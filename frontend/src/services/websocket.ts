// @ts-ignore
const VITE_WS_URL = import.meta.env.VITE_WS_URL;


let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let token: string | null = null;


export function connectWebSocket(newToken: string): WebSocket {
  const tokenToUse = newToken || localStorage.getItem("token");
  console.log('Token para WS:', tokenToUse);
  
  if (!tokenToUse) throw new Error("Token não encontrado para conectar WebSocket");
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }

  token = tokenToUse;
  
  if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }

  ws = new WebSocket(`${VITE_WS_URL}/ws?token=${token}`);

  ws.onopen = () => {
    console.log("✅ Conectado ao WebSocket");
  };

  ws.onmessage = (event) => {
    console.log("📩 Mensagem recebida:", event.data);
  };

  ws.onclose = (event) => {
    console.log("❌ Conexão encerrada");
    if (event.code !== 1000 && token) {
            console.log("🔄 Tentando reconectar em 3 segundos...");
            reconnectTimeout = setTimeout(() => {
                connectWebSocket(token!);
            }, 3000); 
        }
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
export function getWebSocket(): WebSocket | null {
  return ws;
}

export function disconnectWebSocket() {
    if (ws) {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }
        token = null; 
        ws.close(1000, "Normal Closure");
        console.log("🚪 Desconectando do WebSocket...");
    }
}