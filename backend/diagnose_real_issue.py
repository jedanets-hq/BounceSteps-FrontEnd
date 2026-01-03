#!/usr/bin/env python3
"""
DEEP DIAGNOSIS: Tatizo halisi la providers kutoonekana
Chunguza database moja kwa moja
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')

def connect_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

def check_services_data():
    """Check services table data"""
    conn = connect_db()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        
        print("\n" + "="*60)
        print("CHECKING SERVICES TABLE")
        print("="*60)
        
        # Get all services
        cursor.execute("""
            SELECT id, title, category, region, district, area, location, provider_id, is_active
            FROM services
            ORDER BY id
        """)
        
        services = cursor.fetchall()
        print(f"\n📊 Total services: {len(services)}")
        
        if services:
            print("\n📋 Services breakdown:")
            for service in services:
                sid, title, category, region, district, area, location, provider_id, is_active = service
                print(f"\n  Service ID: {sid}")
                print(f"  Title: {title}")
                print(f"  Category: {category}")
                print(f"  Region: {region}")
                print(f"  District: {district}")
                print(f"  Area: {area}")
                print(f"  Location: {location}")
                print(f"  Provider ID: {provider_id}")
                print(f"  Active: {is_active}")
        
        # Check services by category
        cursor.execute("""
            SELECT category, COUNT(*) as count
            FROM services
            WHERE is_active = true
            GROUP BY category
            ORDER BY count DESC
        """)
        
        categories = cursor.fetchall()
        print(f"\n📊 Services by category:")
        for cat, count in categories:
            print(f"  {cat}: {count}")
        
        # Check services by region
        cursor.execute("""
            SELECT region, COUNT(*) as count
            FROM services
            WHERE is_active = true
            GROUP BY region
            ORDER BY count DESC
        """)
        
        regions = cursor.fetchall()
        print(f"\n📍 Services by region:")
        for region, count in regions:
            print(f"  {region or 'NULL'}: {count}")
        
        cursor.close()
        
    except Exception as e:
        print(f"❌ Error checking services: {e}")
    finally:
        conn.close()

def check_providers_data():
    """Check service_providers table data"""
    conn = connect_db()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        
        print("\n" + "="*60)
        print("CHECKING SERVICE_PROVIDERS TABLE")
        print("="*60)
        
        # Get all providers
        cursor.execute("""
            SELECT id, user_id, business_name, region, district, area, location, is_verified
            FROM service_providers
            ORDER BY id
        """)
        
        providers = cursor.fetchall()
        print(f"\n📊 Total providers: {len(providers)}")
        
        if providers:
            print("\n📋 Providers breakdown:")
            for provider in providers:
                pid, user_id, business_name, region, district, area, location, is_verified = provider
                print(f"\n  Provider ID: {pid}")
                print(f"  User ID: {user_id}")
                print(f"  Business Name: {business_name}")
                print(f"  Region: {region}")
                print(f"  District: {district}")
                print(f"  Area: {area}")
                print(f"  Location: {location}")
                print(f"  Verified: {is_verified}")
        
        cursor.close()
        
    except Exception as e:
        print(f"❌ Error checking providers: {e}")
    finally:
        conn.close()

def check_service_provider_relationship():
    """Check relationship between services and providers"""
    conn = connect_db()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        
        print("\n" + "="*60)
        print("CHECKING SERVICE-PROVIDER RELATIONSHIP")
        print("="*60)
        
        # Get services with provider info
        cursor.execute("""
            SELECT 
                s.id as service_id,
                s.title,
                s.category,
                s.region as service_region,
                s.district as service_district,
                s.provider_id,
                sp.business_name,
                sp.region as provider_region,
                sp.district as provider_district
            FROM services s
            LEFT JOIN service_providers sp ON s.provider_id = sp.id
            WHERE s.is_active = true
            ORDER BY s.id
        """)
        
        relationships = cursor.fetchall()
        print(f"\n📊 Total active services: {len(relationships)}")
        
        services_with_provider = 0
        services_without_provider = 0
        location_mismatches = 0
        
        for rel in relationships:
            service_id, title, category, s_region, s_district, provider_id, business_name, p_region, p_district = rel
            
            if provider_id and business_name:
                services_with_provider += 1
                
                # Check location mismatch
                if s_region != p_region:
                    location_mismatches += 1
                    print(f"\n  ⚠️ Location mismatch:")
                    print(f"     Service: {title} (ID: {service_id})")
                    print(f"     Service region: {s_region}")
                    print(f"     Provider region: {p_region}")
            else:
                services_without_provider += 1
                print(f"\n  ❌ Service without provider:")
                print(f"     Service: {title} (ID: {service_id})")
                print(f"     Provider ID: {provider_id}")
        
        print(f"\n✅ Services with provider: {services_with_provider}")
        print(f"❌ Services without provider: {services_without_provider}")
        print(f"⚠️ Location mismatches: {location_mismatches}")
        
        cursor.close()
        
    except Exception as e:
        print(f"❌ Error checking relationships: {e}")
    finally:
        conn.close()

def test_filtering_query():
    """Test the actual filtering query used by backend"""
    conn = connect_db()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        
        print("\n" + "="*60)
        print("TESTING FILTERING QUERIES")
        print("="*60)
        
        # Test 1: Get all services for Mbeya region
        print("\n🔍 Test 1: Services in Mbeya region")
        cursor.execute("""
            SELECT s.id, s.title, s.category, s.region, s.district, sp.business_name
            FROM services s
            LEFT JOIN service_providers sp ON s.provider_id = sp.id
            WHERE s.is_active = true 
            AND LOWER(s.region) = LOWER('Mbeya')
        """)
        
        results = cursor.fetchall()
        print(f"   Found: {len(results)} services")
        for r in results:
            print(f"   - {r[1]} ({r[2]}) | Provider: {r[5]}")
        
        # Test 2: Get accommodation services in Mbeya
        print("\n🔍 Test 2: Accommodation services in Mbeya")
        cursor.execute("""
            SELECT s.id, s.title, s.category, s.region, s.district, sp.business_name
            FROM services s
            LEFT JOIN service_providers sp ON s.provider_id = sp.id
            WHERE s.is_active = true 
            AND s.category = 'accommodation'
            AND LOWER(s.region) = LOWER('Mbeya')
        """)
        
        results = cursor.fetchall()
        print(f"   Found: {len(results)} services")
        for r in results:
            print(f"   - {r[1]} ({r[2]}) | Provider: {r[5]}")
        
        # Test 3: Get all categories available
        print("\n🔍 Test 3: All available categories")
        cursor.execute("""
            SELECT DISTINCT category
            FROM services
            WHERE is_active = true
            ORDER BY category
        """)
        
        categories = cursor.fetchall()
        print(f"   Found: {len(categories)} categories")
        for cat in categories:
            print(f"   - {cat[0]}")
        
        cursor.close()
        
    except Exception as e:
        print(f"❌ Error testing queries: {e}")
    finally:
        conn.close()

def main():
    """Main diagnosis function"""
    print("="*60)
    print("DEEP DATABASE DIAGNOSIS")
    print("="*60)
    
    check_services_data()
    check_providers_data()
    check_service_provider_relationship()
    test_filtering_query()
    
    print("\n" + "="*60)
    print("DIAGNOSIS COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
