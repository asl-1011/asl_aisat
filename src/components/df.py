import requests
import json

# API URL
url = "https://www.indiansuperleague.com/apiv4/listing?entities=5,1&otherent=&exclent=&pgnum=2&inum=12&pgsize=12"

# Send GET request
response = requests.get(url)

# Check if the response is successful
if response.status_code == 200:
    data = response.json()
    
    # Extract the content items
    items = data.get("content", {}).get("items", [])
    
    # Transform the items
    transformed_items = [
        {
            "_id": item["asset_id"],
            "imageid": item["image_path"] + item["image_file_name"],
            "title": item["asset_title"],
            "description": item["short_desc"]
        }
        for item in items
    ]
    
    # Pretty print the transformed result
    print(json.dumps(transformed_items, indent=2, ensure_ascii=False))
else:
    print(f"Request failed with status code {response.status_code}")
