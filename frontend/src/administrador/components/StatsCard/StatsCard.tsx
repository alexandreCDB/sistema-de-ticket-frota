import React from "react";

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  progress?: number;
  subtitle?: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, progress, subtitle, color }) => (
  <div className={`card ${color}`}>
    <div className="card-header">
      <div>
        <span className="card-label">{label}</span>
        <span className="card-value">{value}</span>
      </div>
      <div className="icon-wrapper">{icon}</div>
    </div>
    {progress !== undefined && (
      <div className="card-progress">
        <div style={{ width: `${progress}%` }}></div>
      </div>
    )}
    {subtitle && <span className="card-subtitle">{subtitle}</span>}
  </div>
);

export default StatsCard;
