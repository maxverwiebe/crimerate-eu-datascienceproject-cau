from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd



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



@question5_bp.route('/chart2', methods=['GET'])
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
