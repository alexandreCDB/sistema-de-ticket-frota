from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import shutil
import os
import uuid
from backend.dependencies import get_current_user

router = APIRouter()

# A pasta de uploads agora fica dentro do 'backend' para simplicidade
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image", status_code=201)
async def upload_vehicle_image(file: UploadFile = File(...), user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem fazer upload de imagens")

    file_extension = os.path.splitext(file.filename)[1] or ".png"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    # Retorna o URL RELATIVO. O frontend irá completá-lo.
    # Isto é mais robusto do que construir o URL completo no backend.
    file_url = f"/uploads/{unique_filename}"
    
    return {"file_url": file_url}