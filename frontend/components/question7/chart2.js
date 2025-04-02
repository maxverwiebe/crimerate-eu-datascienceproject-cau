/*
 * chart2.js
 * This component is used to display the 2nd chart for question 7.
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "@/components/interactiveFilter";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// color palette
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#FF8042",
];

export default function Question7Chart2() {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  // fetch data from the backend API
  useEffect(() => {
    async function fetchData() {
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, vals]) =>
        vals.forEach((v) => params.append(k, v))
      );

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question7/chart2?${params}`
        );
        const json = await res.json();
        if (json.error) throw new Error(json.error);

        setData(
          Object.entries(json.chart_data).map(([age, pct]) => ({
            name: age,
            value: pct,
          }))
        );
        setInteractiveData(json.interactive_data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [filters]);

  if (!data.length && !error) return <ChartLoading />;

  const option = {
    angleAxis: {
      type: "category",
      data: data.map((d) => d.name),
      z: 10,
    },
    radiusAxis: {
      min: 0,
      max: Math.round(Math.max(...data.map((d) => d.value)) * 1.2),
    },
    polar: {},
    series: [
      {
        type: "bar",
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: { color: COLORS[i % COLORS.length] },
        })),
        coordinateSystem: "polar",
        label: {
          show: true,
          position: "outside",
          formatter: "{c}%",
        },
      },
    ],
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}%",
    },
  };

  return (
    <div>
      <ChartHeader title="Age-Group Crime Distribution" />
      <ExplanationSection title="How to Read This Chart">
        <p className="mb-2">
          This radial bar chart shows the percentage of each age group that has
          committed crimes for the selected country and year. The longer the
          bar, the higher the percentage of people in that age group who have
          committed a crime.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>Bars:</strong> Each bar represents a different age group.
            The length of the bar corresponds to the percentage of individuals
            in that age group who have committed crimes.
          </li>
          <li>
            <strong>Percentage:</strong> The percentage displayed inside the
            bars indicates the proportion of people from the respective age
            group who have committed a crime in the given year.
          </li>
          <li>
            <strong>Country and Year:</strong> The chart is based on the
            selected country and year. Use the filter above to choose a
            different country or time period.
          </li>
        </ul>
        <p className="mb-2">
          Use the filter above to select a different country or time period and
          explore how the percentage of crime commission varies across age
          groups.
        </p>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={setFilters}
        />
      )}

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />

      <p className="text-sm text-gray-500 m-2">
        Source:{" "}
        <a
          href="https://ec.europa.eu/eurostat/databrowser/product/page/hlth_dhc130"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eurostat hlth_dhc130
        </a>
      </p>
    </div>
  );
}
