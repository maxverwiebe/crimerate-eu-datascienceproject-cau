from flask import Blueprint, request

from app import cache
from .chart_response import ChartResponse
from .es_dataloader import EurostatDataLoader
from ..utils.preprocessing_question1 import (
    process_crime_data_chart1,
    process_crime_data_chart3,
    process_crime_data_chart4
) 


question1_bp = Blueprint('question1', __name__)


# Create interactive data for the frontend
def get_interactive_data(loader, dataset):
    dims = loader.get_dimensions(dataset)
    return {
        "time": {
            "values": dims.get('time', {}).get('codes', []),
            "multiple": True,
            "default": None
        },
        "geo": {
            "labels": dims.get('geo', {}).get('labels', []),
            "values": dims.get('geo', {}).get('codes', []),
            "multiple": True,
            "default": None
        }
    }


# Get filters from the request parameters
def get_filters():
    filters = {}
    time_params = request.args.getlist('time')
    geo_params = request.args.getlist('geo')
    
    if time_params:
        filters['time'] = time_params
    if geo_params:
        filters['geo'] = geo_params
    
    return filters if filters else None


"""-----Endpoints for Question 1-----"""


# Chart 1 endpoint
@question1_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse()
    resp.set_interactive_data(get_interactive_data(loader, 'crim_off_cat'))

    try:
        df = loader.load_dataset('crim_off_cat', filters=get_filters())
        resp.set_chart_data(process_crime_data_chart1(df))
    except Exception as e:
        resp.set_error(f"Error creating chart data: {e}")

    return resp.to_json()


# Chart 3 endpoint
@question1_bp.route('/chart3', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart3():
    loader = EurostatDataLoader()
    resp = ChartResponse()
    resp.set_interactive_data(get_interactive_data(loader, 'crim_off_cat'))

    try:
        df = loader.load_dataset('crim_off_cat', filters=get_filters())
        resp.set_chart_data(process_crime_data_chart3(df))
    except Exception as e:
        resp.set_error(f"Error creating chart data: {e}")

    return resp.to_json()


# Chart 4 endpoint
@question1_bp.route('/chart4', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart4():
    loader = EurostatDataLoader(cache_expiry=1800)

    time_param = int(request.args.get('time', default="2015"))
    df_pop = loader.load_dataset('tps00001')
    df_crime = loader.load_dataset('crim_off_cat')

    chart_data = process_crime_data_chart4(df_pop, df_crime, time_param)

    response = ChartResponse(
        chart_data=chart_data,
        interactive_data={
            "time": {
                "values": [str(y) for y in range(2013, 2023)],
                "multiple": False,
                "default": "2015"
            }
        }
    )

    return response.to_json() 
