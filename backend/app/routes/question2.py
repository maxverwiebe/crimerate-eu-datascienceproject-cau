"""
question2.py

This file defines the routes and API endpoints for Question 2.
It might include generated or modified code.
"""

from flask import Blueprint, request

from .es_dataloader import EurostatDataLoader
from .chart_response import ChartResponse
from app import cache
from ..utils.preprocessing_question2 import (
    get_chart1_data,
    get_chart2_data
)


question2_bp = Blueprint('question2', __name__)


# Helper function to extract interactive data
def get_interactive_data(loader, dataset, multiple):
    dims = loader.get_dimensions(dataset)
    return {
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "labels": dims.get('geo', {}).get('labels', []),
            "multiple": multiple,
            "default": "BE"
        },
        "time": {
            "values": dims.get('time', {}).get('codes', []),
            "multiple": True,
            "default": None
        }
    }

# Helper function to filter dataset based on parameters
def filter_dataset(loader, filters):
    df = loader.load_dataset('crim_gen_reg', filters=filters).dropna()
    return df


"""-----Endpoints for Question 2-----"""


# Chart 1 endpoint
@question2_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    interactive_data = get_interactive_data(loader, 'crim_gen_reg',False)
    resp.set_interactive_data(interactive_data)

    try:
        time_params = request.args.getlist('time')
        geo = request.args.get('geo')

        filters = {}
        if time_params:
            filters['time'] = time_params
        if not filters:
            filters = None

        df = filter_dataset(loader, filters)

        chart_data = get_chart1_data(df, geo)
        resp.set_chart_data(chart_data)

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


# Chart 2 endpoint
@question2_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    interactive_data = get_interactive_data(loader, 'crim_gen_reg', True)
    resp.set_interactive_data(interactive_data)

    try:
        time_params = request.args.getlist('time')
        geo = request.args.get('geo')

        filters = {}
        if time_params:
            filters['time'] = time_params
        if not filters:
            filters = None

        df = filter_dataset(loader, filters)

        chart_data = get_chart2_data(df, geo)
        resp.set_chart_data(chart_data)

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()
