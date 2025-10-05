from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.database import Base

class Perfil(Base):
    __tablename__ = "perfiles"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), nullable=False, unique=True)

    # Relación inversa a Usuario
    usuarios = relationship("Usuario", back_populates="perfil")
