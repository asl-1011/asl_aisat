import requests
import json

url = "https://fantasy.indiansuperleague.com/fantasy/sl_roster/get_playercard_sl"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
    "Accept": "*/*",
    "Accept-Language": "en",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Referer": "https://fantasy.indiansuperleague.com/statistics",
    "Content-Type": "application/json",
    "Origin": "https://fantasy.indiansuperleague.com",
    "Connection": "keep-alive",
   "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Priority": "u=4",
    "TE": "trailers"
}

payload = {
    "league_id": "125",
    "sports_id": "5",
    "player_team_id": "3913",
    "player_uid": "57h3oir0n9l0qgmkhkr98so2d",
    "week": 22
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(response.status_code)
print(response.json())