def processing_data_for_q3(df, unit):
    df_sex_filtered = df[df["sex"] == "Total"]
    df_unit_filtered = df_sex_filtered[df_sex_filtered["unit"] == unit]
    df_cleaned = df_unit_filtered.dropna(subset=["value"])
    return df_cleaned