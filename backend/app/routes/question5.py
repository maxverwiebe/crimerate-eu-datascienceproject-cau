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

    time_param = request.args.get('time', default="2020")  # Jahr aus GET-Parameter
    year = str(time_param)

    # 🔹 Lade relevante Datensätze
    df_police = loader.load_dataset('crim_just_job')  # Polizei-, Gerichts- & Justizpersonal
    df_crime = loader.load_dataset('crim_off_cat')  # Kriminalitätsraten

    # 🔹 Polizeidaten verarbeiten (nur "Police officers", sex = "Total")
    df_police_filtered = df_police[(df_police['isco08'] == 'Police officers') & (df_police['sex'] == 'Total')]
    df_police_pivot = df_police_filtered.pivot_table(index=['geo', 'time'], columns='unit', values='value', aggfunc='sum').reset_index()
    df_police_pivot.columns = ['geo', 'time',  'police_total','police_per_100k']
    df_police_pivot = df_police_pivot[df_police_pivot['time'] == year].dropna()

    # 🔹 Kriminalitätsdaten verarbeiten (Total & per 100k)
    df_crime_filtered = df_crime[df_crime['time'] == year][['geo', 'iccs', 'value', 'unit']]

    df_crime_total = df_crime_filtered[df_crime_filtered['unit'] == 'Number'][['geo', 'iccs', 'value']]
    df_crime_per_100k = df_crime_filtered[df_crime_filtered['unit'] == 'Per hundred thousand inhabitants'][['geo', 'iccs', 'value']]

    df_crime_total.columns = ['geo', 'iccs', 'crime_total']
    df_crime_per_100k.columns = ['geo', 'iccs', 'crime_per_100k']

    # 🔹 Mergen der Kriminalitätsdaten
    df_crime_final = pd.merge(df_crime_total, df_crime_per_100k, on=['geo', 'iccs'], how='outer').dropna()

    # 🔹 Gesamtkriminalität berechnen
    df_total_crime = df_crime_final.groupby(['geo']).agg({'crime_total': 'sum', 'crime_per_100k': 'sum'}).reset_index()
    df_total_crime['iccs'] = 'Total Crimes'
    
    df_crime_final = pd.concat([df_crime_final, df_total_crime], ignore_index=True)

    # 🔹 Merge mit Polizeidaten
    merged_df = df_crime_final.merge(df_police_pivot, on='geo', how='left').dropna()

    # 🔹 JSON-Response
    response_json = {
        "chart_data": merged_df.to_dict(orient='records'),
        "interactive_data": {
            "time": {
                "values": df_crime['time'].unique().tolist(),
                "multiple": False,
                "default": time_param
            },
            "crime_types": {
                "values": df_crime['iccs'].unique().tolist(),
                "multiple": False,
                "default": "Total Crimes"
            }
        }
    }

    return jsonify(response_json)

