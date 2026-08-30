from typing import Optional
from pydantic import BaseModel, EmailStr,ConfigDict


class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    role_id: int


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
