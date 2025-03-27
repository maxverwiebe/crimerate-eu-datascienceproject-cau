from flask import Blueprint, request
from .es_dataloader import EurostatDataLoader
from .chart_response import ChartResponse
import pandas as pd
from app import cache

question2_bp = Blueprint('question2', __name__)

@question2_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    # Always include interactive_data
    dims = loader.get_dimensions('crim_gen_reg')
    interactive_data = {
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "labels": dims.get('geo', {}).get('labels', []),
            "multiple": False,
            "default": "DE"
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
        geo = request.args.get('geo')

        filters = {}
        if time_params:
            filters['time'] = time_params
        if not filters:
            filters = None

        df = loader.load_dataset('crim_gen_reg', filters=filters).dropna()
        df_country = df[df["geo_code"].str.startswith(geo or "")]

        agg = df_country.groupby("geo").agg({"value": "sum", "geo_code": "first"}).fillna(0)
        top = agg.sort_values("value", ascending=False).head(50)

        resp.set_chart_data({
            "cities": top.index.tolist(),
            "values": top["value"].tolist(),
            "geo_codes": top["geo_code"].tolist()
        })

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


@question2_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_gen_reg')
    interactive_data = {
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "labels": dims.get('geo', {}).get('labels', []),
            "multiple": True,
            "default": "BE"
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
        geo = request.args.get('geo')

        filters = {}
        if time_params:
            filters['time'] = time_params
        if not filters:
            filters = None

        df = loader.load_dataset('crim_gen_reg', filters=filters)
        df_country = df[df["geo_code"].str.startswith(geo or "")]

        pivot = (
            df_country.groupby(["time", "geo"])["value"]
            .sum()
            .reset_index()
            .pivot(index="time", columns="geo", values="value")
            .fillna(0)
            .sort_index()
        )

        resp.set_chart_data({
            "times": pivot.index.tolist(),
            "series": [
                {"name": geo_name, "data": pivot[geo_name].tolist()}
                for geo_name in pivot.columns
            ]
        })

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()
