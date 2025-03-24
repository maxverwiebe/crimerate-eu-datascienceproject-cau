import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ExplanationSection from "../explanationSection";
import SectionHeader from "../sectionHeader";
import ChartHeader from "../chartHeader";
import ErrorAlert from "../errorAlert";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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
    time: ["2020"],
    iccs: "Intentional homicide",
    geo: [],
  });
  const [error, setError] = useState(null);

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

  if (!chartData.length) return <div>Lade Daten...</div>;

  const filtered = chartData.filter(
    (d) => !filters.geo.length || filters.geo.includes(d.geo)
  );

  const scatterData = filtered.map((d) => ({
    name: d.geo,
    value: [d.crime_per_100k, d.police_per_100k],
  }));

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
    <div className="p-4">
      <ChartHeader title="Scatter Chart - Crime Rate vs. Police Officers" />
      <ExplanationSection title="How to Read the Chart">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Countries in the upper-right have both high crime and high police
            presence.
          </li>
          <li>
            Countries in the lower-left have low crime and low police presence.
          </li>
          <li>The red line represents the linear regression trend.</li>
        </ul>
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
    </div>
  );
};

export default Question5Chart2;
