from sqlalchemy import Column, Integer, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from backend.database.database import Base

class CnhInfoModel(Base):
    __tablename__ = "cnh_info"
    __table_args__ = {'schema': None} # Mantido para esquema padrao
    
    # 🚨 CORREÇÃO: Remova a Chave Estrangeira
    # user_id = Column(Integer, ForeignKey('users.id'), primary_key=True, unique=True)
    user_id = Column(Integer, primary_key=True, unique=True) # <-- CORRIGIDO
    
    cnh_vencimento = Column(Date, nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())