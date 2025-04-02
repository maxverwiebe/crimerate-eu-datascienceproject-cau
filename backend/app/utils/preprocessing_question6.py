import pandas as pd


def preprocessing_data_chart1(df):
    df = df.dropna()
    df['geo'] = df['geo'].replace('Northern Ireland (UK) (NUTS 2021)', 'Northern Ireland')
    df = df[['geo', 'time', 'sex', 'leg_stat', 'unit', 'value']]
    return df


# This function aggregates the DataFrame into a nested dictionary structure
def aggregate_dataframe(df: pd.DataFrame) -> dict:
    aggregated = {}
    
    for record in df.to_dict(orient="records"):
        geo = record["geo"]
        time = record["time"]
        sex = record["sex"]
        leg_stat = record["leg_stat"]  # z.B. Suspected, Prosecuted, Convicted
        unit = record["unit"]          # Number oder Per hundred thousand inhabitants
        value = record["value"]

        # Struktur aufbauen
        if geo not in aggregated:
            aggregated[geo] = {}
        if time not in aggregated[geo]:
            aggregated[geo][time] = {}
        if leg_stat not in aggregated[geo][time]:
            aggregated[geo][time][leg_stat] = {
                "Males": {"Number": 0, "Per100k": 0},
                "Females": {"Number": 0, "Per100k": 0},
                "Total": {"Number": 0, "Per100k": 0}
            }
    
        unit_key = "Number" if unit == "Number" else "Per100k"
        aggregated[geo][time][leg_stat][sex][unit_key] += value
    
    return aggregated