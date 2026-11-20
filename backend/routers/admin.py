"""Admin protected endpoints: inventory, orders, analytics."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta, timezone

from database import get_db
from models import (
    User, UserRole, Product, Order, OrderStatus, OrderItem, Address
)
from deps import require_admin


router = APIRouter(prefix="/api/admin", tags=["admin"])


# Schemas
class ProductCreate(BaseModel):
    name: str
    category: str
    sku: str
    cost_price: float
    selling_price: float
    stock_qty: int
    unit: str
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_qty: Optional[int] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class StockAdjustment(BaseModel):
    quantity: int  # positive to add, negative to subtract


class OrderStatusUpdate(BaseModel):
    status: str  # Placed, Packed, Out for Delivery, Delivered


# Product/Inventory Endpoints
@router.get("/products")
def list_products(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all products (including inactive/out of stock) with profit margins."""
    query = db.query(Product)
    if not include_inactive:
        query = query.filter(Product.is_active == True)

    products = query.order_by(Product.category, Product.name).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "sku": p.sku,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "stock_qty": p.stock_qty,
            "unit": p.unit,
            "image_url": p.image_url,
            "is_active": p.is_active,
            "unit_profit": p.unit_profit,
            "profit_margin_pct": p.profit_margin_pct,
        }
        for p in products
    ]


@router.post("/products")
def create_product(
    request: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Add a new product."""
    # Check SKU uniqueness
    existing = db.query(Product).filter(Product.sku == request.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    product = Product(**request.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "name": product.name,
        "category": product.category,
        "sku": product.sku,
        "cost_price": product.cost_price,
        "selling_price": product.selling_price,
        "stock_qty": product.stock_qty,
        "unit": product.unit,
        "image_url": product.image_url,
        "is_active": product.is_active,
        "unit_profit": product.unit_profit,
        "profit_margin_pct": product.profit_margin_pct,
    }


@router.put("/products/{product_id}")
def update_product(
    product_id: int,
    request: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update product details."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check SKU uniqueness if changing
    if request.sku and request.sku != product.sku:
        existing = db.query(Product).filter(Product.sku == request.sku).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "name": product.name,
        "category": product.category,
        "sku": product.sku,
        "cost_price": product.cost_price,
        "selling_price": product.selling_price,
        "stock_qty": product.stock_qty,
        "unit": product.unit,
        "image_url": product.image_url,
        "is_active": product.is_active,
        "unit_profit": product.unit_profit,
        "profit_margin_pct": product.profit_margin_pct,
    }


@router.patch("/products/{product_id}/stock")
def adjust_stock(
    product_id: int,
    request: StockAdjustment,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Adjust product stock quantity."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_qty = product.stock_qty + request.quantity
    if new_qty < 0:
        raise HTTPException(status_code=400, detail="Stock cannot go below zero")

    product.stock_qty = new_qty
    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "stock_qty": product.stock_qty,
        "message": f"Stock adjusted by {request.quantity}"
    }


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Soft delete (deactivate) or hard delete product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if referenced in orders
    order_item_count = db.query(OrderItem).filter(OrderItem.product_id == product_id).count()
    if order_item_count > 0:
        # Soft delete
        product.is_active = False
        db.commit()
        return {"message": "Product deactivated (referenced in orders)", "action": "deactivated"}
    else:
        # Hard delete
        db.delete(product)
        db.commit()
        return {"message": "Product deleted permanently", "action": "deleted"}


# Order Fulfillment Endpoints
@router.get("/orders")
def list_orders(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all orders with customer info, items, revenue, profit."""
    query = db.query(Order).order_by(desc(Order.created_at))

    if status:
        try:
            order_status = OrderStatus(status)
            query = query.filter(Order.status == order_status)
        except ValueError:
            pass

    orders = query.all()

    result = []
    for order in orders:
        # Get customer info
        customer = db.query(User).filter(User.id == order.user_id).first()

        items = []
        for order_item in order.items:
            product = db.query(Product).filter(Product.id == order_item.product_id).first()
            if product:
                items.append({
                    "product_id": product.id,
                    "name": product.name,
                    "category": product.category,
                    "unit": product.unit,
                    "quantity": order_item.quantity,
                    "unit_price": order_item.unit_price,
                    "unit_cost": order_item.unit_cost,
                    "line_revenue": round(order_item.unit_price * order_item.quantity, 2),
                    "line_cost": round(order_item.unit_cost * order_item.quantity, 2),
                    "line_profit": round((order_item.unit_price - order_item.unit_cost) * order_item.quantity, 2),
                    "image_url": product.image_url,
                })

        result.append({
            "id": order.id,
            "customer": {
                "id": customer.id if customer else None,
                "name": customer.name if customer else "Unknown",
                "email": customer.email if customer else "Unknown",
            } if customer else {"id": None, "name": "Unknown", "email": "Unknown"},
            "status": order.status.value,
            "total_revenue": order.total_revenue,
            "total_cost": order.total_cost,
            "net_profit": order.net_profit,
            "profit_margin_pct": order.profit_margin_pct,
            "created_at": order.created_at.isoformat(),
            "address_snapshot": order.address_snapshot,
            "items": items,
        })

    return {"orders": result}


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    request: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update order status with strict progression."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Validate status progression
    valid_statuses = ["Placed", "Packed", "Out for Delivery", "Delivered"]
    if request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    current_idx = valid_statuses.index(order.status.value)
    new_idx = valid_statuses.index(request.status)

    if new_idx < current_idx:
        raise HTTPException(status_code=400, detail="Cannot revert order status backwards")
    if new_idx > current_idx + 1:
        raise HTTPException(status_code=400, detail="Cannot skip status steps")

    order.status = OrderStatus(request.status)
    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "status": order.status.value,
        "message": f"Order status updated to {order.status.value}"
    }


# Analytics Endpoints
@router.get("/analytics")
def get_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get revenue, profit, and category analytics."""
    # Use naive UTC datetimes so comparisons with SQLite-stored timestamps
    # (which are read back as naive datetimes) do not raise TypeError.
    end_date = datetime.now(timezone.utc).replace(tzinfo=None)
    start_date = end_date - timedelta(days=days)

    # Overall metrics
    orders_in_period = db.query(Order).filter(Order.created_at >= start_date).all()

    total_revenue = sum(o.total_revenue for o in orders_in_period)
    total_cost = sum(o.total_cost for o in orders_in_period)
    net_profit = total_revenue - total_cost
    profit_margin_pct = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
    total_orders = len(orders_in_period)
    active_orders = len([o for o in orders_in_period if o.status != OrderStatus.delivered])

    # Low stock products (<= 10)
    low_stock = db.query(Product).filter(
        Product.is_active == True,
        Product.stock_qty <= 10
    ).order_by(Product.stock_qty).all()

    low_stock_products = [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category,
            "stock_qty": p.stock_qty,
            "unit": p.unit,
        }
        for p in low_stock
    ]

    # Category breakdown
    category_data = {}
    for order in orders_in_period:
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                cat = product.category
                if cat not in category_data:
                    category_data[cat] = {"revenue": 0, "cost": 0, "profit": 0}
                category_data[cat]["revenue"] += item.unit_price * item.quantity
                category_data[cat]["cost"] += item.unit_cost * item.quantity
                category_data[cat]["profit"] += (item.unit_price - item.unit_cost) * item.quantity

    category_breakdown = [
        {
            "category": cat,
            "revenue": round(data["revenue"], 2),
            "cost": round(data["cost"], 2),
            "profit": round(data["profit"], 2),
            "margin_pct": round((data["profit"] / data["revenue"] * 100) if data["revenue"] > 0 else 0, 2)
        }
        for cat, data in category_data.items()
    ]

    # Daily series for charts
    daily_data = {}
    for order in orders_in_period:
        day_key = order.created_at.date().isoformat()
        if day_key not in daily_data:
            daily_data[day_key] = {"revenue": 0, "cost": 0, "profit": 0}
        daily_data[day_key]["revenue"] += order.total_revenue
        daily_data[day_key]["cost"] += order.total_cost
        daily_data[day_key]["profit"] += order.net_profit

    # Fill in missing days with zeros
    daily_series = []
    current = start_date.date()
    while current <= end_date.date():
        key = current.isoformat()
        if key in daily_data:
            daily_series.append({
                "date": key,
                "revenue": round(daily_data[key]["revenue"], 2),
                "cost": round(daily_data[key]["cost"], 2),
                "profit": round(daily_data[key]["profit"], 2),
            })
        else:
            daily_series.append({
                "date": key,
                "revenue": 0,
                "cost": 0,
                "profit": 0,
            })
        current += timedelta(days=1)

    return {
        "total_revenue": round(total_revenue, 2),
        "total_cost": round(total_cost, 2),
        "net_profit": round(net_profit, 2),
        "profit_margin_pct": round(profit_margin_pct, 2),
        "total_orders": total_orders,
        "active_orders": active_orders,
        "low_stock_products": low_stock_products,
        "category_breakdown": category_breakdown,
        "daily_series": daily_series,
    }