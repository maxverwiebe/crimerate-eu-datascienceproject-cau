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

    time_param = request.args.get('time')  # GET-Parameter
    if time_param:
        filters = {'time': [time_param]}
    else:
        filters = None

    df = loader.load_dataset('crim_off_cat', filters=filters)

    # we are merging some categories to simplify the chart because not all categories are using the same categories
    merge_categories = ["Sexual exploitation", "Sexual violence", "Sexual assault"]
    df['iccs_merged'] = df['iccs'].apply(lambda x: "Sexual crimes" if x in merge_categories else x)

    pivot = df.groupby(['geo', 'iccs_merged'])['value'].sum().unstack()

    most_frequent_crime = df.groupby('iccs_merged')['value'].sum().idxmax()

    pivot_data = pivot.to_dict()

    dims = loader.get_dimensions('crim_off_cat')
    filter_time = dims['time']['codes']

    chart_data = {
        "pivot_data": pivot_data,
        "most_frequent_crime": most_frequent_crime
    }
    interactive_data = {"time": filter_time}

    resp = ChartResponse(chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()