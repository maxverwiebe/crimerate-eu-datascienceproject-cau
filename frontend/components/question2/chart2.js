/*
 * chart2.js
 * This component is used to display the 2nd chart for question 2.
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";

const Question2Chart2 = () => {
  const [chartData, setChartData] = useState({ times: [], series: [] });
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({ geo: ["BE"] }); // Standard: Belgium
  const [error, setError] = useState(null);
  const [topCount, setTopCount] = useState(10);

  // fetch data from the backend API
  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    if (filters.unit) params.append("unit", filters.unit);

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question2/chart2?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setInteractiveData(interactive_data);
        setChartData(chart_data);
        setError(error);
      })
      .catch(console.error);
  }, [filters]);

  // format the data for the bubble chart
  let bubbleData = chartData.series.map((s) => {
    const start = s.data[0];
    const end = s.data[s.data.length - 1];
    const growth = start !== 0 ? ((end - start) / start) * 100 : 0;
    const total = s.data.reduce((acc, cur) => acc + cur, 0);
    return {
      name: s.name,
      growth,
      lastValue: end,
      total,
      value: [growth, end, total],
    };
  });

  // sort the data by total and take the top N (N = topCount changed by the combobox)
  bubbleData.sort((a, b) => b.total - a.total);
  bubbleData = bubbleData.slice(0, topCount);

  // color palette lol
  const palette = [
    "#5470C6",
    "#91CC75",
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
    "#EA7CCC",
  ];

  const scatterData = bubbleData.map((d, index) => ({
    value: d.value,
    name: d.name,
    itemStyle: {
      color: palette[index % palette.length],
    },
  }));

  const option = {
    tooltip: {
      formatter: (params) => {
        const d = bubbleData[params.dataIndex];
        return `
          ${d.name}<br/>
          Growth: ${d.growth.toFixed(1)}%<br/>
          Last Value: ${d.lastValue}<br/>
          Total: ${d.total}
        `;
      },
    },
    xAxis: {
      name: "Growth (%)",
      type: "value",
      splitLine: { show: true },
    },
    yAxis: {
      name: "Last Value",
      type: "value",
      splitLine: { show: true },
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        yAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        yAxisIndex: 0,
        left: 0,
        start: 0,
        end: 100,
      },
    ],
    series: true // TODO: Remove
      ? [
          {
            type: "scatter",
            symbolSize: function (data) {
              return Math.sqrt(data[2]) * 0.1;
            },
            data: scatterData,
            label: {
              show: true,
              formatter: (params) => {
                return bubbleData[params.dataIndex].name;
              },
              position: "top",
            },
            emphasis: {
              label: {
                show: true,
                fontWeight: "bold",
                fontSize: 14,
              },
            },
          },
        ]
      : [],
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (chartData.length === 0) {
    return <ChartLoading />;
  }

  return (
    <div>
      <ChartHeader title="Comparing Crime Growth and Levels" />
      <ExplanationSection title="How to Read this Chart">
        <p className="mb-2">
          This bubble scatter plot compares each region’s change in total crime
          with its current crime level, helping you spot emerging hotspots and
          high‑burden areas.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>X‑Axis (Growth %):</strong> Year‑over‑year percentage change
            in total crimes.
          </li>
          <li>
            <strong>Y‑Axis (Last Value):</strong> Absolute number of crimes in
            the most recent year.
          </li>
          <li>
            <strong>Bubble Size:</strong> Cumulative crime count across all
            selected years.
          </li>
          <li>
            <strong>DataZoom:</strong> Drag inside the chart or use sliders to
            zoom in on specific ranges.
          </li>
        </ul>
        <p className="mb-2">
          <strong>Quadrant interpretation:</strong>
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>
            <strong>Top‑right:</strong> High growth & high current crime
            (rapidly worsening hotspots)
          </li>
          <li>
            <strong>Bottom‑right:</strong> High growth, lower current crime
            (emerging hotspots)
          </li>
          <li>
            <strong>Top‑left:</strong> High current crime, stable or decreasing
            (persistent hotspots)
          </li>
          <li>
            <strong>Bottom‑left:</strong> Low crime & low change (stable
            low‑risk areas)
          </li>
        </ul>
        <p className="text-red-700">
          As the diagram looks at a period of time, you have to select several
          years! For example select Germany and years: 2012, 2013, 2014, 2015!
        </p>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      <div className="mb-4 mt-4 flex items-center">
        <label className="mr-3 font-medium">Show Top Regions:</label>
        <select
          value={topCount}
          onChange={(e) => setTopCount(parseInt(e.target.value))}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />

      <p className="text-sm text-gray-500 m-2">
        Source:{" "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/crim_gen_reg"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat crim_gen_reg
        </a>
      </p>
    </div>
  );
};

export default Question2Chart2;
