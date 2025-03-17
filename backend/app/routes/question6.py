from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
from backend.app.utils import preprocessing_questions as pq
import pandas as pd

question6_bp = Blueprint('question6', __name__)

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

@question6_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()
    time_param = request.args.get('time')

    if time_param:
        filters = {'time': [time_param]}
    else:
        filters = None

    df = loader.load_dataset('hlth_dhc130', filters=filters)
    df = pq.preprocess_q6(df)
    return 



@question6_bp.route('/chart2', methods=['GET'])
def chart2():
    loader = EurostatDataLoader()
    
    geo_param = request.args.get('geo')  
    time_param = request.args.get('time') 
    
    filters = {}
    if geo_param:
        filters['geo'] = [geo_param]
    if time_param:
        filters['time'] = [time_param]
    
    df = loader.load_dataset('hlth_dhc130', filters=filters)
    df = pq.preprocess_q6(df)

    return

