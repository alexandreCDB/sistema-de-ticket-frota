from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import shutil
import os
import uuid
from backend.dependencies import get_current_user

router = APIRouter()

# Define o diretório de uploads baseado na localização do ficheiro principal
# (Isto garante que a pasta 'uploads' fica na raiz do projeto)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Garante que o diretório de uploads existe
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/image", status_code=201)
async def upload_vehicle_image(file: UploadFile = File(...), user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem fazer upload de imagens")

    # Gera um nome de ficheiro único para evitar sobreposições e problemas de cache
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Guarda o ficheiro no disco do servidor
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    # Retorna o URL público do ficheiro, que será guardado na base de dados
    file_url = f"/uploads/{unique_filename}"
    
    return {"file_url": file_url}