export interface IUser {
  email: string
  is_active: boolean
  is_admin: boolean
  is_super_admin: boolean
  id: number
  lastSeen: Date;
  // NOVO CAMPO
  cnh_vencimento?: string | null; 
}