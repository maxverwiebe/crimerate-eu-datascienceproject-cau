from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd
from app import cache

def filter_geo_data(dims):
    """
    Filtert die 'geo' Dimension, um bestimmte Codes und Labels zu entfernen.
    """
    # Sicherstellen, dass 'geo' im dims vorhanden ist
    if 'geo' not in dims:
        return [], []  # Rückgabe leerer Listen, falls 'geo' nicht vorhanden ist

    # Codes und Labels aus dims extrahieren
    filter_geo_codes = dims['geo']['codes']
    filter_geo_labels = dims['geo']['labels']

    # Liste der zu entfernenden Codes
    exclude_codes = {'EU', 'EU28', 'EU27_2007', 'EA', 'EA20', 'EA19', 'EA18'}

    # Liste der zu entfernenden Labels
    exclude_labels = {
        'European Union (EU6-1958, EU9-1973, EU10-1981, EU12-1986, EU15-1995, EU25-2004, EU27-2007, EU28-2013, EU27-2020)',
        'European Union - 28 countries (2013-2020)',
        'European Union - 27 countries (2007-2013)',
        'Euro area (EA11-1999, EA12-2001, EA13-2007, EA15-2008, EA16-2009, EA17-2011, EA18-2014, EA19-2015, EA20-2023)',
        'Euro area – 20 countries (from 2023)',
        'Euro area - 19 countries  (2015-2022)',
        'Euro area - 18 countries (2014)',
    }

    # Beide Listen filtern
    filtered_geo = [
        (code, label) for code, label in zip(filter_geo_codes, filter_geo_labels)
        if code not in exclude_codes and label not in exclude_labels
    ]

    # Entpacken in separate Listen
    if filtered_geo:
        filter_geo_codes, filter_geo_labels = zip(*filtered_geo)
        return list(filter_geo_codes), list(filter_geo_labels)
    else:
        return [], []  # Falls keine Filterergebnisse, leere Listen zurückgeben

def preprocess_q7(df):   
    df = df.dropna()
    df = df[df['sex'] == 'Total']
    df = df[['geo', 'time', 'age', 'value']]

    age_categories = [
        'From 16 to 24 years',
        'From 25 to 34 years',
        'From 35 to 44 years',
        'From 45 to 54 years',
        'From 55 to 64 years',
        '65 years or over'
    ]
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

    df = df[df['age'].isin(age_categories)]
    

    return df

question7_bp = Blueprint('question7', __name__)

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

@question7_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    geo_params = request.args.getlist('geo')
    filters = {'geo': geo_params} if geo_params else None

    df = loader.load_dataset('hlth_dhc130', filters=filters)
    df = preprocess_q7(df)

    # Aggregiere die Werte pro (geo, age, time)
    aggregated = {}
    for record in df.to_dict(orient="records"):
        geo = record["geo"]
        age = record["age"]
        time = record["time"]
        value = record["value"]

        key = (geo, age, time)
        aggregated[key] = aggregated.get(key, 0) + value

    # Berechne Totale pro (geo, time)
    geo_time_totals = {}
    for (geo, age, time), value in aggregated.items():
        key = (geo, time)
        geo_time_totals[key] = geo_time_totals.get(key, 0) + value

    # Erstelle eine verschachtelte Struktur: {geo: {time: {age: {"value": ..., "percentage": ...}}}}
    nested_data = {}
    for (geo, age, time), value in aggregated.items():
        if geo not in nested_data:
            nested_data[geo] = {}
        if time not in nested_data[geo]:
            nested_data[geo][time] = {}
        total = geo_time_totals.get((geo, time), 0)
        percentage = round((value / total * 100), 2) if total > 0 else 0
        nested_data[geo][time][age] = {"value": value, "percentage": percentage}

    # Optional: Sortierung nach Zeit (und ggf. nach Alterskategorien)
    for geo in nested_data:
        # Erstelle eine sortierte Version nach time:
        sorted_time = dict(sorted(nested_data[geo].items(), key=lambda x: x[0]))
        nested_data[geo] = sorted_time

    dims = loader.get_dimensions('hlth_dhc130')
    filter_geo_codes, filter_geo_labels = filter_geo_data(dims)

    interactive_data = {
        "geo": {
            "values": filter_geo_codes,
            "labels": filter_geo_labels,
            "multiple": True,
            "default": "DE"
        }
    }

    resp = ChartResponse(chart_data=nested_data, interactive_data=interactive_data)
    return resp.to_json()


@question7_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader()
    
    countries_param = request.args.getlist('geo')
    time_params = request.args.getlist('time')
    
    filters = {}
    if countries_param:
        filters['geo'] = countries_param or ['DE']
    if time_params:
        filters['time'] = time_params or ['2015']

    df = loader.load_dataset('hlth_dhc130', filters=filters)
    df = preprocess_q7(df)
    
    if df.empty:
        print("Warnung: DataFrame ist leer nach Filterung mit:", countries_param)
    
    result = dict(zip(df['age'], df['value']))
    
    dims = loader.get_dimensions('hlth_dhc130')
    filter_geo_codes, filter_geo_labels = filter_geo_data(dims)
    filter_time = dims['time']['codes'] if 'time' in dims else []
    
    interactive_data = {
        "geo": filter_geo_codes,
        "time": filter_time
    }

    interactive_data = {
        "geo": {
            "values": filter_geo_codes,
            "labels": filter_geo_labels,
            "multiple": False,
            "default": "DE"
        },
        "time": {
            "values": filter_time,
            "multiple": False,
            "default": "2015"
        }
    }
    
    chart_data = result
    resp = ChartResponse(chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()