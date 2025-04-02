"""
Helper functions for preprocessing and preparing data for question 2
(some parts are modified or generated with AI).
"""


# Helper function to aggregate data for chart 1
def get_chart1_data(df, geo):
    df_country = df[df["geo_code"].str.startswith(geo or "")]
    agg = df_country.groupby("geo").agg(
        {"value": "sum", "geo_code": "first"}).fillna(0) # modfied with AI 
    top = agg.sort_values("value", ascending=False).head(50) 
    return {
        "cities": top.index.tolist(),
        "values": top["value"].tolist(),
        "geo_codes": top["geo_code"].tolist()
    }


# Helper function to prepare chart 2 data (pivot)
def get_chart2_data(df, geo):
    df_country = df[df["geo_code"].str.startswith(geo or "")]
    pivot = (
        df_country.groupby(["time", "geo"])["value"]
        .sum()
        .reset_index()
        .pivot(index="time", columns="geo", values="value")
        .fillna(0)
        .sort_index() # modfied with AI 
    )
    return {
        "times": pivot.index.tolist(), 
        "series": [
            {"name": geo_name, "data": pivot[geo_name].tolist()}
            for geo_name in pivot.columns
        ]
    }