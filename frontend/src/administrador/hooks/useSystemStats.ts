import { useState, useEffect, useCallback } from "react";
import { SystemStats } from "../types";

export function useSystemStats() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpu: 45,
    memory: 68,
    disk: 32,
    uptime: "7d 14h 23m",
    connections: 1247,
  });

  const updateStats = useCallback(() => {
    setSystemStats((prev) => ({
      ...prev,
      cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.max(20, Math.min(95, prev.memory + (Math.random() - 0.5) * 8)),
      disk: Math.max(10, Math.min(80, prev.disk + (Math.random() - 0.5) * 2)),
      connections: Math.max(800, Math.min(2000, prev.connections + Math.floor((Math.random() - 0.5) * 100))),
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, [updateStats]);

  return { systemStats, updateStats };
}
