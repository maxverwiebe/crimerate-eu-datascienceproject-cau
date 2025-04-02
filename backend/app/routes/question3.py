from flask import Blueprint, request

from .es_dataloader import EurostatDataLoader
from .chart_response import ChartResponse
from app import cache
from ..utils.preprocessing_question3 import (
    processing_data_for_q3
)

question3_bp = Blueprint('question3', __name__)


# Helper function to prepare interactive data for chart1
def prepare_interactive_data_chart1(dims):
    return {
        "time": {
            "values": dims['time']['codes'],
            "multiple": True,
            "default": None
        },
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "labels": dims.get('geo', {}).get('labels', []),
            "multiple": True,
            "default": None
        },
        "unit": {
            "values": ["Number", "Per hundred thousand inhabitants"],
            "multiple": False,
            "default": "Number"
        },
        "legal_status": {
            "values": dims.get('leg_stat', {}).get('codes', []),
            "labels": dims.get('leg_stat', {}).get('labels', []),
            "multiple": False,
            "default": "PER_SUSP"
        }
    }


# Helper function to prepare interactive data for chart5
def prepare_interactive_data_chart5(dims):
    return {
        "time": {
            "values": dims['time']['codes'],
            "multiple": False,
            "default": None
        },
        "legal_status": {
            "values": dims.get('leg_stat', {}).get('codes', []),
            "labels": dims.get('leg_stat', {}).get('labels', []),
            "multiple": False,
            "default": "PER_SUSP"
        }
    }


# Helper function to get filters from request
def get_filters_from_request():
    time_params = [int(t) for t in request.args.getlist('time')]
    geo_params = request.args.getlist('geo')
    unit = request.args.get('unit', "Number")
    legal_params = request.args.get('legal_status', "PER_SUSP")

    filters = {}
    if time_params:
        filters['time'] = time_params
    if geo_params:
        filters['geo'] = geo_params
    if legal_params:
        filters['leg_stat'] = legal_params

    return filters if filters else None


"""------Endpoints for Question 3------"""


# Chart 1 Endpoint
@question3_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_just_bri')
    interactive_data = prepare_interactive_data_chart1(dims)
    resp.set_interactive_data(interactive_data)

    try:
        filters = get_filters_from_request()

        df = loader.load_dataset('crim_just_bri', filters=filters)
        unit = request.args.get('unit', "Number")
        df = processing_data_for_q3(df, unit)

        resp.set_chart_data(
            df[["time", "geo", "geo_code", "value"]].to_dict(orient="records"))

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


# Chart 5 Endpoint
@question3_bp.route('/chart5', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart5():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_just_bri')
    interactive_data = prepare_interactive_data_chart5(dims)
    resp.set_interactive_data(interactive_data)

    try:
        filters = get_filters_from_request()

        df = loader.load_dataset('crim_just_bri', filters=filters)
        unit = request.args.get('unit', "Number")
        df = processing_data_for_q3(df, unit)

        resp.set_chart_data(
            df[["time", "geo", "geo_code", "value"]].to_dict(orient="records"))

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()
