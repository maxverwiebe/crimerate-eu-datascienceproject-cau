import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const Question2Chart2 = () => {
  const [chartData, setChartData] = useState({ times: [], series: [] });
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({ geo: ["BE"] }); // Standard: Belgium

  // Neue States: Anzahl der Top-Datenpunkte und ob Bubbles angezeigt werden sollen
  const [topCount, setTopCount] = useState(10);
  const [showBubbles, setShowBubbles] = useState(true);

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

  // Berechne für jede Serie (Stadt/Region) den Start-, Endwert, das Wachstum und die Gesamtsumme
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
      // Werte: [Wachstum, letzter Wert, Gesamtwert]
      value: [growth, end, total],
    };
  });

  // Sortiere absteigend nach Gesamtwert und nehme nur die Top-Datenpunkte
  bubbleData.sort((a, b) => b.total - a.total);
  bubbleData = bubbleData.slice(0, topCount);

  // Definiere ein Farbschema
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

  // Baue die Datenreihe so auf, dass jeder Datenpunkt einen eigenen itemStyle-Eintrag mit Farbe bekommt.
  const scatterData = bubbleData.map((d, index) => ({
    value: d.value,
    name: d.name,
    itemStyle: {
      color: palette[index % palette.length],
    },
  }));

  const option = {
    tooltip: {
      formatter: (params) => {
        const d = bubbleData[params.dataIndex];
        return `
          ${d.name}<br/>
          Wachstum: ${d.growth.toFixed(1)}%<br/>
          Letzter Wert: ${d.lastValue}<br/>
          Gesamt: ${d.total}
        `;
      },
    },
    xAxis: {
      name: "Wachstum (%)",
      type: "value",
      splitLine: { show: true },
    },
    yAxis: {
      name: "Letzter Jahreswert",
      type: "value",
      splitLine: { show: true },
    },
    series: showBubbles
      ? [
          {
            type: "scatter",
            symbolSize: function (data) {
              // Kleineren Multiplikator verwenden, damit die Blasen nicht zu groß sind
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
      <h2 className="text-2xl font-bold mb-4">
        Bubble Cluster Chart: Wachstum der intentional homicides
      </h2>
      <p className="mb-4">
        Dieses Diagramm zeigt für jede Stadt bzw. Region den prozentualen
        Wachstum (x-Achse) und den Wert des letzten Jahres (y-Achse). Die Größe
        der Blase entspricht dem Gesamtwert über alle Jahre.
      </p>
      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}
      {/* Zusätzliche Steuerungselemente */}
      <div className="mb-4">
        <label className="mr-2">Top Anzahl anzeigen:</label>
        <select
          value={topCount}
          onChange={(e) => setTopCount(parseInt(e.target.value))}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
        <label className="ml-4">
          <input
            type="checkbox"
            checked={showBubbles}
            onChange={(e) => setShowBubbles(e.target.checked)}
            className="mr-1"
          />
          Bubbles anzeigen
        </label>
      </div>
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question2Chart2;
