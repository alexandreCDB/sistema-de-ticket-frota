export interface Vehicle {
  id: number;
  name: string;
  model: string | null;
  license_plate: string;
  image_url: string | null;
  status: 'available' | 'in-use' | 'reserved' | 'maintenance' | string;
  passengers: number | null;
  features: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  vehicle_id: number;
  user_id: number;
  type: 'checkout' | 'schedule' | string;
  status: 'pending' | 'confirmed' | 'denied' | 'completed' | string;
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
  user: User;  // <-- agora existe
}
