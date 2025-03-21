def preprocess_q7(df):   
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

    df = df[df['age'].isin(age_categories)]
    geo_values_to_remove = [
        'European Union (EU6-1958, EU9-1973, EU10-1981, EU12-1986, EU15-1995, EU25-2004, EU27-2007, EU28-2013, EU27-2020)',
        'European Union - 28 countries (2013-2020)',
        'European Union - 27 countries (2007-2013)',
        'Euro area (EA11-1999, EA12-2001, EA13-2007, EA15-2008, EA16-2009, EA17-2011, EA18-2014, EA19-2015, EA20-2023)',
        'Euro area – 20 countries (from 2023)',
        'Euro area - 19 countries  (2015-2022)',
        'Euro area - 18 countries (2014)'
    ]
    df = df[~df['geo'].isin(geo_values_to_remove)]

    return df

def preprocess_q6_chart2(df):
    df = df.dropna()
    df = df[df['age'] == '16 years or over']
    df = df[df['lev_limit'] == 'Total']
    df = df[['geo', 'time', 'sex', 'value']]
    
    geo_values_to_remove = [
    'European Union (EU6-1958, EU9-1973, EU10-1981, EU12-1986, EU15-1995, EU25-2004, EU27-2007, EU28-2013, EU27-2020)',
    'European Union - 28 countries (2013-2020)',
    'European Union - 27 countries (2007-2013)',
    'Euro area (EA11-1999, EA12-2001, EA13-2007, EA15-2008, EA16-2009, EA17-2011, EA18-2014, EA19-2015, EA20-2023)',
    'Euro area – 20 countries (from 2023)',
    'Euro area - 19 countries  (2015-2022)',
    'Euro area - 18 countries (2014)'
]
    df = df[~df['geo'].isin(geo_values_to_remove)]    

    return df  

def preprocess_q6_chart1(df):
    df = df.dropna()
    df = df[['geo', 'time', 'sex', 'leg_stat','value']]
    return df

def preprocess_q3_chart1(df):
    df = df.dropna()
    df = df[['geo', 'time', 'sex', 'leg_stat', 'unit', 'value']]
    df = df[df['sex'] == 'Total']
    return df 


def prerocess_q3_chart2(df):
    # 1. Dein DataFrame vorbereiten
    df = df.dropna()
    df = df[['geo', 'time', 'sex', 'leg_stat', 'unit', 'value']]
    filtered_df = df[df['sex'] != 'Total']
    grouped_df = filtered_df.groupby(['geo', 'time', 'leg_stat', 'sex', 'unit'])['value'].sum().reset_index()
    total_for_leg_stat = grouped_df.groupby(['geo', 'time', 'leg_stat', 'unit'])['value'].transform('sum')
    grouped_df['percentage'] = (grouped_df['value'] / total_for_leg_stat) * 100
    return grouped_df