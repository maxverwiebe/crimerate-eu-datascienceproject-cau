import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import ErrorAlert from "../errorAlert";

const Question3Chart1 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    if (filters.unit) params.append("unit", filters.unit);

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question3/chart1?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setInteractiveData(interactive_data);
        setData(chart_data);
        setError(error);
      })
      .catch(console.error);
  }, [filters]);

  // Wenn keine Daten vorhanden, zeige "Lade Daten..."
  if (!data || data.length === 0) {
    return <div>Lade Daten...</div>;
  }

  // Aggregiere doppelte Einträge basierend auf geo und time
  const aggregatedData = Object.values(
    data.reduce((acc, { geo, time, value }) => {
      const key = `${geo}-${time}`;
      if (!acc[key]) {
        acc[key] = { geo, time, value: 0, count: 0 };
      }
      acc[key].value += value;
      acc[key].count += 1;
      return acc;
    }, {})
  ).map(({ geo, time, value, count }) => ({
    geo,
    time,
    // Hier wird der Durchschnittswert verwendet – alternativ könnte man auch summieren
    value: value / count,
  }));

  const countries = Array.from(
    new Set(aggregatedData.map((d) => d.geo))
  ).sort();
  const years = Array.from(new Set(aggregatedData.map((d) => d.time))).sort();

  const seriesData = aggregatedData.map(({ geo, time, value }) => [
    countries.indexOf(geo),
    years.indexOf(time),
    value,
  ]);

  const values = seriesData.map((d) => d[2]);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  const option = {
    tooltip: {
      position: "top",
      formatter: ({ data }) =>
        `<strong>${countries[data[0]]}</strong><br/>Year: ${
          years[data[1]]
        }<br/>Value: ${data[2].toFixed(0)}`,
    },
    xAxis: {
      type: "category",
      data: countries,
      axisLabel: { rotate: -45 },
    },
    yAxis: { type: "category", data: years, inverse: true },
    visualMap: {
      min,
      max,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 10,
      inRange: {
        color: ["#e0f3f8", "#005824"],
      },
    },
    series: [
      {
        type: "heatmap",
        data: seriesData,
        label: { show: true, formatter: ({ value }) => value[2].toFixed(0) },
        emphasis: {
          itemStyle: { borderColor: "#000", borderWidth: 1 },
          label: { show: false },
        },
      },
    ],
  };

  return (
    <div className="p-4">
      <h3 className="text-xl">
        Absolut number of people involved in bribery and corruption across
        European countries
      </h3>
      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={setFilters}
      />
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question3Chart1;
