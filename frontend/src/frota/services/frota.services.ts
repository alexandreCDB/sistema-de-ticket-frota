import { useState, useEffect, useCallback } from 'react';
import { Vehicle, Booking, BookingWithVehicle } from '../types';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

interface CheckoutData {
  vehicle_id: number;
  purpose: string | null;
  observation: string | null;
  start_mileage: number | null;
}

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