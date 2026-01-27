from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import shutil
import os
import uuid
from backend.dependencies import get_current_user

router = APIRouter()

# ✅ ALTERADO: Pasta separada para uploads da frota (evita conflito com outro sistema)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads_frota")
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

    # ✅ ALTERADO: URL relativo agora aponta para uploads_frota
    file_url = f"/uploads_frota/{unique_filename}"
    
    return {"file_url": file_url}
