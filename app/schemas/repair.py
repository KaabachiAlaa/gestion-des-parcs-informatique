from datetime import date

from pydantic import BaseModel,ConfigDict


class RepairBase(BaseModel):
    material_id: int
    technician_id: int | None = None
    start_date: date
    end_date: date | None = None
    problem_description: str
    diagnosis: str | None = None
    intervention: str | None = None
    status: str = "IN_PROGRESS"
    priority: str = "MEDIUM"
    replaced_parts: str | None = None
    cost: float | None = None
    comments: str | None = None


class RepairCreate(RepairBase):
    pass


class RepairUpdate(BaseModel):
    technician_id: int | None = None
    end_date: date | None = None
    diagnosis: str | None = None
    intervention: str | None = None
    status: str | None = None
    priority: str | None = None
    replaced_parts: str | None = None
    cost: float | None = None
    comments: str | None = None


class RepairResponse(RepairBase):
    id: int

    model_config = ConfigDict(from_attributes=True)