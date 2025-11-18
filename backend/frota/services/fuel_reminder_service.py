# backend/frota/services/fuel_reminder_service.py
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.ticket.models.notification import Notification, NotificationType
from backend.frota.models.vehicle import Vehicle, VehicleStatus
from backend.database.database import get_db
from backend.websocket.service.ws_instance import manager
import logging

logger = logging.getLogger(__name__)

class FuelReminderService:
    def __init__(self):
        self.is_running = False
    
    async def start_scheduler(self):
        """Inicia o agendador de notificações de abastecimento"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("🚀 Agendador de notificações de abastecimento iniciado")
        
        while self.is_running:
            try:
                now = datetime.now()
                
                # Verificar se é sexta-feira 18:00 ou segunda-feira 18:00
                if self._should_send_reminder(now):
                    await self.send_fuel_reminders()
                    # Esperar 24 horas para evitar múltiplos envios no mesmo dia
                    await asyncio.sleep(24 * 60 * 60)
                else:
                    # Verificar a cada minuto
                    await asyncio.sleep(60)
                    
            except Exception as e:
                logger.error(f"❌ Erro no agendador de abastecimento: {e}")
                await asyncio.sleep(60)
    
    def _should_send_reminder(self, now: datetime) -> bool:
        """Verifica se deve enviar lembrete baseado no dia e hora"""
        # Sexta-feira = 4, Segunda-feira = 0
        is_friday = now.weekday() == 4  # 4 = sexta
        is_monday = now.weekday() == 0  # 0 = segunda
        is_correct_time = now.hour == 18 and now.minute == 0  # 18:00
        
        return (is_friday or is_monday) and is_correct_time
    
    async def send_fuel_reminders(self):
        """Envia notificações de lembrete de abastecimento"""
        try:
            logger.info("⛽ Enviando lembretes de abastecimento...")
            
            # Buscar veículos que precisam de monitoramento
            db = next(get_db())
            vehicles_to_monitor = self._get_vehicles_to_monitor(db)
            
            if not vehicles_to_monitor:
                logger.info("📝 Nenhum veículo precisa de monitoramento de abastecimento")
                return
            
            # Criar notificação para TODOS os usuários (broadcast)
            for vehicle in vehicles_to_monitor:
                await self._create_fuel_notification(db, vehicle)
            
            logger.info(f"✅ Lembretes enviados para {len(vehicles_to_monitor)} veículos")
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar lembretes: {e}")
    
    def _get_vehicles_to_monitor(self, db: Session) -> list[Vehicle]:
        """Busca veículos com monitor_fuel ativo - versão corrigida"""
        try:
            # ✅ QUERY CORRETA com todas as colunas que existem
            result = db.execute(text("""
                SELECT id, name, license_plate, status, monitor_fuel 
                FROM vehicles 
                WHERE monitor_fuel = true 
                AND status IN ('available', 'in-use')
            """))
            
            vehicles = []
            for row in result:
                # Criar um objeto Vehicle com todas as colunas que existem
                vehicle = Vehicle(
                    id=row[0],
                    name=row[1],
                    license_plate=row[2],
                    status=row[3],
                    monitor_fuel=row[4]
                )
                vehicles.append(vehicle)
            
            logger.info(f"🔍 Encontrados {len(vehicles)} veículos para monitoramento")
            return vehicles
            
        except Exception as e:
            logger.error(f"❌ Erro ao buscar veículos: {e}")
            return []
    
    async def _create_fuel_notification(self, db: Session, vehicle: Vehicle):
        """Cria notificação de abastecimento para um veículo"""
        try:
            # Mensagem da notificação
            message = f"⛽ Lembrete de abastecimento: {vehicle.name} ({vehicle.license_plate}) precisa ser abastecido"
            
            # Criar notificação no banco (user_id=0 = notificação global)
            notification = Notification(
                user_id=0,  # 0 = notificação global/sistema
                vehicle_id=vehicle.id,
                message=message,
                notification_type=NotificationType.fuel_reminder,
                is_read=False
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            # Enviar via WebSocket para TODOS os usuários online
            await self._broadcast_fuel_reminder(notification)
            
            logger.info(f"📨 Notificação criada para {vehicle.name}")
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Erro ao criar notificação para {vehicle.name}: {e}")
    
    async def _broadcast_fuel_reminder(self, notification):
        """Envia notificação de lembrete de abastecimento para todos os usuários"""
        message_data = {
            "type": "fuel_reminder",
            "message": {
                "id": notification.id,
                "vehicle_id": notification.vehicle_id,
                "message": notification.message,
                "notification_type": "fuel_reminder"
            }
        }
        
        await manager.broadcast("notification", message_data)
    
    def stop(self):
        """Para o agendador"""
        self.is_running = False

# Instância global
fuel_reminder_service = FuelReminderService()