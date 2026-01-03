#!/usr/bin/env python3
"""
Simple script to check if Render backend is alive
"""

import requests
import sys

def check_backend():
    url = "https://isafarinetworkglobal-2.onrender.com/api/health"
    
    print("🔍 Checking Render backend...")
    print(f"📍 URL: {url}")
    print("⏳ Waiting for response (timeout: 30 seconds)...\n")
    
    try:
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            print("✅ SUCCESS! Backend is ALIVE!")
            print(f"📦 Response: {response.json()}")
            print("\n✅ TATIZO LIMETATULIWA!")
            print("   Providers wataonekana kwenye Journey Planner Step 4")
            return True
        else:
            print(f"❌ ERROR: Backend returned status {response.status_code}")
            print(f"📦 Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Backend haifanyi kazi (30+ seconds)")
        print("\n🚨 TATIZO KUBWA:")
        print("   Backend ya Render HAIFANYI KAZI")
        print("   Hii ndiyo sababu providers hawaonekani")
        print("\n💡 SULUHISHO:")
        print("   1. Ingia https://dashboard.render.com")
        print("   2. Chagua service: isafarinetworkglobal-2")
        print("   3. Bonyeza 'Manual Deploy' > 'Clear build cache & deploy'")
        print("   4. Weka DATABASE_URL kwenye Environment variables")
        print("   5. Subiri backend ianze (5-10 minutes)")
        print("   6. Run script hii tena: python check-render-backend.py")
        return False
        
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Cannot connect to backend")
        print("\n🚨 Backend is DOWN or URL is wrong")
        return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    success = check_backend()
    sys.exit(0 if success else 1)
