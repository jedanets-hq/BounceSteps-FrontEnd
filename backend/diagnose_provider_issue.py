#!/usr/bin/env python3
"""
DEEP DIAGNOSTIC SCRIPT - Provider Visibility Issue
Analyzes database, API responses, and filtering logic
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
API_BASE = "https://isafarinetworkglobal-2.onrender.com/api"
LOCAL_API = "http://localhost:5000/api"

def print_section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def test_api_endpoint(base_url, endpoint, params=None):
    """Test an API endpoint and return response"""
    url = f"{base_url}{endpoint}"
    try:
        print(f"🌐 Testing: {url}")
        if params:
            print(f"📋 Params: {json.dumps(params, indent=2)}")
        
        response = requests.get(url, params=params, timeout=10)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"❌ Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return None

def analyze_services(services, filter_criteria):
    """Analyze services against filter criteria"""
    print(f"\n📦 Total services received: {len(services)}")
    
    if not services:
        print("⚠️ NO SERVICES FOUND!")
        return
    
    # Group by category
    by_category = {}
    for s in services:
        cat = s.get('category', 'Unknown')
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(s)
    
    print(f"\n📊 Services by category:")
    for cat, items in by_category.items():
        print(f"   {cat}: {len(items)} services")
    
    # Group by location
    by_region = {}
    by_district = {}
    for s in services:
        region = s.get('region', 'Unknown')
        district = s.get('district', 'Unknown')
        
        if region not in by_region:
            by_region[region] = []
        by_region[region].append(s)
        
        if district not in by_district:
            by_district[district] = []
        by_district[district].append(s)
    
    print(f"\n📍 Services by region:")
    for region, items in sorted(by_region.items()):
        print(f"   {region}: {len(items)} services")
    
    print(f"\n📍 Services by district:")
    for district, items in sorted(by_district.items()):
        print(f"   {district}: {len(items)} services")
    
    # Check provider data
    providers_found = set()
    services_without_provider = []
    
    for s in services:
        provider_id = s.get('provider_id')
        business_name = s.get('business_name')
        
        if provider_id:
            providers_found.add((provider_id, business_name))
        else:
            services_without_provider.append(s.get('title', 'Unknown'))
    
    print(f"\n👥 Unique providers found: {len(providers_found)}")
    for pid, name in sorted(providers_found):
        print(f"   Provider {pid}: {name}")
    
    if services_without_provider:
        print(f"\n⚠️ Services without provider_id: {len(services_without_provider)}")
        for title in services_without_provider[:5]:
            print(f"   - {title}")
    
    # Analyze against filter criteria
    if filter_criteria:
        print(f"\n🔍 Filter Analysis:")
        print(f"   Requested category: {filter_criteria.get('category', 'None')}")
        print(f"   Requested region: {filter_criteria.get('region', 'None')}")
        print(f"   Requested district: {filter_criteria.get('district', 'None')}")
        
        # Check if services match filters
        matching = []
        not_matching = []
        
        for s in services:
            matches = True
            reasons = []
            
            if filter_criteria.get('category'):
                if s.get('category') != filter_criteria['category']:
                    matches = False
                    reasons.append(f"category mismatch: {s.get('category')} != {filter_criteria['category']}")
            
            if filter_criteria.get('region'):
                if s.get('region') != filter_criteria['region']:
                    matches = False
                    reasons.append(f"region mismatch: {s.get('region')} != {filter_criteria['region']}")
            
            if filter_criteria.get('district'):
                if s.get('district') != filter_criteria['district']:
                    matches = False
                    reasons.append(f"district mismatch: {s.get('district')} != {filter_criteria['district']}")
            
            if matches:
                matching.append(s)
            else:
                not_matching.append((s, reasons))
        
        print(f"\n   ✅ Services matching filters: {len(matching)}")
        print(f"   ❌ Services NOT matching filters: {len(not_matching)}")
        
        if not_matching and len(not_matching) <= 10:
            print(f"\n   Services that don't match:")
            for s, reasons in not_matching[:5]:
                print(f"      - {s.get('title')}: {', '.join(reasons)}")

def main():
    print_section("DEEP DIAGNOSTIC - Provider Visibility Issue")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
    # Test 1: Get ALL services (no filters)
    print_section("TEST 1: Get ALL Services (No Filters)")
    all_services = test_api_endpoint(API_BASE, "/services", {"limit": 500})
    
    if all_services and all_services.get('success'):
        analyze_services(all_services.get('services', []), None)
    
    # Test 2: Filter by Mbeya region
    print_section("TEST 2: Filter by Mbeya Region")
    mbeya_services = test_api_endpoint(API_BASE, "/services", {
        "region": "Mbeya",
        "limit": 500
    })
    
    if mbeya_services and mbeya_services.get('success'):
        analyze_services(mbeya_services.get('services', []), {"region": "Mbeya"})
    
    # Test 3: Filter by Accommodation category
    print_section("TEST 3: Filter by Accommodation Category")
    accommodation_services = test_api_endpoint(API_BASE, "/services", {
        "category": "Accommodation",
        "limit": 500
    })
    
    if accommodation_services and accommodation_services.get('success'):
        analyze_services(accommodation_services.get('services', []), {"category": "Accommodation"})
    
    # Test 4: Filter by Mbeya + Accommodation
    print_section("TEST 4: Filter by Mbeya + Accommodation")
    mbeya_accommodation = test_api_endpoint(API_BASE, "/services", {
        "region": "Mbeya",
        "category": "Accommodation",
        "limit": 500
    })
    
    if mbeya_accommodation and mbeya_accommodation.get('success'):
        analyze_services(
            mbeya_accommodation.get('services', []), 
            {"region": "Mbeya", "category": "Accommodation"}
        )
    
    # Test 5: Check providers endpoint
    print_section("TEST 5: Check Providers Endpoint")
    providers = test_api_endpoint(API_BASE, "/providers", {"limit": 100})
    
    if providers and providers.get('success'):
        provider_list = providers.get('providers', [])
        print(f"📦 Total providers: {len(provider_list)}")
        
        # Group by location
        by_region = {}
        for p in provider_list:
            region = p.get('region', 'Unknown')
            if region not in by_region:
                by_region[region] = []
            by_region[region].append(p)
        
        print(f"\n📍 Providers by region:")
        for region, items in sorted(by_region.items()):
            print(f"   {region}: {len(items)} providers")
            for p in items[:3]:
                print(f"      - {p.get('business_name')} (ID: {p.get('id')})")
    
    # Test 6: Search providers by location
    print_section("TEST 6: Search Providers by Mbeya")
    mbeya_providers = test_api_endpoint(API_BASE, "/providers/search", {
        "region": "Mbeya",
        "limit": 100
    })
    
    if mbeya_providers and mbeya_providers.get('success'):
        provider_list = mbeya_providers.get('providers', [])
        print(f"📦 Providers in Mbeya: {len(provider_list)}")
        for p in provider_list[:10]:
            print(f"   - {p.get('business_name')} (ID: {p.get('id')})")
            print(f"     Location: {p.get('region')}, {p.get('district')}")
            print(f"     Categories: {p.get('service_categories', [])}")
    
    print_section("DIAGNOSTIC COMPLETE")
    print("✅ Check the output above to identify the issue")
    print("\nPossible issues to look for:")
    print("1. Services exist but have wrong region/district values")
    print("2. Services exist but provider_id is missing/null")
    print("3. Providers exist but services don't link to them correctly")
    print("4. API filtering logic is too strict")
    print("5. Data in database doesn't match expected format")

if __name__ == "__main__":
    main()
