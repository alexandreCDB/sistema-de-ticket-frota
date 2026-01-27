# backend/frota/services/vehicle_status_service.py
import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from ..models.booking import Booking
from ..models.vehicle import Vehicle, VehicleStatus
from ..database import SessionLocal
import logging

logger = logging.getLogger(__name__)

class VehicleStatusService:
    def __init__(self):
        self.is_running = False

    async def start_scheduler(self):
        """Inicia o agendador de atualização de status de veículos"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("🚗 Agendador de status de veículos iniciado")
        
        while self.is_running:
            try:
                await self.update_all_vehicle_statuses()
                # Verificar a cada 1 minuto
                await asyncio.sleep(60)
            except Exception as e:
                logger.error(f"❌ Erro no agendador de status de veículos: {e}")
                await asyncio.sleep(60)

    async def update_all_vehicle_statuses(self):
        """Atualiza o status de todos os veículos baseando-se nas regras de tempo"""
        db = SessionLocal()
        try:
            now = datetime.now(timezone.utc)
            vehicles = db.query(Vehicle).all()
            
            for v in vehicles:
                # 1. Verificar se há algum booking 'in-use' ATIVO (status='in-use')
                # Se estiver 'in-use', o veículo DEVE estar 'in-use'
                active_booking = db.query(Booking).filter(
                    Booking.vehicle_id == v.id,
                    Booking.status == "in-use"
                ).first()
                
                if active_booking:
                    if v.status != VehicleStatus.in_use:
                        v.status = VehicleStatus.in_use
                        db.commit()
                    continue

                # 2. Verificar se há algum booking 'confirmed' que deve entrar em 'in-use'
                # Checkout: inicia em 30 min
                # Schedule: inicia em 1 hora
                confirmed_bookings = db.query(Booking).filter(
                    Booking.vehicle_id == v.id,
                    Booking.status == "confirmed"
                ).all()
                
                should_be_in_use = False
                for cb in confirmed_bookings:
                    limit = now + (timedelta(minutes=30) if cb.type == "checkout" else timedelta(hours=1))
                    if cb.start_time <= limit:
                        should_be_in_use = True
                        break
                
                new_status = VehicleStatus.in_use if should_be_in_use else VehicleStatus.available
                
                # Manutenção e Unavailable são prioritários se definidos manualmente
                if v.status in [VehicleStatus.maintenance, VehicleStatus.unavailable]:
                    continue
                    
                if v.status != new_status:
                    logger.info(f"🔄 Atualizando status do veículo {v.name} ({v.license_plate}): {v.status} -> {new_status}")
                    v.status = new_status
                    db.commit()
                    
        except Exception as e:
            logger.error(f"❌ Erro ao atualizar statuses: {e}")
            db.rollback()
        finally:
            db.close()

    def stop(self):
        """Para o agendador"""
        self.is_running = False

# Instância global
vehicle_status_service = VehicleStatusService()
