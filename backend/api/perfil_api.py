# backend/api/perfil_api.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.entidades.perfil import Perfil

router = APIRouter(prefix="/perfiles", tags=["Perfiles"])

# Dependencia DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def listar_perfiles(db: Session = Depends(get_db)):
    return db.query(Perfil).all()
