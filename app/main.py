from fastapi import FastAPI
from app.routers import roles

from app.routers import (
    categories,
    location,
    materials,
    users,
    repairs,
    request,
    auth
)


app = FastAPI(
    title="Gestion des parcs informatiques",
    description="API pour gérer materiel informatique",
    version="1.0.0"
)


app.include_router(roles.router)
app.include_router(categories.router)
app.include_router(location.router)
app.include_router(materials.router)
app.include_router(users.router)
app.include_router(repairs.router)
app.include_router(request.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "IT Park Management API is running"
    }