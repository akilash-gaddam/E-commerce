"""Customer protected endpoints: cart, wishlist, addresses, orders."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from database import get_db
from models import (
    User, UserRole, Product, CartItem, WishlistItem,
    Address, Order, OrderStatus, OrderItem
)
from deps import require_customer


router = APIRouter(prefix="/api/customer", tags=["customer"])


# Schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class WishlistToggle(BaseModel):
    product_id: int


class AddressCreate(BaseModel):
    full_name: str
    phone: str
    street: str
    city: str
    zip_code: str
    is_default: bool = False


class AddressResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    street: str
    city: str
    zip_code: str
    is_default: bool


class OrderCreate(BaseModel):
    address_id: int


# Cart Endpoints
@router.get("/cart")
def get_cart(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    """Get customer's cart with product details and subtotal."""
    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()

    items = []
    subtotal = 0.0
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.is_active:
            item_total = product.selling_price * item.quantity
            subtotal += item_total
            items.append({
                "id": item.id,
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "sku": product.sku,
                "selling_price": product.selling_price,
                "stock_qty": product.stock_qty,
                "unit": product.unit,
                "image_url": product.image_url,
                "quantity": item.quantity,
                "item_total": round(item_total, 2),
            })

    return {"items": items, "subtotal": round(subtotal, 2), "item_count": len(items)}


@router.post("/cart")
def add_to_cart(
    request: CartItemCreate,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Add or update item in cart."""
    product = db.query(Product).filter(Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not product.is_active:
        raise HTTPException(status_code=400, detail="Product is not available")
    if product.stock_qty < request.quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.stock_qty} units available")

    # Check if already in cart
    existing = db.query(CartItem).filter(
        and_(CartItem.user_id == user.id, CartItem.product_id == request.product_id)
    ).first()

    if existing:
        new_qty = existing.quantity + request.quantity
        if new_qty > product.stock_qty:
            raise HTTPException(status_code=400, detail=f"Only {product.stock_qty} units available")
        existing.quantity = new_qty
    else:
        cart_item = CartItem(user_id=user.id, product_id=request.product_id, quantity=request.quantity)
        db.add(cart_item)

    db.commit()
    return {"message": "Added to cart"}


@router.patch("/cart/{item_id}")
def update_cart_item(
    item_id: int,
    request: CartItemUpdate,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Update cart item quantity (delete if 0)."""
    cart_item = db.query(CartItem).filter(
        and_(CartItem.id == item_id, CartItem.user_id == user.id)
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if request.quantity <= 0:
        db.delete(cart_item)
    else:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product or request.quantity > product.stock_qty:
            raise HTTPException(status_code=400, detail=f"Only {product.stock_qty if product else 0} units available")
        cart_item.quantity = request.quantity

    db.commit()
    return {"message": "Cart updated"}


@router.delete("/cart/{item_id}")
def remove_from_cart(
    item_id: int,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Remove item from cart."""
    cart_item = db.query(CartItem).filter(
        and_(CartItem.id == item_id, CartItem.user_id == user.id)
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return {"message": "Removed from cart"}


# Wishlist Endpoints
@router.get("/wishlist")
def get_wishlist(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    """Get customer's wishlist with product details."""
    wishlist_items = db.query(WishlistItem).filter(WishlistItem.user_id == user.id).all()

    items = []
    for item in wishlist_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.is_active:
            items.append({
                "id": item.id,
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "sku": product.sku,
                "selling_price": product.selling_price,
                "stock_qty": product.stock_qty,
                "unit": product.unit,
                "image_url": product.image_url,
            })

    return {"items": items, "count": len(items)}


@router.post("/wishlist/toggle")
def toggle_wishlist(
    request: WishlistToggle,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Add to wishlist if not present, remove if present."""
    product = db.query(Product).filter(Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(WishlistItem).filter(
        and_(WishlistItem.user_id == user.id, WishlistItem.product_id == request.product_id)
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"action": "removed", "message": "Removed from wishlist"}
    else:
        wishlist_item = WishlistItem(user_id=user.id, product_id=request.product_id)
        db.add(wishlist_item)
        db.commit()
        return {"action": "added", "message": "Added to wishlist"}


# Address Endpoints
@router.get("/addresses", response_model=List[AddressResponse])
def get_addresses(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    """Get customer's saved addresses."""
    addresses = db.query(Address).filter(Address.user_id == user.id).order_by(Address.is_default.desc()).all()
    return addresses


@router.post("/addresses", response_model=AddressResponse)
def create_address(
    request: AddressCreate,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Add a new address."""
    # If this is default, unset other defaults
    if request.is_default:
        db.query(Address).filter(Address.user_id == user.id, Address.is_default == True).update({"is_default": False})

    address = Address(user_id=user.id, **request.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: int,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Delete an address."""
    address = db.query(Address).filter(
        and_(Address.id == address_id, Address.user_id == user.id)
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(address)
    db.commit()
    return {"message": "Address deleted"}


# Order Endpoints
@router.post("/orders")
def create_order(
    request: OrderCreate,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Place an order from cart."""
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Get address
    address = db.query(Address).filter(
        and_(Address.id == request.address_id, Address.user_id == user.id)
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Verify stock and calculate totals
    total_revenue = 0.0
    total_cost = 0.0
    order_items_data = []

    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {cart_item.product_id} no longer available")
        if product.stock_qty < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}. Only {product.stock_qty} available.")

        order_items_data.append({
            "product_id": product.id,
            "quantity": cart_item.quantity,
            "unit_price": product.selling_price,
            "unit_cost": product.cost_price,
        })
        total_revenue += product.selling_price * cart_item.quantity
        total_cost += product.cost_price * cart_item.quantity

    # Create order
    order = Order(
        user_id=user.id,
        address_snapshot={
            "full_name": address.full_name,
            "phone": address.phone,
            "street": address.street,
            "city": address.city,
            "zip_code": address.zip_code,
        },
        total_revenue=round(total_revenue, 2),
        total_cost=round(total_cost, 2),
        status=OrderStatus.placed,
    )
    db.add(order)
    db.flush()

    # Create order items and deduct stock
    for item_data in order_items_data:
        order_item = OrderItem(order_id=order.id, **item_data)
        db.add(order_item)

        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock_qty -= item_data["quantity"]

    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "status": order.status.value,
        "total_revenue": order.total_revenue,
        "created_at": order.created_at.isoformat(),
    }


@router.get("/orders")
def get_orders(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    """Get customer's orders with items and address snapshot."""
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        items = []
        for order_item in order.items:
            product = db.query(Product).filter(Product.id == order_item.product_id).first()
            if product:
                items.append({
                    "product_id": product.id,
                    "name": product.name,
                    "unit": product.unit,
                    "quantity": order_item.quantity,
                    "unit_price": order_item.unit_price,
                    "line_total": round(order_item.unit_price * order_item.quantity, 2),
                })

        result.append({
            "id": order.id,
            "status": order.status.value,
            "total_revenue": order.total_revenue,
            "total_cost": order.total_cost,
            "net_profit": order.net_profit,
            "created_at": order.created_at.isoformat(),
            "address_snapshot": order.address_snapshot,
            "items": items,
        })

    return {"orders": result}