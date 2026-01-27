import { useState, useEffect, useCallback } from 'react';
import { Vehicle, Booking, BookingWithVehicle, VehicleWithBookings } from '../types';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

// --- INTERFACES PARA PAYLOADS DE API ---

interface CheckoutData {
  vehicle_id: number;
  purpose: string | null;
  observation: string | null;
  start_mileage: number | null;
  start_time?: string;
}

interface ScheduleData {
  vehicle_id: number;
  start_time: string;
  end_time: string;
  purpose: string | null;
  observation: string | null;
}

// NOVA INTERFACE para o formulário de criação/edição de veículos
interface VehicleFormData {
  name: string;
  model: string | null;
  license_plate: string;
  passengers: number | null;
  // --- CAMPOS ADICIONADOS ---
  image_url: string | null;
  features: string | null;
}
const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- FUNÇÕES DE API ---

export async function checkoutVehicle(data: CheckoutData) {
  // 🚨 CORREÇÃO: frotas -> frota
  const response = await fetch(`${API_URL}/frota/bookings/checkout`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Falha ao retirar o veículo.');
  }
  return response.json();
}

export async function getVehicle(vehicleId: number): Promise<Vehicle> {
  try {
    // 🚨 CORREÇÃO: frotas -> frota
    const response = await fetch(`${API_URL}/frota/vehicles/${vehicleId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao buscar o veículo.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Erro ao buscar veículo:', error);
    throw error;
  }
}

export async function listBookings(): Promise<Booking[]> {
  try {
    // 🚨 CORREÇÃO: frotas -> frota
    const response = await fetch(`${API_URL}/frota/bookings/`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao listar as reservas.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Erro ao listar reservas:', error);
    throw error;
  }
}

export async function listPersonalBookings(): Promise<Booking[]> {
  try {
    const response = await fetch(`${API_URL}/frota/bookings/me`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao listar suas reservas.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Erro ao listar suas reservas:', error);
    throw error;
  }
}

export async function approveBooking(bookingId: number) {
  try {
    // 🚨 CORREÇÃO: frotas -> frota
    const response = await fetch(`${API_URL}/frota/bookings/${bookingId}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao aprovar a reserva.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Erro ao aprovar reserva:', error);
    throw error;
  }
}

export async function denyBooking(bookingId: number) {
  try {
    // 🚨 CORREÇÃO: frotas -> frota
    const response = await fetch(`${API_URL}/frota/bookings/${bookingId}/deny`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao negar a reserva.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Erro ao negar reserva:', error);
    throw error;
  }
}

export async function completeReturn(bookingId: number, data: { end_mileage: number; parking_location: string }) {
  try {
    // 🚨 CORREÇÃO: frotas -> frota
    const response = await fetch(`${API_URL}/frota/bookings/${bookingId}/return`, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao completar a devolução.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Erro ao completar a devolução:', error);
    throw error;
  }
}

export async function createSchedule(data: ScheduleData) {
  // 🚨 CORREÇÃO: frotas -> frota
  const response = await fetch(`${API_URL}/frota/bookings/schedule`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Falha ao agendar o veículo.');
  }

  return response.json();
}

export async function cancelBooking(bookingId: number) {
  try {
    // 🚨 CORREÇÃO: frotas -> frota
    const response = await fetch(`${API_URL}/frota/bookings/${bookingId}/deny`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao cancelar a reserva.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Erro ao cancelar reserva:', error);
    throw error;
  }
}

// --- NOVAS FUNÇÕES PARA GESTÃO DE VEÍCULOS ---

/**
 * Cria um novo veículo.
 */
export async function createVehicle(data: VehicleFormData) {
  // 🚨 CORREÇÃO: frotas -> frota
  const response = await fetch(`${API_URL}/frota/vehicles/`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    // Agora, em vez de atirar apenas 'detail', atiramos o objeto de erro completo
    throw responseData;
  }

  return responseData;
}

/**
 * ATENÇÃO: A função abaixo é um placeholder.
 * O seu backend ainda não tem um endpoint para editar veículos.
 */
export async function updateVehicle(id: number, data: VehicleFormData) {
  // 🚨 CORREÇÃO: frotas -> frota
  const response = await fetch(`${API_URL}/frota/vehicles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Falha ao atualizar o veículo.');
  }
  return response.json();
}
/**
 * ATENÇÃO: A função abaixo é um placeholder.
 * O seu backend ainda não tem um endpoint para remover veículos.
 */
export async function deleteVehicle(id: number) {
  // 🚨 CORREÇÃO: frotas -> frota
  const response = await fetch(`${API_URL}/frota/vehicles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Falha ao remover o veículo.');
  }
  return response.ok; // Retorna true se a resposta for bem-sucedida (ex: 204)
}


// --- HOOKS CUSTOMIZADOS ---

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 🚨 CORREÇÃO: frotas -> frota
      const response = await fetch(`${API_URL}/frota/vehicles`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      const data: Vehicle[] = await response.json();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar veículos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, isLoading, error, refetchVehicles: fetchVehicles };
}


export function useMyBookings() {
  const [bookings, setBookings] = useState<BookingWithVehicle[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 🚨 CORREÇÃO: frotas -> frota
      const response = await fetch(`${API_URL}/frota/bookings/`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      const bookingData: BookingWithVehicle[] = await response.json();
      setBookings(bookingData);

    } catch (err: any) {
      setError(err.message || 'Falha ao buscar as suas reservas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, error, refetchBookings: fetchBookings };
}

export function usePersonalBookings() {
  const [bookings, setBookings] = useState<BookingWithVehicle[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/frota/bookings/me`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      const bookingData: BookingWithVehicle[] = await response.json();
      setBookings(bookingData);

    } catch (err: any) {
      setError(err.message || 'Falha ao buscar as suas reservas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, error, refetchBookings: fetchBookings };
}

export async function uploadVehicleImage(file: File): Promise<{ file_url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  // 🚨 CORREÇÃO: frotas -> frota
  const response = await fetch(`${API_URL}/frota/upload/image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Falha no upload da imagem.');
  }
  return response.json();
}
export function useVehiclesWithBookings() {
  const [vehicles, setVehicles] = useState<VehicleWithBookings[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [vehiclesResponse, bookingsResponse] = await Promise.all([
        // 🚨 CORREÇÃO: frotas -> frota
        fetch(`${API_URL}/frota/vehicles`, { headers: getAuthHeaders(), credentials: 'include' }),
        // 🚨 CORREÇÃO: frotas -> frota
        fetch(`${API_URL}/frota/bookings/`, { headers: getAuthHeaders(), credentials: 'include' })
      ]);

      if (!vehiclesResponse.ok || !bookingsResponse.ok) {
        throw new Error('Falha ao buscar dados da frota.');
      }

      const vehiclesData: Vehicle[] = await vehiclesResponse.json();
      const bookingsData: Booking[] = await bookingsResponse.json();

      const vehiclesWithBookings = vehiclesData.map(vehicle => {
        const vehicleBookings = bookingsData
          .filter(b => b.vehicle_id === vehicle.id)
          .map(b => ({ ...b, vehicle })); // Adiciona o detalhe do veículo a cada reserva
        return { ...vehicle, bookings: vehicleBookings };
      });

      setVehicles(vehiclesWithBookings);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar dados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { vehicles, isLoading, error, refetchVehicles: fetchData };


}

// A lista completa de status que podem ser enviados para o backend
export type VehicleStatus = 'available' | 'in-use' | 'reserved' | 'maintenance' | 'unavailable';

// Interface para o corpo da requisição PATCH
interface VehicleStatusUpdateData {
  status: VehicleStatus;
}

/**
 * Atualiza o status de um veículo específico.
 * @param id O ID do veículo a ser atualizado.
 * @param data O novo status a ser definido.
 */
export async function updateVehicleStatus(id: number, data: VehicleStatusUpdateData) {
  // 🚨 CORREÇÃO: frotas -> frota
  const response = await fetch(`${API_URL}/frota/vehicles/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Falha ao atualizar o status do veículo.');
  }
  return response.json();
}