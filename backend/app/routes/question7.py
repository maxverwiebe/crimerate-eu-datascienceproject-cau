from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

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

    df = df[df['age'].isin(age_categories)]
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
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []

    interactive_data = {
        "geo": {
            "values": filter_geo,
            "labels": dims['geo']['labels'] if 'geo' in dims else [],
            "multiple": True,
            "default": None
        }
    }

    resp = ChartResponse(chart_data=nested_data, interactive_data=interactive_data)
    return resp.to_json()


@question7_bp.route('/chart2', methods=['GET'])
def chart2():
    loader = EurostatDataLoader()
    
    countries_param = request.args.getlist('geo')
    time_params = request.args.getlist('time')
    
    filters = {}
    if countries_param:
        filters['geo'] = countries_param
    if time_params:
        filters['time'] = time_params

    df = loader.load_dataset('hlth_dhc130', filters=filters)
    df = preprocess_q7(df)
    
    print("Verfügbare Ländereinträge im Datensatz:", df['geo'].unique())
    
    if df.empty:
        print("Warnung: DataFrame ist leer nach Filterung mit:", countries_param)
    
    age_sum = df.groupby('age')['value'].sum().reset_index()
    total = age_sum['value'].sum()
    age_sum['percentage'] = (age_sum['value'] / total * 100).round(2)
    
    result = dict(zip(age_sum['age'], age_sum['percentage']))
    
    dims = loader.get_dimensions('hlth_dhc130')
    filter_geo = dims['geo']['codes'] if 'geo' in dims else []
    filter_time = dims['time']['codes'] if 'time' in dims else []
    
    interactive_data = {
        "geo": filter_geo,
        "time": filter_time
    }

    interactive_data = {
        "geo": {
            "values": filter_geo,
            "labels": dims['geo']['labels'] if 'geo' in dims else [],
            "multiple": False,
            "default": None
        },
        "time": {
            "values": filter_time,
            "multiple": False,
            "default": None
        }
    }
    
    chart_data = result
    resp = ChartResponse(chart_data=chart_data, interactive_data=interactive_data)
    return resp.to_json()