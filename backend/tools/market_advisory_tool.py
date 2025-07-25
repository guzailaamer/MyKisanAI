"""
Market Advisory Tool
-------------------
This module provides functions to fetch and analyze market price trends for crops.
It integrates with external market APIs and uses Gemini Pro (Google Vertex AI) for summarization and advice.

Main function:
    get_market_trend(crop_name: str, location: str) -> dict
        # Returns market trend summary and selling advice for the given crop and location.
""" 

import requests
import time
import os

# Add constants at top of file
RATE_LIMIT = 1  # seconds between API calls
DAILY_LIMIT = 1000  # maximum calls per day


def get_market_trend(crop_name, location=None, limit=10):
    API_KEY = os.getenv("GOV_MANDI_PRICE_API_KEY")
    base_url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    print(f"Fetching data for crop: {crop_name}, location: {location}")
    
    unique_commodities = [
        'ajwan', 'almond(badam)', 'alsandikai', 'amaranthus', 'amla(nelli kai)', 
        'amphophalus', 'amranthas red', 'anthorium', 'apple', 'arecanut(betelnut/supari)', 
        'arhar (tur/red gram)(whole)', 'arhar dal(tur dal)', 'asalia', 'asgand', 
        'ashgourd', 'ashwagandha', 'astera', 'bajra(pearl millet/cumbu)', 'banana', 
        'banana - green', 'barley (jau)', 'beans', 'beetroot', 'bengal gram dal (chana dal)', 
        'bengal gram(gram)(whole)', 'betal leaves', 'bhindi(ladies finger)', 'bitter gourd', 
        'black gram (urd beans)(whole)', 'black gram dal (urd dal)', 'black pepper', 'bop', 
        'bottle gourd', 'brinjal', 'bunch beans', 'buttery', 'cabbage', 'capsicum', 
        'cardamoms', 'carrot', 'cashewnuts', 'castor seed', 'cauliflower', 'chapparad avare', 
        'chikoos(sapota)', 'chili red', 'chilly capsicum', 'chow chow', 'chrysanthemum(loose)', 
        'cinamon(dalchini)', 'cluster beans', 'cock', 'coconut', 'coconut oil', 'coconut seed', 
        'coffee', 'colacasia', 'copra', 'coriander(leaves)', 'corriander seed', 'cotton', 
        'cowpea (lobia/karamani)', 'cowpea(veg)', 'cucumbar(kheera)', 'cummin seed(jeera)', 
        'custard apple (sharifa)', 'dried mango', 'drumstick', 'dry chillies', 'duster beans', 
        'elephant yam (suran)', 'field pea', 'fig(anjura/anjeer)', 'firewood', 'fish', 
        'foxtail millet(navane)', 'french beans (frasbean)', 'garlic', 'ghee', 'ginger(dry)', 
        'ginger(green)', 'goat', 'gram raw(chholia)', 'grapes', 'green avare (w)', 
        'green chilli', 'green gram (moong)(whole)', 'green gram dal (moong dal)', 
        'green peas', 'ground nut seed', 'groundnut', 'groundnut (split)', 
        'groundnut pods (raw)', 'guar', 'guar seed(cluster beans seed)', 'guava', 'gulli', 
        'gur(jaggery)', 'hen', 'indian beans (seam)', 'isabgul (psyllium)', 'jack fruit', 
        'jamun(narale hannu)', 'jarbara', 'jasmine', 'jowar(sorghum)', 'jute', 
        'kabuli chana(chickpeas-white)', 'kakada', 'karbuja(musk melon)', 'kartali (kantola)', 
        'kinnow', 'knool khol', 'kodo millet(varagu)', 'kulthi(horse gram)', 'kutki', 
        'lak(teora)', 'leafy vegetable', 'lemon', 'lentil (masur)(whole)', 'lilly', 'lime', 
        'linseed', 'litchi', 'little gourd (kundru)', 'long melon(kakri)', 'lotus', 'mahua', 
        'maize', 'mango', 'mango (raw-ripe)', 'mango powder', 'marigold(calcutta)', 
        'marigold(loose)', 'mashrooms', 'masur dal', 'mataki', 'methi seeds', 'methi(leaves)', 
        'mint(pudina)', 'moath dal', 'mousambi(sweet lime)', 'muleti', 'mustard', 
        'mustard oil', 'nigella seeds', 'onion', 'onion green', 'orange', 'orchid', 
        'other green and fresh vegetables', 'paddy(dhan)(basmati)', 'paddy(dhan)(common)', 
        'papaya', 'papaya (raw)', 'peach', 'pear(marasebu)', 'peas cod', 'peas wet', 
        'peas(dry)', 'pegeon pea (arhar fali)', 'pepper garbled', 'pepper ungarbled', 
        'pigs', 'pineapple', 'plum', 'pointed gourd (parval)', 'pomegranate', 'poppy seeds', 
        'potato', 'pumpkin', 'raddish', 'ragi (finger millet)', 'raibel', 'rajgir', 'ram', 
        'rice', 'ridgeguard(tori)', 'rose(local)', 'rose(loose))', 'round gourd', 'rubber', 
        'safflower', 'seemebadnekai', 'seetapal', 'sesamum(sesame,gingelly,til)', 
        'she buffalo', 'snakeguard', 'soanf', 'soyabean', 'spinach', 'sponge gourd', 
        'squash(chappal kadoo)', 'sugar', 'surat beans (papadi)', 'suva (dill seed)', 
        'suvarna gadde', 'sweet potato', 'sweet pumpkin', 'tamarind fruit', 'tapioca', 
        'tender coconut', 'thondekai', 'tinda', 'tobacco', 'tomato', 'tube flower', 
        'tube rose(loose)', 'turmeric', 'turmeric (raw)', 'turnip', 'water melon', 'wheat', 
        'white peas', 'white pumpkin', 'wood', 'yam', 'yam (ratalu)'
    ]

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "filters[commodity]": crop_name
    }

    if location:
        params["filters[state]"] = location

    # Add rate limiting before API call
    time.sleep(RATE_LIMIT) 

    response = requests.get(base_url, params=params)
    print(f"Request URL: {response.url}")
    print(f"Status Code: {response.status_code}")
    print(f"Response Text: {response.text}")

    if response.status_code != 200:
        return {"error": "Failed to fetch market data"}

    data = response.json()
    records = data.get("records", [])

    if not records:
        return {"message": f"No price data found for {crop_name} in {location}"}

    # Example: get modal price from first record (you can aggregate if needed)
    prices = [int(r["modal_price"]) for r in records if r.get("modal_price")]
    avg_price = sum(prices) // len(prices) if prices else None
    market_names = [
        f"{r['market']} ({r['district']})"
        for r in records[:5]
        if r.get("market") and r.get("district")
    ]

    return {
        "average_modal_price": avg_price,
        "records_found": len(prices),
        "markets": market_names,  # optionally include a sample of markets
        "commodity": crop_name,
        "location": location,
    }



