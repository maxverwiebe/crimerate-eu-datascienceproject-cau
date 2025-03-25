from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
from .chart_response import ChartResponse
import pandas as pd

question1_bp = Blueprint('question1', __name__)

@question1_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse()

    dims = loader.get_dimensions('crim_off_cat')
    interactive_data = {
        "time": {
            "values": dims.get('time', {}).get('codes', []),
            "multiple": True,
            "default": None
        },
        "geo": {
            "values": dims.get('geo', {}).get('labels', []),
            "multiple": True,
            "default": None
        }
    }
    resp.set_interactive_data(interactive_data)

    try:
        time_params = request.args.getlist('time')
        geo_params = request.args.getlist('geo')
        filters = {}
        if time_params:
            filters['time'] = time_params
        if geo_params:
            filters['geo'] = geo_params
        if not filters:
            filters = None

        df = loader.load_dataset('crim_off_cat', filters=filters)
        merge_categories = ["Sexual exploitation", "Sexual violence", "Sexual assault"]
        df['iccs_merged'] = df['iccs'].apply(lambda x: "Sexual crimes" if x in merge_categories else x)

        pivot = df.groupby(['geo', 'iccs_merged'])['value'].sum().unstack(fill_value=0)
        most_frequent_crime = df.groupby('iccs_merged')['value'].sum().idxmax()

        chart_data = {
            "pivot_data": pivot.to_dict(),
            "most_frequent_crime": most_frequent_crime
        }
        resp.set_chart_data(chart_data)

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


@question1_bp.route('/chart3', methods=['GET'])
def chart3():
    loader = EurostatDataLoader()
    resp = ChartResponse()

    dims = loader.get_dimensions('crim_off_cat')
    interactive_data = {
        "geo": {
            "labels": dims.get('geo', {}).get('labels', []),
            "values": dims.get('geo', {}).get('codes', []),
            "multiple": True,
            "default": None
        },
        "time": {
            "values": dims.get('time', {}).get('codes', []),
            "multiple": True,
            "default": None
        }
    }
    resp.set_interactive_data(interactive_data)

    try:
        time_params = request.args.getlist('time')
        geo_params = request.args.getlist('geo')

        filters = {}
        if geo_params:
            filters['geo'] = geo_params
        if time_params:
            filters['time'] = time_params
        if not filters:
            filters = None

        df = loader.load_dataset('crim_off_cat', filters=filters)

        merge_categories = ["Sexual exploitation", "Sexual violence", "Sexual assault"]
        df['iccs_merged'] = df['iccs'].apply(lambda x: "Sexual crimes" if x in merge_categories else x)

        crime_by_category = df.groupby('iccs_merged')['value'].sum().fillna(0)

        chart_data = {
            "categories": crime_by_category.index.tolist(),
            "values": crime_by_category.tolist()
        }
        resp.set_chart_data(chart_data)

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


@question1_bp.route('/chart4', methods=['GET'])
def chart4():
    loader = EurostatDataLoader(cache_expiry=1800)

    df_pop   = loader.load_dataset('tps00001')
    df_crime = loader.load_dataset('crim_off_cat')

    time_param = request.args.get('time', default="2015")

    geo_labels = loader.get_dimensions('crim_off_cat')['geo']['labels']
    dims = loader.get_dimensions('crim_off_cat')

    df_pop = (
        df_pop
        .dropna(subset=['value'])
        .rename(columns={'time': 'year', 'value': 'population'})
        .assign(year=lambda d: d['year'].astype(int))
    )
    latest_year = int(time_param)
    df_pop = df_pop[df_pop['year'] == latest_year][['geo_code', 'population']]

    df_crime = (
        df_crime
        .dropna(subset=['value'])
        .rename(columns={'time': 'year', 'value': 'crime_count'})
        .assign(year=lambda d: d['year'].astype(int))
        .groupby(['geo_code', 'year'], as_index=False)['crime_count'].sum()
    )
    df_crime = df_crime[df_crime['year'] == latest_year][['geo_code', 'crime_count']]

    df = df_crime.merge(df_pop, on='geo_code')
    df['crime_rate_per_100k'] = (df['crime_count'] / df['population']) * 100000

    chart_data = (
        df
        .sort_values('crime_rate_per_100k', ascending=False)
        .rename(columns={'geo_code': 'geo'})
        [['geo', 'crime_rate_per_100k']]
        .to_dict(orient='records')
    )

    response = ChartResponse(
        chart_data=chart_data,
        interactive_data={"time": {
            "values": ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"],
            "multiple": False,
            "default": "2015"
        }}
    )

    return response.to_json()
