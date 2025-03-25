import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question3Chart4 = () => {
  const [chartData, setChartData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question3/chart2`;
    const params = new URLSearchParams();

    if (filterCriteria.geo)
      filterCriteria.geo.forEach((g) => params.append("geo", g));
    if (filterCriteria.time) params.append("time", filterCriteria.time[0]);

    if ([...params].length) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.interactive_data) setInteractiveData(json.interactive_data);
        if (json.chart_data) setChartData(json.chart_data);
        if (json.error) setError(json.error);
      })
      .catch((e) => setError(e.message));
  }, [filterCriteria]);

  const handleFilterChange = (newFilters) => {
    setFilterCriteria(newFilters);
  };

  const option = chartData
    ? {
        title: {
          text: `Criminal Justice Flow (${chartData.year})`,
          left: "center",
        },
        tooltip: { trigger: "item", formatter: "{b}: {c}" },
        series: [
          {
            type: "sankey",
            layout: "none",
            emphasis: { focus: "adjacency" },
            data: chartData.nodes,
            links: chartData.links,
            label: { fontSize: 12 },
            lineStyle: { curveness: 0.5 },
          },
        ],
      }
    : {};

  if (!chartData) return <ChartLoading />;

  return (
    <div>
      <ChartHeader title="Criminal Justice Flow by Legal Status & Gender" />

      <ExplanationSection title="How to Read This Chart">
        <p>
          This Sankey diagram shows the flow from suspects to convicted and
          non-convicted persons, broken down by gender. gender. The width of
          each line corresponds to the number of people.
        </p>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}

      {error && (
        <div className="mt-4">
          <ErrorAlert message={error} />
        </div>
      )}

      <div style={{ overflowX: "auto", marginTop: "1rem" }}>
        {chartData && (
          <ReactECharts
            option={option}
            style={{ width: "100%", height: 600 }}
          />
        )}
      </div>
    </div>
  );
};

export default Question3Chart4;
