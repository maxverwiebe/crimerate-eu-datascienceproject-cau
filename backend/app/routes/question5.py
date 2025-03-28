from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd
from app import cache



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
@cache.cached(timeout=1800, query_string=True)
def chart1():
    loader = EurostatDataLoader(cache_expiry=1800)
    geo_param = request.args.get('geo')
    if geo_param:
        geos = geo_param.split(',')  # split manually
    else:
        geos = []
    crime_type = request.args.get('iccs', "Intentional homicide")

    df_police = loader.load_dataset('crim_just_job')
    df_crime = loader.load_dataset('crim_off_cat')

    df_police = (
        df_police.query("isco08=='Police officers' and sex=='Total'")
                 .pivot_table(index=['geo','time', 'geo_code'], columns='unit', values='value')
                 .rename(columns={'Per hundred thousand inhabitants':'police_per_100k'})
                 .reset_index().dropna(subset=['police_per_100k'])
    )
    df_crime = (
        df_crime.query("iccs==@crime_type")
                .pivot_table(index=['geo','time', 'geo_code'], columns='unit', values='value')
                .rename(columns={'Per hundred thousand inhabitants':'crime_per_100k'})
                .reset_index().dropna(subset=['crime_per_100k'])
    )

    # Filter by geo codes if provided
    if geos:
        df_police = df_police[df_police['geo_code'].isin(geos)]
        df_crime = df_crime[df_crime['geo_code'].isin(geos)]

    merged = df_police.merge(df_crime, on=['geo','time'], how='inner').dropna()
    merged['time'] = merged['time'].astype(int)

    times = sorted(merged['time'].unique().tolist())
    series = [
        {
            "name": geo,
            "data": merged[merged.geo == geo]
                      .sort_values('time')
                      .apply(lambda r: [r.time, r.police_per_100k, r.crime_per_100k], axis=1)
                      .tolist()
        }
        for geo in sorted(merged['geo'].unique())
    ]

    dims = loader.get_dimensions('crim_off_cat')
    interactive_data = {
        "geo": {"labels": dims['geo']['labels'],"values": dims['geo']['codes'], "multiple": True, "default": None},
        "iccs": {"values": dims['iccs']['labels'], "multiple": False, "default": crime_type}
    }

    return jsonify({"chart_data": {"times": times, "series": series}, "interactive_data": interactive_data})



@question5_bp.route('/chart2', methods=['GET'])
@cache.cached(timeout=1800, query_string=True)
def chart2():
    loader = EurostatDataLoader(cache_expiry=1800)

    year = request.args.get('time', "2020")
    crime_type = request.args.get('iccs', "Intentional homicide") # ALL CRIMES DOES NOT MAKE SENSE HERE
    geo_filter = request.args.get('geo', "")

    df_police = loader.load_dataset('crim_just_job')
    df_crime = loader.load_dataset('crim_off_cat')

    av_times = sorted(df_police['time'].unique().tolist())

    df_police = (
        df_police.query("isco08=='Police officers' and sex=='Total'")
        .pivot_table(index=['geo','time'], columns='unit', values='value')
        .rename(columns={'Number':'police_total','Per hundred thousand inhabitants':'police_per_100k'})
        .reset_index()
    ).query("time==@year").dropna()

    df_crime_filtered = df_crime.query("time==@year")
    
    if crime_type not in df_crime_filtered['iccs'].unique():
        crime_type = "Total Crimes"
    
    # Create pivot table with crime statistics
    df_total = (
        df_crime_filtered
        .pivot_table(index=['geo','time','iccs'], columns='unit', values='value', aggfunc='sum')
        .reset_index()
    )
    
    # Rename columns if they exist
    if 'Number' in df_total.columns:
        df_total = df_total.rename(columns={'Number':'crime_total'})
    if 'Per hundred thousand inhabitants' in df_total.columns:
        df_total = df_total.rename(columns={'Per hundred thousand inhabitants':'crime_per_100k'})
    
    # Filter for the selected crime type and handle missing values
    df_total = df_total.query("iccs==@crime_type").dropna(subset=['geo', 'time'])

    if geo_filter:
        df_total = df_total[df_total['geo'].isin(geo_filter.split(','))]

    merged = df_total.merge(df_police, on=['geo','time'], how='inner').dropna()

    dims = loader.get_dimensions('crim_off_cat')
    return jsonify({
        "chart_data": merged.to_dict(orient='records'),
        "interactive_data": {
            "time": {"values": av_times, "multiple": False, "default": year},
            "iccs": {"values": sorted(df_crime['iccs'].unique().tolist()), "multiple": False, "default": crime_type},
        }
    })
