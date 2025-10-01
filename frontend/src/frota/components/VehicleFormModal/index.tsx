import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../../types';
import './styles.css';
import { X, Car, Hash, Users, Image as ImageIcon } from 'lucide-react';
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

  // file = arquivo selecionado agora
  const [file, setFile] = useState<File | null>(null);
  // localPreview = URL.createObjectURL(file) quando o usuário seleciona um arquivo
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  // remotePreview = caminho vindo do backend (pode ser relativo ou absoluto)
  const [remotePreview, setRemotePreview] = useState<string | null>(null);

  const [showExpanded, setShowExpanded] = useState(false);

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
      setRemotePreview(vehicleToEdit.image_url || null);
      // limpa a seleção local quando abrimos o modal com um veículo existente
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
      setFile(null);
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
      }
      setRemotePreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, vehicleToEdit]);

  // limpa objectURL quando localPreview muda / componente desmonta
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);

      // cria preview local
      const url = URL.createObjectURL(f);
      // revoga preview anterior se existir
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(url);

      // opcional: esconder preview remoto (vamos usar local quando houver arquivo)
      setRemotePreview(null);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  // monta URL completa quando backend retorna caminho relativo
  const resolveRemoteUrl = (src: string | null) => {
    if (!src) return null;
    // se já é data: ou http(s) usa direto
    if (src.startsWith('data:') || src.startsWith('http')) return src;

    // tenta usar VITE_WS_URL (raiz do servidor) e VITE_API_URL como fallback
    const ws = (import.meta as any).env?.VITE_WS_URL || (import.meta as any).env?.VITE_API_URL || '';
    if (!ws) return src;

    // junta sem duplicar barras
    if (src.startsWith('/')) return `${ws}${src}`;
    return `${ws}/${src}`;
  };

  // prioridade: localPreview (arquivo novo) > remotePreview (do backend)
  const displaySrc = localPreview || (remotePreview ? resolveRemoteUrl(remotePreview) : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = remotePreview; // pode ser null

    try {
      if (file) {
        const upload = await uploadVehicleImage(file);
        // backend pode retornar file_url absoluto ou relativo — mantemos o valor retornado
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
          <h3>{isEditing ? 'Editar Veículo' : 'Veículo'}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-modal-body">
            <div className="input-group">
              <label><Car size={16}/> Nome do Veículo</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="input-group">
              <label><Hash size={16}/> Placa</label>
              <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required />
            </div>

            <div className="input-group">
              <label><ImageIcon size={16}/> Imagem do Veículo</label>

              <button type="button" onClick={handleSelectFileClick} className="btn-img">
                Selecionar Imagem
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {/* Preview pequeno */}
              {displaySrc ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <span className="preview-meta">Imagem anexada (clique para expandir)</span>
                  <img
                    src={displaySrc}
                    alt="Preview"
                    className="preview-img"
                    onClick={() => setShowExpanded(true)}
                    onError={() => {
                      // se falhar no carregamento, mostra aviso no console
                      console.warn('Erro ao carregar imagem de preview:', displaySrc);
                    }}
                  />
                </div>
              ) : null}
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

      {/* Overlay de imagem expandida */}
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
