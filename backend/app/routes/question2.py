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

    filters = {}
    if time_params:
        filters['time'] = time_params
    if not filters:
        filters = None
    
    df = loader.load_dataset('crim_gen_reg', filters=filters)
    
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


# TODO FIX EMOTY PIVOT VALUES

@question2_bp.route('/chart2', methods=['GET'])
def chart2():
    loader = EurostatDataLoader()

    time_params = request.args.getlist('time')
    geo_params = request.args.get('geo')  # Erwartet z. B. "BE" für Belgium

    filters = {}
    if time_params:
        filters['time'] = time_params
    if not filters:
        filters = None
    
    df = loader.load_dataset('crim_gen_reg', filters=filters)

    # Filter: Nur Zeilen, bei denen geo_code mit dem gewünschten Code beginnt
    df_country = df[df["geo_code"].str.startswith(geo_params)]
    
    # Gruppiere die Daten nach Zeit und geo (z. B. Gesamtland vs. Region)
    pivot_df = df_country.groupby(["time", "geo"])["value"].sum().reset_index()
    
    # Pivotieren: Zeit als Index, Spalten = geo, Werte = sum(value)
    pivot_table = pivot_df.pivot(index="time", columns="geo", values="value").fillna(0)
    pivot_table = pivot_table.sort_index()  # Sortiere nach Jahr

    # Bereite die Chart-Daten vor:
    times = pivot_table.index.tolist()
    series = []
    for geo in pivot_table.columns:
        series.append({
            "name": geo,
            "data": pivot_table[geo].tolist()
        })

    chart_data = {
        "times": times,
        "series": series
    }
    
    # Interaktive Daten: Dimensionen aus dem Loader
    dims = loader.get_dimensions('crim_gen_reg')
    filter_time = dims['time']['codes']
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []
    interactive_data = {
        "time": filter_time,
        "geo": filter_geo
    }

    resp = ChartResponse(chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()