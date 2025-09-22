import datetime
from fastapi import  BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr, BaseModel
from typing import List
from email.mime.multipart import MIMEMultipart


conf = ConnectionConfig(
    MAIL_USERNAME="ti.docebrinquedo@gmail.com",
    MAIL_PASSWORD="gwzzvqnlfwqednns",
    MAIL_FROM="ti.docebrinquedo@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,   
    MAIL_SSL_TLS=False,   
    USE_CREDENTIALS=True
)
fm = FastMail(conf)


async def send_ticket_closed_email(subject: str, recipients: List[str], html_body: str, attachments: List[str] = None):
    
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=html_body,
        subtype=MessageType.html,
        attachments=attachments or []
    )

    await fm.send_message(message)
    

async def send_email2(subject: str, recipients: List[EmailStr], body: str):
    """Função utilitária para enviar e-mails"""
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)



def send_email3(ticket, recipients: list[str]):
    """Envia e-mail com HTML e opcionalmente com imagem do ticket."""

    # monta mensagem
    msg = MIMEMultipart("related")
    msg["From"] = SMTP_EMAIL
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = f"Chamado #{ticket.id} foi fechado"

    # renderiza HTML (simples com f-string; poderia ser Jinja2 também)
    html_body = f"""
    <html>
      <body>
        <h2>Chamado #{ticket.id} foi fechado</h2>
        <p><b>Título:</b> {ticket.title}</p>
        <p><b>Status:</b> {ticket.status}</p>
        <p><b>Categoria:</b> {ticket.category}</p>
        <p><b>Prioridade:</b> {ticket.priority}</p>
        <p><b>Solicitante:</b> {ticket.requester.email}</p>
        <p><b>Atribuído:</b> {ticket.assignee.email if ticket.assignee else 'Não atribuído'}</p>
        <p><b>Descrição:</b> {ticket.description}</p>
        <p><i>Fechado em {datetime.now().strftime('%d/%m/%Y %H:%M')}</i></p>
    """

    if ticket.attachment_url:
        html_body += '<hr><p>Veja o anexo:</p><img src="cid:ticket_image" width="300"/>'

    html_body += "</body></html>"

    msg.attach(MIMEText(html_body, "html"))

    # anexa imagem se existir
    if ticket.attachment_url:
        try:
            resp = requests.get(f"http://192.168.13.249:8000{ticket.attachment_url}", timeout=10)
            resp.raise_for_status()
            image_part = MIMEImage(resp.content)
            image_part.add_header("Content-ID", "<ticket_image>")
            msg.attach(image_part)
        except Exception as e:
            print(f"Falha ao anexar imagem: {e}")

    # envia
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, recipients, msg.as_string())

def send_email_background2(background_tasks: BackgroundTasks, ticket, recipients: list[str]):
    background_tasks.add_task(send_email2, ticket, recipients)