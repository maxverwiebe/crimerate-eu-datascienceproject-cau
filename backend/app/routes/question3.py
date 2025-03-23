from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

question3_bp = Blueprint('question3', __name__)

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

@question3_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()

    time_params = request.args.getlist('time')
    geo_params = request.args.getlist('geo')
    unit_param = request.args.get('unit', "Number")

    filters = {}
    if time_params:
        filters['time'] = [int(t) for t in time_params]
    if geo_params:
        filters['geo'] = geo_params
    if not filters:
        filters = None

    df = loader.load_dataset('crim_just_bri', filters=filters)
    df = df[(df["sex"] == "Total") & (df["unit"] == unit_param)]
    df = df.dropna(subset=["value"])

    chart_data = df[["time", "geo", "geo_code", "value"]].to_dict(orient="records")

    dims = loader.get_dimensions('crim_just_bri')
    # Hier erstellen wir für jede Dimension ein Dictionary mit den gewünschten Keys
    interactive_data = {
        "time": {
            "values": dims['time']['codes'],
            "multiple": True,  # Mehrfachauswahl möglich
            "default": None
        },
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "labels": dims['geo']['labels'] if 'geo' in dims else [],
            "multiple": True,
            "default": None
        },
        "unit": {
            "values": ["Number", "Per hundred thousand inhabitants"],
            "multiple": False,  # Es wird nur ein Wert ausgewählt
            "default": "Number"
        }
    }

    return jsonify({
        "chart_data": chart_data,
        "interactive_data": interactive_data
    })



@question3_bp.route('/chart2', methods=['GET'])
def chart2():
    loader = EurostatDataLoader()

    time_params = request.args.getlist('time')
    geo_params = request.args.getlist('geo')
    unit_param = request.args.get('unit', "Number")

    filters = {}
    if time_params:
        filters['time'] = [int(t) for t in time_params]
    if geo_params:
        filters['geo'] = geo_params
    if not filters:
        filters = None

    df = loader.load_dataset('crim_just_bri', filters=filters)
    df = df.dropna(subset=["value"])

    chart_data = df[["time", "geo", "geo_code", "value", "sex", "leg_stat"]].to_dict(orient="records")

    dims = loader.get_dimensions('crim_just_bri')
    interactive_data = {
        "time": {
            "values": dims['time']['codes'],
            "multiple": True,
            "default": None
        },
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "labels": dims['geo']['labels'] if 'geo' in dims else [],
            "multiple": True,
            "default": None
        },
        "unit": {
            "values": ["Number", "Per hundred thousand inhabitants"],
            "multiple": False,
            "default": "Number"
        }
    }

    return jsonify({
        "chart_data": chart_data,
        "interactive_data": interactive_data
    })
