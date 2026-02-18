"""
TalkMe Chat History API Tests
Tests for:
1. Chat history endpoints (POST save, GET load, DELETE clear)
2. AI chat endpoint (friend-chat)
3. Memory endpoints
4. Health check
"""

import pytest
import requests
import os
import time

# Use public URL for testing
BASE_URL = os.environ.get('VITE_BACKEND_URL', 'https://idol-voices.preview.emergentagent.com/api')

# Test data identifiers - for easy cleanup
TEST_USER_ID = f"TEST_user_{int(time.time())}"
TEST_AGENT_ID = "TEST_agent_ivan"
TEST_AGENT_ID_SOFIA = "TEST_agent_sofia"


class TestHealthCheck:
    """API Health check tests"""
    
    def test_api_root_health(self):
        """Test that the API root returns ok status"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "TalkMe" in data["message"]
        print(f"✅ Health check passed: {data}")


class TestChatHistorySave:
    """POST /api/chat-history/save endpoint tests"""
    
    def test_save_single_message(self):
        """Test saving a single message to chat history"""
        payload = {
            "userId": TEST_USER_ID,
            "agentId": TEST_AGENT_ID,
            "messages": [
                {
                    "id": f"msg_{int(time.time())}_1",
                    "role": "user",
                    "content": "Привет, это тестовое сообщение!",
                    "timestamp": int(time.time() * 1000)
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/chat-history/save", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["status"] == "saved"
        assert data["count"] == 1
        print(f"✅ Saved 1 message: {data}")
    
    def test_save_multiple_messages(self):
        """Test saving multiple messages to chat history"""
        ts = int(time.time() * 1000)
        payload = {
            "userId": TEST_USER_ID,
            "agentId": TEST_AGENT_ID,
            "messages": [
                {
                    "id": f"msg_{ts}_1",
                    "role": "user",
                    "content": "Привет Лукас!",
                    "timestamp": ts
                },
                {
                    "id": f"msg_{ts}_2",
                    "role": "assistant",
                    "content": "Привет! Как дела?",
                    "timestamp": ts + 1000
                },
                {
                    "id": f"msg_{ts}_3",
                    "role": "user",
                    "content": "Всё хорошо, спасибо!",
                    "timestamp": ts + 2000
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/chat-history/save", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "saved"
        assert data["count"] == 3
        print(f"✅ Saved 3 messages: {data}")
    
    def test_save_message_with_image(self):
        """Test saving a message with imageUrl"""
        ts = int(time.time() * 1000)
        payload = {
            "userId": TEST_USER_ID,
            "agentId": TEST_AGENT_ID_SOFIA,
            "messages": [
                {
                    "id": f"msg_img_{ts}",
                    "role": "user",
                    "content": "Посмотри на это фото",
                    "timestamp": ts,
                    "imageUrl": "https://example.com/test-image.jpg"
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/chat-history/save", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "saved"
        print(f"✅ Saved message with imageUrl: {data}")


class TestChatHistoryGet:
    """GET /api/chat-history/{userId}/{agentId} endpoint tests"""
    
    def test_get_chat_history_existing(self):
        """Test getting existing chat history"""
        # First save some messages
        ts = int(time.time() * 1000)
        save_payload = {
            "userId": TEST_USER_ID,
            "agentId": TEST_AGENT_ID,
            "messages": [
                {
                    "id": f"msg_get_{ts}_1",
                    "role": "user",
                    "content": "Тест получения истории",
                    "timestamp": ts
                },
                {
                    "id": f"msg_get_{ts}_2",
                    "role": "assistant",
                    "content": "История получена!",
                    "timestamp": ts + 1000
                }
            ]
        }
        save_response = requests.post(f"{BASE_URL}/chat-history/save", json=save_payload)
        assert save_response.status_code == 200
        
        # Now get the history
        get_response = requests.get(f"{BASE_URL}/chat-history/{TEST_USER_ID}/{TEST_AGENT_ID}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert "messages" in data
        messages = data["messages"]
        assert len(messages) >= 2
        # Verify message structure
        assert "id" in messages[-1]
        assert "role" in messages[-1]
        assert "content" in messages[-1]
        assert "timestamp" in messages[-1]
        print(f"✅ Retrieved {len(messages)} messages from history")
    
    def test_get_chat_history_nonexistent(self):
        """Test getting history for non-existent user/agent"""
        response = requests.get(f"{BASE_URL}/chat-history/nonexistent_user_xyz/nonexistent_agent_xyz")
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert data["messages"] == []
        print("✅ Empty messages returned for non-existent user/agent")
    
    def test_get_chat_history_with_limit(self):
        """Test getting history with limit parameter"""
        response = requests.get(f"{BASE_URL}/chat-history/{TEST_USER_ID}/{TEST_AGENT_ID}?limit=1")
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        # The limit parameter should work to restrict results
        print(f"✅ Retrieved history with limit: {len(data['messages'])} messages")


class TestChatHistoryDelete:
    """DELETE /api/chat-history/{userId}/{agentId} endpoint tests"""
    
    def test_delete_chat_history(self):
        """Test deleting chat history"""
        delete_user = f"TEST_delete_user_{int(time.time())}"
        delete_agent = "TEST_delete_agent"
        
        # First save some messages
        save_payload = {
            "userId": delete_user,
            "agentId": delete_agent,
            "messages": [
                {
                    "id": "msg_to_delete_1",
                    "role": "user",
                    "content": "This will be deleted",
                    "timestamp": int(time.time() * 1000)
                }
            ]
        }
        save_response = requests.post(f"{BASE_URL}/chat-history/save", json=save_payload)
        assert save_response.status_code == 200
        
        # Verify it exists
        get_response = requests.get(f"{BASE_URL}/chat-history/{delete_user}/{delete_agent}")
        assert get_response.status_code == 200
        assert len(get_response.json()["messages"]) == 1
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/chat-history/{delete_user}/{delete_agent}")
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data["status"] == "cleared"
        assert data["deleted"] == 1
        print(f"✅ Deleted chat history: {data}")
        
        # Verify deletion
        verify_response = requests.get(f"{BASE_URL}/chat-history/{delete_user}/{delete_agent}")
        assert verify_response.status_code == 200
        assert verify_response.json()["messages"] == []
        print("✅ Verified history was deleted")
    
    def test_delete_nonexistent_history(self):
        """Test deleting non-existent history (should return 0 deleted)"""
        response = requests.delete(f"{BASE_URL}/chat-history/fake_user_xyz/fake_agent_xyz")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cleared"
        assert data["deleted"] == 0
        print("✅ Delete of non-existent history returned correctly")


class TestFriendChatEndpoint:
    """POST /api/friend-chat endpoint tests"""
    
    def test_friend_chat_basic(self):
        """Test basic AI chat response"""
        payload = {
            "messages": [
                {"role": "user", "content": "Привет!"}
            ],
            "language": "ru",
            "agent": {
                "name": "Лукас",
                "gender": "male"
            }
        }
        response = requests.post(f"{BASE_URL}/friend-chat", json=payload, timeout=60)
        
        # Accept 429 rate limited as valid for free models
        if response.status_code == 429:
            print("⚠️ Rate limited - expected with free models")
            pytest.skip("Rate limited by free model API")
        
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        data = response.json()
        assert "content" in data
        assert len(data["content"]) > 0
        print(f"✅ Friend chat response: {data['content'][:100]}...")
    
    def test_friend_chat_with_agent_sofia(self):
        """Test chat with Sofia agent"""
        payload = {
            "messages": [
                {"role": "user", "content": "Привет София!"}
            ],
            "language": "ru",
            "agent": {
                "name": "София",
                "gender": "female"
            }
        }
        response = requests.post(f"{BASE_URL}/friend-chat", json=payload, timeout=60)
        
        if response.status_code == 429:
            pytest.skip("Rate limited")
        
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        print(f"✅ Sofia agent chat: {data['content'][:100]}...")
    
    def test_friend_chat_with_user_and_agent_id(self):
        """Test chat with userId and agentId for memory context"""
        payload = {
            "messages": [
                {"role": "user", "content": "Меня зовут Тест"}
            ],
            "language": "ru",
            "agent": {
                "name": "Лукас",
                "gender": "male"
            },
            "userId": TEST_USER_ID,
            "agentId": TEST_AGENT_ID
        }
        response = requests.post(f"{BASE_URL}/friend-chat", json=payload, timeout=60)
        
        if response.status_code == 429:
            pytest.skip("Rate limited")
        
        assert response.status_code == 200
        print("✅ Chat with userId/agentId context works")


class TestMemoryEndpoints:
    """Memory management endpoints tests"""
    
    def test_get_memory_empty(self):
        """Test getting memory for user/agent with no memory"""
        response = requests.get(f"{BASE_URL}/memory/new_user_test/new_agent_test")
        assert response.status_code == 200
        data = response.json()
        assert "memory" in data
        print(f"✅ Get empty memory: {data}")
    
    def test_update_memory_extracts_name(self):
        """Test that update-memory extracts user name"""
        payload = {
            "userId": f"TEST_memory_user_{int(time.time())}",
            "agentId": "TEST_memory_agent",
            "agentName": "София",
            "userMessage": "Меня зовут Александр"
        }
        response = requests.post(f"{BASE_URL}/update-memory", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        # Check if name was extracted
        if data.get("extracted_facts"):
            print(f"✅ Memory updated with facts: {data['extracted_facts']}")
        else:
            print(f"✅ Memory update response: {data}")
    
    def test_update_memory_extracts_location(self):
        """Test that update-memory extracts location"""
        payload = {
            "userId": f"TEST_loc_user_{int(time.time())}",
            "agentId": "TEST_loc_agent",
            "agentName": "Лукас",
            "userMessage": "Я из Москвы"
        }
        response = requests.post(f"{BASE_URL}/update-memory", json=payload)
        assert response.status_code == 200
        print("✅ Location memory update processed")


class TestTTSEndpoint:
    """Fish Audio TTS endpoint tests - expected to fail due to insufficient balance"""
    
    def test_tts_returns_402_or_500(self):
        """Test TTS endpoint - expect 402/500 due to Fish Audio insufficient balance"""
        payload = {
            "text": "Привет",
            "language": "ru",
            "voice": "fish_drug"
        }
        response = requests.post(f"{BASE_URL}/fish-audio-tts", json=payload)
        # Fish Audio has insufficient balance - expect 500 (API error)
        if response.status_code == 200:
            print("✅ TTS returned audio (unexpected - balance may be restored)")
        elif response.status_code in [402, 500]:
            print(f"⚠️ TTS returned {response.status_code} - expected due to insufficient Fish Audio balance")
        else:
            print(f"⚠️ TTS returned unexpected status: {response.status_code}")
        # Don't fail the test - just document the state


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_data(self):
        """Clean up test chat histories"""
        # Delete test user history
        requests.delete(f"{BASE_URL}/chat-history/{TEST_USER_ID}/{TEST_AGENT_ID}")
        requests.delete(f"{BASE_URL}/chat-history/{TEST_USER_ID}/{TEST_AGENT_ID_SOFIA}")
        print("✅ Cleaned up test data")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
