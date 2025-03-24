# just a helper class to format the response
from flask import jsonify


class ChartResponse:
    def __init__(self, chart_data=None, interactive_data=None, error=None):
        self.chart_data = chart_data
        self.interactive_data = interactive_data
        self.error = error

    def set_chart_data(self, chart_data):
        self.chart_data = chart_data

    def set_interactive_data(self, interactive_data):
        self.interactive_data = interactive_data

    def set_error(self, error):
        self.error = error

    def to_json(self):
        return jsonify({
            "chart_data": self.chart_data,
            "interactive_data": self.interactive_data,
            "error": self.error
        })