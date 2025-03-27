import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "@/components/interactiveFilter";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#FF8042",
];

export default function Question7Chart1Mini() {
  const [nestedData, setNestedData] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [error, setError] = useState(null);
  const [yAxisMax, setYAxisMax] = useState(50);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filterCriteria).forEach(([k, vs]) =>
        vs.forEach((v) => params.append(k, v))
      );
      if (!params.has("geo")) params.append("geo", "DE");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question7/chart1?${params}`
        );
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setNestedData(json.chart_data || {});
        setInteractiveData(json.interactive_data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [filterCriteria]);

  const handleFilterChange = setFilterCriteria;

  const getMiniChartData = (data) => {
    const result = {};
    Object.entries(data).forEach(([country, times]) =>
      Object.entries(times).forEach(([time, groups]) =>
        Object.entries(groups).forEach(([age, { percentage }]) => {
          result[age] ??= {};
          result[age][time] ??= { time };
          result[age][time][country] = percentage;
        })
      )
    );
    return Object.fromEntries(
      Object.entries(result).map(([age, times]) => [
        age,
        Object.values(times).sort((a, b) => a.time.localeCompare(b.time)),
      ])
    );
  };

  if (!nestedData || !Object.keys(nestedData).length) return <ChartLoading />;

  const miniChartData = getMiniChartData(nestedData);
  const ageGroups = Object.keys(miniChartData).sort();
  const countries = Array.from(
    new Set(
      ageGroups.flatMap((age) =>
        Object.keys(miniChartData[age][0]).filter((k) => k !== "time")
      )
    )
  );

  return (
    <div>
      <ChartHeader title="Age‑Group Percentage Trends Over Time" />

      <ExplanationSection title="How to Read These Mini‑Charts">
        <p className="mb-2">
          Each small chart represents one age group and shows how its share
          (percentage) of the selected measure has evolved over time for each
          country.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>X‑Axis (Year):</strong> Calendar years in the dataset.
          </li>
          <li>
            <strong>Y‑Axis (Percentage):</strong> Proportion of the total
            population (or selected measure) accounted for by that age group in
            a given year.
          </li>
          <li>
            <strong>Lines:</strong> Each colored line corresponds to a different
            country (legend shown below). Follow a line to see how the share of
            that age group rises or falls over time.
          </li>
        </ul>
        <p className="mb-2">
          Use the "Y-Axis Max" slider to adjust the y‑axis maximum — this can
          help when comparing age groups whose percentage values vary greatly.
        </p>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      <div className="mb-4 mt-4">
        <label className="mr-2">Y-Axis Max:</label>
        <input
          type="range"
          min="10"
          max="100"
          value={yAxisMax}
          onChange={(e) => setYAxisMax(Number(e.target.value))}
        />
        <span className="ml-2">{yAxisMax}</span>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="flex flex-wrap mb-4">
        {countries.map((c, i) => (
          <div key={c} className="flex items-center mr-6 mb-2">
            <span
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {c}
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {ageGroups.map((age) => {
          const option = {
            tooltip: { trigger: "axis" },
            xAxis: {
              type: "category",
              data: miniChartData[age].map((d) => d.time),
            },
            yAxis: { type: "value", min: 0, max: yAxisMax },
            grid: { left: "10%", right: "10%", bottom: "15%", top: "10%" },
            series: countries.map((country, idx) => ({
              name: country,
              type: "line",
              data: miniChartData[age].map((d) => d[country] ?? 0),
              smooth: true,
              lineStyle: { width: 2 },
              symbolSize: 4,
              emphasis: { focus: "series" },
              color: COLORS[idx % COLORS.length],
            })),
          };

          return (
            <div key={age} className="border p-4 rounded shadow-sm">
              <h3 className="text-xl mb-2">{age}</h3>
              <ReactECharts
                option={option}
                style={{ height: 200, width: "100%" }}
              />
            </div>
          );
        })}
      </div>

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
