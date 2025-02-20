import requests
import json

# API Details
URL = "https://fantasy.indiansuperleague.com/fantasy/sl_lobby/top_scoring_players"
HEADERS = {
    "Host": "fantasy.indiansuperleague.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
    "Accept": "*/*",
    "Accept-Language": "en",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Referer": "https://fantasy.indiansuperleague.com/statistics",
    "Content-Type": "application/json",
    "Origin": "https://fantasy.indiansuperleague.com",
    "Connection": "keep-alive"
}

PAYLOAD = {"league_id": "125", "sports_id": "5", "limit": "50", "set_weekly_data": "1"}

# Fetch Data
try:
    response = requests.post(URL, headers=HEADERS, json=PAYLOAD)
    response.raise_for_status()  # Raise error for bad responses (4xx, 5xx)
    data = response.json()  # Convert response to JSON
except requests.exceptions.RequestException as e:
    print(f"API request failed: {e}")
    exit()
except json.JSONDecodeError:
    print("Failed to parse JSON response")
    exit()

# Extract Data
player_list = data.get("data", {}).get("player_list", {})
overall_top_scorers = data.get("data", {}).get("overall_top_scorer", [])
monthly_top_scorers = data.get("data", {}).get("month_top_scorer", [])
weekly_top_scorers = data.get("data", {}).get("weekly_top_scorer", [])

# Store consolidated player data
players_data = {}

# Function to fetch player details
def get_player_details(player_uid):
    return player_list.get(player_uid, {
        "full_name": "Unknown",
        "position": "Unknown",
        "team_name": "Unknown",
        "team_abbreviation": "Unknown",
        "jersey": "",
        "flag": "",
        "player_image": ""
    })

# Function to update player scores
def update_player_score(player_uid, category, score):
    if player_uid not in players_data:
        players_data[player_uid] = get_player_details(player_uid)
        players_data[player_uid]["scores"] = {}

    players_data[player_uid]["scores"][category] = score

# Process Scores
for category, scorer_list in [("overall", overall_top_scorers), 
                              ("monthly", monthly_top_scorers), 
                              ("weekly", weekly_top_scorers)]:
    for player in scorer_list:
        update_player_score(player["player_uid"], category, player["top_score"])

# Save Processed Data
output_file = "players_data.json"
with open(output_file, "w", encoding="utf-8") as file:
    json.dump(players_data, file, indent=4)

print(f"Processed data saved to {output_file}")
