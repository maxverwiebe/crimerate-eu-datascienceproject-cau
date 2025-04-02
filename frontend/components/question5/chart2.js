/*
 * chart2.js
 * This component is used to display the 2nd chart for question 5.
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ExplanationSection from "../explanationSection";
import ChartHeader from "../chartHeader";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// calculate the regression line data
// !! AI GENERATED CODE !! tbh
const calculateRegression = (data) => {
  if (data.length < 2) return { lineData: [], slope: 0, intercept: 0 };
  const n = data.length;
  const sumX = data.reduce((acc, d) => acc + d.value[0], 0);
  const sumY = data.reduce((acc, d) => acc + d.value[1], 0);
  const sumXY = data.reduce((acc, d) => acc + d.value[0] * d.value[1], 0);
  const sumX2 = data.reduce((acc, d) => acc + d.value[0] ** 2, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;
  const xMin = Math.min(...data.map((d) => d.value[0]));
  const xMax = Math.max(...data.map((d) => d.value[0]));

  return {
    lineData: [
      [xMin, slope * xMin + intercept],
      [xMax, slope * xMax + intercept],
    ],
    slope,
    intercept,
  };
};

const Question5Chart2 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({
    time: ["2020"], // some default values because of bugs
    iccs: "Intentional homicide",
    geo: [],
  });
  const [error, setError] = useState(null);

  // fetch data from the backend API
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.time?.length) params.append("time", filters.time.join(","));
    if (filters.iccs) params.append("iccs", filters.iccs);
    if (filters.geo?.length) params.append("geo", filters.geo.join(","));

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question5/chart2?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setChartData(chart_data);
        setInteractiveData(interactive_data);
        setError(error);
      })
      .catch(console.error);
  }, [filters]);

  if (!chartData.length) return <ChartLoading />;

  const filtered = chartData.filter(
    (d) => !filters.geo.length || filters.geo.includes(d.geo)
  );

  const scatterData = filtered.map((d) => ({
    name: d.geo,
    value: [d.crime_per_100k, d.police_per_100k],
  }));

  // reg line
  const { lineData, slope, intercept } = calculateRegression(scatterData);

  const option = {
    tooltip: {
      formatter: (params) =>
        params.seriesType === "line"
          ? `Regression: y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`
          : `${params.name}<br/>Crime Rate: ${params.value[0].toFixed(
              2
            )} per 100k<br/>Police: ${params.value[1].toFixed(2)} per 100k`,
    },
    xAxis: {
      name: "Crime Rate per 100,000",
      type: "value",
      splitLine: { show: true },
    },
    yAxis: {
      name: "Police Officers per 100,000",
      type: "value",
      splitLine: { show: true },
    },
    dataZoom: [{ type: "inside" }, { type: "slider" }],
    series: [
      {
        type: "scatter",
        symbolSize: 10,
        data: scatterData,
        label: { show: true, formatter: "{b}", position: "top" },
        emphasis: { label: { show: true, fontWeight: "bold" } },
      },
      {
        type: "line",
        data: lineData,
        smooth: true,
        lineStyle: { width: 2, type: "solid" },
      },
    ],
  };

  const handleFilterChange = (newFilters) =>
    setFilters((prev) => ({ ...prev, ...newFilters }));

  return (
    <div>
      <ChartHeader title="Relationship Between Crime and Police Forces" />
      <ExplanationSection title="How to Read This Chart">
        <p className="mb-2">
          This scatter chart compares the crime rate per 100,000 people with the
          number of police officers per 100,000 people in various countries.
          Each point represents a country, plotted based on these two metrics.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Axes:</strong> The x-axis represents the crime rate per
            100,000 people, while the y-axis represents the number of police
            officers per 100,000 people.
          </li>
          <li>
            <strong>Data Points:</strong> Each point corresponds to a specific
            country. The location of the point indicates its crime rate and the
            number of police officers relative to other countries.
          </li>
          <li>
            <strong>Regression Line:</strong> The red line shows the correlation
            between crime rate and police presence. If the line slopes from
            top-left to bottom-right, it indicates a negative correlation.
          </li>
        </ul>
        <p>
          The chart allows you to see patterns or outliers. For example,
          countries in the upper-right quadrant have both high crime rates and
          high police presence, while those in the lower-left quadrant have
          lower crime rates and police presence.
        </p>
        <p>
          You can interact with the chart by adjusting filters such as time
          periods, crime categories, and geographical regions using the filter
          options provided.
        </p>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />

      <p className="text-sm text-gray-500 m-2">
        Source:{" "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/crim_just_job"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat crim_just_job
        </a>
        {", "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/crim_off_cat"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat crim_off_cat
        </a>
      </p>
    </div>
  );
};

export default Question5Chart2;
