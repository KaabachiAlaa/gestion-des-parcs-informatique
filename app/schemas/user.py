from pydantic import BaseModel, EmailStr,ConfigDict


class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    role_id: int


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)