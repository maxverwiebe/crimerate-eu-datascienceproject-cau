from flask import Blueprint, request

from .es_dataloader import EurostatDataLoader
from .chart_response import ChartResponse
from app import cache
from ..utils.preprocessing_question4 import (
    preprocess_and_merge_data_chart1,
    preprocess_and_merge_data_chart2,
    preprocess_and_merge_data_chart3
)


question4_bp = Blueprint('question4', __name__)


# Chart 1 endpoint
@question4_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader(cache_expiry=1800)

    time_param = request.args.get('time', default="2020")
    iccs_param = request.args.get('iccs', default="Intentional homicide")
    year = str(time_param)

    pop_df = loader.load_dataset('tps00001')
    gdp_df = loader.load_dataset('tec00115')
    crime_df = loader.load_dataset('crim_off_cat')

    filtered_df = preprocess_and_merge_data_chart1(
        pop_df,
        gdp_df,
        crime_df,
        year,
        iccs_param
    )

    resp = ChartResponse(chart_data=filtered_df.to_dict(orient='records'), interactive_data={
        "time": {
            "values": pop_df['time'].unique().tolist(),
            "multiple": False,
            "default": time_param
        },
        "iccs": {
            "values": crime_df['iccs'].unique().tolist(),
            "multiple": False,
            "default": iccs_param
        }
    })

    return resp.to_json()


# Chart 2 endpoint
@question4_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader(cache_expiry=1800)
    geo_param = request.args.get('geo', default="DE")

    df_pop = loader.load_dataset('tps00001') 
    df_crime = loader.load_dataset('crim_off_cat')
    df_gdp = loader.load_dataset('tec00115')

    geo_codes = df_crime['geo_code'].unique().tolist()
    geo_labels = loader.get_dimensions('crim_off_cat')['geo']['labels']

    final_df = preprocess_and_merge_data_chart2(
        df_pop,
        df_gdp,
        df_crime,
        geo_param
    )

    response = ChartResponse(
        chart_data=final_df.to_dict(orient='records'),
        interactive_data={
            "geo": {
                "labels": geo_labels,
                "values": geo_codes,
                "multiple": False,
                "default": geo_param,
            }
        }
    )

    return response.to_json()


# Chart 3 endpoint
@question4_bp.route('/chart3', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart3():
    loader = EurostatDataLoader(cache_expiry=1800)

    year = request.args.get('time', default="2020")
    iccs = request.args.get('iccs', default="Intentional homicide")
    geo_codes = request.args.getlist('geo')

    df_pop = loader.load_dataset('tps00001')
    df_gdp = loader.load_dataset('tec00115')
    df_crime = loader.load_dataset('crim_off_cat')

    merged = preprocess_and_merge_data_chart3(
        df_pop,
        df_gdp,
        df_crime,
        year,
        iccs
    )

    all_codes = merged['geo_code'].unique().tolist()
    all_labels = merged['country'].unique().tolist()
    valid_codes = [code for code in geo_codes if code in all_codes]
    filtered = merged[merged['geo_code'].isin(valid_codes)]

    resp = ChartResponse(
        chart_data=filtered[['country','geo_code','population','gdp_growth','crime_rate_per_100k']]
        .dropna()
        .to_dict(orient='records'),
        interactive_data={
            "time": {"values": sorted(df_pop['time'].unique().tolist()), "multiple": False, "default": year},
            "iccs": {"values": sorted(df_crime['iccs'].unique().tolist()), "multiple": False, "default": iccs},
            "geo": {"labels":sorted(all_labels),"values": sorted(all_codes), "multiple": True, "default": None}
        }
    )

    return resp.to_json()
