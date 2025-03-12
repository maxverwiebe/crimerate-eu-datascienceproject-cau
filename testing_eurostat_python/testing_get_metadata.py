import requests

dataset_code = 'nama_10_gdp'

url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset_code}?format=JSON&lang=en"

response = requests.get(url)

if response.status_code == 200:
    metadata = response.json()['dimension']

    for dim_name, dim_content in metadata.items():
        print(f"\nDimension: {dim_name}")
        categories = dim_content['category']['label']
        for key, label in categories.items():
            print(f"  {key}: {label}")
else:
    print(f"Fehler beim Abrufen der Metadaten: {response.status_code}")
