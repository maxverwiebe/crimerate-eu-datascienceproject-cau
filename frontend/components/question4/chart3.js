/*
 * chart3.js
 * This component is used to display the third chart for question 4.
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question4Chart3 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    time: "2020",
    iccs: "Intentional homicide",
    geo: ["DE", "FR", "IT"],
  });

  // fetch data from the backend API
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.time) params.append("time", filters.time);
    if (filters.iccs) params.append("iccs", filters.iccs);
    filters.geo?.forEach((g) => params.append("geo", g));

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question4/chart3?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setData(chart_data);
        setInteractiveData(interactive_data);
        setError(error);
      })
      .catch(console.error);
  }, [filters]);

  if (!data) return <ChartLoading />;

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const [population, gdp, crime] = params.value;
        return `
          <strong>${params.name}</strong><br/>
          Population: ${Number(population).toLocaleString()}<br/>
          GDP Growth: ${gdp}%<br/>
          Crime Rate/100k: ${crime.toFixed(2)}
        `;
      },
    },
    parallelAxis: [
      // axes for parallel coordinates
      { dim: 0, name: "Population", type: "value" },
      { dim: 1, name: "GDP Growth (%)", type: "value" },
      { dim: 2, name: "Crime Rate /100k", type: "value" },
    ],
    series: [
      {
        name: "Country Comparison",
        type: "parallel", // parallel coordinates chart
        lineStyle: { width: 2 },
        data: data.map((d) => ({
          name: d.country || d.geo_code,
          value: [d.population, d.gdp_growth, d.crime_rate_per_100k], // data for each axis
        })),
      },
    ],
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Population, GDP & Criminality ({filters.time})
      </h2>

      <ExplanationSection title="How to read this chart">
        <p className="mb-4">
          This parallel coordinate chart visualizes three key metrics for each
          country on parallel axes:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>
            <strong>Population:</strong> Absolute number of inhabitants (left
            axis).
          </li>
          <li>
            <strong>GDP Growth (%):</strong> Annual economic growth rate (middle
            axis).
          </li>
          <li>
            <strong>Crime Rate per 100k:</strong> Recorded crime incidents
            standardized per 100,000 people (right axis).
          </li>
        </ul>
        <p className="mb-4">
          <strong>Key Insights:</strong>
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Lines starting high on the left and staying high in the middle
            represent large, fast‑growing economies.
          </li>
          <li>
            Lines dipping low on the right indicate countries with lower crime
            rates — the ideal profile runs from high population → high GDP
            growth → low crime.
          </li>
          <li>
            Upward movement toward the right signals higher crime relative to
            population and growth.
          </li>
          <li>
            Clusters of similar line patterns highlight groups of countries with
            comparable demographic, economic, and safety profiles.
          </li>
          <li>
            Outliers (e.g., high crime despite strong growth or low growth
            despite a large population) are immediately visible.
          </li>
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

export default Question4Chart3;
