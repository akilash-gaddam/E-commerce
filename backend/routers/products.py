"""Public storefront products router."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from database import get_db
from models import Product


router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/")
def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    in_stock_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """List active products with optional filters."""
    query = db.query(Product).filter(Product.is_active == True)

    if category:
        query = query.filter(Product.category == category)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term)
            )
        )

    if in_stock_only:
        query = query.filter(Product.stock_qty > 0)

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


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get list of unique product categories."""
    categories = db.query(Product.category).filter(Product.is_active == True).distinct().all()
    return [c[0] for c in categories]


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        return {"error": "Product not found"}

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