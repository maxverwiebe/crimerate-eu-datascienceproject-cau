"""
question7.py

This file defines the routes and API endpoints for Question 7.
It might include generated or modified code.
"""


from flask import Blueprint, jsonify, request

from .es_dataloader import EurostatDataLoader
from .chart_response import ChartResponse
from app import cache
from ..utils.preprocessing_question7 import (
    preprocess_q7,
    filter_geo_data,
    structure_chart_data,
)


question7_bp = Blueprint('question7', __name__)


def get_filters():
    countries_param = request.args.getlist('geo')
    time_params = request.args.getlist('time')
    filters = {}
    if countries_param:
        filters['geo'] = countries_param or ['DE']
    if time_params:
        filters['time'] = time_params or ['2015']
        return filters
    

"""------Endpoints for Question 7------"""
    

# Endpoint for Chart 1
@question7_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    geo_params = request.args.getlist('geo')
    filters = {'geo': geo_params} if geo_params else None

    df = loader.load_dataset('hlth_dhc130', filters=filters)
    df = preprocess_q7(df)

    chart_data = structure_chart_data(df)

    dims = loader.get_dimensions('hlth_dhc130')
    filter_geo_codes, filter_geo_labels = filter_geo_data(dims)

    interactive_data = {
        "geo": {
            "values": filter_geo_codes,
            "labels": filter_geo_labels,
            "multiple": True,
            "default": "DE"
        }
    }

    resp = ChartResponse(
        chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()


# Endpoint for Chart 2
@question7_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader()    

    df = loader.load_dataset('hlth_dhc130', filters= get_filters())
    df = preprocess_q7(df)

    result = dict(zip(df['age'], df['value']))
    
    dims = loader.get_dimensions('hlth_dhc130')
    filter_geo_codes, filter_geo_labels = filter_geo_data(dims)
    filter_time = dims['time']['codes'] if 'time' in dims else []
    
    interactive_data = {
        "geo": {
            "values": filter_geo_codes,
            "labels": filter_geo_labels,
            "multiple": False,
            "default": "DE"
        },
        "time": {
            "values": filter_time,
            "multiple": False,
            "default": "2015"
        }
    }
    
    resp = ChartResponse(
        chart_data=result, interactive_data=interactive_data)
    
    return resp.to_json()