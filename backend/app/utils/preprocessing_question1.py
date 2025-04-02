# Prepare chart 1 data
def process_crime_data_chart1(df):
    merge_categories = {"Sexual exploitation", "Sexual violence", "Sexual assault"}
    df['iccs_merged'] = df['iccs'].apply(
        lambda x: "Sexual crimes" if x in merge_categories else x)
    
    pivot = df.groupby(['geo', 'iccs_merged'])['value'].sum().unstack(fill_value=0)
    most_frequent_crime = df.groupby('iccs_merged')['value'].sum().idxmax()

    return {
        "pivot_data": pivot.to_dict(),
        "most_frequent_crime": most_frequent_crime
    }


# Prepare chart 3 data
def process_crime_data_chart3(df):
    merge_categories = {"Sexual exploitation", "Sexual violence", "Sexual assault"}
    df['iccs_merged'] = df['iccs'].apply(
    lambda x: "Sexual crimes" if x in merge_categories else x
)
    
    crime_by_category = df.groupby('iccs_merged')['value'].sum().fillna(0)

    return {
        "categories": crime_by_category.index.tolist(),
        "values": crime_by_category.tolist()
    }


# Prepare chart 4 data and calculate crime rate per 100ks
def process_crime_data_chart4(df_pop, df_crime, latest_year):
    df_pop = (
        df_pop.dropna(subset=['value'])
        .rename(columns={'time': 'year', 'value': 'population'})
        .assign(year=lambda d: d['year'].astype(int))
    )

    df_crime = (
        df_crime.dropna(subset=['value'])
        .rename(columns={'time': 'year', 'value': 'crime_count'})
        .assign(year=lambda d: d['year'].astype(int))
        .groupby(['geo_code', 'year'], as_index=False)['crime_count'].sum()
    )

    df_pop = df_pop[df_pop['year'] == latest_year][['geo_code', 'population']]
    df_crime = df_crime[df_crime['year'] == latest_year][['geo_code', 'crime_count']]

    if df_pop.empty or df_crime.empty:
        return []

    df = df_crime.merge(df_pop, on='geo_code', how='inner')
    df['crime_rate_per_100k'] = (df['crime_count'] / df['population']) * 100000

    return (
        df.sort_values('crime_rate_per_100k', ascending=False)
        [['geo_code', 'crime_rate_per_100k']]
        .rename(columns={'geo_code': 'geo'})
        .to_dict(orient='records')
    )