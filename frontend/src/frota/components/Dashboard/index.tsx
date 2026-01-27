import React from 'react';
import './styles.css';
import { Vehicle } from '../../types';
import { Car, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
}

export const Dashboard: React.FC<DashboardProps> = ({ vehicles }) => {
  const availableCount = vehicles.filter(v => v.status === 'available').length;
  const inUseCount = vehicles.filter(v => v.status === 'in-use').length;
  const unavailableCount = vehicles.filter(v => v.status === 'unavailable' || v.status === 'maintenance').length;
  const totalCount = vehicles.length;

  const stats = [
    { title: 'Disponíveis', count: availableCount, Icon: Car, theme: 'available' },
    { title: 'Em Uso', count: inUseCount, Icon: Clock, theme: 'in-use' },
    { title: 'Indisponíveis', count: unavailableCount, Icon: AlertTriangle, theme: 'maintenance' },
    { title: 'Total da Frota', count: totalCount, Icon: CheckCircle, theme: 'total' },
  ];

  return (
    <div className="dashboard-grid">
      {stats.map(({ title, count, Icon, theme }) => (
        <div key={title} className={`status-card theme-${theme}`}>
          <div className="status-icon-wrapper">
            <Icon size={24} />
          </div>
          <div className="status-info">
            <span className="status-count">{count}</span>
            <span className="status-title">{title}</span>
          </div>
        </div>
      ))}
    </div>
  );
};