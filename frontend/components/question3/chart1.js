/*
 * chart1.js
 * This component is used to display the first chart for question 2.
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import ErrorAlert from "../errorAlert";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ChartLoading from "../chartLoading";

const Question3Chart1 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    filters.legal_status?.forEach((l) => params.append("legal_status", l));
    if (filters.unit) params.append("unit", filters.unit);

    // fetch data from the backend API
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

  if (!data || data.length === 0) {
    return <ChartLoading />;
  }

  // format the data for the heatmap
  // !! USED AI HERE !!
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
    <div>
      <ChartHeader title="Bribery & Corruption Cases" />

      <ExplanationSection title="How to Read this Chart">
        <p className="mb-2">
          This heatmap displays the number of recorded bribery and corruption
          incidents per country (X‑axis) across different years (Y‑axis). Darker
          cells represent higher incidents.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>X‑Axis (Country):</strong> Countries sorted alphabetically.
          </li>
          <li>
            <strong>Y‑Axis (Year):</strong> Chronological order (latest at top).
          </li>
          <li>
            <strong>Color Scale:</strong> Indicates average incident count;
            darker = more incidents.
          </li>
        </ul>
      </ExplanationSection>

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

      <p className="text-sm text-gray-500 m-2">
        Source:{" "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/crim_just_bri"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat crim_just_bri
        </a>
      </p>
    </div>
  );
};

export default Question3Chart1;
