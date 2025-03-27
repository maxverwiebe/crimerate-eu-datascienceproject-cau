import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

import ExplanationSection from "../explanationSection";

import ChartHeader from "../chartHeader";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question4Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2020");
  const [selectedIccs, setSelectedIccs] = useState("Intentional homicide");
  const [bubbleScaler, setBubbleScaler] = useState(25);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question4/chart1?time=${selectedYear}&iccs=${encodeURIComponent(
        selectedIccs
      )}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setChartData(chart_data);
        setInteractiveData(interactive_data);
        setError(error);
      })
      .catch(console.error);
  }, [selectedYear, selectedIccs]);

  if (!chartData) {
    return <ChartLoading />;
  }

  const scatterData = chartData.map((d) => ({
    name: d.geo,
    value: [d.population, d.gdp_growth, d.crime_rate_per_100k],
  }));

  const option = {
    tooltip: {
      formatter: (params) => {
        const [population, gdpGrowth, crimeRate] = params.data.value;
        return `
          ${params.name}<br/>
          Population: ${population.toLocaleString()}<br/>
          GDP growth: ${gdpGrowth}%<br/>
          Crime rate: ${crimeRate.toFixed(2)} per 100.000 inhibitants
        `;
      },
    },
    xAxis: {
      name: "Total Population",
      type: "log",
      splitLine: { show: true },
    },
    yAxis: {
      name: "GDP Growth (%)",
      type: "value",
      splitLine: { show: true },
    },
    dataZoom: [{ type: "inside" }, { type: "slider" }],
    series: [
      {
        type: "scatter",
        symbolSize: (data) => Math.sqrt(data[2]) * bubbleScaler,
        data: scatterData,
        label: {
          show: true,
          formatter: "{b}",
          position: "top",
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: "bold",
          },
        },
      },
    ],
  };

  const handleFilterChange = ({ time, iccs }) => {
    if (time) setSelectedYear(time);
    if (iccs) setSelectedIccs(iccs);
  };

  return (
    <div>
      <ChartHeader title={"Crime Rate vs. Population & GDP Growth"} />

      <ExplanationSection title="How to Read this Chart">
        <p className="mb-4">
          This bubble chart plots three dimensions of country‑level data
          simultaneously:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>
            <strong>X‑Axis (log scale):</strong> Total population (larger values
            → further right).
          </li>
          <li>
            <strong>Y‑Axis:</strong> Annual GDP growth rate (%) (higher values →
            further up).
          </li>
          <li>
            <strong>Bubble Size:</strong> Crime rate per 100,000 inhabitants
            (larger bubbles → higher crime rate).
          </li>
        </ul>
        <p className="mb-4">
          <strong>Interpretation:</strong>
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Countries in the upper‑right quadrant combine large populations with
            strong economic growth.
          </li>
          <li>
            Small bubbles high on the Y‑axis indicate fast-growing economies
            with relatively low crime.
          </li>
          <li>
            Large bubbles low on the Y‑axis signal high crime rates despite
            sluggish or negative GDP growth.
          </li>
          <li>
            Very small bubbles on the far left represent low‑population
            countries, where crime rates can appear exaggerated relative to
            size.
          </li>
          <li>
            Use the slider to adjust bubble scaling if the differences in crime
            rate are too subtle or too extreme.
          </li>
          <li>
            Hover over a bubble for exact values (population, GDP growth, crime
            rate) via tooltip.
          </li>
        </ul>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="mb-4 mt-4">
        <label className="mr-2">Bubble Scaler:</label>
        <input
          type="range"
          min="1"
          max="50"
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

      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />

      <p className="text-sm text-gray-500 m-2">
        Source:{" "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/tps00001"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat tps00001
        </a>
        {", "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/tec00115"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat tec00115
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

export default Question4Chart1;
