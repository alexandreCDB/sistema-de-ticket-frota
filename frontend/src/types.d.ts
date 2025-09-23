export interface Vehicle {
  id: number;
  name: string;
  model?: string;
  license_plate: string;
  image_url?: string;
  status: "available" | "in-use" | "reserved" | "maintenance";
  passengers?: number;
  features?: string;
  created_at: string;
}
