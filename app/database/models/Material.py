from sqlalchemy import String, Text, ForeignKey, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .Base import Base

class Material(Base):
    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(primary_key=True)

    asset_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False
    )

    brand: Mapped[str | None] = mapped_column(
        String(100)
    )

    model: Mapped[str | None] = mapped_column(
        String(100)
    )

    serial_number: Mapped[str | None] = mapped_column(
        String(150),
        unique=True
    )

    acquisition_date: Mapped[Date | None] = mapped_column(
        Date
    )

    warranty_end_date: Mapped[Date | None] = mapped_column(
        Date
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="IN_SERVICE",
        nullable=False
    )

    location_id: Mapped[int | None] = mapped_column(
        ForeignKey("locations.id")
    )

    assigned_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id")
    )

    purchase_price: Mapped[float | None] = mapped_column(
        Numeric(10, 2)
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    category: Mapped["Category"] = relationship(
        back_populates="materials"
    )

    location: Mapped["Location | None"] = relationship(
        back_populates="materials"
    )

    assigned_user: Mapped["User | None"] = relationship(
        back_populates="materials"
    )

    repairs: Mapped[list["Repair"]] = relationship(
        back_populates="material"
    )

    requests: Mapped[list["Request"]] = relationship(
        back_populates="material"
    )