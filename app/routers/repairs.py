from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.models.User import User
from app.security.dependencies import require_role
from app.database.connection import get_db
from app.database.models.Repair import Repair
from app.schemas.repair import (
    RepairCreate,
    RepairResponse,
    RepairUpdate
)


router = APIRouter(
    prefix="/repairs",
    tags=["Repairs"]
)


@router.post("/", response_model=RepairResponse)
def create_repair(
    repair: RepairCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin","Technicien"))
):
    new_repair = Repair(
        **repair.model_dump()
    )

    db.add(new_repair)
    db.commit()
    db.refresh(new_repair)

    return new_repair


@router.get("/", response_model=list[RepairResponse])
def get_repairs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin","Technicien"))

):
    return db.query(Repair).all()


@router.get("/{repair_id}", response_model=RepairResponse)
def get_repair(
    repair_id: int,
    db: Session = Depends(get_db)
):
    repair = db.query(Repair).filter(
        Repair.id == repair_id
    ).first()

    if not repair:
        raise HTTPException(
            status_code=404,
            detail="Repair not found"
        )

    return repair


@router.put("/{repair_id}", response_model=RepairResponse)
def update_repair(
    repair_id: int,
    repair_data: RepairUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin","Technicien"))
):
    repair = db.query(Repair).filter(
        Repair.id == repair_id
    ).first()

    if not repair:
        raise HTTPException(
            status_code=404,
            detail="Repair not found"
        )

    update_data = repair_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(repair, key, value)

    db.commit()
    db.refresh(repair)

    return repair

@router.delete("/{repair_id}")
def delete_request(
    repair_id:int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin"))

):
    repair = db.query(Repair).filter(
            Repair.id == repair_id
        ).first()
    
    if not repair:
        raise HTTPException(
            status_code=404,
            detail="request not found"
        )

    db.delete(repair)
    db.commit()

    return {"message": "repair deleted successfully"}