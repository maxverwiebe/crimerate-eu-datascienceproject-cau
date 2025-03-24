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

    time_param = request.args.get('time', default="2020")
    iccs_param = request.args.get('iccs', default="Intentional homicide")
    year = str(time_param)

    df1 = loader.load_dataset('tps00001')
    df2 = loader.load_dataset('tec00115')
    df3 = loader.load_dataset('crim_off_cat')

    pop = df1[df1['time'] == year][['geo', 'value', 'geo_code']].drop_duplicates()
    pop.columns = ['geo', 'population', 'geo_code']

    gdp = df2[df2['time'] == year][['geo', 'value']].drop_duplicates(subset=['geo']).dropna()
    gdp.columns = ['geo', 'gdp_growth']

    crime = df3[(df3['time'] == year) & (df3['iccs'] == iccs_param)][['geo', 'value']].drop_duplicates(subset=['geo'])
    crime.columns = ['geo', 'crime_rate']

    merged_df = pop.merge(gdp, on='geo').merge(crime, on='geo')

    merged_df['crime_rate_per_100k'] = (merged_df['crime_rate'] / merged_df['population']) * 100000

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
def chart2():
    loader = EurostatDataLoader(cache_expiry=1800)
    geo_param = request.args.get('geo', default="DE")

    df_pop = loader.load_dataset('tps00001') 
    df_crime = loader.load_dataset('crim_off_cat')
    df_gdp = loader.load_dataset('tec00115')

    geo_codes = df_crime['geo_code'].unique().tolist()
    geo_labels = loader.get_dimensions('crim_off_cat')['geo']['labels']

    pop = df_pop[df_pop['geo_code'] == geo_param][['time', 'value']].dropna()
    pop.columns = ['year', 'population']
    pop['year'] = pop['year'].astype(int)

    crime = df_crime[df_crime['geo_code'] == geo_param][['time', 'value']].dropna()
    crime.columns = ['year', 'crime_count']
    crime['year'] = crime['year'].astype(int)

    crime = crime.groupby('year', as_index=False)['crime_count'].sum()
    crime.rename(columns={'crime_count': 'total_crime'}, inplace=True)

    gdp = df_gdp[df_gdp['geo_code'] == geo_param][['time', 'value']].dropna()
    gdp.columns = ['year', 'gdp_growth']
    gdp['year'] = gdp['year'].astype(int)
    gdp = gdp.groupby('year', as_index=False)['gdp_growth'].mean()

    merged_df = crime.merge(pop, on='year').merge(gdp, on='year')

    merged_df['crime_rate_per_100k'] = (merged_df['total_crime'] / merged_df['population']) * 100000

    merged_df.sort_values('year', inplace=True)
    merged_df['population_change_pct'] = merged_df['population'].pct_change() * 100
    merged_df['gdp_growth_change_pct'] = merged_df['gdp_growth']
    merged_df['total_crime_change_pct'] = merged_df['total_crime'].pct_change() * 100

    merged_df = merged_df.dropna()

    final_df = merged_df[[
        'year',
        'total_crime_change_pct',
        'population_change_pct',
        'gdp_growth_change_pct'
    ]]

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



@question4_bp.route('/chart3', methods=['GET'])
def chart3():
    loader = EurostatDataLoader(cache_expiry=1800)

    year = request.args.get('time', default="2020")
    iccs = request.args.get('iccs', default="Intentional homicide")
    geo_codes = request.args.getlist('geo')

    df_pop = loader.load_dataset('tps00001')
    df_gdp = loader.load_dataset('tec00115')
    df_crime = loader.load_dataset('crim_off_cat')

    pop = (
        df_pop[df_pop['time'] == year]
        .groupby(['geo', 'geo_code'], as_index=False)['value']
        .mean()
        .rename(columns={'geo': 'country', 'value': 'population'})
    )

    gdp = (
        df_gdp[df_gdp['time'] == year]
        .groupby(['geo', 'geo_code'], as_index=False)['value']
        .mean()
        .rename(columns={'geo': 'country', 'value': 'gdp_growth'})
    )

    crime = (
        df_crime[(df_crime['time'] == year) & (df_crime['iccs'] == iccs)]
        .groupby(['geo', 'geo_code'], as_index=False)['value']
        .mean()
        .rename(columns={'geo': 'country', 'value': 'crime_rate'})
    )

    merged = pop.merge(gdp, on='geo_code').merge(crime, on='geo_code')
    merged['crime_rate_per_100k'] = merged['crime_rate'] / merged['population'] * 100000

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
