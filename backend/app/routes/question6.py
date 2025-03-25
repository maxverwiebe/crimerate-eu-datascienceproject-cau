from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

from .chart_response import ChartResponse

# Preprocessing-Funktion für crim_just_sex
def preprocess_q6_chart1(df):
    df = df.dropna()
    df['geo'] = df['geo'].replace('Northern Ireland (UK) (NUTS 2021)', 'Northern Ireland')
    df = df[['geo', 'time', 'sex', 'leg_stat', 'unit', 'value']]
    return df

# Blueprint für Frage 6
question6_bp = Blueprint('question6', __name__)

# Route für Chart 1
@question6_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()

    # Hole geo und time Parameter aus der Anfrage
    geo_params = request.args.getlist('geo')
    time_params = request.args.getlist('time')

    filters = {}
    if geo_params:
        filters['geo'] = geo_params
    if time_params:
        filters['time'] = time_params
    if not filters:
        filters = None
    
    # Lade crim_just_sex Datensatz
    df = loader.load_dataset('crim_just_sex', filters=filters)
    df = preprocess_q6_chart1(df)

    # Aggregation nach geo, time, sex, leg_stat, unit
    aggregated = {}
    for record in df.to_dict(orient="records"):
        geo = record["geo"]
        time = record["time"]
        sex = record["sex"]
        leg_stat = record["leg_stat"]  # z.B. Suspected, Prosecuted, Convicted
        unit = record["unit"]          # Number oder Per hundred thousand inhabitants
        value = record["value"]

        # Struktur aufbauen
        if geo not in aggregated:
            aggregated[geo] = {}
        if time not in aggregated[geo]:
            aggregated[geo][time] = {}
        if leg_stat not in aggregated[geo][time]:
            aggregated[geo][time][leg_stat] = {
                "Males": {"Number": 0, "Per100k": 0},
                "Females": {"Number": 0, "Per100k": 0},
                "Total": {"Number": 0, "Per100k": 0}
            }
        
        # Werte zuordnen
        unit_key = "Number" if unit == "Number" else "Per100k"
        aggregated[geo][time][leg_stat][sex][unit_key] += value

    # Lade Dimensionen für Filter
    dims = loader.get_dimensions('crim_just_sex')
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []
    filter_time = dims['time']['codes'] if 'time' in dims else []

    interactive_data = {
        "geo": {
            "values": filter_geo,
            "labels": dims['geo']['labels'] if 'geo' in dims else [],
            "multiple": True,
            "default": None
        },
        "time": {
            "values": filter_time,
            "labels": dims['time']['labels'] if 'time' in dims else [],
            "multiple": True,
            "default": None
        }
    }

    # Antwort erstellen
    resp = ChartResponse(chart_data=aggregated, interactive_data=interactive_data)
    return resp.to_json()

@question6_bp.route('/chart2', methods=['GET'])
def chart2():
    loader = EurostatDataLoader()
    resp = ChartResponse()

    dims = loader.get_dimensions('crim_just_sex')
    interactive_data = {
        "geo": {
            "labels": dims.get('geo', {}).get('labels', []),
            "values": dims.get('geo', {}).get('codes', []),
            "multiple": False,
            "default": None
        },
        "time": {
            "values": dims.get('time', {}).get('codes', []),
            "multiple": True,
            "default": None
        },
        "leg_stat": {
            "values": dims.get('leg_stat', {}).get('codes', []),
            "labels": dims.get('leg_stat', {}).get('labels', []),
            "multiple": False,
            "default": "PER_SUSP"
        }
    }
    resp.set_interactive_data(interactive_data)

    try:
        geo_param = request.args.get('geo')
        time_params = request.args.getlist('time')
        leg_stat_params = request.args.getlist('leg_stat') or ['PER_SUSP']

        filters = {}
        if geo_param:
            filters['geo'] = [geo_param]
        if time_params:
            filters['time'] = time_params
        if leg_stat_params:
            filters['leg_stat'] = leg_stat_params
        if not filters:
            filters = None

        df = loader.load_dataset('crim_just_sex', filters=filters)

        pivot = (
            df.dropna(subset=['value'])
              .pivot_table(index='time', columns='sex', values='value', aggfunc='sum', fill_value=0)
              .sort_index()
        )

        chart_data = {
            "years": pivot.index.tolist(),
            "male": pivot.get('Males', pd.Series(dtype=float)).tolist(),
            "female": pivot.get('Females', pd.Series(dtype=float)).tolist()
        }
        resp.set_chart_data(chart_data)

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")
        resp.set_chart_data(None)

    return resp.to_json()
