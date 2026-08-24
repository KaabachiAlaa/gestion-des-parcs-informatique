
from sqlalchemy import String, Text, ForeignKey, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .Base import Base



class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        default=True
    )

    role: Mapped["Role"] = relationship(
        back_populates="users"
    )

    materials: Mapped[list["Material"]] = relationship(
        back_populates="assigned_user"
    )

    repairs: Mapped[list["Repair"]] = relationship(
        back_populates="technician"
    )

    created_requests: Mapped[list["Request"]] = relationship(
        back_populates="creator",
        foreign_keys="Request.created_by"
    )

    assigned_requests: Mapped[list["Request"]] = relationship(
        back_populates="assigned_to_user",
        foreign_keys="Request.assigned_to"
    )