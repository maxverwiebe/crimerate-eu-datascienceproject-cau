from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

question1_bp = Blueprint('question1', __name__)

# just a helper class to format the response
class ChartResponse:
    def __init__(self, chart_data, interactive_data=None):
        self.chart_data = chart_data
        self.interactive_data = interactive_data

    def to_json(self):
        return jsonify({
            "chart_data": self.chart_data,
            "interactive_data": self.interactive_data
        })

@question1_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()

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

    pivot = df.groupby(['geo', 'iccs_merged'])['value'].sum().unstack()
    most_frequent_crime = df.groupby('iccs_merged')['value'].sum().idxmax()
    pivot_data = pivot.to_dict()

    dims = loader.get_dimensions('crim_off_cat')
    filter_time = dims['time']['codes']
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []

    chart_data = {
        "pivot_data": pivot_data,
        "most_frequent_crime": most_frequent_crime
    }

    interactive_data = {
        "time": {
            "values": filter_time,
            "multiple": True,
            "default": None
        },
        "geo": {
            "values": filter_geo,
            "multiple": True,
            "default": None
        }
    }

    resp = ChartResponse(chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()

@question1_bp.route('/chart3', methods=['GET'])
def chart3():
    loader = EurostatDataLoader()
    time_params = request.args.getlist('time')
    geo_param = request.args.get('geo')

    filters = {}
    if geo_param:
        filters['geo'] = [geo_param]
    if time_params:
        filters['time'] = [time_params]
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
    
    dims = loader.get_dimensions('crim_off_cat')
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []
    filter_time = dims['time']['codes']


    interactive_data = {
        "geo": {
            "values": filter_geo,
            "multiple": True,
            "default": None
        },
        "time": {
            "values": filter_time,
            "multiple": True,
            "default": None
        }
    }
    
    resp = ChartResponse(chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()