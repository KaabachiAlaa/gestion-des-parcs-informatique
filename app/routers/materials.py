from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.security.dependencies import get_current_user,require_role
from app.database.connection import get_db
from app.database.models.Material import Material
from app.database.models.User import User
from app.schemas.material import (
    MaterialCreate,
    MaterialResponse,
    MaterialUpdate
)


router = APIRouter(
    prefix="/materials",
    tags=["Materials"]
)


@router.post("/", response_model=MaterialResponse)
def create_material(
    material: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin","Technicien"))
    
):
    new_material = Material(
        **material.model_dump()
    )
    existing_material = db.query(Material).filter(
            Material.asset_code == new_material.asset_code
        ).first()
    print(existing_material)
    if existing_material:
        raise HTTPException(status_code=409,detail="A material with this assest code already exists")
    db.add(new_material)
    db.commit()
    db.refresh(new_material)

    return new_material


@router.get("/", response_model=list[MaterialResponse])
def get_materials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Material).all()


@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    material = db.query(Material).filter(
        Material.id == material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    return material


@router.put("/{material_id}", response_model=MaterialResponse)
def update_material(
    material_id: int,
    material_data: MaterialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin","Technicien"))
):
    material = db.query(Material).filter(
        Material.id == material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    update_data = material_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)

    return material


@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin","Technicien"))
):
    material = db.query(Material).filter(
        Material.id == material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    db.delete(material)
    db.commit()

    return {"message": "Material deleted successfully"}