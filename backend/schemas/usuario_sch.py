# backend/schemas.py
from pydantic import BaseModel

class UsuarioCreate(BaseModel):
    nombre: str
    correo: str
    contrasena: str
    perfil_id: int  # FK al perfil
    experiencia_id: int  # FK a la experiencia
