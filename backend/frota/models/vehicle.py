# backend/frota/models/vehicle.py
import enum
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Enum as SQLAlchemyEnum, Boolean
from sqlalchemy.sql import func
from ..database import Base
from sqlalchemy.orm import relationship

# CORRIGIDO: Nomes dos membros do Enum agora estão em minúsculo
class VehicleStatus(str, enum.Enum):
    available = "available"
    in_use = "in-use"
    reserved = "reserved"
    maintenance = "maintenance"
    unavailable = "unavailable"

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    model = Column(String(255), nullable=True)
    license_plate = Column(String(50), unique=True, nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    
    # O default também precisa ser atualizado para o nome em minúsculo
    status = Column(SQLAlchemyEnum(VehicleStatus), nullable=False, default=VehicleStatus.available)
    
    passengers = Column(Integer, nullable=True)
    features = Column(Text, nullable=True)
    
    # ✅ NOVO CAMPO: Categoria (carro ou caminhao)
    categories = Column(String(50), nullable=True)
    
    # ✅ NOVO CAMPO: Monitoramento de abastecimento
    monitor_fuel = Column(Boolean, nullable=False, default=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


    bookings = relationship("Booking", back_populates="vehicle")
    
    # ✅ NOVO RELACIONAMENTO: Abastecimentos
    fuel_supplies = relationship("FuelSupply", back_populates="vehicle")