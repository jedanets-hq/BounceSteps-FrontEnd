#!/usr/bin/env python3
"""
FIX PRODUCTION DATABASE - Add Mbeya Services
This script connects to Render PostgreSQL and adds missing services
"""

import psycopg2
import os
from urllib.parse import urlparse

# IMPORTANT: Set this environment variable with your Render DATABASE_URL
# Example: postgresql://user:password@host:5432/database
DATABASE_URL = os.getenv('DATABASE_URL', '')

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL environment variable not set!")
    print("\nTo fix this:")
    print("1. Go to Render Dashboard → Your PostgreSQL database")
    print("2. Copy the 'External Database URL'")
    print("3. Run: set DATABASE_URL=<your-url>  (Windows)")
    print("   OR: export DATABASE_URL=<your-url>  (Linux/Mac)")
    print("4. Run this script again")
    exit(1)

def connect_to_database():
    """Connect to PostgreSQL database"""
    try:
        # Parse DATABASE_URL
        result = urlparse(DATABASE_URL)
        username = result.username
        password = result.password
        database = result.path[1:]
        hostname = result.hostname
        port = result.port

        print(f"🔗 Connecting to database...")
        print(f"   Host: {hostname}")
        print(f"   Database: {database}")
        print(f"   User: {username}")

        conn = psycopg2.connect(
            database=database,
            user=username,
            password=password,
            host=hostname,
            port=port
        )
        
        print("✅ Connected successfully!")
        return conn
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return None

def fix_existing_services(conn):
    """Fix services that have NULL region by copying from provider"""
    print("\n🔧 Step 1: Fixing existing services with NULL region...")
    
    cursor = conn.cursor()
    
    # Update services to copy location from provider
    cursor.execute("""
        UPDATE services 
        SET 
          region = sp.region,
          district = sp.district,
          area = sp.area,
          country = COALESCE(sp.country, 'Tanzania'),
          location = COALESCE(
            sp.district || ', ' || sp.region,
            'Tanzania'
          )
        FROM service_providers sp
        WHERE services.provider_id = sp.id
          AND (services.region IS NULL OR services.region = '')
    """)
    
    rows_updated = cursor.rowcount
    conn.commit()
    
    print(f"✅ Fixed {row