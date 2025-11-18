# backend/frota/models/fuel_supply.py
import enum
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Enum as SQLAlchemyEnum, Boolean, Date, Time, Numeric, ForeignKey
from sqlalchemy.sql import func
from ..database import Base
from sqlalchemy.orm import relationship

class FuelSupply(Base):
    __tablename__ = "fuel_supplies"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relacionamentos
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    user_id = Column(Integer, nullable=False)  # ✅ REMOVIDA FOREIGN KEY "users.id"
    
    # Dados de Saída
    departure_date = Column(Date, nullable=False)
    departure_time = Column(Time, nullable=False)
    departure_km = Column(Integer, nullable=False)
    departure_amount = Column(Numeric(10, 2), nullable=False)
    
    # Dados de Retorno
    return_date = Column(Date, nullable=False)
    return_time = Column(Time, nullable=False)
    return_km = Column(Integer, nullable=False)
    return_amount = Column(Numeric(10, 2), nullable=False)
    
    # Timestamps
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # ✅ APENAS RELACIONAMENTO COM VEHICLE
    vehicle = relationship("Vehicle", back_populates="fuel_supplies")
    # user = relationship("User")  # ✅ COMENTADO TEMPORARIAMENTE