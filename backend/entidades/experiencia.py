from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.database import Base

class Experiencia(Base):
    __tablename__ = "experiencia"

    id = Column(Integer, primary_key=True, index=True)
    nivel = Column(String(50), nullable=False, unique=True)

    # Relación inversa a Usuario
    usuarios = relationship("Usuario", back_populates="experiencia")
