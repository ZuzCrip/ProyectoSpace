from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.entidades.usuario import Usuario

#Revisar
def seed_usuarios():
    db = SessionLocal

    # Lista de usuarios iniciales
    usuarios_iniciales = [
        {"nombre": "Alan Aguilar", "correo": "alan@example.com", "contrasena": "1234", "perfil_id": "1"},
        {"nombre": "Maria Perez", "correo": "maria@example.com", "contrasena": "abcd", "perfil_id": "2"},
        {"nombre": "Carlos Lopez", "correo": "carlos@example.com", "contrasena": "pass", "perfil_id": "3"},
    ]

    for u in usuarios_iniciales:
        # Evitar duplicados por correo
        if not db.query(Usuario).filter(Usuario.correo == u["correo"]).first():
            nuevo = Usuario(**u)
            db.add(nuevo)

    db.commit()
