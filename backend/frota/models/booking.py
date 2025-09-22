from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
# A linha abaixo também foi corrigida.
from ..database import Base

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    user_id = Column(Integer, nullable=False)
    type = Column(String(30), nullable=False)
    status = Column(String(30), nullable=False, default="pending")
    purpose = Column(String(255), nullable=True)
    observation = Column(Text, nullable=True)
    start_time = Column(TIMESTAMP(timezone=True), nullable=False)
    end_time = Column(TIMESTAMP(timezone=True), nullable=True)
    start_mileage = Column(Integer, nullable=True)
    end_mileage = Column(Integer, nullable=True)
    parking_location = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    handled_by = Column(Integer, nullable=True)

    vehicle = relationship("Vehicle", backref="bookings")