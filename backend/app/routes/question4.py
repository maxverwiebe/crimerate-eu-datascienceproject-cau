from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

question4_bp = Blueprint('question4', __name__)

# just a helper class to format the response
class ChartResponse:
    def __init__(self, chart_data, interactive_data=None):
        self.chart_data = chart_data
        self.interactive_data = interactive_data

    def to_json(self):
        return jsonify({
            "chart_data": self.chart_data,
            "interactive_data": self.interactive_data
        })

@question4_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader(cache_expiry=1800)

    time_param = request.args.get('time', default="2020")  # GET parameter
    iccs_param = request.args.get('iccs', default="Intentional homicide")  # GET parameter
    year = str(time_param)

    df1 = loader.load_dataset('tps00001')  # (Bevölkerungszahl - 2013 - 2024)
    df2 = loader.load_dataset('tec00115')  # (BIP-Wachstum - 2013 - 2024)
    df3 = loader.load_dataset('crim_off_cat')  # (Kriminalitätsrate - 2008 - 2022)

    # Daten der Bevölkerung filtern und Duplikate entfernen
    pop = df1[df1['time'] == year][['geo', 'value', 'geo_code']].drop_duplicates()
    pop.columns = ['geo', 'population', 'geo_code']

    # Daten des BIP-Wachstums eindeutig filtern, NaNs entfernen
    gdp = df2[df2['time'] == year][['geo', 'value']].drop_duplicates(subset=['geo']).dropna()
    gdp.columns = ['geo', 'gdp_growth']

    # Kriminalitätsdaten filtern und Duplikate entfernen
    crime = df3[(df3['time'] == year) & (df3['iccs'] == iccs_param)][['geo', 'value']].drop_duplicates(subset=['geo'])
    crime.columns = ['geo', 'crime_rate']

    # Merge der DataFrames zu einem einzigen DataFrame
    merged_df = pop.merge(gdp, on='geo').merge(crime, on='geo')

    # Kriminalitätsrate pro 100.000 Einwohner berechnen
    merged_df['crime_rate_per_100k'] = (merged_df['crime_rate'] / merged_df['population']) * 100000

    # Filter rows with NaN values
    filtered_df = merged_df.dropna(subset=['crime_rate_per_100k', 'gdp_growth'])

    resp = ChartResponse(chart_data=filtered_df.to_dict(orient='records'), interactive_data={
        "time": {
            "values": df1['time'].unique().tolist(),
            "multiple": False,
            "default": time_param
        },
        "iccs": {
            "values": df3['iccs'].unique().tolist(),
            "multiple": False,
            "default": iccs_param
        }
    })

    return resp.to_json()

@question4_bp.route('/chart2', methods=['GET'])
def chart2():
    data = {"chart": "Chart 2", "values": [4, 3, 2, 1]}
    return jsonify(data)

@question4_bp.route('/chart3', methods=['GET'])
def chart3():
    data = {"chart": "Chart 3", "values": [10, 20, 30, 40]}
    return jsonify(data)