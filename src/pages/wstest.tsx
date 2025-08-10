"use client";

import { useEffect, useRef, useState } from "react";
import Layout from "@/containers/Layout";

const HOST = "172.16.1.76:8001"; // same as your test.html
const WS_PATH = "/ws/audio";

const WSTest = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isStreamingRef = useRef(false);

  const [logText, setLogText] = useState("");
  const [canDisconnect, setCanDisconnect] = useState(false);
  const [canSend, setCanSend] = useState(false);
  const [canMicStart, setCanMicStart] = useState(false);
  const [canMicStop, setCanMicStop] = useState(false);
  const [msg, setMsg] = useState("");

  const log = (msg: string) => {
    setLogText((prev) => prev + msg + "\n");
  };

  const setMicButtons = (enabled: boolean) => {
    setCanMicStart(enabled);
    setCanMicStop(!enabled);
  };

  const stopMicStream = async () => {
    isStreamingRef.current = false;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        await audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }

    setMicButtons(true);
    log("Mic recording stopped");
  };

  const handleConnect = () => {
    // mimic the exact URL building from your test file
    const scheme = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss://" : "ws://";
    const url = `${scheme}${HOST}${WS_PATH}`;

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      log("WebSocket connected");
      setCanDisconnect(true);
      setCanSend(true);
      setMicButtons(true);
    };

    ws.onclose = () => {
      log("WebSocket disconnected");
      setCanDisconnect(false);
      setCanSend(false);
      setMicButtons(false);
      stopMicStream();
    };

    ws.onerror = (e: Event) => {
      // Event has no .message reliably; mirror your test.html behavior
      log("WebSocket error");
    };

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        log(`Received binary data: ${event.data.byteLength} bytes`);
      } else {
        log(`Received: ${event.data}`);
      }
    };

    wsRef.current = ws;
  };

  const handleDisconnect = () => {
    wsRef.current?.close();
  };

  const handleSend = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(msg);
    log("Sent: " + msg);
  };

  const handleMicStart = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      log("getUserMedia not supported");
      return;
    }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      log("WebSocket not connected");
      return;
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = audioStream;

      // Match your test: 16 kHz AudioContext
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const source = ctx.createMediaStreamSource(audioStream);
      sourceRef.current = source;

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(ctx.destination);

      isStreamingRef.current = true;

      processor.onaudioprocess = (e) => {
        if (!isStreamingRef.current) return;
        const input = e.inputBuffer.getChannelData(0);

        // Float32 [-1,1] -> Int16 PCM (little-endian)
        const pcm = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(pcm.buffer);
          log("Sent PCM chunk: " + pcm.byteLength + " bytes");
        }
      };

      setMicButtons(false);
      log("Mic recording started");
    } catch (err: any) {
      log("Mic error: " + (err?.message ?? String(err)));
    }
  };

  const handleMicStop = () => {
    stopMicStream();
  };

  useEffect(() => {
    // disable mic buttons initially (same as test.html final line)
    setMicButtons(false);

    return () => {
      stopMicStream();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  return (
    <Layout isScreenHeight={false} isFullWidth={false} isHeaderFullWidth={false}>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Testing websocket</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">WebSocket Test</h2>

          <div className="flex flex-wrap items-center gap-2">
            <button id="ws-connect" onClick={handleConnect} className="px-3 py-2 rounded bg-green-600 text-white">
              Connect
            </button>
            <button
              id="ws-disconnect"
              onClick={handleDisconnect}
              disabled={!canDisconnect}
              className={`px-3 py-2 rounded ${canDisconnect ? "bg-red-600 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              Disconnect
            </button>

            <input
              id="ws-message"
              type="text"
              placeholder="Type a message (bytes)"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="border px-2 py-2 rounded min-w-[220px]"
            />
            <button
              id="ws-send"
              onClick={handleSend}
              disabled={!canSend}
              className={`px-3 py-2 rounded ${canSend ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              Send
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              id="mic-start"
              onClick={handleMicStart}
              disabled={!canMicStart}
              className={`px-3 py-2 rounded ${canMicStart ? "bg-indigo-600 text-white" : "bg-gray-300 text-gray-600"}`}
            >
              Start Mic
            </button>
            <button
              id="mic-stop"
              onClick={handleMicStop}
              disabled={!canMicStop}
              className={`px-3 py-2 rounded ${canMicStop ? "bg-amber-500 text-black" : "bg-gray-300 text-gray-600"}`}
            >
              Stop Mic
            </button>
          </div>

          <pre
            id="ws-log"
            className="bg-gray-100 p-3 h-52 overflow-auto whitespace-pre-wrap text-sm rounded border"
            aria-live="polite"
          >
            {logText}
          </pre>
        </section>
      </div>
    </Layout>
  );
};

export default WSTest;
