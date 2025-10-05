from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.repositorio import usuario_repo as repo
from backend.entidades.perfil import Perfil
from backend.database import SessionLocal
from backend.schemas.usuario_sch import UsuarioCreate

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):
    return repo.get_usuarios(db)

@router.post("/")
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    # Revisar que el perfil exista
    perfil = db.query(Perfil).filter(Perfil.id == usuario.perfil_id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    
    return repo.create_usuario(
        db,
        nombre=usuario.nombre,
        correo=usuario.correo,
        contrasena=usuario.contrasena,
        perfil_id=usuario.perfil_id,
        experiencia_id=usuario.experiencia_id
    )

@router.delete("/{id}")
def eliminar_usuario(id: int, db: Session = Depends(get_db)):
    exito = repo.delete_usuario(db, id)
    return {"mensaje": "Usuario eliminado"} if exito else {"error": "Usuario no encontrado"}
