from backend.database import SessionLocal
from backend.entidades.experiencia import Experiencia

def seed_perfiles():
    db = SessionLocal()

    niveles = ["Novato", "Intermedio", "Avanzado"]

    for nivel in niveles:
        if not db.query(Experiencia).filter(Experiencia.nivel == nivel).first():
            db.add(Experiencia(nivel=nivel))

    db.commit()