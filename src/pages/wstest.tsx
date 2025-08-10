import { useEffect, useRef, useState } from "react";
import Layout from "@/containers/Layout";
import type { NextPage } from "next";

const WSTest: NextPage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);

  const log = (msg: string) =>
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}  ${msg}`]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, []);

  const sendTestPackets = () => {
    if (sending) return;
    setSending(true);
    setLogs([]);

    // Use env if set; otherwise match your test.html hardcoded URL
    const base =
      process.env.NEXT_PUBLIC_WS_API_URL?.replace(/\/+$/, "") ||
      "ws://172.16.1.76:8001";
    const wsUrl = `${base}/ws/audio`;

    log(`Connecting to ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      log("WebSocket connected");

      // Prepare a 30ms @ 16kHz test frame (480 samples, 16-bit PCM)
      const samplesPerFrame = 480;
      const frame = new Int16Array(samplesPerFrame);
      for (let i = 0; i < samplesPerFrame; i++) {
        frame[i] = i % 100 < 50 ? 1000 : -1000; // simple pattern
      }

      // Send 10 frames (~300ms) at 30ms intervals
      let count = 0;
      const id = window.setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN || count >= 10) {
          window.clearInterval(id);
          timerRef.current = null;
          log("Finished sending frames, closing in 0.5s...");
          setTimeout(() => {
            try {
              ws.close(1000, "done");
            } catch {}
          }, 500);
          return;
        }
        try {
          ws.send(frame.buffer);
          log(`Sent frame ${count + 1}`);
        } catch (e) {
          log(`Send error: ${(e as Error).message}`);
        }
        count++;
      }, 30);
      timerRef.current = id;
    };

    ws.onmessage = (evt) => {
      log(`Message from server: ${typeof evt.data === "string" ? evt.data : `[binary ${evt.data?.byteLength} bytes]`}`);
    };

    ws.onerror = (err) => {
      log("WebSocket error (see console for details)");
      // eslint-disable-next-line no-console
      console.error("WS error:", err);
    };

    ws.onclose = (evt) => {
      log(`WebSocket closed code=${evt.code} reason="${evt.reason}"`);
      setSending(false);
      wsRef.current = null;
    };
  };

  return (
    <Layout isScreenHeight={false} isFullWidth={false} isHeaderFullWidth={false}>
      <div className="max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">Testing WebSocket</h1>

        <button
          onClick={sendTestPackets}
          disabled={sending}
          className={`px-4 py-2 rounded-md text-white ${
            sending ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
          title="Send 10× 30ms Int16 frames like test.html"
        >
          {sending ? "Sending…" : "Send Test Packets"}
        </button>

        <div className="mt-6">
          <h2 className="font-medium mb-2">Logs</h2>
          <pre className="bg-black text-green-200 p-3 rounded-md overflow-auto max-h-80 text-sm">
            {logs.length ? logs.join("\n") : "No output yet."}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default WSTest;
