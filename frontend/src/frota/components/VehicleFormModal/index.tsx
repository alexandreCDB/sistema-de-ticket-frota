import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types';
import './styles.css'; // Vamos criar este novo ficheiro de estilos
import { X, Car, Hash, Users, Image as ImageIcon, Sparkles } from 'lucide-react';
import { uploadVehicleImage } from '../../services/frota.services';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: any, vehicleId?: number) => void;
  vehicleToEdit: Vehicle | null;
  isSaving: boolean;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ isOpen, onClose, onSave, vehicleToEdit, isSaving }) => {
  const [formData, setFormData] = useState({
    name: '',
    license_plate: '',
    model: '',
    passengers: '',
    features: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isEditing = !!vehicleToEdit;

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        setFormData({
          name: vehicleToEdit.name,
          license_plate: vehicleToEdit.license_plate,
          model: vehicleToEdit.model || '',
          passengers: vehicleToEdit.passengers?.toString() || '',
          features: vehicleToEdit.features || '',
        });
      } else {
        // Limpa o formulário para adicionar um novo
        setFormData({ name: '', license_plate: '', model: '', passengers: '', features: '' });
      }
      setSelectedFile(null);
    }
  }, [vehicleToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl: string | null = vehicleToEdit?.image_url || null;

    try {
      if (selectedFile) {
        const uploadResponse = await uploadVehicleImage(selectedFile);
        finalImageUrl = uploadResponse.file_url;
      }

      const dataToSave = {
        name: formData.name,
        license_plate: formData.license_plate,
        model: formData.model || null,
        passengers: formData.passengers ? parseInt(formData.passengers, 10) : null,
        image_url: finalImageUrl,
        features: formData.features || null,
      };

      onSave(dataToSave, vehicleToEdit?.id);

    } catch (err) {
      console.error("Erro no processo de guardar:", err);
      alert("Ocorreu um erro ao guardar. Verifique a consola.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="form-modal-backdrop">
      <div className="form-modal-content">
        <div className="form-modal-header">
          <h3>{isEditing ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-modal-body">
            {/* Adicionámos todos os campos necessários, mas mantendo o design clean */}
            <div className="input-group">
              <label><Car size={16}/> Nome do Veículo*</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label><Hash size={16}/> Matrícula*</label>
              <input name="license_plate" value={formData.license_plate} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label><ImageIcon size={16}/> Imagem do Veículo</label>
              <input type="file" name="image_file" onChange={handleFileChange} accept="image/png, image/jpeg" />
            </div>
            <div className="input-group">
              <label><Sparkles size={16}/> Características</label>
              <input name="features" value={formData.features} onChange={handleChange} placeholder="Ex: Ar condicionado, GPS, Bluetooth" />
            </div>
             <div className="input-group">
              <label><Users size={16}/> Passageiros</label>
              <input type="number" name="passengers" value={formData.passengers} onChange={handleChange} />
            </div>
          </div>
          <div className="form-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? 'A Guardar...' : 'Guardar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};