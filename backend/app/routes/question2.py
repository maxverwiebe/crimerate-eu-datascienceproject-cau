from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

question2_bp = Blueprint('question2', __name__)

# Helper-Klasse zum Formatieren der Response
class ChartResponse:
    def __init__(self, chart_data, interactive_data=None):
        self.chart_data = chart_data
        self.interactive_data = interactive_data

    def to_json(self):
        return jsonify({
            "chart_data": self.chart_data,
            "interactive_data": self.interactive_data
        })

@question2_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()

    time_params = request.args.getlist('time')
    geo_params = request.args.get('geo')
    
    df = loader.load_dataset('crim_gen_reg')
    
    # Filter: Only rows where geo_code starts with the selected country
    df_country = df[df["geo_code"].str.startswith(geo_params)]
    
    # Aggregation: Total crime values per city
    # Also get the first geo_code for each city
    crime_by_city = df_country.groupby("geo").agg({
        "value": "sum",
        "geo_code": "first"
    }).fillna(0)
    
    # Get top 20 cities with highest aggregated values
    top_20_cities = crime_by_city.sort_values("value", ascending=False).head(20)
    
    # Prepare chart data for frontend
    chart_data = {
        "cities": top_20_cities.index.tolist(),
        "values": top_20_cities["value"].tolist(),
        "geo_codes": top_20_cities["geo_code"].tolist()
    }
    
    # Interaktive Daten: Verwende die Dimensionen aus dem Loader
    dims = loader.get_dimensions('crim_gen_reg')
    filter_time = dims['time']['codes']
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []
    
    interactive_data = {
        "time": filter_time,
        "geo": filter_geo
    }

    resp = ChartResponse(chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()
