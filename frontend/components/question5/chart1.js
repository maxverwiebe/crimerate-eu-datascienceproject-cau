import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ExplanationSection from "../explanationSection";
import ChartHeader from "../chartHeader";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question5Chart1 = () => {
  const [chartData, setChartData] = useState({ times: [], series: [] });
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [bubbleScaler, setBubbleScaler] = useState(5);
  const [error, setError] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.geo) {
      const validGeos = filters.geo.filter((g) => g);
      if (validGeos.length) {
        params.append("geo", validGeos.join(","));
      }
    }

    if (filters.iccs) params.append("iccs", filters.iccs);

    console.log(filters);

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question5/chart1?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setChartData(chart_data);
        setInteractiveData(interactive_data);
        setError(error);
      })
      .catch(console.error);
  }, [filters]);

  if (!chartData.series.length) return <ChartLoading />;

  const option = {
    legend: {
      show: true,
      type: "scroll",
      orient: "horizontal",
      top: 10,
      left: "center",
      width: "90%",
    },
    tooltip: {
      formatter: ({ seriesName, value }) => `
        <strong>${seriesName}</strong><br/>
        Police per 100k: ${value[0].toFixed(1)}<br/>
        Year: ${value[1].toString()}<br/>
        Crime per 100k: ${value[2].toFixed(1)}
      `,
    },
    xAxis: {
      name: "Police per 100k",
      type: "value",
      splitLine: { show: true },
    },
    yAxis: {
      name: "Year",
      type: "value",
      min: "dataMin",
      max: "dataMax",
      axisLabel: { formatter: (val) => val.toString() },
      splitLine: { show: true },
    },

    dataZoom: [
      { type: "slider", yAxisIndex: 0 },
      { type: "inside", yAxisIndex: 0 },
    ],
    series: chartData.series.map(({ name, data }) => ({
      name,
      type: "scatter",
      encode: { x: 1, y: 0, tooltip: [1, 0, 2] },
      data,
      symbolSize: (data) => Math.sqrt(data[2]) * bubbleScaler,
      emphasis: { label: { show: true, formatter: "{b}", fontWeight: "bold" } },
    })),
  };

  return (
    <div>
      <ChartHeader title="Crime Rate and Police Officers Over Time" />
      <ExplanationSection title="How to Read This Chart">
        <p className="mb-2">
          This chart visualizes the relationship between the number of police
          officers per 100,000 people, the crime rate per 100,000 people, and
          the year of observation for each country. Instead of showing raw
          values, it uses a scatter plot where:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>X‑Axis (Year):</strong> The year of data collection.
          </li>
          <li>
            <strong>Y‑Axis (Police per 100k):</strong> The number of police
            officers per 100,000 people in the given year.
          </li>
          <li>
            <strong>Bubble Size (Crime per 100k):</strong> The size of each
            bubble represents the number of crimes per 100,000 people for that
            year in the given country.
          </li>
        </ul>
        <p>
          By using bubble size and position, this chart allows you to compare
          trends over time across countries. For example, you can observe how
          the number of police officers correlates with the crime rate in
          different years, and how both metrics evolved over time.
        </p>
        <p>
          To recognize a correlation, the bubbles with fewer police officers (on
          the left) should be larger, indicating higher crime rates. In
          contrast, on the right, where there are more police officers, the
          bubbles should be smaller, suggesting lower crime rates.
        </p>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={setFilters}
        />
      )}
      <div className="mb-4 mt-4">
        <label className="mr-2">Bubble Scaler:</label>
        <input
          type="range"
          min="0.1"
          max="25"
          step={bubbleScaler <= 1 ? 0.1 : 1}
          value={bubbleScaler}
          onChange={(e) => setBubbleScaler(Number(e.target.value))}
        />
        <span className="ml-2">{bubbleScaler}</span>
      </div>
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <ReactECharts
        option={option}
        style={{ width: "100%", height: 500 }}
        notMerge={true}
      />
    </div>
  );
};

export default Question5Chart1;
