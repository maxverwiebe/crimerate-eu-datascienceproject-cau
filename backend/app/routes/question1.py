from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
from .chart_response import ChartResponse
import pandas as pd

question1_bp = Blueprint('question1', __name__)

@question1_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse()

    dims = loader.get_dimensions('crim_off_cat')
    interactive_data = {
        "time": {
            "values": dims.get('time', {}).get('codes', []),
            "multiple": True,
            "default": None
        },
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "multiple": True,
            "default": None
        }
    }
    resp.set_interactive_data(interactive_data)

    try:
        time_params = request.args.getlist('time')
        geo_params = request.args.getlist('geo')
        filters = {}
        if time_params:
            filters['time'] = time_params
        if geo_params:
            filters['geo'] = geo_params
        if not filters:
            filters = None

        df = loader.load_dataset('crim_off_cat', filters=filters)
        merge_categories = ["Sexual exploitation", "Sexual violence", "Sexual assault"]
        df['iccs_merged'] = df['iccs'].apply(lambda x: "Sexual crimes" if x in merge_categories else x)

        pivot = df.groupby(['geo', 'iccs_merged'])['value'].sum().unstack(fill_value=0)
        most_frequent_crime = df.groupby('iccs_merged')['value'].sum().idxmax()

        chart_data = {
            "pivot_data": pivot.to_dict(),
            "most_frequent_crime": most_frequent_crime
        }
        resp.set_chart_data(chart_data)

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


@question1_bp.route('/chart3', methods=['GET'])
def chart3():
    loader = EurostatDataLoader()
    resp = ChartResponse()

    dims = loader.get_dimensions('crim_off_cat')
    interactive_data = {
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "multiple": True,
            "default": None
        },
        "time": {
            "values": dims.get('time', {}).get('codes', []),
            "multiple": True,
            "default": None
        }
    }
    resp.set_interactive_data(interactive_data)

    try:
        time_params = request.args.getlist('time')
        geo_params = request.args.getlist('geo')

        filters = {}
        if geo_params:
            filters['geo'] = geo_params
        if time_params:
            filters['time'] = time_params
        if not filters:
            filters = None

        df = loader.load_dataset('crim_off_cat', filters=filters)

        merge_categories = ["Sexual exploitation", "Sexual violence", "Sexual assault"]
        df['iccs_merged'] = df['iccs'].apply(lambda x: "Sexual crimes" if x in merge_categories else x)

        crime_by_category = df.groupby('iccs_merged')['value'].sum().fillna(0)

        chart_data = {
            "categories": crime_by_category.index.tolist(),
            "values": crime_by_category.tolist()
        }
        resp.set_chart_data(chart_data)

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()
