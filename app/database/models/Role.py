from sqlalchemy import String, Text, ForeignKey, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .Base import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(Text)

    users: Mapped[list["User"]] = relationship(
        back_populates="role"
    )