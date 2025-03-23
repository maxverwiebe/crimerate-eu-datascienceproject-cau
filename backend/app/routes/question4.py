from flask import Blueprint, jsonify, request
from .es_dataloader import EurostatDataLoader
import pandas as pd

question4_bp = Blueprint('question4', __name__)

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

@question4_bp.route('/chart1', methods=['GET'])
def chart1():
    loader = EurostatDataLoader(cache_expiry=1800)

    time_param = request.args.get('time', default="2020")  # GET parameter
    iccs_param = request.args.get('iccs', default="Intentional homicide")  # GET parameter
    year = str(time_param)

    df1 = loader.load_dataset('tps00001')  # (Bevölkerungszahl - 2013 - 2024)
    df2 = loader.load_dataset('tec00115')  # (BIP-Wachstum - 2013 - 2024)
    df3 = loader.load_dataset('crim_off_cat')  # (Kriminalitätsrate - 2008 - 2022)

    # Daten der Bevölkerung filtern und Duplikate entfernen
    pop = df1[df1['time'] == year][['geo', 'value', 'geo_code']].drop_duplicates()
    pop.columns = ['geo', 'population', 'geo_code']

    # Daten des BIP-Wachstums eindeutig filtern, NaNs entfernen
    gdp = df2[df2['time'] == year][['geo', 'value']].drop_duplicates(subset=['geo']).dropna()
    gdp.columns = ['geo', 'gdp_growth']

    # Kriminalitätsdaten filtern und Duplikate entfernen
    crime = df3[(df3['time'] == year) & (df3['iccs'] == iccs_param)][['geo', 'value']].drop_duplicates(subset=['geo'])
    crime.columns = ['geo', 'crime_rate']

    # Merge der DataFrames zu einem einzigen DataFrame
    merged_df = pop.merge(gdp, on='geo').merge(crime, on='geo')

    # Kriminalitätsrate pro 100.000 Einwohner berechnen
    merged_df['crime_rate_per_100k'] = (merged_df['crime_rate'] / merged_df['population']) * 100000

    # Filter rows with NaN values
    filtered_df = merged_df.dropna(subset=['crime_rate_per_100k', 'gdp_growth'])

    resp = ChartResponse(chart_data=filtered_df.to_dict(orient='records'), interactive_data={
        "time": {
            "values": df1['time'].unique().tolist(),
            "multiple": False,
            "default": time_param
        },
        "iccs": {
            "values": df3['iccs'].unique().tolist(),
            "multiple": False,
            "default": iccs_param
        }
    })

    return resp.to_json()

@question4_bp.route('/chart2', methods=['GET'])
def linechart():
    loader = EurostatDataLoader(cache_expiry=1800)
    geo_param = request.args.get('geo', default="DE")

    df_pop = loader.load_dataset('tps00001')  # Bevölkerung
    df_crime = loader.load_dataset('crim_off_cat')  # Kriminalität
    df_gdp = loader.load_dataset('tec00115')  # BIP-Wachstum

    pop = df_pop[df_pop['geo_code'] == geo_param][['time', 'value']].dropna()
    pop.columns = ['year', 'population']
    pop['year'] = pop['year'].astype(int)

    crime = df_crime[df_crime['geo_code'] == geo_param][['time', 'value']].dropna()
    crime.columns = ['year', 'crime_rate']
    crime['year'] = crime['year'].astype(int)

    gdp = df_gdp[df_gdp['geo_code'] == geo_param][['time', 'value']].dropna()
    gdp.columns = ['year', 'gdp_growth']
    gdp['year'] = gdp['year'].astype(int)

    # Merge DataFrames
    merged_df = crime.merge(pop, on='year').merge(gdp, on='year')

    # Kriminalitätsrate berechnen
    merged_df['crime_rate_per_100k'] = (merged_df['crime_rate'] / merged_df['population']) * 100000

    # Median pro Jahr, falls mehrere Einträge vorhanden sind
    median_crime = merged_df.groupby('year')['crime_rate_per_100k'].median().reset_index()
    final_df = median_crime.merge(pop, on='year').merge(gdp, on='year')
    final_df.columns = ['year', 'median_crime_rate', 'population', 'gdp_growth']

    response = ChartResponse(
        chart_data=final_df.to_dict(orient='records'),
        interactive_data={
            "geo": {
                "values": df_pop['geo_code'].unique().tolist(),
                "multiple": False,
                "default": geo_param
            }
        }
    )

    return response.to_json()

@question4_bp.route('/chart3', methods=['GET'])
def chart3():
    loader = EurostatDataLoader(cache_expiry=1800)

    year = request.args.get('time', default="2020")
    iccs = request.args.get('iccs', default="Intentional homicide")
    geo_codes = request.args.getlist('geo')

    df_pop = loader.load_dataset('tps00001')
    df_gdp = loader.load_dataset('tec00115')
    df_crime = loader.load_dataset('crim_off_cat')

    # Bevölkerung pro Land im Jahr (Mittelwert)
    pop = (
        df_pop[df_pop['time'] == year]
        .groupby(['geo', 'geo_code'], as_index=False)['value']
        .mean()
        .rename(columns={'geo': 'country', 'value': 'population'})
    )

    # BIP pro Land im Jahr (Mittelwert)
    gdp = (
        df_gdp[df_gdp['time'] == year]
        .groupby(['geo', 'geo_code'], as_index=False)['value']
        .mean()
        .rename(columns={'geo': 'country', 'value': 'gdp_growth'})
    )

    # Kriminalität pro Land & ICCS im Jahr (Mittelwert)
    crime = (
        df_crime[(df_crime['time'] == year) & (df_crime['iccs'] == iccs)]
        .groupby(['geo', 'geo_code'], as_index=False)['value']
        .mean()
        .rename(columns={'geo': 'country', 'value': 'crime_rate'})
    )

    # Merge & Berechnung
    merged = pop.merge(gdp, on='geo_code').merge(crime, on='geo_code')
    merged['crime_rate_per_100k'] = merged['crime_rate'] / merged['population'] * 100000

    # Nur gewünschte Länder
    all_codes = merged['geo_code'].unique().tolist()
    valid_codes = [code for code in geo_codes if code in all_codes]
    filtered = merged[merged['geo_code'].isin(valid_codes)]

    resp = ChartResponse(
        chart_data=filtered[['country','geo_code','population','gdp_growth','crime_rate_per_100k']]
        .dropna()
        .to_dict(orient='records'),
        interactive_data={
            "time": {"values": sorted(df_pop['time'].unique().tolist()), "multiple": False, "default": year},
            "iccs": {"values": sorted(df_crime['iccs'].unique().tolist()), "multiple": False, "default": iccs},
            "geo": {"values": sorted(all_codes), "multiple": True, "default": None}
        }
    )

    return resp.to_json()
