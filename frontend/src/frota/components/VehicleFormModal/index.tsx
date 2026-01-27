import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, VehicleStatus } from '../../types';
import './styles.css';
import { X, Car, Hash, Users, Image as ImageIcon, ListChecks, Fuel } from 'lucide-react';
import { uploadVehicleImage, updateVehicleStatus } from '../../services/frota.services';

const STATUS_TRANSLATIONS: Record<VehicleStatus, string> = {
  available: 'Disponível',
  maintenance: 'Manutenção',
  unavailable: 'Indisponível',
  'in-use': 'Em Uso',
  reserved: 'Reservado',
};

const ADMIN_EDITABLE_STATUSES: VehicleStatus[] = [
  'available',
  'maintenance',
  'unavailable',
];

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
  const [status, setStatus] = useState<VehicleStatus>('available');
  const [monitorFuel, setMonitorFuel] = useState(false);
  const [categories, setCategories] = useState<'carro' | 'caminhao' | ''>(''); // ✅ NOVO ESTADO

  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [remotePreview, setRemotePreview] = useState<string | null>(null);
  const [showExpanded, setShowExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!vehicleToEdit;

  useEffect(() => {
    if (!isOpen) return;
    setShowExpanded(false);

    if (vehicleToEdit) {
      setName(vehicleToEdit.name);
      setLicensePlate(vehicleToEdit.license_plate);
      setModel(vehicleToEdit.model || '');
      setPassengers(vehicleToEdit.passengers?.toString() || '');
      setFeatures(vehicleToEdit.features || '');
      setRemotePreview(vehicleToEdit.image_url || null);
      setStatus(vehicleToEdit.status);
      setMonitorFuel(vehicleToEdit.monitor_fuel || false);
      setCategories(vehicleToEdit.categories || ''); // ✅ CARREGA CATEGORIA
      setFile(null);
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
      }
    } else {
      setName('');
      setLicensePlate('');
      setModel('');
      setPassengers('');
      setFeatures('');
      setStatus('available');
      setMonitorFuel(false);
      setCategories(''); // ✅ PADRÃO
      setFile(null);
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
      }
      setRemotePreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, vehicleToEdit]);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const resolveRemoteUrl = (src: string | null) => {
    if (!src) return null;
    if (src.startsWith('data:') || src.startsWith('http')) return src;

    const baseUrl = (import.meta as any).env?.VITE_WS_URL || (import.meta as any).env?.VITE_API_URL || '';
    if (!baseUrl) return src;

    const cleanBaseUrl = baseUrl.replace(/\/api$/, '');

    return src.startsWith('/') ? `${cleanBaseUrl}${src}` : `${cleanBaseUrl}/${src}`;
  };

  const displaySrc = localPreview || (remotePreview ? resolveRemoteUrl(remotePreview) : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(url);
      setRemotePreview(null);
    }
  };
  const handleSelectFileClick = () => { fileInputRef.current?.click(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = remotePreview;

    // ✅ DEBUG 1: Verificar estado do checkbox
    console.log('🔍 DEBUG 1 - Estado do monitorFuel:', monitorFuel);

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
        monitor_fuel: monitorFuel,
        categories: categories || null, // ✅ ENVIA CATEGORIA
      };

      // ✅ DEBUG 2: Verificar dados antes de enviar
      console.log('🔍 DEBUG 2 - Dados enviados:', vehicleData);

      onSave(vehicleData, vehicleToEdit?.id);

    } catch (err) {
      console.error('Erro ao salvar veículo:', err);
      alert('Erro ao salvar veículo. Veja o console.');
    }
  };

  const handleStatusChange = async (newStatus: VehicleStatus) => {
    if (!isEditing || newStatus === status) return;

    setStatus(newStatus);
    try {
      await updateVehicleStatus(vehicleToEdit.id, { status: newStatus });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Falha ao atualizar o status. O status original foi restaurado.");
      setStatus(vehicleToEdit.status);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="form-modal-backdrop">
      <div className="form-modal-content">
        <div className="form-modal-header">
          <h3>{isEditing ? 'Editar Veículo' : 'Adicionar Veículo'}</h3>
        </div>

        <form onSubmit={handleSubmit} id="vehicle-form">
          <div className="form-modal-body">

            <div className="input-group">
              <label><Car size={16} /> Nome do Veículo</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label><Hash size={16} /> Placa</label>
              <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required />
            </div>

            <div className="input-group">
              <label><ImageIcon size={16} /> Imagem do Veículo</label>
              <button type="button" onClick={handleSelectFileClick} className="btn-img">
                Selecionar Imagem
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
              {displaySrc && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span className="preview-meta">Imagem anexada (clique para expandir)</span>
                  <img src={displaySrc} alt="Preview" className="preview-img" onClick={() => setShowExpanded(true)} />
                </div>
              )}
            </div>

            <div className="input-group">
              <label><Users size={16} /> Passageiros</label>
              <input type="number" value={passengers} onChange={e => setPassengers(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Modelo</label>
              <input value={model} onChange={e => setModel(e.target.value)} />
            </div>

            {/* ✅ NOVO CAMPO: CATEGORIA (Carro ou Caminhão) */}
            <div className="input-group">
              <label>Categoria</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                <label className="checkbox-label" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="category"
                    value="carro"
                    checked={categories === 'carro'}
                    onChange={() => setCategories('carro')}
                    className="checkbox-input"
                  />
                  <span className="checkmark" style={{ borderRadius: '50%' }}>
                    {categories === 'carro' && '✓'}
                  </span>
                  Carro
                </label>
                <label className="checkbox-label" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="category"
                    value="caminhao"
                    checked={categories === 'caminhao'}
                    onChange={() => setCategories('caminhao')}
                    className="checkbox-input"
                  />
                  <span className="checkmark" style={{ borderRadius: '50%' }}>
                    {categories === 'caminhao' && '✓'}
                  </span>
                  Caminhão
                </label>
              </div>
            </div>

            {/* ✅ NOVO CAMPO: MONITORAR ABASTECIMENTO */}
            <div className="input-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={monitorFuel}
                  onChange={(e) => setMonitorFuel(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkmark">
                  {monitorFuel && '✓'}
                </span>
                <Fuel size={16} style={{ marginRight: '8px' }} />
                Monitorar Abastecimento
              </label>

            </div>

            <div className="input-group">
              <label><ListChecks size={16} /> Status do Veículo</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as VehicleStatus)}
                disabled={!isEditing}
              >
                {!ADMIN_EDITABLE_STATUSES.includes(status as VehicleStatus) && (
                  <option value={status} disabled>{STATUS_TRANSLATIONS[status]}</option>
                )}
                {ADMIN_EDITABLE_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_TRANSLATIONS[s]}</option>
                ))}
              </select>
              <small>{isEditing ? 'Status como "Em Uso" ou "Reservado" são automáticos.' : 'O status inicial será "Disponível".'}</small>
            </div>
          </div>

          <div className="form-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" form="vehicle-form" className="btn-save" disabled={isSaving}>
              {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Veículo')}
            </button>
          </div>
        </form>
      </div>

      {showExpanded && displaySrc && (
        <div className="image-overlay" onClick={() => setShowExpanded(false)}>
          <div className="image-overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-close-btn botao-fechar" onClick={() => setShowExpanded(false)} aria-label="Fechar imagem">
              <X size={26} />
            </button>
            <img src={displaySrc} alt="Preview expandido" className="expanded-img" />
          </div>
        </div>
      )}
    </div>
  );
};