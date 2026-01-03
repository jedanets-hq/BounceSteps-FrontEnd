#!/usr/bin/env python3
"""
DEEP DIAGNOSIS: Provider Visibility Issue in Journey Planner
Chunguza kwa kina tatizo la providers kutoonekana
"""

import requests
import json
from typing import Dict, List, Any

# Production API URL
API_BASE = "https://isafari-backend.onrender.com/api"

def test_api_endpoint(endpoint: str, params: Dict = None) -> Dict:
    """Test API endpoint na rudisha response"""
    try:
        url = f"{API_BASE}{endpoint}"
        print(f"\n{'='*60}")
        print(f"Testing: {url}")
        if params:
            print(f"Params: {json.dumps(params, indent=2)}")
        
        response = requests.get(url, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response size: {len(json.dumps(data))} bytes")
            return data
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {str(e)}")
        return None

def analyze_services(services: List[Dict]) -> None:
    """Analyze services data structure"""
    print(f"\n{'='*60}")
    print(f"ANALYZING {len(services)} SERVICES")
    print(f"{'='*60}")
    
    if not services:
        print("❌ NO SERVICES FOUND!")
        return
    
    # Check structure of first service
    first_service = services[0]
    print(f"\nFirst Service Structure:")
    print(json.dumps(first_service, indent=2))
    
    # Analyze all services
    locations = set()
    categories = set()
    providers_found = 0
    services_with_location = 0
    services_with_category = 0
    
    for service in services:
        # Check location
        if 'location' in service and service['location']:
            locations.add(service['location'])
            services_with_location += 1
        
        # Check category
        if 'category' in service and service['category']:
            categories.add(service['category'])
            services_with_category += 1
        
        # Check provider
        if 'provider_id' in service or 'providerId' in service or 'provider' in service:
            providers_found += 1
    
    print(f"\n📊 STATISTICS:")
    print(f"Total Services: {len(services)}")
    print(f"Services with Location: {services_with_location}")
    print(f"Services with Category: {services_with_category}")
    print(f"Services with Provider: {providers_found}")
    
    print(f"\n📍 LOCATIONS FOUND ({len(locations)}):")
    for loc in sorted(locations):
        print(f"  - {loc}")
    
    print(f"\n🏷️ CATEGORIES FOUND ({len(categories)}):")
    for cat in sorted(categories):
        print(f"  - {cat}")

def test_providers_endpoint() -> List[Dict]:
    """Test providers endpoint directly"""
    print(f"\n{'='*60}")
    print("TESTING PROVIDERS ENDPOINT")
    print(f"{'='*60}")
    
    data = test_api_endpoint("/providers")
    
    if data and 'providers' in data:
        providers = data['providers']
        print(f"\n✅ Found {len(providers)} providers")
        
        for i, provider in enumerate(providers[:3], 1):
            print(f"\nProvider {i}:")
            print(f"  ID: {provider.get('id')}")
            print(f"  Name: {provider.get('business_name')}")
            print(f"  Location: {provider.get('location')}")
            print(f"  Services: {provider.get('services_count', 0)}")
        
        return providers
    else:
        print("❌ No providers data found")
        return []

def test_filtering_scenarios():
    """Test different filtering scenarios"""
    print(f"\n{'='*60}")
    print("TESTING FILTERING SCENARIOS")
    print(f"{'='*60}")
    
    scenarios = [
        {"location": "Mbeya", "category": None},
        {"location": "Dar es Salaam", "category": None},
        {"location": None, "category": "accommodation"},
        {"location": None, "category": "transportation"},
        {"location": "Mbeya", "category": "accommodation"},
        {"location": "Dar es Salaam", "category": "transportation"},
    ]
    
    for scenario in scenarios:
        params = {k: v for k, v in scenario.items() if v is not None}
        print(f"\n🔍 Testing: {params}")
        
        data = test_api_endpoint("/services", params)
        
        if data and 'services' in data:
            services = data['services']
            print(f"  ✅ Found {len(services)} services")
            
            # Check if services match filter
            for service in services[:2]:
                print(f"    - {service.get('name')} | Location: {service.get('location')} | Category: {service.get('category')}")
        else:
            print(f"  ❌ No services found")

def check_service_provider_relationship():
    """Check relationship between services and providers"""
    print(f"\n{'='*60}")
    print("CHECKING SERVICE-PROVIDER RELATIONSHIP")
    print(f"{'='*60}")
    
    # Get all services
    services_data = test_api_endpoint("/services")
    if not services_data or 'services' not in services_data:
        print("❌ Cannot get services")
        return
    
    services = services_data['services']
    
    # Get all providers
    providers_data = test_api_endpoint("/providers")
    if not providers_data or 'providers' not in providers_data:
        print("❌ Cannot get providers")
        return
    
    providers = providers_data['providers']
    
    # Create provider lookup
    provider_lookup = {p['id']: p for p in providers}
    
    print(f"\n📊 RELATIONSHIP ANALYSIS:")
    print(f"Total Services: {len(services)}")
    print(f"Total Providers: {len(providers)}")
    
    services_with_valid_provider = 0
    services_without_provider = 0
    provider_id_fields = set()
    
    for service in services:
        # Check different possible provider ID fields
        provider_id = None
        for field in ['provider_id', 'providerId', 'provider', 'user_id', 'userId']:
            if field in service and service[field]:
                provider_id = service[field]
                provider_id_fields.add(field)
                break
        
        if provider_id and provider_id in provider_lookup:
            services_with_valid_provider += 1
        else:
            services_without_provider += 1
            print(f"\n⚠️ Service without valid provider:")
            print(f"  Name: {service.get('name')}")
            print(f"  ID: {service.get('id')}")
            print(f"  Provider fields: {[f for f in ['provider_id', 'providerId', 'provider', 'user_id'] if f in service]}")
    
    print(f"\n✅ Services with valid provider: {services_with_valid_provider}")
    print(f"❌ Services without provider: {services_without_provider}")
    print(f"🔑 Provider ID fields found: {provider_id_fields}")

def main():
    """Main diagnosis function"""
    print("="*60)
    print("DEEP DIAGNOSIS - PROVIDER VISIBILITY ISSUE")
    print("="*60)
    
    # Test 1: Get all services
    print("\n\n1️⃣ GETTING ALL SERVICES")
    services_data = test_api_endpoint("/services")
    if services_data and 'services' in services_data:
        analyze_services(services_data['services'])
    
    # Test 2: Get all providers
    print("\n\n2️⃣ GETTING ALL PROVIDERS")
    providers = test_providers_endpoint()
    
    # Test 3: Test filtering
    print("\n\n3️⃣ TESTING FILTERING")
    test_filtering_scenarios()
    
    # Test 4: Check relationships
    print("\n\n4️⃣ CHECKING RELATIONSHIPS")
    check_service_provider_relationship()
    
    print("\n\n" + "="*60)
    print("DIAGNOSIS COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
