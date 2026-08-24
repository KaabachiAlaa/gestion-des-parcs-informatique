from sqlalchemy import String, Text, ForeignKey, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .Base import Base

class Repair(Base):
    __tablename__ = "repairs"

    id: Mapped[int] = mapped_column(primary_key=True)

    material_id: Mapped[int] = mapped_column(
        ForeignKey("materials.id"),
        nullable=False
    )

    technician_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id")
    )

    start_date: Mapped[Date] = mapped_column(
        Date,
        nullable=False
    )

    end_date: Mapped[Date | None] = mapped_column(
        Date
    )

    problem_description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    diagnosis: Mapped[str | None] = mapped_column(
        Text
    )

    intervention: Mapped[str | None] = mapped_column(
        Text
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="IN_PROGRESS",
        nullable=False
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="MEDIUM"
    )

    replaced_parts: Mapped[str | None] = mapped_column(
        Text
    )

    cost: Mapped[float | None] = mapped_column(
        Numeric(10, 2)
    )

    comments: Mapped[str | None] = mapped_column(
        Text
    )

    material: Mapped["Material"] = relationship(
        back_populates="repairs"
    )

    technician: Mapped["User | None"] = relationship(
        back_populates="repairs"
    )