/* Bơm N lần bấm phím giả qua XTest để kiểm tra ActivityProbe trên X11 (Xvfb).
 * Build: gcc -o xtest_keys xtest_keys.c -ldl    Chạy: ./xtest_keys 25 */
#include <dlfcn.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
typedef struct _XDisplay Display;
int main(int argc, char **argv) {
	int n = argc > 1 ? atoi(argv[1]) : 10;
	void *x11 = dlopen("libX11.so.6", RTLD_NOW), *xt = dlopen("libXtst.so.6", RTLD_NOW);
	if (!x11 || !xt) { fprintf(stderr, "no libX11/libXtst\n"); return 1; }
	Display *(*XOpenDisplay)(const char *) = dlsym(x11, "XOpenDisplay");
	int (*XFlush)(Display *) = dlsym(x11, "XFlush");
	int (*XCloseDisplay)(Display *) = dlsym(x11, "XCloseDisplay");
	int (*XTestFakeKeyEvent)(Display *, unsigned int, int, unsigned long) = dlsym(xt, "XTestFakeKeyEvent");
	Display *d = XOpenDisplay(NULL);
	if (!d) { fprintf(stderr, "no display\n"); return 1; }
	for (int i = 0; i < n; i++) {
		XTestFakeKeyEvent(d, 38 /* 'a' */, 1, 0);
		XTestFakeKeyEvent(d, 38, 0, 0);
		XFlush(d);
		usleep(20000);
	}
	XCloseDisplay(d);
	printf("sent %d key presses\n", n);
	return 0;
}
