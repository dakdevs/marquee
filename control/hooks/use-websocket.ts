import { useEffect, useRef, useState, useCallback } from "react";
import type { Scene } from "../../types.ts";

export type SyncState = {
  scenes: Scene[];
  quickTweet: { author: string; text: string; url: string } | null;
  connected: boolean;
};

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<SyncState>({
    scenes: [],
    quickTweet: null,
    connected: false,
  });

  const send = useCallback((msg: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${location.host}/ws`);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        setState((prev) => ({ ...prev, connected: true }));
      });

      ws.addEventListener("message", (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "sync") {
          setState({
            scenes: msg.scenes ?? [],
            quickTweet: msg.quickTweet ?? null,
            connected: true,
          });
        }
      });

      ws.addEventListener("close", () => {
        setState((prev) => ({ ...prev, connected: false }));
        reconnectTimer = setTimeout(connect, 1000);
      });
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  return { ...state, send };
}
