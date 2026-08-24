from pydantic import BaseModel,ConfigDict


class LocationBase(BaseModel):
    place: str
    description: str | None = None



class LocationCreate(LocationBase):
    pass


class LocationResponse(LocationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)