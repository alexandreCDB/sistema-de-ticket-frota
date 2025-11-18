// src/types.ts

// ADICIONE 'unavailable' A ESTA LISTA
export type VehicleStatus = 'available' | 'in-use' | 'reserved' | 'maintenance' | 'unavailable';

export interface Vehicle {
  id: number;
  name: string;
  model: string | null;
  license_plate: string;
  image_url: string | null;
  status: VehicleStatus; // O tipo agora é mais específico
  passengers: number | null;
  features: string | null;
  monitor_fuel: boolean; // ✅ CAMPO ADICIONADO
  created_at: string;
}

export interface Booking {
  id: number;
  vehicle_id: number;
  user_id: number;
  type: 'checkout' | 'schedule';
  status: 'pending' | 'confirmed' | 'denied' | 'completed';
  purpose: string | null;
  observation: string | null;
  start_time: string;
  end_time: string | null;
  start_mileage: number | null;
  end_mileage: number | null;
  parking_location: string | null;
  created_at: string;
  handled_by: number | null;
}

// Tipo de veículo que inclui suas reservas
export interface VehicleWithBookings extends Vehicle {
  bookings: BookingWithVehicle[];
}

export interface User {
  id: number;
  email: string;
}

export interface BookingWithVehicle extends Booking {
  vehicle: Vehicle;
  user: User;
}