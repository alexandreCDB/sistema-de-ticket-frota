// src/frota/services/frota.service.ts (CORREÇÃO FINAL)

import { useState, useEffect } from 'react';
import { Vehicle } from '../types';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL; // Esta variável já é "http://localhost:8000/api"

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // --- AQUI ESTÁ A CORREÇÃO ---
        // Removemos o "/api" daqui, pois ele já está na variável API_URL
        const response = await fetch(`${API_URL}/frotas/vehicles`, { 
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Erro na rede: ${response.statusText}`);
        }
        
        const data: Vehicle[] = await response.json();
        setVehicles(data);

      } catch (err: any) {
        setError(err.message || 'Falha ao buscar veículos.');
        console.error("Erro ao buscar veículos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return { vehicles, isLoading, error };
}