
def preprocess_and_merge_data_chart1(pop_df, gdp_df, crime_df, year, iccs_param):
    pop = pop_df[pop_df['time'] == year][['geo', 'value', 'geo_code']].drop_duplicates()
    pop.columns = ['geo', 'population', 'geo_code']
    
    gdp = gdp_df[gdp_df['time'] == year][['geo', 'value']].drop_duplicates(subset=['geo']).dropna()
    gdp.columns = ['geo', 'gdp_growth']
    
    crime = crime_df[(crime_df['time'] == year) & (crime_df['iccs'] == iccs_param)][['geo', 'value']]
    crime = crime.drop_duplicates(subset=['geo'])
    crime.columns = ['geo', 'crime_rate']
    
    merged_df = pop.merge(gdp, on='geo', how='inner').merge(crime, on='geo', how='inner')
    merged_df['crime_rate_per_100k'] = (merged_df['crime_rate'] / merged_df['population']) * 100000
    
    return merged_df.dropna(subset=['crime_rate_per_100k', 'gdp_growth'])


def preprocess_and_merge_data_chart2(df_pop, df_gdp, df_crime, geo_param):
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
    return final_df


def preprocess_and_merge_data_chart3(df_pop, df_gdp, df_crime, year, iccs):
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
    return merged