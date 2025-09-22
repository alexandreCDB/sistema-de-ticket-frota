// @ts-ignore
const VITE_WS_URL = import.meta.env.VITE_WS_URL;


let ws: WebSocket | null = null;

export function connectWebSocket(token: string): WebSocket {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }

  ws = new WebSocket(`${VITE_WS_URL}/ws?token=${token}`);

  ws.onopen = () => {
    console.log("✅ Conectado ao WebSocket");
  };

  ws.onmessage = (event) => {
    console.log("📩 Mensagem recebida:", event.data);
  };

  ws.onclose = () => {
    console.log("❌ Conexão encerrada");
  };

  ws.onerror = (err) => {
    console.error("⚠️ Erro no WebSocket:", err);
  };

  return ws;
}

export function sendMessage(message: string) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.warn("⚠️ WebSocket não está conectado.");
  }
}
