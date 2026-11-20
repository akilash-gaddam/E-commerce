"""Idempotent database seeder for STANDARD.IO."""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, Base, SessionLocal
from models import (
    User, UserRole, Address, Product, CartItem, WishlistItem,
    Order, OrderStatus, OrderItem
)
from auth_utils import hash_password


def seed_database():
    """Seed the database with initial data if empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        user_count = db.query(func.count(User.id)).scalar()
        if user_count > 0:
            print("Database already seeded, skipping...")
            return

        print("Seeding database...")

        # Create Admin user
        admin = User(
            name="Admin",
            email="admin@standard.io",
            password_hash=hash_password("admin123"),
            role=UserRole.admin,
        )
        db.add(admin)

        # Create Customer user
        customer = User(
            name="Demo Customer",
            email="user@standard.io",
            password_hash=hash_password("user123"),
            role=UserRole.customer,
        )
        db.add(customer)
        db.flush()  # Get IDs

        # Create default address for customer
        address = Address(
            user_id=customer.id,
            full_name="Demo Customer",
            phone="+91 98765 43210",
            street="123 Main Street, Apt 4B",
            city="Mumbai",
            zip_code="400001",
            is_default=True,
        )
        db.add(address)
        db.flush()

        # Seed 18 realistic supermarket products across 5 categories
        products = [
            # Produce (4 items)
            Product(
                name="Organic Bananas",
                category="Produce",
                sku="PROD-BAN-001",
                cost_price=0.35,
                selling_price=0.69,
                stock_qty=150,
                unit="1kg",
                image_url="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Avocados (Hass)",
                category="Produce",
                sku="PROD-AVO-002",
                cost_price=1.20,
                selling_price=2.49,
                stock_qty=80,
                unit="4 pack",
                image_url="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Baby Spinach",
                category="Produce",
                sku="PROD-SPI-003",
                cost_price=1.50,
                selling_price=3.29,
                stock_qty=60,
                unit="150g bag",
                image_url="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Vine Tomatoes",
                category="Produce",
                sku="PROD-TOM-004",
                cost_price=1.80,
                selling_price=3.99,
                stock_qty=70,
                unit="1kg",
                image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            # Dairy (4 items)
            Product(
                name="Whole Milk",
                category="Dairy",
                sku="DAI-MIL-001",
                cost_price=1.20,
                selling_price=2.49,
                stock_qty=200,
                unit="1L",
                image_url="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Greek Yogurt (Plain)",
                category="Dairy",
                sku="DAI-YOG-002",
                cost_price=1.80,
                selling_price=3.79,
                stock_qty=120,
                unit="500g",
                image_url="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Cheddar Cheese Block",
                category="Dairy",
                sku="DAI-CHE-003",
                cost_price=3.50,
                selling_price=6.99,
                stock_qty=90,
                unit="400g",
                image_url="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Unsalted Butter",
                category="Dairy",
                sku="DAI-BUT-004",
                cost_price=2.80,
                selling_price=5.49,
                stock_qty=100,
                unit="250g",
                image_url="https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            # Pantry (4 items)
            Product(
                name="Extra Virgin Olive Oil",
                category="Pantry",
                sku="PAN-OIL-001",
                cost_price=6.50,
                selling_price=12.99,
                stock_qty=50,
                unit="500ml",
                image_url="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Organic Quinoa",
                category="Pantry",
                sku="PAN-QUI-002",
                cost_price=3.20,
                selling_price=6.49,
                stock_qty=75,
                unit="1kg",
                image_url="https://images.unsplash.com/photo-1586201375761-83865011e356?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Penne Pasta",
                category="Pantry",
                sku="PAN-PAS-003",
                cost_price=0.80,
                selling_price=1.89,
                stock_qty=200,
                unit="500g",
                image_url="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Canned Chickpeas",
                category="Pantry",
                sku="PAN-CHI-004",
                cost_price=0.60,
                selling_price=1.49,
                stock_qty=180,
                unit="400g tin",
                image_url="https://images.unsplash.com/photo-1584017911766-d451babbd45c?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            # Beverages (3 items)
            Product(
                name="Sparkling Water",
                category="Beverages",
                sku="BEV-SPA-001",
                cost_price=0.45,
                selling_price=1.29,
                stock_qty=300,
                unit="6 x 500ml",
                image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Cold Brew Coffee",
                category="Beverages",
                sku="BEV-COF-002",
                cost_price=2.50,
                selling_price=4.99,
                stock_qty=85,
                unit="250ml",
                image_url="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Orange Juice (Fresh)",
                category="Beverages",
                sku="BEV-OJU-003",
                cost_price=1.80,
                selling_price=3.79,
                stock_qty=110,
                unit="1L",
                image_url="https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            # Bakery (3 items)
            Product(
                name="Sourdough Loaf",
                category="Bakery",
                sku="BAK-SOU-001",
                cost_price=2.00,
                selling_price=4.99,
                stock_qty=40,
                unit="1 loaf",
                image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Croissants (Butter)",
                category="Bakery",
                sku="BAK-CRO-002",
                cost_price=1.50,
                selling_price=3.49,
                stock_qty=50,
                unit="4 pack",
                image_url="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
            Product(
                name="Whole Wheat Bagels",
                category="Bakery",
                sku="BAK-BAG-003",
                cost_price=1.20,
                selling_price=2.99,
                stock_qty=60,
                unit="6 pack",
                image_url="https://images.unsplash.com/photo-1643097299420-825a86019ad2?w=400&h=400&fit=crop&crop=center",
                is_active=True,
            ),
        ]

        for product in products:
            db.add(product)
        db.flush()

        # Create sample historical orders for the customer
        # Order 1 - Delivered (3 days ago)
        order1 = Order(
            user_id=customer.id,
            address_snapshot={
                "full_name": "Demo Customer",
                "phone": "+91 98765 43210",
                "street": "123 Main Street, Apt 4B",
                "city": "Mumbai",
                "zip_code": "400001",
            },
            total_revenue=0,
            total_cost=0,
            status=OrderStatus.delivered,
            created_at=(datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=3)),
        )
        db.add(order1)
        db.flush()

        # Order items for order 1
        banana = db.query(Product).filter(Product.sku == "PROD-BAN-001").first()
        milk = db.query(Product).filter(Product.sku == "DAI-MIL-001").first()
        bread = db.query(Product).filter(Product.sku == "BAK-SOU-001").first()

        order1_items = [
            OrderItem(order_id=order1.id, product_id=banana.id, quantity=2, unit_price=banana.selling_price, unit_cost=banana.cost_price),
            OrderItem(order_id=order1.id, product_id=milk.id, quantity=1, unit_price=milk.selling_price, unit_cost=milk.cost_price),
            OrderItem(order_id=order1.id, product_id=bread.id, quantity=1, unit_price=bread.selling_price, unit_cost=bread.cost_price),
        ]
        for item in order1_items:
            db.add(item)

        order1.total_revenue = sum(i.unit_price * i.quantity for i in order1_items)
        order1.total_cost = sum(i.unit_cost * i.quantity for i in order1_items)

        # Order 2 - Out for Delivery (1 day ago)
        order2 = Order(
            user_id=customer.id,
            address_snapshot={
                "full_name": "Demo Customer",
                "phone": "+91 98765 43210",
                "street": "123 Main Street, Apt 4B",
                "city": "Mumbai",
                "zip_code": "400001",
            },
            total_revenue=0,
            total_cost=0,
            status=OrderStatus.out_for_delivery,
            created_at=(datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=1)),
        )
        db.add(order2)
        db.flush()

        avo = db.query(Product).filter(Product.sku == "PROD-AVO-002").first()
        yogurt = db.query(Product).filter(Product.sku == "DAI-YOG-002").first()
        pasta = db.query(Product).filter(Product.sku == "PAN-PAS-003").first()

        order2_items = [
            OrderItem(order_id=order2.id, product_id=avo.id, quantity=1, unit_price=avo.selling_price, unit_cost=avo.cost_price),
            OrderItem(order_id=order2.id, product_id=yogurt.id, quantity=2, unit_price=yogurt.selling_price, unit_cost=yogurt.cost_price),
            OrderItem(order_id=order2.id, product_id=pasta.id, quantity=3, unit_price=pasta.selling_price, unit_cost=pasta.cost_price),
        ]
        for item in order2_items:
            db.add(item)

        order2.total_revenue = sum(i.unit_price * i.quantity for i in order2_items)
        order2.total_cost = sum(i.unit_cost * i.quantity for i in order2_items)

        # Order 3 - Placed (today)
        order3 = Order(
            user_id=customer.id,
            address_snapshot={
                "full_name": "Demo Customer",
                "phone": "+91 98765 43210",
                "street": "123 Main Street, Apt 4B",
                "city": "Mumbai",
                "zip_code": "400001",
            },
            total_revenue=0,
            total_cost=0,
            status=OrderStatus.placed,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        db.add(order3)
        db.flush()

        spinach = db.query(Product).filter(Product.sku == "PROD-SPI-003").first()
        cheese = db.query(Product).filter(Product.sku == "DAI-CHE-003").first()
        water = db.query(Product).filter(Product.sku == "BEV-SPA-001").first()

        order3_items = [
            OrderItem(order_id=order3.id, product_id=spinach.id, quantity=1, unit_price=spinach.selling_price, unit_cost=spinach.cost_price),
            OrderItem(order_id=order3.id, product_id=cheese.id, quantity=1, unit_price=cheese.selling_price, unit_cost=cheese.cost_price),
            OrderItem(order_id=order3.id, product_id=water.id, quantity=2, unit_price=water.selling_price, unit_cost=water.cost_price),
        ]
        for item in order3_items:
            db.add(item)

        order3.total_revenue = sum(i.unit_price * i.quantity for i in order3_items)
        order3.total_cost = sum(i.unit_cost * i.quantity for i in order3_items)

        db.commit()
        print("Database seeded successfully!")
        print(f"Created {len(products)} products")
        print(f"Created 3 sample orders for customer {customer.email}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()