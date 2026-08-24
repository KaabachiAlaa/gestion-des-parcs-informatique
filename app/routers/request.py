from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.security.dependencies import get_current_user,require_role
from app.database.connection import get_db
from app.database.models.Request import Request
from app.database.models.User import User
from app.schemas.request import (
    RequestCreate,
    RequestResponse,
    RequestUpdate
)


router = APIRouter(
    prefix="/requests",
    tags=["Requests"]
)


@router.post("/", response_model=RequestResponse)
def create_request(
    request: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin","Technicien"))
):
    new_request = Request(
        **request.model_dump()  
    )
    print(new_request)

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.get("/", response_model=list[RequestResponse])
def get_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Request).all()


@router.get("/{request_id}", response_model=RequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request = db.query(Request).filter(
        Request.id == request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    return request


@router.put("/{request_id}", response_model=RequestResponse)
def update_request(
    request_id: int,
    request_data: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin"))
):
    request = db.query(Request).filter(
        Request.id == request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    update_data = request_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(request, key, value)

    db.commit()
    db.refresh(request)

    return request
@router.delete("/{request_id}")
def delete_request(
    request_id:int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin"))

):
    request = db.query(Request).filter(
            Request.id == request_id
        ).first()
    
    if not request:
        raise HTTPException(
            status_code=404,
            detail="request not found"
        )

    db.delete(request)
    db.commit()

    return {"message": "request deleted successfully"}