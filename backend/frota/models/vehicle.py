from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
# A linha abaixo foi corrigida.
# Importa o objeto 'Base' diretamente do arquivo 'database.py' que está um nível acima.
from ..database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    model = Column(String(255), nullable=True)
    license_plate = Column(String(50), unique=True, nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    status = Column(String(30), nullable=False, default="available")  # available, in-use, reserved, maintenance
    passengers = Column(Integer, nullable=True)
    features = Column(Text, nullable=True)  # JSON string or text
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
