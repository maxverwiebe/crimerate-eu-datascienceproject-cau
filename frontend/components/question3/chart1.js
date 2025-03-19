import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question3Chart1 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    if (filters.unit) params.append("unit", filters.unit);

    fetch(`http://127.0.0.1:5000/api/question3/chart1?${params.toString()}`)
      .then((res) => res.json())
      .then(({ chart_data, interactive_data }) => {
        setInteractiveData(interactive_data);
        setData(chart_data);
      })
      .catch(console.error);
  }, [filters]);

  const countries = Array.from(new Set(data.map((d) => d.geo))).sort();
  const years = Array.from(new Set(data.map((d) => d.time))).sort();

  const seriesData = data.map(({ geo, time, value }) => [
    countries.indexOf(geo),
    years.indexOf(time),
    value,
  ]);

  const values = seriesData.map((d) => d[2]);
  const min = Math.min(...values),
    max = Math.max(...values);

  const option = {
    tooltip: {
      position: "top",
      formatter: ({ data }) =>
        `<strong>${countries[data[0]]}</strong><br/>Year: ${
          years[data[1]]
        }<br/>Value: ${data[2].toFixed(0)}`,
    },
    xAxis: { type: "category", data: countries, axisLabel: { rotate: -45 } },
    yAxis: { type: "category", data: years, inverse: true },
    visualMap: {
      min,
      max,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 10,
    },
    series: [
      {
        type: "heatmap",
        data: seriesData,
        label: { show: true, formatter: ({ value }) => value[2].toFixed(0) },
        emphasis: { itemStyle: { borderColor: "#000", borderWidth: 1 } },
      },
    ],
  };

  return (
    <div className="p-4">
      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={setFilters}
      />
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question3Chart1;
