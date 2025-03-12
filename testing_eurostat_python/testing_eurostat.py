import requests
import pandas as pd

dataset_code = 'nama_10_gdp'

params = {
    '2022': '2022',
    'format': 'JSON',
}

url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset_code}"

response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()

    df = pd.DataFrame(data['value'].items(), columns=['key', 'value'])
    print(df.head())
else:
    print(f"Fehler beim Abrufen der Daten: {response.status_code}")
