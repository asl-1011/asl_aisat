import requests
import json
from datetime import datetime

def fetch_player_data():
    url = "https://fantasy.indiansuperleague.com/fantasy/sl_roster/get_playercard_sl_master_data"
    payload = {
        "league_id": "125",
        "sports_id": "5",
        "player_team_id": "3275",
        "player_uid": "8dzeq723volchfye1smryolt6"

    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raises HTTPError if response is not 200

        data = response.json()

        if data.get("response_code") == 200 and "data" in data:
            return convert_player_data(data["data"])
        else:
            print("API Error:", data.get("global_error", "Unknown error"))
            return None

    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return None

def convert_player_data(data):
    converted_data = {
        "player_id": int(data["player_id"]),
        "player_uid": data["player_uid"],
        "player_team_id": int(data["player_team_id"]),
        "full_name": data["full_name"],
        "position": data["position"],
        "team_name": data["team_name"],
        "team_abbreviation": data["team_abbreviation"],
        "salary": float(data["salary"]),
        "total_points": int(data["total_points"]),
        "player_status": int(data["player_status"]),
        "flag": data["flag"],
        "jersey": data["jersey"],
        "player_image": data.get("player_image"),
        "weekly_scores": [
            {
                "week": int(week["week"]),
                "score": int(week["score"]),
                "season_game_uid": week.get("season_game_uid"),
            }
            for week in data["master_data"]
        ],
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }
    return converted_data

# Fetch and print player data
player_data = fetch_player_data()
if player_data:
    print(json.dumps(player_data, indent=2))
