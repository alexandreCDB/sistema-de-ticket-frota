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


// --- FUNÇÕES DE API ---

export async function checkoutVehicle(data: CheckoutData) {
  const response = await fetch(`${API_URL}/frotas/bookings/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    const response = await fetch(`${API_URL}/frotas/vehicles/${vehicleId}`, {
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
    const response = await fetch(`${API_URL}/frotas/bookings/`, {
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

export async function approveBooking(bookingId: number) {
  try {
    const response = await fetch(`${API_URL}/frotas/bookings/${bookingId}/approve`, {
      method: 'PATCH',
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
    const response = await fetch(`${API_URL}/frotas/bookings/${bookingId}/deny`, {
      method: 'PATCH',
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
    const response = await fetch(`${API_URL}/frotas/bookings/${bookingId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  const response = await fetch(`${API_URL}/frotas/bookings/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
        const response = await fetch(`${API_URL}/frotas/bookings/${bookingId}/deny`, {
            method: 'PATCH',
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
// Em src/frota/services/frota.service.ts

export async function createVehicle(data: VehicleFormData) {
  const response = await fetch(`${API_URL}/frotas/vehicles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  console.warn("Endpoint de EDIÇÃO ainda não implementado no backend.");
  // Exemplo de como seria a chamada:
  // const response = await fetch(`${API_URL}/frotas/vehicles/${id}`, {
  //   method: 'PUT', // ou 'PATCH'
  //   headers: { 'Content-Type': 'application/json' },
  //   credentials: 'include',
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error('Falha ao atualizar o veículo.');
  // return response.json();
  
  // Simula uma resposta bem-sucedida para fins de teste
  return Promise.resolve({ ...data, id });
}

/**
 * ATENÇÃO: A função abaixo é um placeholder.
 * O seu backend ainda não tem um endpoint para remover veículos.
 */
export async function deleteVehicle(id: number) {
  console.warn("Endpoint de REMOÇÃO ainda não implementado no backend.");
  // Exemplo de como seria a chamada:
  // const response = await fetch(`${API_URL}/frotas/vehicles/${id}`, {
  //   method: 'DELETE',
  //   credentials: 'include',
  // });
  // if (!response.ok) throw new Error('Falha ao remover o veículo.');
  // return response.ok;

  // Simula uma resposta bem-sucedida para fins de teste
  return Promise.resolve(true);
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
      const response = await fetch(`${API_URL}/frotas/bookings/`, { 
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      const bookingData: Booking[] = await response.json();

      const bookingsWithDetails = await Promise.all(
          bookingData.map(async (booking) => {
              const vehicle = await getVehicle(booking.vehicle_id);
              return { ...booking, vehicle };
          })
      );

      setBookings(bookingsWithDetails);
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

  const response = await fetch(`${API_URL}/frotas/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // Envia como FormData, não JSON
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
                fetch(`${API_URL}/frotas/vehicles`, { credentials: 'include' }),
                fetch(`${API_URL}/frotas/bookings/`, { credentials: 'include' })
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