// src/frota/types/index.ts

export interface Vehicle {
  id: number;
  name: string;
  model: string | null;
  license_plate: string;
  image_url: string | null;
  status: 'available' | 'in-use' | 'reserved' | 'maintenance';
  passengers: number | null;
  features: string | null; // Receberemos como texto/JSON
  created_at: string; // Datas geralmente chegam como strings no formato ISO
}