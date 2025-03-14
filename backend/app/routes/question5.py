from flask import Blueprint, jsonify

question5_bp = Blueprint('question5', __name__)

@question5_bp.route('/chart1', methods=['GET'])
def chart1():
    data = {"chart": "Chart 1", "values": [1, 2, 3, 4]}
    return jsonify(data)

@question5_bp.route('/chart2', methods=['GET'])
def chart2():
    data = {"chart": "Chart 2", "values": [4, 3, 2, 1]}
    return jsonify(data)

@question5_bp.route('/chart3', methods=['GET'])
def chart3():
    data = {"chart": "Chart 3", "values": [10, 20, 30, 40]}
    return jsonify(data)
