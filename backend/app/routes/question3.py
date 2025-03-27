from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd
from .chart_response import ChartResponse
from app import cache

question3_bp = Blueprint('question3', __name__)

@question3_bp.route('/chart1', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_just_bri')
    interactive_data = {
        "time": {
            "values": dims['time']['codes'],
            "multiple": True,
            "default": None
        },
        "geo": {
            "values": dims.get('geo', {}).get('codes', []),
            "labels": dims.get('geo', {}).get('labels', []),
            "multiple": True,
            "default": None
        },
        "unit": {
            "values": ["Number", "Per hundred thousand inhabitants"],
            "multiple": False,
            "default": "Number"
        }
    }

    legal_dim = dims.get('leg_stat')
    if legal_dim:
        interactive_data["legal_status"] = {
            "values": legal_dim.get('codes', []),
            "labels": legal_dim.get('labels', []),
            "multiple": False,
            "default": "PER_SUSP"
        }

    resp.set_interactive_data(interactive_data)

    try:
        time_params = [int(t) for t in request.args.getlist('time')]
        geo_params = request.args.getlist('geo')
        unit = request.args.get('unit', "Number")
        legal_params = request.args.get('legal_status', "PER_SUSP")

        filters = {}
        if time_params:
            filters['time'] = time_params
        if geo_params:
            filters['geo'] = geo_params
        if legal_params:
            filters['leg_stat'] = legal_params or "PER_SUSP"

        if not filters:
            filters = None

        df = loader.load_dataset('crim_just_bri', filters=filters)
        df = df[(df["sex"] == "Total") & (df["unit"] == unit)].dropna(subset=["value"])

        resp.set_chart_data(df[["time", "geo", "geo_code", "value"]].to_dict(orient="records"))

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()


@question3_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_just_bri')
    resp.set_interactive_data({
        "time": {"values": dims['time']['codes'], "multiple": False, "default": None},
        "geo": {"values": dims.get('geo', {}).get('codes', []), "labels": dims.get('geo', {}).get('labels', []), "multiple": False, "default": "DE"},
        "unit": {"values": ["Number", "Per hundred thousand inhabitants"], "multiple": False, "default": "Number"}
    })

    try:
        geo_params = request.args.getlist('geo')
        time_params = request.args.getlist('time')

        # Exactly one geo
        geo = geo_params[0] if geo_params else "DE"
        if len(geo_params) > 1:
            raise ValueError("Only one country (geo) allowed")

        # Exactly one year or default to latest
        year = int(time_params[0]) if time_params else None
        if len(time_params) > 1:
            raise ValueError("Only one year (time) allowed")

        filters = {"geo": [geo]}
        if year:
            filters["time"] = [year]

        df = loader.load_dataset('crim_just_bri', filters=filters).dropna(subset=["value"])
        if df.empty:
            raise ValueError("No data found for selected country/year")

        df["time"] = pd.to_numeric(df["time"])
        df = df[df["geo_code"] == geo]

        # Determine year if not provided
        latest_year = int(df["time"].max()) if year is None else year
        df = df[df["time"] == latest_year]

        def get_val(leg, sex):
            row = df[(df["leg_stat"] == leg) & (df["sex"] == sex)]
            return float(row["value"].iloc[0]) if not row.empty else 0.0

        suspected_m = get_val("Suspected person", "Males")
        suspected_f = get_val("Suspected person", "Females")
        convicted_m = get_val("Convicted person", "Males")
        convicted_f = get_val("Convicted person", "Females")

        suspected_total = suspected_m + suspected_f
        convicted_total = convicted_m + convicted_f
        non_conv_m = suspected_m - convicted_m
        non_conv_f = suspected_f - convicted_f
        non_conv_total = non_conv_m + non_conv_f

        labels = [
            geo, "Suspected", "Convicted Total", "Not Convicted Total",
            "Convicted Males", "Convicted Females", "Not Convicted Males", "Not Convicted Females"
        ]
        nodes = [{"name": lbl} for lbl in labels]
        links = [
            {"source": geo, "target": "Suspected", "value": suspected_total},
            {"source": "Suspected", "target": "Convicted Total", "value": convicted_total},
            {"source": "Suspected", "target": "Not Convicted Total", "value": non_conv_total},
            {"source": "Convicted Total", "target": "Convicted Males", "value": convicted_m},
            {"source": "Convicted Total", "target": "Convicted Females", "value": convicted_f},
            {"source": "Not Convicted Total", "target": "Not Convicted Males", "value": non_conv_m},
            {"source": "Not Convicted Total", "target": "Not Convicted Females", "value": non_conv_f},
        ]

        resp.set_chart_data({"nodes": nodes, "links": links, "year": latest_year})
    except Exception as e:
        resp.set_error(f"Failed to build Sankey data: {e}")

    return resp.to_json()




@question3_bp.route('/chart5', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart5():
    loader = EurostatDataLoader()
    resp = ChartResponse(chart_data=None)

    dims = loader.get_dimensions('crim_just_bri')
    interactive_data = {
        "time": {
            "values": dims['time']['codes'],
            "multiple": False,
            "default": None
        }
    }

    legal_dim = dims.get('leg_stat')
    if legal_dim:
        interactive_data["legal_status"] = {
            "values": legal_dim.get('codes', []),
            "labels": legal_dim.get('labels', []),
            "multiple": False,
            "default": "PER_SUSP"
        }

    resp.set_interactive_data(interactive_data)

    try:
        time_params = [int(t) for t in request.args.getlist('time')]
        geo_params = request.args.getlist('geo')
        unit = request.args.get('unit', "Number")
        legal_params = request.args.get('legal_status') or "PER_SUSP"

        filters = {}
        if time_params:
            filters['time'] = time_params
        if geo_params:
            filters['geo'] = geo_params
        if legal_params:
            filters['leg_stat'] = legal_params

        if not filters:
            filters = None

        df = loader.load_dataset('crim_just_bri', filters=filters)
        df = df[(df["sex"] == "Total") & (df["unit"] == unit)].dropna(subset=["value"])

        resp.set_chart_data(df[["time", "geo", "geo_code", "value"]].to_dict(orient="records"))

    except Exception as e:
        resp.set_error(f"Failed to build chart data: {e}")

    return resp.to_json()