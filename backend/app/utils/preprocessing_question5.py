"""
Helper functions for preprocessing and preparing data for question 5
(some parts are modified or generated with AI).
"""


# Filters and formats police officer data per 100k inhabitants
def preprocessing_police_data_for_chart1(df_police): # modified with AI
    df_police = (
        df_police.query("isco08=='Police officers' and sex=='Total'")
                 .pivot_table(index=['geo','time', 'geo_code'], columns='unit', values='value')
                 .rename(columns={'Per hundred thousand inhabitants':'police_per_100k'})
                 .reset_index().dropna(subset=['police_per_100k']) 
    )
    return df_police


# Filters and formats crime data per 100k inhabitants.
def preprocessing_crime_data_for_chart1(df_crime, crime_type): # modiefied with AI
    df_crime = (
        df_crime.query("iccs==@crime_type")
                .pivot_table(index=['geo','time', 'geo_code'], columns='unit', values='value')
                .rename(columns={'Per hundred thousand inhabitants':'crime_per_100k'})
                .reset_index().dropna(subset=['crime_per_100k']) 
    )
    return df_crime


# Merges police and crime data based on selected locations.
def filter_and_format_data_for_chart1(df_police, df_crime, geo_param): # partially generated with AI
    geos = geo_param.split(',') if geo_param else []
    
    if geos:
        df_police = df_police[df_police['geo_code'].isin(geos)]
        df_crime = df_crime[df_crime['geo_code'].isin(geos)]
    
    merged = df_police.merge(df_crime, on=['geo', 'time'], how='inner').dropna() # modified with AI
    merged['time'] = merged['time'].astype(int)
    
    times = sorted(merged['time'].unique().tolist())
    series = [
        {
            "name": geo,
            "data": merged[merged.geo == geo]
                      .sort_values('time')
                      .apply(lambda r: [r.time, r.police_per_100k, r.crime_per_100k], axis=1)
                      .tolist() # modified with AI
        }
        for geo in sorted(merged['geo'].unique())
    ]
    
    return times, series


# Merges police and crime data for a given year and crime type.
def preprocess_and_format_data_for_chart2(df_police, df_crime, year, crime_type): 
    df_police = (
        df_police.query("isco08=='Police officers' and sex=='Total'")
        .pivot_table(index=['geo','time'], columns='unit', values='value')
        .rename(columns={'Number':'police_total','Per hundred thousand inhabitants':'police_per_100k'})
        .reset_index() 
    ).query("time==@year").dropna() # modified with AI

    df_crime_filtered = df_crime.query("time==@year")
    
    df_total = (
        df_crime_filtered
        .pivot_table(index=['geo','time','iccs'], columns='unit', values='value', aggfunc='sum')
        .reset_index() # modified with AI
    )
   
    if 'Number' in df_total.columns:
        df_total = df_total.rename(columns={'Number':'crime_total'}) 
    if 'Per hundred thousand inhabitants' in df_total.columns:
        df_total = df_total.rename(columns={'Per hundred thousand inhabitants':'crime_per_100k'})


    df_total = df_total.query("iccs==@crime_type").dropna(subset=['geo', 'time']) # modified with AI


    merged = df_total.merge(df_police, on=['geo','time'], how='inner').dropna() # modified with AI

    return merged