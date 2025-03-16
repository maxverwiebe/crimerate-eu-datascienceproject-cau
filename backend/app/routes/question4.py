from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

question4_bp = Blueprint('question4', __name__)

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

@question4_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()

    time_param = request.args.get('time') # GET parameter
    if time_param:
        filters = {'time': [time_param]}
    else:
        filters = None

    df = loader.load_dataset('ilc_mddw06', filters=filters)

    avg_crime_by_urbanisation = df.groupby('deg_urb')['value'].mean().dropna()
    data = avg_crime_by_urbanisation.to_dict()

    ###

    dims = loader.get_dimensions('ilc_mddw06')
    filter_time = dims['time']['codes']

    resp = ChartResponse(chart_data=data, interactive_data={"time": filter_time})

    return resp.to_json()

@question4_bp.route('/chart2', methods=['GET'])
def chart2():
    data = {"chart": "Chart 2", "values": [4, 3, 2, 1]}
    return jsonify(data)

@question4_bp.route('/chart3', methods=['GET'])
def chart3():
    data = {"chart": "Chart 3", "values": [10, 20, 30, 40]}
    return jsonify(data)