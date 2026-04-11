#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Diajem Global Black News Platform
Tests all CRUD operations, authentication, and public endpoints
"""

import requests
import json
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://diaspora-editorial.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@diajemnews.com"
ADMIN_PASSWORD = "DiajemAdmin2025!"

class DiajemAPITester:
    def __init__(self):
        self.token = None
        self.user = None
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name, success, message="", data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "data": data
        })
        
    def make_request(self, method, endpoint, data=None, auth=True, public=False):
        """Make HTTP request with proper headers"""
        url = f"{API_BASE}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if auth and self.token and not public:
            headers["Authorization"] = f"Bearer {self.token}"
            
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None
            
    def test_seed_database(self):
        """Test database seeding"""
        print("\n=== Testing Database Seed ===")
        
        response = self.make_request("POST", "/seed", auth=False)
        if response and response.status_code == 200:
            self.log_result("Seed Database", True, "Database seeded successfully")
            return True
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Seed Database", False, f"Failed to seed database: {error_msg}")
            return False
            
    def test_auth_login(self):
        """Test authentication login"""
        print("\n=== Testing Authentication ===")
        
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data, auth=False)
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                self.token = data["token"]
                self.user = data["user"]
                self.log_result("Auth Login", True, f"Login successful for {data['user']['email']}")
                return True
            else:
                self.log_result("Auth Login", False, "Missing token or user in response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Auth Login", False, f"Login failed: {error_msg}")
            return False
            
    def test_auth_me(self):
        """Test get current user"""
        response = self.make_request("GET", "/auth/me")
        if response and response.status_code == 200:
            data = response.json()
            if "user" in data:
                self.log_result("Auth Me", True, f"Retrieved user: {data['user']['email']}")
                return True
            else:
                self.log_result("Auth Me", False, "Missing user in response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Auth Me", False, f"Failed to get current user: {error_msg}")
            return False
            
    def test_categories_crud(self):
        """Test categories CRUD operations"""
        print("\n=== Testing Categories CRUD ===")
        
        # List categories
        response = self.make_request("GET", "/categories")
        if response and response.status_code == 200:
            categories = response.json()
            self.log_result("List Categories", True, f"Retrieved {len(categories)} categories")
            self.test_data["categories"] = categories
        else:
            self.log_result("List Categories", False, "Failed to list categories")
            return False
            
        # Create category
        new_category = {
            "name": "Test Category",
            "description": "Test category for API testing",
            "order": 99
        }
        
        response = self.make_request("POST", "/categories", new_category)
        if response and response.status_code == 201:
            category = response.json()
            self.test_data["test_category"] = category
            self.log_result("Create Category", True, f"Created category: {category['name']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Create Category", False, f"Failed to create category: {error_msg}")
            return False
            
        return True
        
    def test_stories_crud(self):
        """Test stories CRUD operations"""
        print("\n=== Testing Stories CRUD ===")
        
        # List stories
        response = self.make_request("GET", "/stories")
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("List Stories", True, f"Retrieved {data.get('total', 0)} stories")
        else:
            self.log_result("List Stories", False, "Failed to list stories")
            
        # Create story
        new_story = {
            "source_title": "Test News Story for API Testing",
            "source_text": "This is a test news story created during API testing to verify CRUD operations work correctly.",
            "source_outlet": "Test Outlet",
            "category_id": self.test_data.get("categories", [{}])[0].get("id", ""),
            "category_name": "Africa",
            "content_type": "Breaking News",
            "urgency": "normal"
        }
        
        response = self.make_request("POST", "/stories", new_story)
        if response and response.status_code == 201:
            story = response.json()
            self.test_data["test_story"] = story
            self.log_result("Create Story", True, f"Created story: {story['source_title']}")
            
            # Get story by ID
            response = self.make_request("GET", f"/stories/{story['id']}")
            if response and response.status_code == 200:
                story_detail = response.json()
                self.log_result("Get Story Detail", True, f"Retrieved story with ID: {story['id']}")
                
                # Update story
                update_data = {
                    "source_notes": "Updated during API testing",
                    "urgency": "high"
                }
                response = self.make_request("PUT", f"/stories/{story['id']}", update_data)
                if response and response.status_code == 200:
                    self.log_result("Update Story", True, "Story updated successfully")
                else:
                    self.log_result("Update Story", False, "Failed to update story")
            else:
                self.log_result("Get Story Detail", False, "Failed to get story detail")
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Create Story", False, f"Failed to create story: {error_msg}")
            return False
            
        return True
        
    def test_articles_crud(self):
        """Test articles CRUD operations"""
        print("\n=== Testing Articles CRUD ===")
        
        # List articles
        response = self.make_request("GET", "/articles")
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("List Articles", True, f"Retrieved {data.get('total', 0)} articles")
        else:
            self.log_result("List Articles", False, "Failed to list articles")
            
        # Create article
        story_id = self.test_data.get("test_story", {}).get("id", "")
        new_article = {
            "story_id": story_id,
            "headline": "Test Article: Breaking News from API Testing",
            "excerpt": "This is a test article created during comprehensive API testing to verify all CRUD operations work correctly.",
            "body_html": "<p>This is the main content of our test article.</p><p>It contains multiple paragraphs to test the HTML body field.</p><h2>Key Points</h2><p>Testing is important for ensuring API reliability.</p>",
            "seo_title": "Test Article - API Testing",
            "meta_description": "Test article created during API testing to verify CRUD operations",
            "tags": ["test", "api", "news"],
            "category_id": self.test_data.get("categories", [{}])[0].get("id", ""),
            "category_name": "Africa",
            "read_time": 3
        }
        
        response = self.make_request("POST", "/articles", new_article)
        if response and response.status_code == 201:
            article = response.json()
            self.test_data["test_article"] = article
            self.log_result("Create Article", True, f"Created article: {article['headline']}")
            
            # Get article by ID
            response = self.make_request("GET", f"/articles/{article['id']}")
            if response and response.status_code == 200:
                self.log_result("Get Article Detail", True, f"Retrieved article with ID: {article['id']}")
                
                # Update and publish article
                update_data = {
                    "is_published": True,
                    "featured_image_url": "https://example.com/test-image.jpg"
                }
                response = self.make_request("PUT", f"/articles/{article['id']}", update_data)
                if response and response.status_code == 200:
                    updated_article = response.json()
                    self.test_data["published_article"] = updated_article
                    self.log_result("Publish Article", True, "Article published successfully")
                else:
                    self.log_result("Publish Article", False, "Failed to publish article")
            else:
                self.log_result("Get Article Detail", False, "Failed to get article detail")
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Create Article", False, f"Failed to create article: {error_msg}")
            return False
            
        return True
        
    def test_public_endpoints(self):
        """Test public endpoints (no auth required)"""
        print("\n=== Testing Public Endpoints ===")
        
        # Public articles list
        response = self.make_request("GET", "/public/articles", auth=False, public=True)
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Public Articles List", True, f"Retrieved {data.get('total', 0)} published articles")
        else:
            self.log_result("Public Articles List", False, "Failed to get public articles")
            
        # Public categories
        response = self.make_request("GET", "/public/categories", auth=False, public=True)
        if response and response.status_code == 200:
            categories = response.json()
            self.log_result("Public Categories", True, f"Retrieved {len(categories)} categories")
        else:
            self.log_result("Public Categories", False, "Failed to get public categories")
            
        # Public search
        response = self.make_request("GET", "/public/search?q=test", auth=False, public=True)
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Public Search", True, f"Search returned {data.get('total', 0)} results")
        else:
            self.log_result("Public Search", False, "Failed to perform public search")
            
        # Get published article by slug
        if "published_article" in self.test_data:
            slug = self.test_data["published_article"].get("slug", "")
            if slug:
                response = self.make_request("GET", f"/public/articles/{slug}", auth=False, public=True)
                if response and response.status_code == 200:
                    article = response.json()
                    self.log_result("Public Article by Slug", True, f"Retrieved article: {article.get('article', {}).get('headline', '')}")
                else:
                    self.log_result("Public Article by Slug", False, "Failed to get article by slug")
                    
        return True
        
    def test_video_tasks_crud(self):
        """Test video tasks CRUD operations"""
        print("\n=== Testing Video Tasks CRUD ===")
        
        # List video tasks
        response = self.make_request("GET", "/video-tasks")
        if response and response.status_code == 200:
            tasks = response.json()
            self.log_result("List Video Tasks", True, f"Retrieved {len(tasks)} video tasks")
        else:
            self.log_result("List Video Tasks", False, "Failed to list video tasks")
            
        # Create video task
        story_id = self.test_data.get("test_story", {}).get("id", "")
        new_task = {
            "story_id": story_id,
            "title": "Test Video Task for API Testing",
            "status": "script_needed",
            "assigned_to": "Test User",
            "notes": "Created during API testing"
        }
        
        response = self.make_request("POST", "/video-tasks", new_task)
        if response and response.status_code == 201:
            task = response.json()
            self.test_data["test_video_task"] = task
            self.log_result("Create Video Task", True, f"Created video task: {task['title']}")
            
            # Update video task
            update_data = {
                "status": "in_progress",
                "notes": "Updated during API testing"
            }
            response = self.make_request("PUT", f"/video-tasks/{task['id']}", update_data)
            if response and response.status_code == 200:
                self.log_result("Update Video Task", True, "Video task updated successfully")
            else:
                self.log_result("Update Video Task", False, "Failed to update video task")
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Create Video Task", False, f"Failed to create video task: {error_msg}")
            return False
            
        return True
        
    def test_stats_endpoint(self):
        """Test stats endpoint"""
        print("\n=== Testing Stats Endpoint ===")
        
        response = self.make_request("GET", "/stats")
        if response and response.status_code == 200:
            stats = response.json()
            required_fields = ["totalStories", "totalArticles", "publishedArticles", "totalScripts", "totalVideoTasks"]
            
            if all(field in stats for field in required_fields):
                self.log_result("Stats Endpoint", True, f"Retrieved stats: {stats['totalStories']} stories, {stats['totalArticles']} articles")
                return True
            else:
                self.log_result("Stats Endpoint", False, "Missing required fields in stats response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Stats Endpoint", False, f"Failed to get stats: {error_msg}")
            return False
            
    def test_settings_crud(self):
        """Test settings CRUD operations"""
        print("\n=== Testing Settings CRUD ===")
        
        # Get settings
        response = self.make_request("GET", "/settings")
        if response and response.status_code == 200:
            settings = response.json()
            self.log_result("Get Settings", True, f"Retrieved {len(settings)} settings")
        else:
            self.log_result("Get Settings", False, "Failed to get settings")
            
        # Update settings
        new_settings = {
            "site_name": "Diajem Global Black News",
            "test_setting": "API Test Value"
        }
        
        response = self.make_request("PUT", "/settings", new_settings)
        if response and response.status_code == 200:
            self.log_result("Update Settings", True, "Settings updated successfully")
            return True
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Update Settings", False, f"Failed to update settings: {error_msg}")
            return False
            
    def test_sheet_exports(self):
        """Test sheet exports (mocked)"""
        print("\n=== Testing Sheet Exports ===")
        
        # List exports
        response = self.make_request("GET", "/sheet-exports")
        if response and response.status_code == 200:
            exports = response.json()
            self.log_result("List Sheet Exports", True, f"Retrieved {len(exports)} exports")
        else:
            self.log_result("List Sheet Exports", False, "Failed to list sheet exports")
            
        # Create export (mocked)
        story_id = self.test_data.get("test_story", {}).get("id", "")
        export_data = {
            "story_id": story_id
        }
        
        response = self.make_request("POST", "/sheet-exports", export_data)
        if response and response.status_code == 201:
            export = response.json()
            if export.get("status") == "mocked":
                self.log_result("Create Sheet Export (MOCKED)", True, "Export created successfully (mocked)")
                return True
            else:
                self.log_result("Create Sheet Export", False, "Export not properly mocked")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Create Sheet Export", False, f"Failed to create export: {error_msg}")
            return False
            
    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n=== Cleaning Up Test Data ===")
        
        # Delete test video task
        if "test_video_task" in self.test_data:
            task_id = self.test_data["test_video_task"]["id"]
            response = self.make_request("DELETE", f"/video-tasks/{task_id}")
            if response and response.status_code == 200:
                self.log_result("Delete Test Video Task", True, "Test video task deleted")
            else:
                self.log_result("Delete Test Video Task", False, "Failed to delete test video task")
                
        # Delete test article
        if "test_article" in self.test_data:
            article_id = self.test_data["test_article"]["id"]
            response = self.make_request("DELETE", f"/articles/{article_id}")
            if response and response.status_code == 200:
                self.log_result("Delete Test Article", True, "Test article deleted")
            else:
                self.log_result("Delete Test Article", False, "Failed to delete test article")
                
        # Delete test story
        if "test_story" in self.test_data:
            story_id = self.test_data["test_story"]["id"]
            response = self.make_request("DELETE", f"/stories/{story_id}")
            if response and response.status_code == 200:
                self.log_result("Delete Test Story", True, "Test story deleted")
            else:
                self.log_result("Delete Test Story", False, "Failed to delete test story")
                
        # Delete test category
        if "test_category" in self.test_data:
            category_id = self.test_data["test_category"]["id"]
            response = self.make_request("DELETE", f"/categories/{category_id}")
            if response and response.status_code == 200:
                self.log_result("Delete Test Category", True, "Test category deleted")
            else:
                self.log_result("Delete Test Category", False, "Failed to delete test category")
                
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting Diajem Global Black News API Tests")
        print(f"📍 Testing against: {API_BASE}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Core setup tests
        if not self.test_seed_database():
            print("❌ Database seeding failed - stopping tests")
            return False
            
        if not self.test_auth_login():
            print("❌ Authentication failed - stopping tests")
            return False
            
        # Authentication tests
        self.test_auth_me()
        
        # CRUD tests
        self.test_categories_crud()
        self.test_stories_crud()
        self.test_articles_crud()
        self.test_video_tasks_crud()
        
        # Public endpoints
        self.test_public_endpoints()
        
        # Other endpoints
        self.test_stats_endpoint()
        self.test_settings_crud()
        self.test_sheet_exports()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        self.print_summary()
        return True
        
    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🏁 TEST SUMMARY")
        print(f"{'='*60}")
        
        passed = sum(1 for r in self.results if r["success"])
        failed = len(self.results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {len(self.results)}")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
                    
        print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")

if __name__ == "__main__":
    tester = DiajemAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)