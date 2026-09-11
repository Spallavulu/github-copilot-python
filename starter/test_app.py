import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_home_page(client):
    response = client.get("/")
    assert response.status_code == 200


def test_new_game(client):
    response = client.get("/new")
    assert response.status_code == 200

    data = response.get_json()
    assert "puzzle" in data
    assert len(data["puzzle"]) == 9
    assert all(len(row) == 9 for row in data["puzzle"])


def test_check_solution_after_new_game(client):
    response = client.get("/new")
    assert response.status_code == 200

    puzzle = response.get_json()["puzzle"]

    response = client.post("/check", json={"board": puzzle})

    assert response.status_code == 200
    assert "incorrect" in response.get_json()


def test_invalid_route(client):
    response = client.get("/invalid")
    assert response.status_code == 404
