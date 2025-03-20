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
          Bevölkerung: ${population.toLocaleString()}<br/>
          BIP-Wachstum: ${gdpGrowth}%<br/>
          Kriminalitätsrate: ${crimeRate.toFixed(2)} pro 100.000 Einwohner
        `;
      },
    },
    xAxis: {
      name: "Bevölkerungszahl",
      type: "log",
      splitLine: { show: true },
    },
    yAxis: {
      name: "BIP-Wachstum (%)",
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
        Bubble Chart - Bevölkerung, BIP-Wachstum und Kriminalitätsrate pro
        100.000 Einwohner ({selectedYear})
      </h2>
      <p className="mb-4">
        Dieses Diagramm zeigt die Bevölkerungszahl (logarithmisch, x-Achse), das
        BIP-Wachstum (y-Achse) und die Kriminalitätsrate (Größe der Blase) pro
        100.000 Einwohner für jedes Land.
      </p>

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
