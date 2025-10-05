from backend.database import SessionLocal
from backend.entidades.perfil import Perfil

def seed_perfiles():
    db = SessionLocal()

    perfiles = ["Estudiante", "Educador", "Cientifico", "Entusiasta", "Periodista"]

    for tipo in perfiles:
        if not db.query(Perfil).filter(Perfil.tipo == tipo).first():
            db.add(Perfil(tipo=tipo))

    db.commit()