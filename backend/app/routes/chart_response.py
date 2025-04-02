# just a helper class to format the response
from flask import jsonify


class ChartResponse:
    def __init__(self, chart_data=None, interactive_data=None, error=None):
        """
        Initializes the ChartResponse object. This is the Response object that will be returned to the frontend. (as JSON)
        """
        
        self.chart_data = chart_data
        self.interactive_data = interactive_data
        self.error = error

    def set_chart_data(self, chart_data):
        """
        Sets the chart data for the response."
        """
        self.chart_data = chart_data

    def set_interactive_data(self, interactive_data):
        """
        "Sets the interactive data for the response, so the user can interact with the chart change the filters.
        """
        self.interactive_data = interactive_data

    def set_error(self, error):
        """
        Sets the error message for the response, if any.
        """
        self.error = error

    def to_json(self):
        """
        Converts the response object to JSON format for HTTP(S) response.
        """
        return jsonify({
            "chart_data": self.chart_data,
            "interactive_data": self.interactive_data,
            "error": self.error
        })