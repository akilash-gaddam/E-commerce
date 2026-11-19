"""
STANDARD.IO - Comprehensive End-to-End Test Suite
Covers all 7 requirement suites for the supermarket e-commerce API.
"""
import os
import sys
import tempfile
from pathlib import Path

import bcrypt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import Base, get_db
from main import app
from models import User, UserRole, Product, Order, OrderStatus, CartItem, WishlistItem, Address
from auth_utils import hash_password, verify_password, create_access_token, decode_access_token


# ──────────────────────────────────────────────────────────────────────────────
# Test Database Setup (Isolated SQLite in-memory)
# ──────────────────────────────────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create tables once at module level so all tests can see them
Base.metadata.create_all(bind=test_engine)


@pytest.fixture(autouse=True)
def reset_db():
    """Reset all tables before each test for isolation.

    Tables themselves persist (created once at module level) so that test
    code which opens its own TestingSessionLocal() can always see them,
    but all row data is cleared so tests do not leak state into each other.
    """
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield


def override_get_db():
    """Override get_db dependency to use test database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


# ──────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ──────────────────────────────────────────────────────────────────────────────

def get_auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def create_customer_user(db, email="test@customer.com", password="pass123"):
    """Create a test customer user."""
    user = User(
        name="Test Customer",
        email=email,
        password_hash=hash_password(password),
        role=UserRole.customer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_admin_user(db, email="test@admin.com", password="admin123"):
    """Create a test admin user."""
    user = User(
        name="Test Admin",
        email=email,
        password_hash=hash_password(password),
        role=UserRole.admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_product(db, name="Test Product", category="Produce", sku="TEST-001",
                        cost_price=1.00, selling_price=2.00, stock_qty=100, unit="1kg",
                        is_active=True):
    """Create a test product."""
    product = Product(
        name=name,
        category=category,
        sku=sku,
        cost_price=cost_price,
        selling_price=selling_price,
        stock_qty=stock_qty,
        unit=unit,
        is_active=is_active,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def create_test_address(db, user_id, is_default=True):
    """Create a test address."""
    address = Address(
        user_id=user_id,
        full_name="Test User",
        phone="+1 555 123 4567",
        street="123 Test St",
        city="Test City",
        zip_code="12345",
        is_default=is_default,
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def login_customer(client, email="test@customer.com", password="pass123"):
    """Login as customer and return token."""
    resp = client.post("/api/auth/login", json={
        "email": email,
        "password": password,
        "portal": "customer"
    })
    return resp.json()["access_token"]


def login_admin(client, email="test@admin.com", password="admin123"):
    """Login as admin and return token."""
    resp = client.post("/api/auth/login", json={
        "email": email,
        "password": password,
        "portal": "admin"
    })
    return resp.json()["access_token"]


# ──────────────────────────────────────────────────────────────────────────────
# Test Suite 1 — Role-Based Authentication & Portal Separation
# ──────────────────────────────────────────────────────────────────────────────

class TestSuite1_Authentication:
    """Suite 1: Role-Based Authentication & Portal Separation"""

    def test_register_new_customer(self):
        """Register a new customer account with bcrypt-hashed password."""
        resp = client.post("/api/auth/register", json={
            "name": "New Customer",
            "email": "new@customer.com",
            "password": "securepass123"
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "customer"
        assert data["user"]["email"] == "new@customer.com"

        # Verify password is bcrypt hashed in database
        db = TestingSessionLocal()
        try:
            user = db.query(User).filter(User.email == "new@customer.com").first()
            assert user is not None
            assert verify_password("securepass123", user.password_hash)
            assert user.role == UserRole.customer
        finally:
            db.close()

    def test_register_duplicate_email_fails(self):
        """Duplicate email registration should fail with 400."""
        # First registration
        client.post("/api/auth/register", json={
            "name": "Customer One",
            "email": "dup@test.com",
            "password": "pass123"
        })
        # Second registration with same email
        resp = client.post("/api/auth/register", json={
            "name": "Customer Two",
            "email": "dup@test.com",
            "password": "pass456"
        })
        assert resp.status_code in (400, 409), f"Expected 400/409, got {resp.status_code}"

    def test_customer_login_succeeds(self):
        """Customer login with correct portal succeeds."""
        db = TestingSessionLocal()
        try:
            create_customer_user(db, "login@test.com", "loginpass")
        finally:
            db.close()

        resp = client.post("/api/auth/login", json={
            "email": "login@test.com",
            "password": "loginpass",
            "portal": "customer"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "customer"

    def test_admin_login_succeeds(self):
        """Admin login with correct portal succeeds."""
        db = TestingSessionLocal()
        try:
            create_admin_user(db, "admin@login.com", "adminpass")
        finally:
            db.close()

        resp = client.post("/api/auth/login", json={
            "email": "admin@login.com",
            "password": "adminpass",
            "portal": "admin"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"

    def test_customer_portal_admin_rejected(self):
        """Customer credentials with portal=admin MUST fail with 403."""
        db = TestingSessionLocal()
        try:
            create_customer_user(db, "cross@test.com", "pass123")
        finally:
            db.close()

        resp = client.post("/api/auth/login", json={
            "email": "cross@test.com",
            "password": "pass123",
            "portal": "admin"
        })
        assert resp.status_code == 403
        assert "Admin portal access denied" in resp.json()["detail"]

    def test_admin_portal_customer_rejected(self):
        """Admin credentials with portal=customer MUST fail with 403."""
        db = TestingSessionLocal()
        try:
            create_admin_user(db, "cross2@test.com", "adminpass")
        finally:
            db.close()

        resp = client.post("/api/auth/login", json={
            "email": "cross2@test.com",
            "password": "adminpass",
            "portal": "customer"
        })
        assert resp.status_code == 403
        assert "Customer portal access denied" in resp.json()["detail"]

    def test_customer_token_rejected_from_admin_endpoints(self):
        """Customer token calling /api/admin/* returns 403."""
        db = TestingSessionLocal()
        try:
            user = create_customer_user(db, "cust@admin.com", "pass123")
        finally:
            db.close()

        token = login_customer(client, "cust@admin.com", "pass123")
        resp = client.get("/api/admin/products", headers=get_auth_header(token))
        assert resp.status_code == 403

    def test_unauthenticated_requests_rejected(self):
        """Unauthenticated requests to protected routes return 401."""
        resp = client.get("/api/customer/cart")
        assert resp.status_code == 401


# ──────────────────────────────────────────────────────────────────────────────
# Test Suite 2 — Storefront Product Catalog & Filtering
# ──────────────────────────────────────────────────────────────────────────────

class TestSuite2_ProductCatalog:
    """Suite 2: Storefront Product Catalog & Filtering"""

    @pytest.fixture(autouse=True)
    def setup_products(self):
        """Create test products for filtering tests."""
        db = TestingSessionLocal()
        try:
            create_test_product(db, "Organic Apples", "Produce", "APP-001", 0.50, 1.20, 50, "1kg")
            create_test_product(db, "Bananas", "Produce", "BAN-001", 0.30, 0.80, 0, "1kg")  # Out of stock
            create_test_product(db, "Whole Milk", "Dairy", "MIL-001", 1.00, 2.50, 30, "1L")
            create_test_product(db, "Inactive Product", "Produce", "INA-001", 1.00, 2.00, 10, "1kg", is_active=False)
        finally:
            db.close()

    def test_list_products_returns_only_active(self):
        """GET /api/products returns only active products."""
        resp = client.get("/api/products")
        assert resp.status_code == 200
        products = resp.json()
        assert len(products) == 3  # Only 3 active products
        for p in products:
            assert p["is_active"] is True

    def test_category_filter(self):
        """Category filtering returns accurate subset."""
        resp = client.get("/api/products?category=Produce")
        assert resp.status_code == 200
        products = resp.json()
        # Active Produce items: Organic Apples (stock 50) and Bananas (stock 0, included by default)
        # Inactive Product is excluded
        assert len(products) == 2
        names = {p["name"] for p in products}
        assert "Organic Apples" in names
        assert "Bananas" in names

    def test_keyword_search(self):
        """Keyword search matches product name or SKU."""
        resp = client.get("/api/products?search=Milk")
        assert resp.status_code == 200
        products = resp.json()
        assert len(products) == 1
        assert products[0]["name"] == "Whole Milk"

    def test_in_stock_only_filter(self):
        """In-stock-only filtering excludes out-of-stock items."""
        resp = client.get("/api/products?in_stock_only=true")
        assert resp.status_code == 200
        products = resp.json()
        assert len(products) == 2  # Organic Apples and Whole Milk
        names = {p["name"] for p in products}
        assert "Bananas" not in names


# ──────────────────────────────────────────────────────────────────────────────
# Test Suite 3 — Customer Cart & Wishlist Persistence
# ──────────────────────────────────────────────────────────────────────────────

class TestSuite3_CartWishlist:
    """Suite 3: Customer Cart & Wishlist Persistence"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Create customer, product, and address for each test."""
        db = TestingSessionLocal()
        try:
            user = create_customer_user(db, "cart@test.com", "cartpass")
            create_test_product(db, "Cart Product", "Produce", "CART-001", 1.00, 2.00, 10, "1kg")
            create_test_address(db, user.id)
        finally:
            db.close()

    def test_add_to_cart_and_persistence(self):
        """Add item to cart, verify persistence."""
        token = login_customer(client, "cart@test.com", "cartpass")
        headers = get_auth_header(token)

        # Add to cart
        resp = client.post("/api/customer/cart", json={"product_id": 1, "quantity": 2}, headers=headers)
        assert resp.status_code == 200

        # Verify cart contents
        resp = client.get("/api/customer/cart", headers=headers)
        assert resp.status_code == 200
        cart = resp.json()
        assert cart["item_count"] == 1
        assert cart["items"][0]["quantity"] == 2

    def test_update_cart_quantity(self):
        """Update cart item quantity via PATCH."""
        token = login_customer(client, "cart@test.com", "cartpass")
        headers = get_auth_header(token)

        # Add item first
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=headers)

        # Get cart item ID
        resp = client.get("/api/customer/cart", headers=headers)
        cart = resp.json()
        item_id = cart["items"][0]["id"]

        # Update quantity
        resp = client.patch(f"/api/customer/cart/{item_id}", json={"quantity": 5}, headers=headers)
        assert resp.status_code == 200

        # Verify updated
        resp = client.get("/api/customer/cart", headers=headers)
        cart = resp.json()
        assert cart["items"][0]["quantity"] == 5

    def test_remove_from_cart(self):
        """Remove item from cart via DELETE."""
        token = login_customer(client, "cart@test.com", "cartpass")
        headers = get_auth_header(token)

        # Add item
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=headers)

        # Get item ID
        resp = client.get("/api/customer/cart", headers=headers)
        item_id = resp.json()["items"][0]["id"]

        # Delete
        resp = client.delete(f"/api/customer/cart/{item_id}", headers=headers)
        assert resp.status_code == 200

        # Verify removed
        resp = client.get("/api/customer/cart", headers=headers)
        assert resp.json()["item_count"] == 0

    def test_cart_quantity_above_stock_rejected(self):
        """Adding quantity above available stock MUST be rejected with 400."""
        token = login_customer(client, "cart@test.com", "cartpass")
        headers = get_auth_header(token)

        # Stock is 10, try to add 15
        resp = client.post("/api/customer/cart", json={"product_id": 1, "quantity": 15}, headers=headers)
        assert resp.status_code == 400
        assert "available" in resp.json()["detail"].lower()

    def test_wishlist_toggle_add_and_remove(self):
        """Toggle wishlist adds on first call, removes on second."""
        token = login_customer(client, "cart@test.com", "cartpass")
        headers = get_auth_header(token)

        # First toggle - add
        resp = client.post("/api/customer/wishlist/toggle", json={"product_id": 1}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["action"] == "added"

        # Second toggle - remove
        resp = client.post("/api/customer/wishlist/toggle", json={"product_id": 1}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["action"] == "removed"


# ──────────────────────────────────────────────────────────────────────────────
# Test Suite 4 — Customer Address Book
# ──────────────────────────────────────────────────────────────────────────────

class TestSuite4_AddressBook:
    """Suite 4: Customer Address Book"""

    @pytest.fixture(autouse=True)
    def setup_users(self):
        """Create two test customers."""
        db = TestingSessionLocal()
        try:
            create_customer_user(db, "addr1@test.com", "pass123")
            create_customer_user(db, "addr2@test.com", "pass123")
        finally:
            db.close()

    def test_create_and_list_addresses(self):
        """Create address and list it."""
        token = login_customer(client, "addr1@test.com", "pass123")
        headers = get_auth_header(token)

        # Create address
        resp = client.post("/api/customer/addresses", json={
            "full_name": "John Doe",
            "phone": "+1 555 000 1111",
            "street": "456 Address St",
            "city": "Addr City",
            "zip_code": "54321",
            "is_default": True
        }, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "John Doe"

        # List addresses
        resp = client.get("/api/customer/addresses", headers=headers)
        assert resp.status_code == 200
        addresses = resp.json()
        assert len(addresses) == 1

    def test_delete_address(self):
        """Delete an address."""
        token = login_customer(client, "addr1@test.com", "pass123")
        headers = get_auth_header(token)

        # Create address first
        resp = client.post("/api/customer/addresses", json={
            "full_name": "To Delete",
            "phone": "+1 555 000 2222",
            "street": "Delete St",
            "city": "Del City",
            "zip_code": "99999",
            "is_default": False
        }, headers=headers)
        addr_id = resp.json()["id"]

        # Delete it
        resp = client.delete(f"/api/customer/addresses/{addr_id}", headers=headers)
        assert resp.status_code == 200

        # Verify gone
        resp = client.get("/api/customer/addresses", headers=headers)
        assert len(resp.json()) == 0

    def test_user_isolation_addresses(self):
        """Customer A cannot see or delete Customer B's addresses."""
        token1 = login_customer(client, "addr1@test.com", "pass123")
        token2 = login_customer(client, "addr2@test.com", "pass123")
        headers1 = get_auth_header(token1)
        headers2 = get_auth_header(token2)

        # Customer 1 creates address
        resp = client.post("/api/customer/addresses", json={
            "full_name": "Customer One",
            "phone": "+1 555 000 1111",
            "street": "Cust1 St",
            "city": "Cust1 City",
            "zip_code": "11111",
            "is_default": True
        }, headers=headers1)
        addr_id = resp.json()["id"]

        # Customer 2 tries to delete Customer 1's address - should fail with 404
        resp = client.delete(f"/api/customer/addresses/{addr_id}", headers=headers2)
        assert resp.status_code == 404

        # Customer 2 lists addresses - should be empty
        resp = client.get("/api/customer/addresses", headers=headers2)
        assert len(resp.json()) == 0


# ──────────────────────────────────────────────────────────────────────────────
# Test Suite 5 — Atomic Checkout, Stock Deduction & Order Tracking
# ──────────────────────────────────────────────────────────────────────────────

class TestSuite5_Checkout:
    """Suite 5: Atomic Checkout, Stock Deduction & Order Tracking"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Create customer, products, address for checkout tests."""
        db = TestingSessionLocal()
        try:
            user = create_customer_user(db, "checkout@test.com", "checkoutpass")
            create_test_product(db, "Product A", "Produce", "CHK-001", 2.00, 5.00, 10, "1kg")
            create_test_product(db, "Product B", "Dairy", "CHK-002", 1.00, 3.00, 5, "1L")
            create_test_address(db, user.id)
        finally:
            db.close()

    def test_checkout_empty_cart_fails(self):
        """Checkout with empty cart fails with 400."""
        token = login_customer(client, "checkout@test.com", "checkoutpass")
        headers = get_auth_header(token)

        # Don't add anything to cart
        resp = client.post("/api/customer/orders", json={"address_id": 1}, headers=headers)
        assert resp.status_code == 400
        assert "empty" in resp.json()["detail"].lower()

    def test_checkout_invalid_address_fails(self):
        """Checkout with invalid address_id fails with 404."""
        token = login_customer(client, "checkout@test.com", "checkoutpass")
        headers = get_auth_header(token)

        # Add item to cart first
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=headers)

        # Try with invalid address
        resp = client.post("/api/customer/orders", json={"address_id": 999}, headers=headers)
        assert resp.status_code == 404

    def test_atomic_checkout_stock_deduction_and_order_creation(self):
        """Valid checkout: atomic order creation, stock deduction, cart clearing."""
        token = login_customer(client, "checkout@test.com", "checkoutpass")
        headers = get_auth_header(token)

        # Add items to cart
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 2}, headers=headers)  # Product A: stock 10 -> 8
        client.post("/api/customer/cart", json={"product_id": 2, "quantity": 1}, headers=headers)  # Product B: stock 5 -> 4

        # Place order
        resp = client.post("/api/customer/orders", json={"address_id": 1}, headers=headers)
        assert resp.status_code == 200, f"Checkout failed: {resp.text}"
        order = resp.json()
        assert order["status"] == "Placed"
        assert order["total_revenue"] == 13.00  # (5.00 * 2) + (3.00 * 1)
        assert "id" in order

        # Verify order appears in customer order history
        resp = client.get("/api/customer/orders", headers=headers)
        assert resp.status_code == 200
        orders = resp.json()["orders"]
        assert len(orders) == 1
        assert orders[0]["status"] == "Placed"
        assert orders[0]["total_revenue"] == 13.00
        assert len(orders[0]["items"]) == 2

        # Verify stock deduction
        resp = client.get("/api/products")
        products = resp.json()
        product_a = next(p for p in products if p["sku"] == "CHK-001")
        product_b = next(p for p in products if p["sku"] == "CHK-002")
        assert product_a["stock_qty"] == 8  # 10 - 2
        assert product_b["stock_qty"] == 4  # 5 - 1

        # Verify cart cleared
        resp = client.get("/api/customer/cart", headers=headers)
        assert resp.json()["item_count"] == 0

    def test_address_snapshot_immutable_after_order(self):
        """Address snapshot preserved even if original address is deleted."""
        token = login_customer(client, "checkout@test.com", "checkoutpass")
        headers = get_auth_header(token)

        # Add item and place order
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=headers)
        resp = client.post("/api/customer/orders", json={"address_id": 1}, headers=headers)
        order_id = resp.json()["id"]

        # Delete the address
        client.delete("/api/customer/addresses/1", headers=headers)

        # Order should still have address snapshot
        resp = client.get("/api/customer/orders", headers=headers)
        orders = resp.json()["orders"]
        assert len(orders) == 1
        snapshot = orders[0]["address_snapshot"]
        assert snapshot["street"] == "123 Test St"
        assert snapshot["city"] == "Test City"


# ──────────────────────────────────────────────────────────────────────────────
# Test Suite 6 — Admin Inventory Management & Order Dispatch
# ──────────────────────────────────────────────────────────────────────────────

class TestSuite6_AdminInventoryDispatch:
    """Suite 6: Admin Inventory Management & Order Dispatch"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Create admin, customer, product, and order."""
        db = TestingSessionLocal()
        try:
            admin = create_admin_user(db, "admin@dispatch.com", "adminpass")
            customer = create_customer_user(db, "dispatch@test.com", "custpass")
            product = create_test_product(db, "Dispatch Product", "Produce", "DSP-001", 2.00, 4.00, 20, "1kg")
            create_test_address(db, customer.id)
        finally:
            db.close()

    def test_admin_add_product_appears_on_storefront(self):
        """Admin adds new product, it appears on public storefront immediately."""
        admin_token = login_admin(client, "admin@dispatch.com", "adminpass")
        headers = get_auth_header(admin_token)

        # Add new product
        resp = client.post("/api/admin/products", json={
            "name": "New Storefront Product",
            "category": "Bakery",
            "sku": "NEW-001",
            "cost_price": 1.50,
            "selling_price": 3.50,
            "stock_qty": 15,
            "unit": "1 loaf"
        }, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["sku"] == "NEW-001"

        # Verify it appears on public storefront
        resp = client.get("/api/products")
        assert resp.status_code == 200
        products = resp.json()
        skus = {p["sku"] for p in products}
        assert "NEW-001" in skus

    def test_admin_adjust_stock(self):
        """Admin adjusts stock quantity via PATCH."""
        admin_token = login_admin(client, "admin@dispatch.com", "adminpass")
        headers = get_auth_header(admin_token)

        # Adjust stock
        resp = client.patch("/api/admin/products/1/stock", json={"quantity": -5}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["stock_qty"] == 15  # 20 - 5

        # Add stock
        resp = client.patch("/api/admin/products/1/stock", json={"quantity": 10}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["stock_qty"] == 25

    def test_admin_update_product_details(self):
        """Admin updates product details via PUT."""
        admin_token = login_admin(client, "admin@dispatch.com", "adminpass")
        headers = get_auth_header(admin_token)

        resp = client.put("/api/admin/products/1", json={
            "name": "Updated Product Name",
            "selling_price": 5.00
        }, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Product Name"
        assert resp.json()["selling_price"] == 5.00

    def test_admin_advance_order_status_sequentially(self):
        """Admin advances order status sequentially through all stages."""
        admin_token = login_admin(client, "admin@dispatch.com", "adminpass")
        cust_token = login_customer(client, "dispatch@test.com", "custpass")
        admin_headers = get_auth_header(admin_token)
        cust_headers = get_auth_header(cust_token)

        # Customer places order
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=cust_headers)
        resp = client.post("/api/customer/orders", json={"address_id": 1}, headers=cust_headers)
        order_id = resp.json()["id"]

        # Verify initial status
        resp = client.get("/api/customer/orders", headers=cust_headers)
        assert resp.json()["orders"][0]["status"] == "Placed"

        # Admin advances: Placed -> Packed
        resp = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Packed"}, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Packed"

        # Verify customer sees update
        resp = client.get("/api/customer/orders", headers=cust_headers)
        assert resp.json()["orders"][0]["status"] == "Packed"

        # Admin advances: Packed -> Out for Delivery
        resp = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Out for Delivery"}, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Out for Delivery"

        # Admin advances: Out for Delivery -> Delivered
        resp = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Delivered"}, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Delivered"

    def test_admin_rejects_invalid_status_transitions(self):
        """Admin rejects invalid status strings and backward jumps."""
        admin_token = login_admin(client, "admin@dispatch.com", "adminpass")
        cust_token = login_customer(client, "dispatch@test.com", "custpass")
        admin_headers = get_auth_header(admin_token)
        cust_headers = get_auth_header(cust_token)

        # Create new order
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=cust_headers)
        resp = client.post("/api/customer/orders", json={"address_id": 1}, headers=cust_headers)
        order_id = resp.json()["id"]

        # Try invalid status string
        resp = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "InvalidStatus"}, headers=admin_headers)
        assert resp.status_code == 400

        # Advance to Delivered
        client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Packed"}, headers=admin_headers)
        client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Out for Delivery"}, headers=admin_headers)
        client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Delivered"}, headers=admin_headers)

        # Try to go backwards (Delivered -> Packed)
        resp = client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Packed"}, headers=admin_headers)
        assert resp.status_code == 400

    def test_customer_sees_live_status_updates(self):
        """Customer's GET /api/customer/orders immediately reflects admin status changes."""
        admin_token = login_admin(client, "admin@dispatch.com", "adminpass")
        cust_token = login_customer(client, "dispatch@test.com", "custpass")
        admin_headers = get_auth_header(admin_token)
        cust_headers = get_auth_header(cust_token)

        # Place order
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=cust_headers)
        resp = client.post("/api/customer/orders", json={"address_id": 1}, headers=cust_headers)
        order_id = resp.json()["id"]

        # Admin updates to Delivered
        client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Packed"}, headers=admin_headers)
        client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Out for Delivery"}, headers=admin_headers)
        client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "Delivered"}, headers=admin_headers)

        # Customer fetches orders
        resp = client.get("/api/customer/orders", headers=cust_headers)
        orders = resp.json()["orders"]
        assert orders[0]["status"] == "Delivered"


# ──────────────────────────────────────────────────────────────────────────────
# Test Suite 7 — Admin Revenue & Net Profit Analytics Accuracy
# ──────────────────────────────────────────────────────────────────────────────

class TestSuite7_Analytics:
    """Suite 7: Admin Revenue & Net Profit Analytics Accuracy"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Create admin, customer, products, and an order for analytics."""
        db = TestingSessionLocal()
        try:
            admin = create_admin_user(db, "analytics@admin.com", "adminpass")
            customer = create_customer_user(db, "analytics@cust.com", "custpass")
            # Product A: cost 2.00, sell 5.00, profit 3.00
            create_test_product(db, "Analytics Product A", "Produce", "ANA-001", 2.00, 5.00, 50, "1kg")
            # Product B: cost 1.00, sell 3.00, profit 2.00
            create_test_product(db, "Analytics Product B", "Dairy", "ANA-002", 1.00, 3.00, 30, "1L")
            create_test_address(db, customer.id)
        finally:
            db.close()

    def test_analytics_before_and_after_order(self):
        """Analytics before and after placing a known order."""
        admin_token = login_admin(client, "analytics@admin.com", "adminpass")
        cust_token = login_customer(client, "analytics@cust.com", "custpass")
        admin_headers = get_auth_header(admin_token)
        cust_headers = get_auth_header(cust_token)

        # Get analytics BEFORE order
        resp = client.get("/api/admin/analytics", headers=admin_headers)
        assert resp.status_code == 200
        before = resp.json()
        before_revenue = before["total_revenue"]
        before_cost = before["total_cost"]
        before_profit = before["net_profit"]

        # Customer places order: 2x Product A (5.00 each) + 1x Product B (3.00)
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 2}, headers=cust_headers)
        client.post("/api/customer/cart", json={"product_id": 2, "quantity": 1}, headers=cust_headers)
        client.post("/api/customer/orders", json={"address_id": 1}, headers=cust_headers)

        # Expected: revenue = 2*5 + 1*3 = 13.00, cost = 2*2 + 1*1 = 5.00, profit = 8.00
        expected_revenue = 13.00
        expected_cost = 5.00
        expected_profit = 8.00

        # Get analytics AFTER order
        resp = client.get("/api/admin/analytics", headers=admin_headers)
        assert resp.status_code == 200
        after = resp.json()

        assert after["total_revenue"] == round(before_revenue + expected_revenue, 2)
        assert after["total_cost"] == round(before_cost + expected_cost, 2)
        assert after["net_profit"] == round(before_profit + expected_profit, 2)

        # Verify profit margin calculation
        if after["total_revenue"] > 0:
            expected_margin = round((after["net_profit"] / after["total_revenue"]) * 100, 2)
            assert after["profit_margin_pct"] == expected_margin

    def test_low_stock_products_accuracy(self):
        """Low stock products list includes items with stock_qty <= 10."""
        admin_token = login_admin(client, "analytics@admin.com", "adminpass")
        headers = get_auth_header(admin_token)

        # Product A stock is 50, Product B is 30 - neither should be low stock
        resp = client.get("/api/admin/analytics", headers=headers)
        low_stock = resp.json()["low_stock_products"]
        skus = {p["sku"] for p in low_stock}
        assert "ANA-001" not in skus
        assert "ANA-002" not in skus

    def test_category_breakdown_sums_match_total(self):
        """Category breakdown revenue sums match total revenue."""
        admin_token = login_admin(client, "analytics@admin.com", "adminpass")
        headers = get_auth_header(admin_token)

        # Place an order to generate data
        cust_token = login_customer(client, "analytics@cust.com", "custpass")
        cust_headers = get_auth_header(cust_token)
        client.post("/api/customer/cart", json={"product_id": 1, "quantity": 1}, headers=cust_headers)
        client.post("/api/customer/orders", json={"address_id": 1}, headers=cust_headers)

        resp = client.get("/api/admin/analytics", headers=headers)
        data = resp.json()

        category_revenue_sum = sum(cat["revenue"] for cat in data["category_breakdown"])
        assert abs(category_revenue_sum - data["total_revenue"]) < 0.01


# ──────────────────────────────────────────────────────────────────────────────
# Run All Tests
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])