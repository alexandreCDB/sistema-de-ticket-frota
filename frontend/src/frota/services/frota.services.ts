//
// Arquivo: frontend/src/frota/services/frota.service.ts
//

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

// Define a "forma" de um objeto Veículo, baseado no que a API retorna
export interface Vehicle {
  id: number;
  name: string;
  model: string | null;
  license_plate: string;
  image_url: string | null;
  status: 'available' | 'in-use' | 'reserved' | 'maintenance';
  passengers: number | null;
}

// Função para buscar todos os veículos da API
export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch(`${API_URL}/frotas/vehicles/`, {
    method: 'GET',
    credentials: 'include', // Essencial para enviar o cookie de autenticação
  });

  if (!response.ok) {
    // Se a resposta não for bem-sucedida, lança um erro
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Falha ao buscar os veículos da frota.');
  }

  return response.json();
};

// Futuramente, adicionaremos aqui as funções para criar, agendar, devolver, etc.