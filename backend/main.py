# backend/main.py
from fastapi import FastAPI
from backend.database import Base, engine
from backend.api import usuario_api, perfil_api, experiencia_api  
from backend.entidades import usuario
from backend.rellenado_datos import perfiles_rll, experiencia_rll
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="NASA - SpaceApp")

#config cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # dominios permitidos
    allow_credentials=True,         # cookies o tokens
    allow_methods=["*"],            # GET, POST, PUT, DELETE...
    allow_headers=["*"],            # cabeceras como Authorization, Content-Type, etc.
)


# Borra y crea todas las tablas
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
# Rellena datos iniciales
perfiles_rll.seed_perfiles()
experiencia_rll.seed_perfiles()



# Registramos el router de usuarios
app.include_router(usuario_api.router)
app.include_router(perfil_api.router)
app.include_router(experiencia_api.router)

