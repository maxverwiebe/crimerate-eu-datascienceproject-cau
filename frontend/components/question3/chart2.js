import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ErrorAlert from "../errorAlert";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question3Chart2 = () => {
  const [data, setData] = useState(null);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question3/chart2?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setInteractiveData(interactive_data);
        setData(chart_data);
        setError(error);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <div>Loading…</div>;
  if (error) return <ErrorAlert message={error} />;

  const option = data
    ? {
        title: {
          text: `Criminal Justice Flow (${data.year})`,
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c}",
        },
        series: [
          {
            type: "sankey",
            layout: "none",
            emphasis: { focus: "adjacency" },
            data: data.nodes,
            links: data.links,
            label: { fontSize: 12 },
            lineStyle: { curveness: 0.5 },
          },
        ],
      }
    : {};

  return (
    <div className="p-4">
      <h3 className="text-xl mb-4">
        Criminal Justice Flow by Legal Status & Gender
      </h3>

      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={setFilters}
      />

      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question3Chart2;
