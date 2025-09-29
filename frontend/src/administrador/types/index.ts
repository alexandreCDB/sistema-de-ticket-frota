export interface User {
  id: number;
  name: string;
  email: string;
  status: "online" | "offline";
  is_admin: boolean;
  is_super_admin: boolean;
}

export interface SystemStats {
  cpu: {
    percent: number; // percentual de uso da CPU
  };
  memory: {
    total: number;   // GB
    used: number;    // GB
    percent: number; // percentual usado
  };
  disk: {
    total: number;   // GB
    used: number;    // GB
    percent: number; // percentual usado
  };
  uptime: string;     // tempo de uptime
  connections: number; // número de conexões ativas
}
