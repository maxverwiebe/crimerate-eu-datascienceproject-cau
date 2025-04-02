def preprocessing_police_data_for_chart1(df_police):
    df_police = (
        df_police.query("isco08=='Police officers' and sex=='Total'")
                 .pivot_table(index=['geo','time', 'geo_code'], columns='unit', values='value')
                 .rename(columns={'Per hundred thousand inhabitants':'police_per_100k'})
                 .reset_index().dropna(subset=['police_per_100k'])
    )
    return df_police


def preprocessing_crime_data_for_chart1(df_crime, crime_type):
    df_crime = (
        df_crime.query("iccs==@crime_type")
                .pivot_table(index=['geo','time', 'geo_code'], columns='unit', values='value')
                .rename(columns={'Per hundred thousand inhabitants':'crime_per_100k'})
                .reset_index().dropna(subset=['crime_per_100k'])
    )
    return df_crime


def filter_and_format_data_for_chart1(df_police, df_crime, geo_param):
    geos = geo_param.split(',') if geo_param else []
    
    if geos:
        df_police = df_police[df_police['geo_code'].isin(geos)]
        df_crime = df_crime[df_crime['geo_code'].isin(geos)]
    
    merged = df_police.merge(df_crime, on=['geo', 'time'], how='inner').dropna()
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
    
    return times, series


def preprocess_and_format_data_for_chart2(df_police, df_crime, year, crime_type):
    df_police = (
        df_police.query("isco08=='Police officers' and sex=='Total'")
        .pivot_table(index=['geo','time'], columns='unit', values='value')
        .rename(columns={'Number':'police_total','Per hundred thousand inhabitants':'police_per_100k'})
        .reset_index()
    ).query("time==@year").dropna()

    df_crime_filtered = df_crime.query("time==@year")
    
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


    merged = df_total.merge(df_police, on=['geo','time'], how='inner').dropna()

    return merged