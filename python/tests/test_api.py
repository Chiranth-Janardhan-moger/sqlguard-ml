from fastapi.testclient import TestClient
from sqlguard_ml.api import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_detect():
    response = client.post("/api/v1/detect", json={"payload": "' OR '1'='1"})
    assert response.status_code == 200
    data = response.json()
    assert "label" in data
    assert "confidence" in data
    assert "probabilities" in data
