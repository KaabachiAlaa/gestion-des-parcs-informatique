from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.models.User import User
from app.database.connection import get_db
from app.database.models.Role import Role
from app.schemas.role import RoleCreate, RoleResponse
from app.security.dependencies import require_role,get_current_user


router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.post("/", response_model=RoleResponse)
def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin"))
):
    new_role = Role(
        **role.model_dump()
    )

    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return new_role


@router.get("/", response_model=list[RoleResponse])
def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Role).all()


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = db.query(Role).filter(
        Role.id == role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    return role