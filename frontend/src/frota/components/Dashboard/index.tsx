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
  const reservedCount = vehicles.filter(v => v.status === 'reserved').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;

  const stats = [
    { title: 'Disponíveis', count: availableCount, Icon: Car, theme: 'available' },
    { title: 'Em Uso', count: inUseCount, Icon: Clock, theme: 'in-use' },
    { title: 'Reservados', count: reservedCount, Icon: CheckCircle, theme: 'reserved' },
    { title: 'Manutenção', count: maintenanceCount, Icon: AlertTriangle, theme: 'maintenance' },
  ];

  return (
    <div className="dashboard-grid">
      {stats.map(({ title, count, Icon, theme }) => (
        <div key={title} className={`status-card theme-${theme}`}>
          <div className="status-info">
            <span className="status-title">{title}</span>
            <span className="status-count">{count}</span>
          </div>
          <div className="status-icon-wrapper">
            <Icon size={24} color="white" />
          </div>
        </div>
      ))}
    </div>
  );
};