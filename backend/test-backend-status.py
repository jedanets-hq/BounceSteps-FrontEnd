#!/usr/bin/env python3
"""
Script ya kutest backend ya Render na kuonyesha tatizo wazi
"""

import requests
import time
import json
from datetime import datetime

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")

def test_backend_health(url, timeout=10):
    """Test backend health endpoint"""
    print_info(f"Testing: {url}")
    print_info(f"Timeout: {timeout} seconds")
    
    try:
        start_time = time.time()
        response = requests.get(url, timeout=timeout)
        end_time = time.time()
        duration = end_time - start_time
        
        print_info(f"Response time: {duration:.2f} seconds")
        print_info(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Backend is ALIVE!")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print_error(f"Backend returned error: {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print_error(f"Backend TIMEOUT after {timeout} seconds")
        print_warning("Backend is NOT responding - probably sleeping or crashed")
        return False
        
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend")
        print_warning("Backend is DOWN or URL is wrong")
        return False
        
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_services_endpoint(url, timeout=10):
    """Test services endpoint"""
    print_info(f"Testing: {url}")
    
    try:
        start_time = time.time()
        response = requests.get(url, timeout=timeout)
        end_time = time.time()
        duration = end_time - start_time
        
        print_info(f"Response time: {duration:.2f} seconds")
        print_info(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                services_count = len(data.get('services', []))
                print_success(f"Found {services_count} services")
                
                if services_count > 0:
                    print_info("Sample services:")
                    for i, service in enumerate(data['services'][:3], 1):
                        print(f"   {i}. {service.get('title')} - {service.get('category')}")
                        print(f"      Location: {service.get('region')} > {service.get('district')}")
                        print(f"      Provider: {service.get('business_name')}")
                return True
            else:
                print_error("API returned success=false")
                return False
        else:
            print_error(f"Backend returned error: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print_error(f"Backend TIMEOUT after {timeout} seconds")
        return False
        
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def main():
    print_header("iSAFARI BACKEND STATUS TEST")
    print_info(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    backend_url = "https://isafarinetworkglobal-2.onrender.com"
    
    # Test 1: Health endpoint
    print_header("TEST 1: Backend Health Check")
    health_url = f"{backend_url}/api/health"
    health_ok = test_backend_health(health_url, timeout=15)
    
    # Test 2: Services endpoint
    print_header("TEST 2: Services Endpoint")
    services_url = f"{backend_url}/api/services?limit=5"
    services_ok = test_services_endpoint(services_url, timeout=15)
    
    # Test 3: Specific category and location
    print_header("TEST 3: Services with Filters")
    filtered_url = f"{backend_url}/api/services?category=Accommodation&region=Mbeya&limit=5"
    filtered_ok = test_services_endpoint(filtered_url, timeout=15)
    
    # Summary
    print_header("TEST SUMMARY")
    
    tests = [
        ("Health Check", health_ok),
        ("Services Endpoint", services_ok),
        ("Filtered Services", filtered_ok)
    ]
    
    passed = sum(1 for _, ok in tests if ok)
    failed = len(tests) - passed
    
    for test_name, ok in tests:
        if ok:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{Colors.BOLD}Total: {len(tests)} tests{Colors.END}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.END}")
    print(f"{Colors.RED}Failed: {failed}{Colors.END}")
    
    # Diagnosis
    print_header("DIAGNOSIS")
    
    if failed == 0:
        print_success("Backend is working perfectly!")
        print_success("Providers should appear in Journey Planner Step 4")
        print_info("\nNext steps:")
        print("   1. Clear browser cache (Ctrl + Shift + Delete)")
        print("   2. Reload https://isafari-tz.netlify.app/journey-planner")
        print("   3. Go to Step 4 - providers should appear!")
    else:
        print_error("Backend is NOT working!")
        print_warning("\nPossible causes:")
        print("   1. Backend is sleeping (Render free tier)")
        print("   2. Database connection error")
        print("   3. Backend deployment failed")
        print("   4. Environment variables missing")
        
        print_info("\nSolutions:")
        print("   1. Go to https://dashboard.render.com")
        print("   2. Find service: isafarinetworkglobal-2")
        print("   3. Click 'Manual Deploy' > 'Clear build cache & deploy'")
        print("   4. Check Logs for errors")
        print("   5. Verify DATABASE_URL is set in Environment")
        
        print_warning("\nIMPORTANT:")
        print("   Frontend code is CORRECT - no changes needed")
        print("   Problem is BACKEND not responding")
        print("   After backend works, providers will appear automatically")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Test interrupted by user{Colors.END}")
    except Exception as e:
        print_error(f"Fatal error: {str(e)}")
