import os
from fastapi import BackgroundTasks
from sqlalchemy.orm import joinedload
from backend.database.database import SessionLocal
from backend.ticket.models.ticket import Ticket
from backend.ticket.models.message import Message
from backend.ticket.services.email import send_ticket_closed_email


def send_ticket_closed_email_background(background_tasks: BackgroundTasks, ticket_id: int):
    
    db = SessionLocal()
    try:
       
        ticket:Ticket = (
            db.query(Ticket)
            .options(
                joinedload(Ticket.messages).joinedload(Message.sender),  
                joinedload(Ticket.requester),
                joinedload(Ticket.assignee)
            )
            .filter(Ticket.id == ticket_id)
            .first()
        )

        if not ticket:
            return 

       
        messages_html = ""
        if ticket.messages:
            messages_html += "<h3>Histórico de Mensagens:</h3><ul>"
            for msg in sorted(ticket.messages, key=lambda m: m.sent_at):
                sender_name = msg.sender.email.split("@")[0] if msg.sender else "Desconhecido"
                messages_html += f"<li><b>{sender_name}</b> ({msg.sent_at.strftime('%d/%m/%Y %H:%M:%S')}): {msg.content}</li>"
            messages_html += "</ul>"

        html_body = f"""
        <html>
          <head>
            <style>
              body {{
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f7;
                margin: 0;
                padding: 0;
                color: #333333;
              }}
              .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                padding: 20px;
                border: 1px solid #e0e0e0;
              }}
              h2 {{
                color: #1a73e8;
                font-size: 24px;
                margin-bottom: 10px;
              }}
              h3 {{
                color: #555555;
                font-size: 18px;
                margin-bottom: 8px;
              }}
              p {{
                font-size: 14px;
                line-height: 1.6;
                margin: 5px 0;
              }}
              ul {{
                padding-left: 20px;
                margin: 10px 0;
              }}
              li {{
                margin-bottom: 8px;
              }}
              .label {{
                color: #555555;
              }}
              .value {{
                color: #000000;
                font-weight: bold;
              }}
              .status-closed {{
                color: #d93025;
                font-weight: bold;
              }}
              .attachments {{
                margin-top: 15px;
              }}
              .attachment-item {{
                display: block;
                margin-bottom: 5px;
                color: #1a73e8;
                text-decoration: none;
              }}
              .footer {{
                font-size: 12px;
                color: #999999;
                margin-top: 20px;
                border-top: 1px solid #e0e0e0;
                padding-top: 10px;
                text-align: center;
              }}
              @media screen and (max-width: 640px) {{
                .email-container {{
                  padding: 15px;
                }}
                h2 {{
                  font-size: 20px;
                }}
                h3 {{
                  font-size: 16px;
                }}
                p, li {{
                  font-size: 13px;
                }}
              }}
            </style>
          </head>
          <body>
            <div class="email-container">
              <h2>Chamado #{ticket.id} foi fechado</h2>
              <p><span class="label">Título:</span> <span class="value">{ticket.title}</span></p>
              <p><span class="label">Status:</span> <span class="status-closed">{ticket.status}</span></p>
              <p><span class="label">Categoria:</span> <span class="value">{ticket.category}</span></p>
              <p><span class="label">Prioridade:</span> <span class="value">{ticket.priority}</span></p>
              <p><span class="label">Solicitante:</span> <span class="value">{ticket.requester.email if ticket.requester else 'Desconhecido'}</span></p>
              <p><span class="label">Atribuído:</span> <span class="value">{ticket.assignee.email if ticket.assignee else 'Não atribuído'}</span></p>
              <p><span class="label">Descrição:</span> <span class="value">{ticket.description}</span></p>

              {f'<p><span class="label">Observação do fechamento:</span> <span class="value">{ticket.observation}</span></p>' if ticket.observation else ''}
              
              
              {messages_html}

              <div class="attachments">
        """

        

        html_body += """
              </div>
              <div class="footer">
                Este é um email automático, por favor não responda.
              </div>
            </div>
          </body>
        </html>
        """

       
        attachments = []
        if ticket.attachment_url:
            file_path = os.path.join(os.getcwd(), ticket.attachment_url.strip("/"))
            if os.path.exists(file_path):
                attachments.append(file_path)

        
        recipients = [
            "wallacevidoto.docebrinquedo@gmail.com",
            # "paulo.henrique@docebrinquedo.com.br",
        ]

        if ticket.requester and ticket.requester.email:
            recipients.append(ticket.requester.email)

        if ticket.assignee and ticket.assignee.email:
            recipients.append(ticket.assignee.email)

        background_tasks.add_task(
            send_ticket_closed_email,
            subject=f"Chamado #{ticket.id} Finalizado",
            recipients=recipients,
            html_body=html_body,
            attachments=attachments
        )
    except:
     pass
    finally:
        db.close()
