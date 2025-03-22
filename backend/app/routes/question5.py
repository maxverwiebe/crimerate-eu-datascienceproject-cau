from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

def preprocess_q5(df):
    df = df.dropna()

    geo_values_to_remove = [
        'European Union (EU6-1958, EU9-1973, EU10-1981, EU12-1986, EU15-1995, EU25-2004, EU27-2007, EU28-2013, EU27-2020)',
        'European Union - 28 countries (2013-2020)',
        'European Union - 27 countries (2007-2013)',
        'Euro area (EA11-1999, EA12-2001, EA13-2007, EA15-2008, EA16-2009, EA17-2011, EA18-2014, EA19-2015, EA20-2023)',
        'Euro area – 20 countries (from 2023)',
        'Euro area - 19 countries  (2015-2022)',
        'Euro area - 18 countries (2014)'
    ]
    df = df[~df['geo'].isin(geo_values_to_remove)]
    
    df = df[['geo', 'time', 'deg_urb', 'incgrp', 'value']]
    return df

class ChartResponse:
    def __init__(self, chart_data, interactive_data=None):
        self.chart_data = chart_data
        self.interactive_data = interactive_data

    def to_json(self):
        return jsonify({
            "chart_data": self.chart_data,
            "interactive_data": self.interactive_data
        })


question5_bp = Blueprint('question5', __name__)

@question5_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()
    
    # Parameter aus Request (Länder + Einkommensgruppe)
    geo_params = request.args.getlist('geo')
    incgrp_param = request.args.get('incgrp')  # Einkommensgruppe wie 'Total', 'Below 60%' etc.
    
    filters = {}
    if geo_params:
        filters['geo'] = geo_params

    # Lade den Datensatz
    df = loader.load_dataset('ilc_mddw06', filters=filters)
    df = preprocess_q5(df)

    # Optional: Einkommensgruppe filtern
    if incgrp_param:
        df = df[df['incgrp'] == incgrp_param]

    # Aggregieren: Summe pro geo, time, deg_urb und incgrp (direkt die values verwenden)
    grouped = df.groupby(['geo', 'time', 'deg_urb', 'incgrp'])['value'].sum().reset_index()

    # Struktur fürs Frontend: {geo: {time: {deg_urb: {incgrp: value}}}}
    nested_data = {}

    for record in grouped.to_dict(orient="records"):
        geo = record["geo"]
        time = record["time"]
        deg_urb = record["deg_urb"]
        incgrp = record["incgrp"]
        value = record["value"]

        if geo not in nested_data:
            nested_data[geo] = {}
        if time not in nested_data[geo]:
            nested_data[geo][time] = {}
        if deg_urb not in nested_data[geo][time]:
            nested_data[geo][time][deg_urb] = {}
        nested_data[geo][time][deg_urb][incgrp] = value

    # Optional: Zeit nach Jahren sortieren
    for geo in nested_data:
        nested_data[geo] = dict(sorted(nested_data[geo].items(), key=lambda x: x[0]))

    # Filterwerte fürs Frontend (Geo + Einkommensgruppen)
    dims = loader.get_dimensions('ilc_mddw06')
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []
    filter_incgrp = dims['incgrp']['codes'] if 'incgrp' in dims else []

    interactive_data = {
        "geo": {
            "values": filter_geo,
            "labels": dims['geo']['labels'] if 'geo' in dims else [],
            "multiple": True,
            "default": None
        },
        "incgrp": {
            "values": filter_incgrp,
            "labels": dims['incgrp']['labels'] if 'incgrp' in dims else [],
            "multiple": False,
            "default": "Total"
        }
    }

    # Antwort als JSON zurückgeben
    resp = ChartResponse(chart_data=nested_data, interactive_data=interactive_data)
    return resp.to_json()

