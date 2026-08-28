from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    role_id: int


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    role_id: int | None = None
    password: str | None = None


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
