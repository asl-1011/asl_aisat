import requests

url = "https://fantasy.indiansuperleague.com/fantasy/sl_roster/get_playercard_sl_master_data"
payload = {
    "league_id": "125",
    "sports_id": "5",
    "player_team_id": "3282",
    "player_uid": "cmipqs8kvp9fztc1ekgzlwogl"
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    print("Response:", response.json())
else:
    print("Error:", response.status_code, response.text)
