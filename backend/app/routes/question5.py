from flask import Blueprint, jsonify, request

from .es_dataloader import EurostatDataLoader
from app import cache
from .chart_response import ChartResponse
from ..utils.preprocessing_question5 import (
    preprocessing_police_data_for_chart1,
    preprocessing_crime_data_for_chart1,
    filter_and_format_data_for_chart1,
    preprocess_and_format_data_for_chart2
)


question5_bp = Blueprint('question5', __name__)


#Endpoint for Chat 1
@question5_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader(cache_expiry=1800)

    geo_param = request.args.get('geo')
    crime_type = request.args.get('iccs', "Intentional homicide")
    
    dims = loader.get_dimensions('crim_off_cat')
    df_police = loader.load_dataset('crim_just_job')
    df_crime = loader.load_dataset('crim_off_cat')

    df_police = preprocessing_police_data_for_chart1(df_police)
    df_crime = preprocessing_crime_data_for_chart1(df_crime, crime_type)

    times, series = filter_and_format_data_for_chart1(
        df_police, df_crime, geo_param)

    chart_data= {
       "times": times, 
       "series": series
       }
    
    interactive_data = {
        "geo": {
            "labels": dims['geo']['labels'],
            "values": dims['geo']['codes'],
            "multiple": True,
            "default": None
            },

        "iccs": {
            "values": dims['iccs']['labels'],
            "multiple": False, 
            "default": crime_type
            }
    }

    resp = ChartResponse(
        chart_data= chart_data,interactive_data= interactive_data)

    return resp.to_json()


# Endpoint for Chart 2 
@question5_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader(cache_expiry=1800)

    year = request.args.get('time', "2020")
    crime_type = request.args.get('iccs', "Intentional homicide") 

    df_police = loader.load_dataset('crim_just_job')
    df_crime = loader.load_dataset('crim_off_cat')

    av_times = sorted(df_police['time'].unique().tolist())
    merged = preprocess_and_format_data_for_chart2(
        df_police, df_crime, year, crime_type)

    return jsonify({
        "chart_data": merged.to_dict(orient='records'),
        "interactive_data": {
            "time": {
                "values": av_times,
                "multiple": False, 
                "default": year
                },
            "iccs": {
                "values": sorted(df_crime['iccs'].unique().tolist()),
                "multiple": False, 
                "default": crime_type},
        }
    })
