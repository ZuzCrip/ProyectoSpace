from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(120), unique=True, nullable=False)
    contrasena = Column(String(100), nullable=False)

    # FK al Perfil
    perfil_id = Column(Integer, ForeignKey("perfiles.id"))
    perfil = relationship("Perfil", back_populates="usuarios")

    # FK a la Experiencia
    experiencia_id = Column(Integer, ForeignKey("experiencia.id"))
    experiencia = relationship("Experiencia", back_populates="usuarios")
