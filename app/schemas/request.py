from datetime import date

from pydantic import BaseModel,ConfigDict


class RequestBase(BaseModel):
    request_code: str
    type: str
    title: str
    description: str | None = None
    created_by: int
    assigned_to: int | None = None
    material_id: int | None = None
    priority: str = "MEDIUM"
    status: str = "OPEN"
    closed_at: date | None = None


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    assigned_to: int | None = None
    priority: str | None = None
    status: str | None = None
    closed_at: date | None = None


class RequestResponse(RequestBase):
    id: int

model_config = ConfigDict(from_attributes=True)