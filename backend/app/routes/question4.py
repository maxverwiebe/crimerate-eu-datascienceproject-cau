from flask import Blueprint, jsonify
from .es_dataloader import EurostatDataLoader
import pandas as pd

question4_bp = Blueprint('question4', __name__)

@question4_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()
    df = loader.load_dataset('ilc_mddw06')

    avg_crime_by_urbanisation = df.groupby('deg_urb')['value'].mean().dropna()
    data = avg_crime_by_urbanisation.to_dict()

    return jsonify(data)

@question4_bp.route('/chart2', methods=['GET'])
def chart2():
    data = {"chart": "Chart 2", "values": [4, 3, 2, 1]}
    return jsonify(data)

@question4_bp.route('/chart3', methods=['GET'])
def chart3():
    data = {"chart": "Chart 3", "values": [10, 20, 30, 40]}
    return jsonify(data)
