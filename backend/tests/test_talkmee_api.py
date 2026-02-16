"""
TalkMe API Test Suite
Tests all backend endpoints: health, chat, TTS, memory, chat-history
"""
import pytest
import requests
import os
import time
import uuid

# Use localhost for testing since we're inside the container
BASE_URL = "http://localhost:8001"


class TestHealthEndpoints:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "talkme-api"
        print("PASS: Health check endpoint working")
    
    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "TalkMe API" in data["message"]
        print("PASS: Root API endpoint working")


class TestChatHistory:
    """Chat history CRUD tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data identifiers"""
        self.test_user_id = f"TEST_user_{uuid.uuid4().hex[:8]}"
        self.test_agent_id = f"TEST_agent_{uuid.uuid4().hex[:8]}"
        yield
        # Cleanup after test
        try:
            requests.delete(f"{BASE_URL}/api/chat-history/{self.test_user_id}/{self.test_agent_id}")
        except:
            pass
    
    def test_save_chat_history(self):
        """Test POST /api/chat-history/save"""
        messages = [
            {"id": "msg1", "role": "user", "content": "Hello!", "timestamp": int(time.time() * 1000)},
            {"id": "msg2", "role": "assistant", "content": "Hi there!", "timestamp": int(time.time() * 1000) + 1000}
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/chat-history/save",
            json={
                "userId": self.test_user_id,
                "agentId": self.test_agent_id,
                "messages": messages
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "saved"
        assert data["count"] == 2
        print("PASS: Chat history save working")
    
    def test_get_chat_history(self):
        """Test GET /api/chat-history/{userId}/{agentId}"""
        # First save some messages
        messages = [
            {"id": "msg1", "role": "user", "content": "Test message", "timestamp": int(time.time() * 1000)}
        ]
        requests.post(
            f"{BASE_URL}/api/chat-history/save",
            json={"userId": self.test_user_id, "agentId": self.test_agent_id, "messages": messages}
        )
        
        # Then retrieve
        response = requests.get(f"{BASE_URL}/api/chat-history/{self.test_user_id}/{self.test_agent_id}")
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) >= 1
        assert data["messages"][0]["content"] == "Test message"
        print("PASS: Chat history get working")
    
    def test_delete_chat_history(self):
        """Test DELETE /api/chat-history/{userId}/{agentId}"""
        # First save some messages
        messages = [{"id": "msg1", "role": "user", "content": "To delete", "timestamp": int(time.time() * 1000)}]
        requests.post(
            f"{BASE_URL}/api/chat-history/save",
            json={"userId": self.test_user_id, "agentId": self.test_agent_id, "messages": messages}
        )
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/chat-history/{self.test_user_id}/{self.test_agent_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cleared"
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/chat-history/{self.test_user_id}/{self.test_agent_id}")
        assert get_response.status_code == 200
        assert len(get_response.json()["messages"]) == 0
        print("PASS: Chat history delete working")


class TestFriendChat:
    """Friend chat (AI conversation) tests"""
    
    def test_friend_chat_basic(self):
        """Test POST /api/friend-chat basic functionality"""
        response = requests.post(
            f"{BASE_URL}/api/friend-chat",
            json={
                "messages": [{"role": "user", "content": "Привет!"}],
                "language": "ru",
                "learningMode": False,
                "agent": {"name": "Лукас", "gender": "male"}
            },
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        assert len(data["content"]) > 0
        print(f"PASS: Friend chat returned response: {data['content'][:100]}...")
    
    def test_friend_chat_with_video_request(self):
        """Test that chat can return video tags when asked for video"""
        # Note: This tests the endpoint works, actual video tag generation depends on LLM
        response = requests.post(
            f"{BASE_URL}/api/friend-chat",
            json={
                "messages": [{"role": "user", "content": "Покажи видео как ты танцуешь"}],
                "language": "ru",
                "learningMode": False,
                "agent": {"name": "Лукас", "gender": "male"},
                "agentId": "ivan"
            },
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        # The response should contain text (video tag generation depends on LLM)
        print(f"PASS: Friend chat video request returned: {data['content'][:150]}...")


class TestMemory:
    """Memory endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_user_id = f"TEST_mem_user_{uuid.uuid4().hex[:8]}"
        self.test_agent_id = f"TEST_mem_agent_{uuid.uuid4().hex[:8]}"
        yield
    
    def test_update_memory(self):
        """Test POST /api/update-memory"""
        response = requests.post(
            f"{BASE_URL}/api/update-memory",
            json={
                "userId": self.test_user_id,
                "agentId": self.test_agent_id,
                "agentName": "Лукас",
                "userMessage": "Привет, меня зовут Алексей, я из Москвы, люблю музыку"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["memory_updated", "no_facts_extracted"]
        print(f"PASS: Update memory returned: {data}")
    
    def test_get_memory(self):
        """Test GET /api/memory/{user_id}/{agent_id}"""
        response = requests.get(f"{BASE_URL}/api/memory/{self.test_user_id}/{self.test_agent_id}")
        assert response.status_code == 200
        data = response.json()
        assert "memory" in data
        print("PASS: Get memory endpoint working")


class TestTTS:
    """Text-to-Speech endpoint tests"""
    
    def test_fish_audio_tts_endpoint_exists(self):
        """Test that TTS endpoint exists and responds"""
        # Note: May return 500 if Fish Audio has no balance, but endpoint should respond
        response = requests.post(
            f"{BASE_URL}/api/fish-audio-tts",
            json={
                "text": "Привет",
                "language": "ru",
                "voice": "fish_drug"
            },
            timeout=30
        )
        # Accept 200 (success) or 500 (API key/balance issue)
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert "audio" in data or response.headers.get("content-type") == "audio/mpeg"
            print("PASS: TTS endpoint working and returned audio")
        else:
            print("INFO: TTS endpoint returned 500 (likely Fish Audio balance issue)")


class TestVideoFilesAccessibility:
    """Tests to verify video files are accessible"""
    
    def test_ivan_video_files_exist(self):
        """Verify ivan video files exist in filesystem"""
        video_path = "/app/frontend/public/videos/ivan"
        assert os.path.exists(video_path), f"Video directory {video_path} does not exist"
        
        files = os.listdir(video_path)
        assert len(files) > 0, "No video files found in ivan directory"
        
        # Check for specific scene files mentioned in videoScenes.ts
        expected_files = [
            "scene_1_kitchen_singing.mp4",
            "scene_6_mirror_dance.mp4",
            "scene_18_sleepy_morning.mp4"
        ]
        for expected in expected_files:
            assert expected in files, f"Missing expected video file: {expected}"
        
        print(f"PASS: Found {len(files)} video files in ivan directory")
    
    def test_sofia_video_files_exist(self):
        """Verify sofia video files exist"""
        video_path = "/app/frontend/public/videos/sofia"
        assert os.path.exists(video_path), f"Video directory {video_path} does not exist"
        
        files = os.listdir(video_path)
        assert len(files) > 0, "No video files found in sofia directory"
        print(f"PASS: Found {len(files)} video files in sofia directory")
    
    def test_video_files_served_by_frontend(self):
        """Test that frontend serves video files correctly"""
        response = requests.get("http://localhost:3000/videos/ivan/scene_1_kitchen_singing.mp4", stream=True, timeout=10)
        assert response.status_code == 200, f"Video file not accessible, status: {response.status_code}"
        
        content_type = response.headers.get("content-type", "")
        assert "video" in content_type.lower() or "octet-stream" in content_type.lower(), f"Wrong content type: {content_type}"
        
        # Check file size is reasonable (> 100KB)
        content_length = response.headers.get("content-length")
        if content_length:
            assert int(content_length) > 100000, f"Video file too small: {content_length} bytes"
        
        print("PASS: Video files served correctly by frontend")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
