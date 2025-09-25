import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types';
import '../CheckoutModal/styles.css';
import { X, Car, Hash, Users, Image as ImageIcon, Sparkles } from 'lucide-react';

// Interface interna do formulário atualizada
interface FormData {
  name: string;
  license_plate: string;
  model: string;
  passengers: string;
  image_url: string;
  features: string;
}

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: any, vehicleId?: number) => void;
  vehicleToEdit: Vehicle | null;
  isSaving: boolean;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ isOpen, onClose, onSave, vehicleToEdit, isSaving }) => {
  const [formData, setFormData] = useState<FormData>({ 
    name: '', license_plate: '', model: '', passengers: '', image_url: '', features: '' 
  });
  const isEditing = !!vehicleToEdit;

  useEffect(() => {
    if (vehicleToEdit && isOpen) {
      setFormData({
        name: vehicleToEdit.name,
        license_plate: vehicleToEdit.license_plate,
        model: vehicleToEdit.model || '',
        passengers: vehicleToEdit.passengers?.toString() || '',
        image_url: vehicleToEdit.image_url || '',
        features: vehicleToEdit.features || '',
      });
    } else {
      setFormData({ name: '', license_plate: '', model: '', passengers: '', image_url: '', features: '' });
    }
  }, [vehicleToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      passengers: formData.passengers ? parseInt(formData.passengers, 10) : null,
      // Garante que os campos opcionais são enviados como null se estiverem vazios
      model: formData.model || null,
      image_url: formData.image_url || null,
      features: formData.features || null,
    };
    onSave(dataToSave, vehicleToEdit?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</h2>
          <button onClick={onClose} className="modal-close-button"><X size={24} /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Campos obrigatórios */}
          <div className="form-group">
            <label className="form-label"><Car size={16}/> Nome do Veículo*</label>
            <input name="name" value={formData.name} onChange={handleChange} className="form-input" required/>
          </div>
          <div className="form-group">
            <label className="form-label"><Hash size={16}/> Matrícula*</label>
            <input name="license_plate" value={formData.license_plate} onChange={handleChange} className="form-input" required/>
          </div>

          {/* Campos opcionais */}
          <div className="form-group">
            <label className="form-label">Modelo</label>
            <input name="model" value={formData.model} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label"><Users size={16}/> Passageiros</label>
            <input type="number" name="passengers" value={formData.passengers} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label"><ImageIcon size={16}/> URL da Imagem</label>
            <input name="image_url" value={formData.image_url} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label"><Sparkles size={16}/> Características</label>
            <input name="features" value={formData.features} onChange={handleChange} className="form-input" placeholder="Ex: Ar condicionado, GPS, Bluetooth"/>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'A Guardar...' : 'Guardar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};