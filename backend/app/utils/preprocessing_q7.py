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