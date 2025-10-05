from sqlalchemy.orm import Session
from backend.entidades.usuario import Usuario

def get_usuarios(db: Session):
    return db.query(Usuario).all()

def create_usuario(db: Session, nombre: str, correo: str, contrasena: str, perfil_id: str, experiencia_id: str):
    nuevo = Usuario(nombre=nombre, correo=correo, contrasena=contrasena, perfil_id=perfil_id, experiencia_id=experiencia_id)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

def delete_usuario(db: Session, id: int):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if usuario:
        db.delete(usuario)
        db.commit()
        return True
    return False
