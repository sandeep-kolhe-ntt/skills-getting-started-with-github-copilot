import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_for_activity_success():
    # Use a unique email to avoid duplicate error
    response = client.post("/activities/Chess Club/signup?email=testuser1@mergington.edu")
    assert response.status_code == 200
    assert "Signed up" in response.json()["message"]

def test_signup_for_activity_duplicate():
    # Try to sign up the same user again
    client.post("/activities/Programming Class/signup?email=testuser2@mergington.edu")
    response = client.post("/activities/Programming Class/signup?email=testuser2@mergington.edu")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=someone@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_signup_for_activity_full():
    # Fill up an activity
    activity = "Math Olympiad"
    for i in range(25):
        client.post(f"/activities/{activity}/signup?email=full{i}@mergington.edu")
    response = client.post(f"/activities/{activity}/signup?email=overflow@mergington.edu")
    assert response.status_code == 400
    assert "Activity is full" in response.json()["detail"]
