def preprocess_q7(df):   
    """ Cleans and filters the dataset by removing 
        missing values,selecting relevant columns,
        and excluding specific geographical regions. """
    
    df = df.dropna()
    df = df[df['sex'] == 'Total']
    df = df[['geo', 'time', 'age', 'value']]

    age_categories = [
        'From 16 to 24 years',
        'From 25 to 34 years',
        'From 35 to 44 years',
        'From 45 to 54 years',
        'From 55 to 64 years',
        '65 years or over'
    ]
    geo_values_to_remove = [
        'European Union (EU6-1958, EU9-1973, EU10-1981,'
        'EU12-1986, EU15-1995, EU25-2004, EU27-2007, EU28-2013, EU27-2020)',
        'European Union - 28 countries (2013-2020)',
        'European Union - 27 countries (2007-2013)',
        'Euro area (EA11-1999, EA12-2001, EA13-2007, EA15-2008, '
        'EA16-2009, EA17-2011, EA18-2014, EA19-2015, EA20-2023)',
        'Euro area – 20 countries (from 2023)',
        'Euro area - 19 countries  (2015-2022)',
        'Euro area - 18 countries (2014)'
    ]
    df = df[~df['geo'].isin(geo_values_to_remove)]
    df = df[df['age'].isin(age_categories)]
    
    return df


def filter_geo_data(dims):
    """ Filters the 'geo' dimension to remove 
        specific geographical codes and labels. """
    
    if 'geo' not in dims:
        return [], [] 

    filter_geo_codes = dims['geo']['codes']
    filter_geo_labels = dims['geo']['labels']

    exclude_codes = {'EU', 'EU28', 'EU27_2007', 'EA', 'EA20', 'EA19', 'EA18'}

    exclude_labels = {
        'European Union (EU6-1958, EU9-1973, EU10-1981,'
        'EU12-1986, EU15-1995, EU25-2004, EU27-2007, '
        'EU28-2013, EU27-2020)',
        'European Union - 28 countries (2013-2020)',
        'European Union - 27 countries (2007-2013)',
        'Euro area (EA11-1999, EA12-2001, EA13-2007,'
        'EA15-2008, EA16-2009, EA17-2011, EA18-2014, EA19-2015, EA20-2023)',
        'Euro area – 20 countries (from 2023)',
        'Euro area - 19 countries  (2015-2022)',
        'Euro area - 18 countries (2014)',
    }

    filtered_geo = [
        (code, label) for code, label in zip(filter_geo_codes, filter_geo_labels)
        if code not in exclude_codes and label not in exclude_labels
    ]

    if filtered_geo:
        filter_geo_codes, filter_geo_labels = zip(*filtered_geo)
        return list(filter_geo_codes), list(filter_geo_labels)
    else:
        return [], []  


def structure_chart_data(df):
    """ Structures the dataset into a nested format with a
    ggregated values and percentage calculations. """

    aggregated = {}
    for record in df.to_dict(orient="records"):
        geo = record["geo"]
        age = record["age"]
        time = record["time"]
        value = record["value"]

        key = (geo, age, time)
        aggregated[key] = aggregated.get(key, 0) + value

    geo_time_totals = {}
    for (geo, age, time), value in aggregated.items():
        key = (geo, time)
        geo_time_totals[key] = geo_time_totals.get(key, 0) + value

    nested_data = {}
    for (geo, age, time), value in aggregated.items():
        if geo not in nested_data:
            nested_data[geo] = {}
        if time not in nested_data[geo]:
            nested_data[geo][time] = {}
        total = geo_time_totals.get((geo, time), 0)
        percentage = round((value / total * 100), 2) if total > 0 else 0
        nested_data[geo][time][age] = {"value": value, "percentage": percentage}
    
    return nested_data
