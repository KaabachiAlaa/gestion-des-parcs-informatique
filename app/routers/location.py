from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models.Location import Location
from app.schemas.location import LocationCreate, LocationResponse
from app.security.dependencies import require_role,get_current_user
from app.database.models import User

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)

@router.post("/", response_model=LocationResponse)
def create_location(
    location: LocationCreate,
    current_user: User = Depends(require_role("Admin")),
    db: Session = Depends(get_db)
):
    new_location = Location(
        place=location.place,
        description=location.description
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)

    return new_location


@router.get("/", response_model=list[LocationResponse])
def get_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Location).all()


@router.get("/{location_id}", response_model=LocationResponse)
def get_location(
    location_id: int,
    db: Session = Depends(get_db)
):
    location = db.query(Location).filter(
        Location.id == location_id
    ).first()

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    return location


@router.delete("/{location_id}")
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin"))
):
    location = db.query(Location).filter(
        Location.id == location_id
    ).first()

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    db.delete(location)
    db.commit()

    return {"message": "Location deleted successfully"}