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

export default function Question7Chart2() {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

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
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}% ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      data: data.map((d) => d.name),
    },
    series: [
      {
        name: "Age Group Share",
        type: "pie",
        radius: ["50%", "75%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "inside",
          formatter: "{d}%",
        },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: "bold" },
        },
        data,
        color: COLORS,
      },
    ],
  };

  return (
    <div>
      <ChartHeader title="Age‑Group Distribution (Percentage)" />
      <ExplanationSection title="How to Read This Chart">
        <p>
          This donut chart shows the share (%) of each age group in the total
          number of cases for the selected country and year. Hover over a slice
          to see exact percentages.
        </p>
        <p>Use the filter above to pick a different country or time period.</p>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={setFilters}
        />
      )}

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
}
