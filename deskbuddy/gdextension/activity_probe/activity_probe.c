/*
 * ActivityProbe: GDExtension đo hoạt động người dùng toàn hệ thống cho DeskBuddy.
 *
 * Chỉ trả lời ba câu hỏi: người dùng idle bao lâu, phím cuối bấm bao lâu rồi,
 * và có bao nhiêu lần bấm phím kể từ lần hỏi trước. KHÔNG BAO GIỜ đọc mã phím
 * hay ký tự, không ghi file, không gửi đi đâu.
 *
 * Backend:
 *   Linux   : X11 XInput2 raw events (dlopen libX11 + libXi, không cần header).
 *             Trên Wayland thuần không có DISPLAY → báo không hỗ trợ.
 *   Windows : GetLastInputInfo + WH_KEYBOARD_LL hook chỉ đếm.
 *   macOS   : CGEventSourceSecondsSinceLastEventType, không cần quyền
 *             Accessibility (đếm phím theo mốc thời gian ở độ phân giải poll).
 *
 * Viết thẳng trên C API của Godot (gdextension_interface.h), không cần godot-cpp.
 * Build: xem build.sh / build.bat.
 */
#if !defined(_WIN32)
#define _POSIX_C_SOURCE 200809L
#define _DEFAULT_SOURCE
#endif
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <time.h>

#include "gdextension_interface.h"

/* ---------------------------------------------------------------- thời gian */
static double now_mono(void) {
#if defined(_WIN32)
	return (double)GetTickCount64() / 1000.0;
#else
	struct timespec ts;
	clock_gettime(CLOCK_MONOTONIC, &ts);
	return (double)ts.tv_sec + (double)ts.tv_nsec / 1e9;
#endif
}

/* ---------------------------------------------------------------- probe */
typedef struct Probe {
	int supported;
	const char *backend;
	double last_input;   /* mốc mono của lần nhập cuối (mọi thiết bị) */
	double last_key;     /* mốc mono của lần bấm phím cuối, <0 nếu chưa biết */
	int64_t key_count;   /* số phím từ lần take cuối */
	void *platform;
} Probe;

/* ============================================================== LINUX / X11 */
#if defined(__linux__)
#include <dlfcn.h>

typedef struct _XDisplay Display;
typedef unsigned long XID;
typedef XID Window;
typedef int Bool;
typedef union { int type; long pad[24]; } XEvent;
typedef struct {
	int type; unsigned long serial; Bool send_event; Display *display;
	int extension; int evtype; unsigned int cookie; void *data;
} XGenericEventCookie;
typedef struct { int deviceid; int mask_len; unsigned char *mask; } XIEventMask;

#define GenericEvent 35
#define XIAllMasterDevices 1
#define XI_RawKeyPress 13
#define XI_RawButtonPress 15
#define XI_RawMotion 17
#define XI_RawTouchBegin 22

typedef struct {
	void *x11, *xi;
	Display *dpy;
	int xi_opcode;
	Display *(*XOpenDisplay)(const char *);
	int (*XCloseDisplay)(Display *);
	Window (*XDefaultRootWindow)(Display *);
	Bool (*XQueryExtension)(Display *, const char *, int *, int *, int *);
	int (*XPending)(Display *);
	int (*XNextEvent)(Display *, XEvent *);
	int (*XFlush)(Display *);
	int (*XIQueryVersion)(Display *, int *, int *);
	int (*XISelectEvents)(Display *, Window, XIEventMask *, int);
} X11Probe;

static void *sym(void *h, const char *n) { return h ? dlsym(h, n) : NULL; }

static void probe_init(Probe *p) {
	p->backend = "none";
	p->last_key = -1.0;
	p->last_input = now_mono();
	if (!getenv("DISPLAY")) { p->backend = "wayland-or-no-display"; return; }
	X11Probe *x = calloc(1, sizeof(X11Probe));
	x->x11 = dlopen("libX11.so.6", RTLD_NOW | RTLD_LOCAL);
	x->xi = dlopen("libXi.so.6", RTLD_NOW | RTLD_LOCAL);
	x->XOpenDisplay = sym(x->x11, "XOpenDisplay");
	x->XCloseDisplay = sym(x->x11, "XCloseDisplay");
	x->XDefaultRootWindow = sym(x->x11, "XDefaultRootWindow");
	x->XQueryExtension = sym(x->x11, "XQueryExtension");
	x->XPending = sym(x->x11, "XPending");
	x->XNextEvent = sym(x->x11, "XNextEvent");
	x->XFlush = sym(x->x11, "XFlush");
	x->XIQueryVersion = sym(x->xi, "XIQueryVersion");
	x->XISelectEvents = sym(x->xi, "XISelectEvents");
	if (!x->XOpenDisplay || !x->XISelectEvents || !x->XIQueryVersion || !x->XQueryExtension) {
		p->backend = "x11-missing-libs"; goto fail;
	}
	x->dpy = x->XOpenDisplay(NULL);
	if (!x->dpy) { p->backend = "x11-no-display"; goto fail; }
	int ev, err;
	if (!x->XQueryExtension(x->dpy, "XInputExtension", &x->xi_opcode, &ev, &err)) { p->backend = "x11-no-xinput"; goto fail; }
	int major = 2, minor = 0;
	if (x->XIQueryVersion(x->dpy, &major, &minor) != 0 /* Success */) { p->backend = "x11-xi2-unavailable"; goto fail; }
	unsigned char mask[4] = {0, 0, 0, 0};
	#define XI_SET(m, e) ((m)[(e) >> 3] |= (unsigned char)(1 << ((e) & 7)))
	XI_SET(mask, XI_RawKeyPress);
	XI_SET(mask, XI_RawButtonPress);
	XI_SET(mask, XI_RawMotion);
	XI_SET(mask, XI_RawTouchBegin);
	XIEventMask em = { XIAllMasterDevices, sizeof(mask), mask };
	x->XISelectEvents(x->dpy, x->XDefaultRootWindow(x->dpy), &em, 1);
	x->XFlush(x->dpy);
	p->platform = x;
	p->supported = 1;
	p->backend = "x11-xinput2";
	return;
fail:
	if (x->dpy && x->XCloseDisplay) x->XCloseDisplay(x->dpy);
	if (x->xi) dlclose(x->xi);
	if (x->x11) dlclose(x->x11);
	free(x);
}

static void probe_poll(Probe *p) {
	if (!p->supported) return;
	X11Probe *x = p->platform;
	double now = now_mono();
	int guard = 10000; /* không kẹt vô hạn nếu sự kiện dồn dập */
	while (guard-- > 0 && x->XPending(x->dpy) > 0) {
		XEvent ev;
		x->XNextEvent(x->dpy, &ev);
		if (ev.type != GenericEvent) continue;
		XGenericEventCookie *c = (XGenericEventCookie *)&ev;
		if (c->extension != x->xi_opcode) continue;
		p->last_input = now;
		if (c->evtype == XI_RawKeyPress) {
			p->key_count++;
			p->last_key = now;
		}
	}
}

static void probe_shutdown(Probe *p) {
	X11Probe *x = p->platform;
	if (!x) return;
	if (x->dpy) x->XCloseDisplay(x->dpy);
	if (x->xi) dlclose(x->xi);
	if (x->x11) dlclose(x->x11);
	free(x);
	p->platform = NULL;
}

/* ============================================================== WINDOWS */
#elif defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#include <windows.h>

static volatile LONG g_key_count = 0;
static HHOOK g_hook = NULL;
static HANDLE g_thread = NULL;
static DWORD g_thread_id = 0;
static LONG g_refs = 0;

static LRESULT CALLBACK ll_keyboard(int code, WPARAM wp, LPARAM lp) {
	if (code == HC_ACTION && (wp == WM_KEYDOWN || wp == WM_SYSKEYDOWN)) {
		InterlockedIncrement(&g_key_count); /* chỉ đếm, không đọc vkCode */
	}
	return CallNextHookEx(g_hook, code, wp, lp);
}

static DWORD WINAPI hook_thread(LPVOID arg) {
	(void)arg;
	g_hook = SetWindowsHookExW(WH_KEYBOARD_LL, ll_keyboard, GetModuleHandleW(NULL), 0);
	MSG msg;
	while (GetMessageW(&msg, NULL, 0, 0) > 0) {
		TranslateMessage(&msg);
		DispatchMessageW(&msg);
	}
	if (g_hook) { UnhookWindowsHookEx(g_hook); g_hook = NULL; }
	return 0;
}

typedef struct { LONG seen; } WinProbe;

static void probe_init(Probe *p) {
	p->last_key = -1.0;
	p->last_input = now_mono();
	if (InterlockedIncrement(&g_refs) == 1) {
		g_thread = CreateThread(NULL, 0, hook_thread, NULL, 0, &g_thread_id);
	}
	WinProbe *w = calloc(1, sizeof(WinProbe));
	w->seen = g_key_count;
	p->platform = w;
	p->supported = 1;
	p->backend = "windows-lowlevel-hook";
}

static void probe_poll(Probe *p) {
	if (!p->supported) return;
	WinProbe *w = p->platform;
	double now = now_mono();
	LONG total = g_key_count;
	LONG delta = total - w->seen;
	if (delta > 0) {
		w->seen = total;
		p->key_count += delta;
		p->last_key = now;
		p->last_input = now;
	}
	LASTINPUTINFO li; li.cbSize = sizeof(li);
	if (GetLastInputInfo(&li)) {
		double idle = (double)(GetTickCount() - li.dwTime) / 1000.0;
		if (now - idle > p->last_input) p->last_input = now - idle;
	}
}

static void probe_shutdown(Probe *p) {
	free(p->platform);
	p->platform = NULL;
	if (InterlockedDecrement(&g_refs) == 0 && g_thread) {
		PostThreadMessageW(g_thread_id, WM_QUIT, 0, 0);
		WaitForSingleObject(g_thread, 2000);
		CloseHandle(g_thread);
		g_thread = NULL;
	}
}

/* ============================================================== MACOS */
#elif defined(__APPLE__)
#include <ApplicationServices/ApplicationServices.h>

typedef struct { double last_key_abs; } MacProbe;

static void probe_init(Probe *p) {
	p->last_key = -1.0;
	p->last_input = now_mono();
	MacProbe *m = calloc(1, sizeof(MacProbe));
	m->last_key_abs = -1.0;
	p->platform = m;
	p->supported = 1;
	p->backend = "macos-cgeventsource";
}

static void probe_poll(Probe *p) {
	if (!p->supported) return;
	MacProbe *m = p->platform;
	double now = now_mono();
	double since_any = CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGAnyInputEventType);
	double since_key = CGEventSourceSecondsSinceLastEventType(kCGEventSourceStateCombinedSessionState, kCGEventKeyDown);
	if (now - since_any > p->last_input) p->last_input = now - since_any;
	double key_abs = now - since_key;
	if (m->last_key_abs < 0) {
		m->last_key_abs = key_abs; /* mốc ban đầu, không đếm phím cũ */
	} else if (key_abs > m->last_key_abs + 0.002) {
		m->last_key_abs = key_abs;
		p->key_count++;
		p->last_key = now;
	}
}

static void probe_shutdown(Probe *p) {
	free(p->platform);
	p->platform = NULL;
}

/* ============================================================== KHÁC */
#else
static void probe_init(Probe *p) { p->backend = "unsupported-os"; p->last_key = -1.0; p->last_input = now_mono(); }
static void probe_poll(Probe *p) { (void)p; }
static void probe_shutdown(Probe *p) { (void)p; }
#endif

/* ================================================================ GODOT GLUE */
typedef struct { uint8_t opaque[8]; } GDStringName;
typedef struct { uint8_t opaque[8]; } GDString;

static GDExtensionClassLibraryPtr g_lib;
static GDExtensionInterfaceStringNameNewWithLatin1Chars sn_new;
static GDExtensionInterfaceStringNewWithUtf8Chars str_new;
static GDExtensionInterfaceClassdbRegisterExtensionClass3 reg_class;
static GDExtensionInterfaceClassdbRegisterExtensionClassMethod reg_method;
static GDExtensionInterfaceClassdbConstructObject construct_object;
static GDExtensionInterfaceObjectSetInstance set_instance;
static GDExtensionInterfaceMemAlloc mem_alloc;
static GDExtensionInterfaceMemFree mem_free;
static GDExtensionInterfaceGetVariantFromTypeConstructor get_var_ctor;
static GDExtensionInterfaceVariantGetPtrDestructor get_ptr_dtor;
static GDExtensionVariantFromTypeConstructorFunc var_from_bool, var_from_int, var_from_float, var_from_string;
static GDExtensionInterfaceVariantNewNil variant_new_nil;
static GDExtensionPtrDestructor string_dtor;

static GDStringName g_class_name, g_parent_name;

/* --- thân các method --- */
static void m_is_supported(Probe *p, uint8_t *out) { *out = p->supported ? 1 : 0; }
static void m_poll(Probe *p) { probe_poll(p); }
static void m_idle(Probe *p, double *out) { probe_poll(p); *out = now_mono() - p->last_input; if (*out < 0) *out = 0; }
static void m_since_key(Probe *p, double *out) { probe_poll(p); *out = p->last_key < 0 ? -1.0 : now_mono() - p->last_key; }
static void m_take_keys(Probe *p, int64_t *out) { probe_poll(p); *out = p->key_count; p->key_count = 0; }

/* --- call (Variant) và ptrcall cho từng method --- */
#define NOARGS (void)p_args; (void)p_argument_count; if (r_error) r_error->error = GDEXTENSION_CALL_OK; (void)method_userdata

static void call_is_supported(void *method_userdata, GDExtensionClassInstancePtr inst, const GDExtensionConstVariantPtr *p_args, GDExtensionInt p_argument_count, GDExtensionVariantPtr r_return, GDExtensionCallError *r_error) {
	NOARGS; uint8_t v; m_is_supported(inst, &v); GDExtensionBool b = v; var_from_bool(r_return, &b);
}
static void ptr_is_supported(void *ud, GDExtensionClassInstancePtr inst, const GDExtensionConstTypePtr *a, GDExtensionTypePtr r) { (void)ud; (void)a; m_is_supported(inst, (uint8_t *)r); }

static void call_backend(void *method_userdata, GDExtensionClassInstancePtr inst, const GDExtensionConstVariantPtr *p_args, GDExtensionInt p_argument_count, GDExtensionVariantPtr r_return, GDExtensionCallError *r_error) {
	NOARGS; GDString s; str_new(&s, ((Probe *)inst)->backend); var_from_string(r_return, &s); string_dtor(&s);
}
static void ptr_backend(void *ud, GDExtensionClassInstancePtr inst, const GDExtensionConstTypePtr *a, GDExtensionTypePtr r) { (void)ud; (void)a; str_new(r, ((Probe *)inst)->backend); }

static void call_poll(void *method_userdata, GDExtensionClassInstancePtr inst, const GDExtensionConstVariantPtr *p_args, GDExtensionInt p_argument_count, GDExtensionVariantPtr r_return, GDExtensionCallError *r_error) {
	NOARGS; m_poll(inst); variant_new_nil(r_return);
}
static void ptr_poll(void *ud, GDExtensionClassInstancePtr inst, const GDExtensionConstTypePtr *a, GDExtensionTypePtr r) { (void)ud; (void)a; (void)r; m_poll(inst); }

static void call_idle(void *method_userdata, GDExtensionClassInstancePtr inst, const GDExtensionConstVariantPtr *p_args, GDExtensionInt p_argument_count, GDExtensionVariantPtr r_return, GDExtensionCallError *r_error) {
	NOARGS; double d; m_idle(inst, &d); var_from_float(r_return, &d);
}
static void ptr_idle(void *ud, GDExtensionClassInstancePtr inst, const GDExtensionConstTypePtr *a, GDExtensionTypePtr r) { (void)ud; (void)a; m_idle(inst, (double *)r); }

static void call_since_key(void *method_userdata, GDExtensionClassInstancePtr inst, const GDExtensionConstVariantPtr *p_args, GDExtensionInt p_argument_count, GDExtensionVariantPtr r_return, GDExtensionCallError *r_error) {
	NOARGS; double d; m_since_key(inst, &d); var_from_float(r_return, &d);
}
static void ptr_since_key(void *ud, GDExtensionClassInstancePtr inst, const GDExtensionConstTypePtr *a, GDExtensionTypePtr r) { (void)ud; (void)a; m_since_key(inst, (double *)r); }

static void call_take_keys(void *method_userdata, GDExtensionClassInstancePtr inst, const GDExtensionConstVariantPtr *p_args, GDExtensionInt p_argument_count, GDExtensionVariantPtr r_return, GDExtensionCallError *r_error) {
	NOARGS; int64_t v; m_take_keys(inst, &v); var_from_int(r_return, &v);
}
static void ptr_take_keys(void *ud, GDExtensionClassInstancePtr inst, const GDExtensionConstTypePtr *a, GDExtensionTypePtr r) { (void)ud; (void)a; m_take_keys(inst, (int64_t *)r); }

/* --- vòng đời instance --- */
static GDExtensionObjectPtr create_instance(void *class_userdata) {
	(void)class_userdata;
	GDExtensionObjectPtr obj = construct_object(&g_parent_name);
	Probe *p = mem_alloc(sizeof(Probe));
	memset(p, 0, sizeof(Probe));
	probe_init(p);
	set_instance(obj, &g_class_name, p);
	return obj;
}

static void free_instance(void *class_userdata, GDExtensionClassInstancePtr inst) {
	(void)class_userdata;
	if (!inst) return;
	probe_shutdown(inst);
	mem_free(inst);
}

/* --- đăng ký --- */
static void register_method(const char *name, GDExtensionClassMethodCall call, GDExtensionClassMethodPtrCall ptrcall,
		int has_ret, GDExtensionVariantType ret_type, GDExtensionClassMethodArgumentMetadata meta) {
	GDStringName mname, empty;
	GDString hint;
	sn_new(&mname, name, 1);
	sn_new(&empty, "", 1);
	str_new(&hint, "");
	GDExtensionPropertyInfo ret;
	memset(&ret, 0, sizeof(ret));
	ret.type = ret_type;
	ret.name = &empty;
	ret.class_name = &empty;
	ret.hint_string = &hint;
	ret.usage = 6; /* PROPERTY_USAGE_DEFAULT */
	GDExtensionClassMethodInfo mi;
	memset(&mi, 0, sizeof(mi));
	mi.name = &mname;
	mi.call_func = call;
	mi.ptrcall_func = ptrcall;
	mi.method_flags = GDEXTENSION_METHOD_FLAGS_DEFAULT;
	mi.has_return_value = has_ret ? 1 : 0;
	mi.return_value_info = &ret;
	mi.return_value_metadata = meta;
	reg_method(g_lib, &g_class_name, &mi);
	string_dtor(&hint);
}

static void initialize(void *userdata, GDExtensionInitializationLevel level) {
	(void)userdata;
	if (level != GDEXTENSION_INITIALIZATION_SCENE) return;
	sn_new(&g_class_name, "ActivityProbe", 1);
	sn_new(&g_parent_name, "RefCounted", 1);
	GDExtensionClassCreationInfo3 ci;
	memset(&ci, 0, sizeof(ci));
	ci.is_exposed = 1;
	ci.create_instance_func = create_instance;
	ci.free_instance_func = free_instance;
	reg_class(g_lib, &g_class_name, &g_parent_name, &ci);
	register_method("is_supported", call_is_supported, ptr_is_supported, 1, GDEXTENSION_VARIANT_TYPE_BOOL, GDEXTENSION_METHOD_ARGUMENT_METADATA_NONE);
	register_method("backend_name", call_backend, ptr_backend, 1, GDEXTENSION_VARIANT_TYPE_STRING, GDEXTENSION_METHOD_ARGUMENT_METADATA_NONE);
	register_method("poll", call_poll, ptr_poll, 0, GDEXTENSION_VARIANT_TYPE_NIL, GDEXTENSION_METHOD_ARGUMENT_METADATA_NONE);
	register_method("get_idle_seconds", call_idle, ptr_idle, 1, GDEXTENSION_VARIANT_TYPE_FLOAT, GDEXTENSION_METHOD_ARGUMENT_METADATA_REAL_IS_DOUBLE);
	register_method("get_seconds_since_key", call_since_key, ptr_since_key, 1, GDEXTENSION_VARIANT_TYPE_FLOAT, GDEXTENSION_METHOD_ARGUMENT_METADATA_REAL_IS_DOUBLE);
	register_method("take_key_presses", call_take_keys, ptr_take_keys, 1, GDEXTENSION_VARIANT_TYPE_INT, GDEXTENSION_METHOD_ARGUMENT_METADATA_INT_IS_INT64);
}

static void deinitialize(void *userdata, GDExtensionInitializationLevel level) { (void)userdata; (void)level; }

#if defined(_WIN32)
#define EXPORT __declspec(dllexport)
#else
#define EXPORT __attribute__((visibility("default")))
#endif

EXPORT GDExtensionBool activity_probe_init(GDExtensionInterfaceGetProcAddress get_proc, GDExtensionClassLibraryPtr lib, GDExtensionInitialization *init) {
	g_lib = lib;
	sn_new = (GDExtensionInterfaceStringNameNewWithLatin1Chars)get_proc("string_name_new_with_latin1_chars");
	str_new = (GDExtensionInterfaceStringNewWithUtf8Chars)get_proc("string_new_with_utf8_chars");
	reg_class = (GDExtensionInterfaceClassdbRegisterExtensionClass3)get_proc("classdb_register_extension_class3");
	reg_method = (GDExtensionInterfaceClassdbRegisterExtensionClassMethod)get_proc("classdb_register_extension_class_method");
	construct_object = (GDExtensionInterfaceClassdbConstructObject)get_proc("classdb_construct_object");
	set_instance = (GDExtensionInterfaceObjectSetInstance)get_proc("object_set_instance");
	mem_alloc = (GDExtensionInterfaceMemAlloc)get_proc("mem_alloc");
	mem_free = (GDExtensionInterfaceMemFree)get_proc("mem_free");
	get_var_ctor = (GDExtensionInterfaceGetVariantFromTypeConstructor)get_proc("get_variant_from_type_constructor");
	get_ptr_dtor = (GDExtensionInterfaceVariantGetPtrDestructor)get_proc("variant_get_ptr_destructor");
	variant_new_nil = (GDExtensionInterfaceVariantNewNil)get_proc("variant_new_nil");
	if (!sn_new || !str_new || !reg_class || !reg_method || !construct_object || !set_instance || !mem_alloc || !mem_free || !get_var_ctor || !get_ptr_dtor || !variant_new_nil) {
		return 0;
	}
	var_from_bool = get_var_ctor(GDEXTENSION_VARIANT_TYPE_BOOL);
	var_from_int = get_var_ctor(GDEXTENSION_VARIANT_TYPE_INT);
	var_from_float = get_var_ctor(GDEXTENSION_VARIANT_TYPE_FLOAT);
	var_from_string = get_var_ctor(GDEXTENSION_VARIANT_TYPE_STRING);
	string_dtor = get_ptr_dtor(GDEXTENSION_VARIANT_TYPE_STRING);
	init->minimum_initialization_level = GDEXTENSION_INITIALIZATION_SCENE;
	init->userdata = NULL;
	init->initialize = initialize;
	init->deinitialize = deinitialize;
	return 1;
}
