from sqlalchemy import String, Text, ForeignKey, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .Base import Base


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True)

    request_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    type: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id")
    )

    material_id: Mapped[int | None] = mapped_column(
        ForeignKey("materials.id")
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="MEDIUM"
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="OPEN"
    )

    closed_at: Mapped[Date | None] = mapped_column(
        Date
    )

    creator: Mapped["User"] = relationship(
        back_populates="created_requests",
        foreign_keys=[created_by]
    )

    assigned_to_user: Mapped["User | None"] = relationship(
        back_populates="assigned_requests",
        foreign_keys=[assigned_to]
    )

    material: Mapped["Material | None"] = relationship(
        back_populates="requests"
    )