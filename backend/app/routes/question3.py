from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd
from .chart_response import ChartResponse

question3_bp = Blueprint('question3', __name__)
@question3_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_just_bri')
    interactive_data = {
        "time": {"values": dims['time']['codes'], "multiple": True, "default": None},
        "geo": {"values": dims.get('geo', {}).get('codes', []), "labels": dims.get('geo', {}).get('labels', []), "multiple": True, "default": None},
        "unit": {"values": ["Number", "Per hundred thousand inhabitants"], "multiple": False, "default": "Number"}
    }
    resp.set_interactive_data(interactive_data)

    try:
        time_params = [int(t) for t in request.args.getlist('time')]
        geo_params = request.args.getlist('geo')
        unit = request.args.get('unit', "Number")

        filters = {}
        if time_params: filters['time'] = time_params
        if geo_params: filters['geo'] = geo_params
        if not filters: filters = None

        df = loader.load_dataset('crim_just_bri', filters=filters)
        df = df[(df["sex"] == "Total") & (df["unit"] == unit)].dropna(subset=["value"])

        resp.set_chart_data(df[["time", "geo", "geo_code", "value"]].to_dict(orient="records"))

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


@question3_bp.route('/chart2', methods=['GET'])
def chart2():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_just_bri')
    interactive_data = {
        "time": {"values": dims['time']['codes'], "multiple": True, "default": None},
        "geo": {"values": dims.get('geo', {}).get('codes', []), "labels": dims.get('geo', {}).get('labels', []), "multiple": True, "default": None},
        "unit": {"values": ["Number", "Per hundred thousand inhabitants"], "multiple": False, "default": "Number"}
    }
    resp.set_interactive_data(interactive_data)

    try:
        time_params = [int(t) for t in request.args.getlist('time')]
        geo_params = request.args.getlist('geo')

        filters = {}
        if time_params: filters['time'] = time_params
        if geo_params: filters['geo'] = geo_params
        if not filters: filters = None

        df = loader.load_dataset('crim_just_bri', filters=filters).dropna(subset=["value"])
        resp.set_chart_data(df[["time", "geo", "geo_code", "value", "sex", "leg_stat"]].to_dict(orient="records"))

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()
