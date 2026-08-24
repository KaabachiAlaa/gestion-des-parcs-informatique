from datetime import date

from pydantic import BaseModel,ConfigDict


class MaterialBase(BaseModel):
    asset_code: str
    name: str
    category_id: int
    brand: str | None = None
    model: str | None = None
    serial_number: str | None = None
    acquisition_date: date | None = None
    warranty_end_date: date | None = None
    status: str = "IN_SERVICE"
    location_id: int | None = None
    assigned_user_id: int | None = None
    purchase_price: float | None = None
    description: str | None = None


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    name: str | None = None
    category_id: int | None = None
    brand: str | None = None
    model: str | None = None
    serial_number: str | None = None
    acquisition_date: date | None = None
    warranty_end_date: date | None = None
    status: str | None = None
    location_id: int | None = None
    assigned_user_id: int | None = None
    purchase_price: float | None = None
    description: str | None = None


class MaterialResponse(MaterialBase):
    id: int

model_config = ConfigDict(from_attributes=True)