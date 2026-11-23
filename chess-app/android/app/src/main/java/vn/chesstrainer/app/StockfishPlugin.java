package vn.chesstrainer.app;

import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;

/**
 * Runs the official Stockfish 17.1 Android build (arm64, dot-product instructions, NNUE nets embedded) as a child
 * process and relays UCI text both ways. The binary ships as jniLibs/arm64-v8a/libstockfish.so so that Android
 * installs it, executable, in the app's native library directory.
 * Devices without the dot-product instructions are refused: the web app then falls back to its WebAssembly engine.
 *
 * Stockfish is free software under the GNU GPL v3; its source is at https://github.com/official-stockfish/Stockfish.
 */
@CapacitorPlugin(name = "Stockfish")
public class StockfishPlugin extends Plugin {
    private Process process;
    private Writer stdin;

    @PluginMethod
    public void start(PluginCall call) {
        JSObject ret = new JSObject();
        int cores = Runtime.getRuntime().availableProcessors();
        ret.put("cores", cores);
        if (process != null && process.isAlive()) {
            ret.put("ok", true);
            call.resolve(ret);
            return;
        }
        String reason = unsupported();
        if (reason != null) {
            ret.put("ok", false);
            ret.put("reason", reason);
            call.resolve(ret);
            return;
        }
        try {
            File bin = new File(getContext().getApplicationInfo().nativeLibraryDir, "libstockfish.so");
            ProcessBuilder pb = new ProcessBuilder(bin.getAbsolutePath());
            pb.redirectErrorStream(true);
            process = pb.start();
            stdin = new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8);
            final Process p = process;
            Thread reader = new Thread(() -> {
                try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = r.readLine()) != null) {
                        JSObject ev = new JSObject();
                        ev.put("line", line);
                        notifyListeners("line", ev);
                    }
                } catch (Exception ignored) {
                }
                JSObject ev = new JSObject();
                ev.put("code", p.isAlive() ? -1 : p.exitValue());
                notifyListeners("exit", ev);
            }, "stockfish-out");
            reader.setDaemon(true);
            reader.start();
            ret.put("ok", true);
            call.resolve(ret);
        } catch (Exception e) {
            process = null;
            ret.put("ok", false);
            ret.put("reason", "start failed: " + e.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void send(PluginCall call) {
        String cmd = call.getString("cmd", "");
        try {
            if (stdin == null) throw new IllegalStateException("not started");
            stdin.write(cmd);
            stdin.write('\n');
            stdin.flush();
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        kill();
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        kill();
    }

    private void kill() {
        try {
            if (stdin != null) {
                stdin.write("quit\n");
                stdin.flush();
            }
        } catch (Exception ignored) {
        }
        if (process != null) process.destroy();
        process = null;
        stdin = null;
    }

    /** null when this device can run the bundled binary, else why not */
    private static String unsupported() {
        boolean arm64 = false;
        for (String abi : Build.SUPPORTED_ABIS) if ("arm64-v8a".equals(abi)) arm64 = true;
        if (!arm64) return "not arm64";
        try (BufferedReader r = new BufferedReader(new FileReader("/proc/cpuinfo"))) {
            String line;
            while ((line = r.readLine()) != null) {
                if (line.startsWith("Features") && line.contains("asimddp")) return null;
            }
        } catch (Exception e) {
            return "cannot read cpu features";
        }
        return "no dot-product instructions";
    }
}
