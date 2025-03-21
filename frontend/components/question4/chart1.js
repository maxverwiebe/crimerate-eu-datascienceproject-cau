import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question4Chart1 = () => {
  const [chartData, setChartData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2020");
  const [selectedIccs, setSelectedIccs] = useState("Intentional homicide");
  const [bubbleScaler, setBubbleScaler] = useState(25);

  useEffect(() => {
    fetch(
      `http://127.0.0.1:5000/api/question4/chart1?time=${selectedYear}&iccs=${encodeURIComponent(
        selectedIccs
      )}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data }) => {
        setChartData(chart_data);
        setInteractiveData(interactive_data);
        console.log(chart_data);
      })
      .catch(console.error);
  }, [selectedYear, selectedIccs]);

  if (chartData.length === 0) {
    return <div>Lade Daten...</div>;
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Bubble Chart - Population, GDP growth and crime rate per 100,000
        inhabitants (2020) ({selectedYear})
      </h2>
      <p className="mb-4">
        This chart shows the population (logarithmic, x-axis), GDP growth
        (y-axis) GDP growth (y-axis) and the crime rate (size of the bubble) per
        100,000 inhabitants for each country.
      </p>

      <section className="mx-auto p-6 bg-neutral-800 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">
          How to Interpret the Bubble Chart
        </h2>
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
          <strong>Key Insights:</strong>
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
      </section>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="mb-4">
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

      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question4Chart1;
