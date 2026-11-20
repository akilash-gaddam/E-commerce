"""Update existing products in database with image URLs."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Product

# Image URLs matching each product by SKU
image_urls = {
    "PROD-BAN-001": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center",
    "PROD-AVO-002": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop&crop=center",
    "PROD-SPI-003": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&crop=center",
    "PROD-TOM-004": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop&crop=center",
    "DAI-MIL-001": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center",
    "DAI-YOG-002": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&crop=center",
    "DAI-CHE-003": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop&crop=center",
    "DAI-BUT-004": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop&crop=center",
    "PAN-OIL-001": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&crop=center",
    "PAN-QUI-002": "https://images.unsplash.com/photo-1586201375761-83865011e356?w=400&h=400&fit=crop&crop=center",
    "PAN-PAS-003": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=400&fit=crop&crop=center",
    "PAN-CHI-004": "https://images.unsplash.com/photo-1584017911766-d451babbd45c?w=400&h=400&fit=crop&crop=center",
    "BEV-SPA-001": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop&crop=center",
    "BEV-COF-002": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop&crop=center",
    "BEV-OJU-003": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop&crop=center",
    "BAK-SOU-001": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center",
    "BAK-CRO-002": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop&crop=center",
    "BAK-BAG-003": "https://images.unsplash.com/photo-1643097299420-825a86019ad2?w=400&h=400&fit=crop&crop=center",
}

def update_product_images():
    db = SessionLocal()
    try:
        for sku, image_url in image_urls.items():
            product = db.query(Product).filter(Product.sku == sku).first()
            if product:
                product.image_url = image_url
                print(f"Updated {sku} ({product.name}) with image")
            else:
                print(f"Product with SKU {sku} not found")
        db.commit()
        print("All product images updated successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error updating images: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_product_images()