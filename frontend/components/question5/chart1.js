import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import SectionHeader from "../sectionHeader";
import ExplanationSection from "../explanationSection";
import ChartHeader from "../chartHeader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question5Chart1 = () => {
  const [chartData, setChartData] = useState({ times: [], series: [] });
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});

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

    fetch(`http://127.0.0.1:5000/api/question5/chart1?${params.toString()}`)
      .then((res) => res.json())
      .then(({ chart_data, interactive_data }) => {
        setChartData(chart_data);
        setInteractiveData(interactive_data);
        console.log(chart_data);
      })
      .catch(console.error);
  }, [filters]);

  if (!chartData.series.length) return <div>Lade Daten...</div>;

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
      symbolSize: (val) => Math.sqrt(val[2]) * 5,
      emphasis: { label: { show: true, formatter: "{b}", fontWeight: "bold" } },
    })),
  };

  return (
    <div className="p-4">
      <ChartHeader title="Timeline Bubble Chart: Police vs Crime" />
      <ExplanationSection title="How to Read">
        <ul className="list-disc list-inside space-y-2">
          <li>X‑Axis = Year</li>
          <li>Y‑Axis = Police officers per 100k</li>
          <li>Bubble size = Crime rate per 100k</li>
        </ul>
      </ExplanationSection>
      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={setFilters}
        />
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
