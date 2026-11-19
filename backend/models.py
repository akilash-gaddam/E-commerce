"""SQLAlchemy models for STANDARD.IO supermarket e-commerce."""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base
import enum


class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    placed = "Placed"
    packed = "Packed"
    out_for_delivery = "Out for Delivery"
    delivered = "Delivered"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.customer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    # Relationships
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    street = Column(String, nullable=False)
    city = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="addresses")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    stock_qty = Column(Integer, default=0, nullable=False)
    unit = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")

    @property
    def unit_profit(self) -> float:
        return round(self.selling_price - self.cost_price, 2)

    @property
    def profit_margin_pct(self) -> float:
        if self.selling_price == 0:
            return 0.0
        return round(((self.selling_price - self.cost_price) / self.selling_price) * 100, 2)


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_user_product_cart"),)


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")

    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_user_product_wishlist"),)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address_snapshot = Column(JSON, nullable=False)
    total_revenue = Column(Float, default=0.0, nullable=False)
    total_cost = Column(Float, default=0.0, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.placed, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    @property
    def net_profit(self) -> float:
        return round(self.total_revenue - self.total_cost, 2)

    @property
    def profit_margin_pct(self) -> float:
        if self.total_revenue == 0:
            return 0.0
        return round(((self.total_revenue - self.total_cost) / self.total_revenue) * 100, 2)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")