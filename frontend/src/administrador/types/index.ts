export interface User {
  id: number;
  name: string;
  email: string;
  status: "online" | "offline";
  is_admin: boolean;
  is_super_admin: boolean;
  is_active: boolean;
  lastSeen:Date ;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  status: "online" | "offline";
  role: string;
  lastSeen: string;
  is_active: boolean;
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

