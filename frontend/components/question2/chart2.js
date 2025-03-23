import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question2Chart2 = () => {
  const [chartData, setChartData] = useState({ times: [], series: [] });
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({ geo: ["BE"] }); // Standard: Belgium

  const [topCount, setTopCount] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    if (filters.unit) params.append("unit", filters.unit);

    fetch(`http://127.0.0.1:5000/api/question2/chart2?${params.toString()}`)
      .then((res) => res.json())
      .then(({ chart_data, interactive_data }) => {
        setInteractiveData(interactive_data);
        setChartData(chart_data);
      })
      .catch(console.error);
  }, [filters]);

  if (chartData.times.length === 0) {
    return <div>Lade Daten...</div>;
  }

  let bubbleData = chartData.series.map((s) => {
    const start = s.data[0];
    const end = s.data[s.data.length - 1];
    const growth = start !== 0 ? ((end - start) / start) * 100 : 0;
    const total = s.data.reduce((acc, cur) => acc + cur, 0);
    return {
      name: s.name,
      growth,
      lastValue: end,
      total,
      value: [growth, end, total],
    };
  });

  bubbleData.sort((a, b) => b.total - a.total);
  bubbleData = bubbleData.slice(0, topCount);

  const palette = [
    "#5470C6",
    "#91CC75",
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
    "#EA7CCC",
  ];

  const scatterData = bubbleData.map((d, index) => ({
    value: d.value,
    name: d.name,
    itemStyle: {
      color: palette[index % palette.length],
    },
  }));

  // Hinzufügen von DataZoom-Komponenten als DragControls
  const option = {
    tooltip: {
      formatter: (params) => {
        const d = bubbleData[params.dataIndex];
        return `
          ${d.name}<br/>
          Growth: ${d.growth.toFixed(1)}%<br/>
          Last Value: ${d.lastValue}<br/>
          Total: ${d.total}
        `;
      },
    },
    xAxis: {
      name: "Growth (%)",
      type: "value",
      splitLine: { show: true },
    },
    yAxis: {
      name: "Last Value",
      type: "value",
      splitLine: { show: true },
    },
    dataZoom: [
      {
        type: "inside", // DragZoom innerhalb des Diagramms
        xAxisIndex: 0,
        yAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider", // Externer Slider (unten)
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider", // Optionale y-Achse-Schieber (links)
        yAxisIndex: 0,
        left: 0,
        start: 0,
        end: 100,
      },
    ],
    series: true
      ? [
          {
            type: "scatter",
            symbolSize: function (data) {
              return Math.sqrt(data[2]) * 0.1;
            },
            data: scatterData,
            label: {
              show: true,
              formatter: (params) => {
                return bubbleData[params.dataIndex].name;
              },
              position: "top",
            },
            emphasis: {
              label: {
                show: true,
                fontWeight: "bold",
                fontSize: 14,
              },
            },
          },
        ]
      : [],
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bubble Cluster Chart: Growth</h2>
      <p className="mb-4">
        This chart shows the percentage growth (x-axis) and the value of the
        last year (y-axis) for each city or region. The size of the bubble
        corresponds to the total value over all years. You can zoom in and out
        of the diagram using DragControls (DataZoom). Growth: The percentage
        change between the first year (start) and the last year (end). Last
        Value: The value of the last year. Total: The sum of values across all
        years.
      </p>
      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      <div className="mb-4">
        <label className="mr-2">Show Top Regions</label>
        <select
          value={topCount}
          onChange={(e) => setTopCount(parseInt(e.target.value))}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question2Chart2;
