import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ChartHeader from "../chartHeader";
import ExplanationSection from "../explanationSection";
import ErrorAlert from "../errorAlert";
import ChartLoading from "../chartLoading";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question6Chart2 = () => {
  const [chartData, setChartData] = useState({
    years: [],
    male: [],
    female: [],
  });
  const [filterCriteria, setFilterCriteria] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question6/chart2`;
    const params = new URLSearchParams();

    if (filterCriteria.time) {
      filterCriteria.time.forEach((t) => params.append("time", t));
    }
    if (filterCriteria.geo) {
      filterCriteria.geo.forEach((g) => params.append("geo", g));
    }

    if (filterCriteria.leg_stat) {
      filterCriteria.leg_stat.forEach((l) => params.append("leg_stat", l));
    }

    if ([...params].length) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          return;
        }
        setInteractiveData(json.interactive_data);
        setChartData(json.chart_data);
      })
      .catch((e) => setError(e.message));
  }, [filterCriteria]);

  const handleFilterChange = (newFilters) => {
    setFilterCriteria(newFilters);
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      appendToBody: true,
    },
    legend: { data: ["Males", "Females"], top: 10 },
    grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
    xAxis: {
      type: "category",
      data: chartData.years,
      axisLabel: { rotate: 45 },
    },
    yAxis: { type: "value" },
    series: [
      { name: "Males", type: "bar", stack: "total", data: chartData.male },
      { name: "Females", type: "bar", stack: "total", data: chartData.female, itemStyle: { color: "#EE6666" } },
    ],
  };

  if (!chartData) return <ChartLoading />;

  return (
    <div>
      <ChartHeader title="Gender Distribution Among Suspected, Prosecuted, and Convicted Persons Over Time" />

      <ExplanationSection title="How to Read This Chart">
        <p className="mb-2">
          This stacked bar chart shows the number of individuals involved in
          crime cases broken down by gender—for a chosen legal status
          (Suspected, Prosecuted, or Convicted) across time for each country.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            <strong>X‑Axis (Year):</strong> Each bar represents a calendar year.
          </li>
          <li>
            <strong>Y‑Axis (Count of Persons):</strong> Total number of people
            recorded for the selected legal status in that year.
          </li>
          <li>
            <strong>Stacked Bars:</strong> Each bar is split into two segments:
            Males and Females showing each gender’s
            contribution to the total count.
          </li>
        </ul>
      </ExplanationSection>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}

      {error && <ErrorAlert message={error} />}

      <div style={{ overflowX: "auto" }}>
        <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
      </div>
    </div>
  );
};

export default Question6Chart2;
