from flask import Blueprint, request
import pandas as pd

from .es_dataloader import EurostatDataLoader
from app import cache
from .chart_response import ChartResponse
from ..utils.preprocessing_question6 import (
    preprocessing_data_chart1,
    aggregate_dataframe
)


# Blueprint für Frage 6
question6_bp = Blueprint('question6', __name__)


def get_filters():
    filters = {}
    time_params = request.args.getlist('time')
    geo_params = request.args.getlist('geo')
    leg_stat_params = request.args.getlist('leg_stat')
    
    if time_params:
        filters['time'] = time_params
    if geo_params:
        filters['geo'] = geo_params
    if leg_stat_params:
        filters['leg_stat'] = leg_stat_params
    
    return filters if filters else None


"""------Endpoints for Question 6------"""

# Endppoint for Chart 1
@question6_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    
    dims = loader.get_dimensions('crim_just_sex')
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []
    filter_time = dims['time']['codes'] if 'time' in dims else []

    df = loader.load_dataset('crim_just_sex', filters=get_filters())
    df = preprocessing_data_chart1(df)

    aggregated = aggregate_dataframe(df)

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

    resp = ChartResponse(
        chart_data=aggregated, interactive_data=interactive_data)
    
    return resp.to_json()


#Endpoint for Chart 2
@question6_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader()

    dims = loader.get_dimensions('crim_just_sex')
    df = loader.load_dataset('crim_just_sex', filters=get_filters())

    pivot = (
        df.dropna(subset=['value'])
            .pivot_table(
                index='time', columns='sex',
                values='value', aggfunc='sum', 
                fill_value=0)
            .sort_index()
    )

    chart_data = {
        "years": pivot.index.tolist(),
        "male": pivot.get('Males', pd.Series(dtype=float)).tolist(),
        "female": pivot.get('Females', pd.Series(dtype=float)).tolist()
    }

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
    
    resp = ChartResponse(
        chart_data=chart_data, interactive_data=interactive_data)

    return resp.to_json()
