from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# CORS configuration so the browser can call the API from the frontend.
# The preflight OPTIONS request must be answered, otherwise login fails with 405.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
