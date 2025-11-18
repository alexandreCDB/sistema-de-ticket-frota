// frontend/src/frota/services/fuelSupply.services.ts
//@ts-ignore
const API_BASE = import.meta.env.VITE_API_URL;

export interface FuelSupplyData {
  vehicle_id: number;
  user_id: number;
  departure_date: string;
  departure_time: string;
  departure_km: number;
  departure_amount: number;
  return_date: string;
  return_time: string;
  return_km: number;
  return_amount: number;
}

export interface FuelSupply {
  id: number;
  vehicle_id: number;
  user_id: number;
  departure_date: string;
  departure_time: string;
  departure_km: number;
  departure_amount: number;
  return_date: string;
  return_time: string;
  return_km: number;
  return_amount: number;
  created_at: string;
  vehicle?: {
    name: string;
    license_plate: string;
  };
  user?: {
    email: string;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const createFuelSupply = async (fuelSupplyData: FuelSupplyData): Promise<FuelSupply> => {
  const response = await fetch(`${API_BASE}/frota/fuel-supplies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(fuelSupplyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao criar abastecimento');
  }

  return response.json();
};

export const getMyFuelSupplies = async (): Promise<FuelSupply[]> => {
  const response = await fetch(`${API_BASE}/frota/fuel-supplies/my-supplies`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao buscar abastecimentos');
  }

  return response.json();
};

export const getAllFuelSupplies = async (): Promise<FuelSupply[]> => {
  const response = await fetch(`${API_BASE}/frota/fuel-supplies`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Usuário não autenticado');
    }
    if (response.status === 403) {
      throw new Error('Apenas administradores podem visualizar todos os abastecimentos');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao buscar todos os abastecimentos');
  }

  return response.json();
};

export const getFuelSuppliesByVehicle = async (vehicleId: number): Promise<FuelSupply[]> => {
  const response = await fetch(`${API_BASE}/frota/fuel-supplies/vehicle/${vehicleId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao buscar abastecimentos do veículo');
  }

  return response.json();
};

export const getFuelSupply = async (fuelSupplyId: number): Promise<FuelSupply> => {
  const response = await fetch(`${API_BASE}/frota/fuel-supplies/${fuelSupplyId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Abastecimento não encontrado');
    }
    
    if (response.status === 403) {
      throw new Error('Acesso negado a este abastecimento');
    }

    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao buscar abastecimento');
  }

  return response.json();
};

export const deleteFuelSupply = async (fuelSupplyId: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/frota/fuel-supplies/${fuelSupplyId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Apenas administradores podem excluir abastecimentos');
    }
    
    if (response.status === 404) {
      throw new Error('Abastecimento não encontrado');
    }

    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao excluir abastecimento');
  }
};