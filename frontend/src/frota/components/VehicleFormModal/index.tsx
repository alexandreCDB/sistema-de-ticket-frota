import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../../types';
import './styles.css';
import { X, Car, Hash, Users, Image as ImageIcon, Sparkles } from 'lucide-react';
import { uploadVehicleImage } from '../../services/frota.services';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: any, vehicleId?: number) => void;
  vehicleToEdit: Vehicle | null;
  isSaving: boolean;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vehicleToEdit,
  isSaving
}) => {
  const [name, setName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [model, setModel] = useState('');
  const [passengers, setPassengers] = useState('');
  const [features, setFeatures] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!vehicleToEdit;

  useEffect(() => {
    if (!isOpen) return;

    if (vehicleToEdit) {
      setName(vehicleToEdit.name);
      setLicensePlate(vehicleToEdit.license_plate);
      setModel(vehicleToEdit.model || '');
      setPassengers(vehicleToEdit.passengers?.toString() || '');
      setFeatures(vehicleToEdit.features || '');
      setPreview(vehicleToEdit.image_url || null);
    } else {
      setName('');
      setLicensePlate('');
      setModel('');
      setPassengers('');
      setFeatures('');
      setFile(null);
      setPreview(null);
    }
  }, [isOpen, vehicleToEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setPreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = preview;

    try {
      if (file) {
        const upload = await uploadVehicleImage(file);
        imageUrl = upload.file_url;
      }

      const vehicleData = {
        name,
        license_plate: licensePlate,
        model: model || null,
        passengers: passengers ? parseInt(passengers, 10) : null,
        features: features || null,
        image_url: imageUrl || null,
      };

      onSave(vehicleData, vehicleToEdit?.id);
    } catch (err) {
      console.error('Erro ao salvar veículo:', err);
      alert('Erro ao salvar veículo. Veja o console.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="form-modal-backdrop">
      <div className="form-modal-content">
        <div className="form-modal-header">
          <h3>{isEditing ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</h3>
          
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-modal-body">
            <div className="input-group">
              <label><Car size={16}/> Nome do Veículo*</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="input-group">
              <label><Hash size={16}/> Matrícula*</label>
              <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required />
            </div>

            <div className="input-group">
              <label><ImageIcon size={16}/> Imagem do Veículo</label>
              {/* Botão visível para escolher arquivo */}
              <button type="button" onClick={handleSelectFileClick} className="btn-img">
                Selecionar Imagem
              </button>
              {/* Input real escondido */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {preview && <img src={preview} alt="Preview" style={{ marginTop: '0.5rem', maxHeight: '100px', maxWidth: '150px', borderRadius: '8px' }} />}
            </div>

            <div className="input-group">
              <label><Sparkles size={16}/> Características</label>
              <input value={features} onChange={e => setFeatures(e.target.value)} placeholder="Ex: Ar condicionado, GPS, Bluetooth" />
            </div>

            <div className="input-group">
              <label><Users size={16}/> Passageiros</label>
              <input type="number" value={passengers} onChange={e => setPassengers(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Modelo</label>
              <input value={model} onChange={e => setModel(e.target.value)} />
            </div>
          </div>

          <div className="form-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? 'A Guardar...' : 'Guardar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
