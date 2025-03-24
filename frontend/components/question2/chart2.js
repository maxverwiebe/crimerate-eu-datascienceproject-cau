import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import ErrorAlert from "../errorAlert";

const Question2Chart2 = () => {
  const [chartData, setChartData] = useState({ times: [], series: [] });
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({ geo: ["BE"] }); // Standard: Belgium
  const [error, setError] = useState(null);
  const [topCount, setTopCount] = useState(10);

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

  if (chartData.times.length === 0) {
    return <div>Lade Daten...</div>;
  }

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

  bubbleData.sort((a, b) => b.total - a.total);
  bubbleData = bubbleData.slice(0, topCount);

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

  // Hinzufügen von DataZoom-Komponenten als DragControls
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
        type: "inside", // DragZoom innerhalb des Diagramms
        xAxisIndex: 0,
        yAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider", // Externer Slider (unten)
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider", // Optionale y-Achse-Schieber (links)
        yAxisIndex: 0,
        left: 0,
        start: 0,
        end: 100,
      },
    ],
    series: true
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

  return (
    <div className="p-4">
      <ChartHeader title="Regional Crime Dynamics: Growth vs Current Level" />
      <ExplanationSection title="Explanation">
        <p>
          This chart is a bubble scatter plot that simultaneously visualizes
          three different metrics for each region (e.g., city or administrative
          area) in the selected country over the chosen time period. Each bubble
          corresponds to one region.
        </p>
        <p>
          <strong>X‑Axis (Growth %):</strong> Shows the percentage change in
          total reported crime between the first and last selected year. A
          positive value indicates an increase in crime, while a negative value
          indicates a decrease.
        </p>
        <p>
          <strong>Y‑Axis (Last Value):</strong> Represents the absolute number
          of reported crimes in the last year of the selected time range,
          providing a snapshot of the current crime level for each region.
        </p>
        <p>
          <strong>Bubble Size (Total):</strong> Reflects the cumulative number
          of reported crimes across all selected years. Larger bubbles indicate
          regions with a higher overall crime volume over time.
        </p>
        <p>
          Regions are sorted by total crime volume, and you can choose to
          display the top 5, 10, 20, or 50 regions using the "Show Top Regions"
          dropdown. This helps focus on areas with the greatest overall crime
          burden.
        </p>
        <p>
          <strong>Interpretation:</strong>
          <ul>
            <li>
              Top‑right quadrant: Regions with high growth and high current
              crime levels (rapidly worsening hotspots).
            </li>
            <li>
              Bottom‑right quadrant: Regions with strong growth but lower
              absolute crime levels (emerging hotspots).
            </li>
            <li>
              Top‑left quadrant: Regions with high crime levels that have
              remained stable or declined over time.
            </li>
            <li>
              Bottom‑left quadrant: Regions with lower crime volumes and little
              change over time.
            </li>
          </ul>
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
    </div>
  );
};

export default Question2Chart2;
