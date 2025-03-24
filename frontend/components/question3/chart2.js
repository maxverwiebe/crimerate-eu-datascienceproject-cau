import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import ErrorAlert from "../errorAlert";

const Question3Chart2 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    if (filters.unit) params.append("unit", filters.unit);

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
      .catch(console.error);
  }, [filters]);

  // Filtere alle Datensätze, die "Total" als sex haben, heraus
  const filteredData = data.filter((item) => item.sex !== "Total");

  // Aggregation der Daten:
  // 1. Aggregiere Werte pro "leg_stat" für den äußeren Kreis
  const outerDataMap = {};
  filteredData.forEach((item) => {
    const { leg_stat, value } = item;
    outerDataMap[leg_stat] = (outerDataMap[leg_stat] || 0) + value;
  });
  const outerData = Object.keys(outerDataMap).map((key) => ({
    name: key,
    value: outerDataMap[key],
  }));

  // 2. Erstelle für jeden "leg_stat" eine Aufschlüsselung nach "sex" für den inneren Kreis
  const innerDataMap = {};
  filteredData.forEach((item) => {
    const { leg_stat, sex, value } = item;
    const mapKey = `${leg_stat}-${sex}`;
    if (!innerDataMap[mapKey]) {
      innerDataMap[mapKey] = { name: sex, value: 0, parent: leg_stat };
    }
    innerDataMap[mapKey].value += value;
  });
  const innerData = Object.values(innerDataMap);

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    series: [
      {
        name: "Leg Stat",
        type: "pie",
        selectedMode: "single",
        radius: [0, "30%"],
        label: {
          position: "inner",
          formatter: "{b}\n({d}%)",
        },
        labelLine: { show: false },
        data: outerData,
      },
      {
        name: "Sex",
        type: "pie",
        radius: ["40%", "55%"],
        label: {
          // Benutzerdefinierte Formatter-Funktion:
          // Hier berechnen wir den Prozentwert des inneren Segments relativ zu seinem Eltern-Segment.
          formatter: (params) => {
            // params.data.parent enthält den Leg Stat-Wert
            const parentTotal = outerDataMap[params.data.parent] || 1;
            const percent = ((params.data.value / parentTotal) * 100).toFixed(
              0
            );
            return `${params.data.name}\n(${percent}%)`;
          },
        },
        data: innerData,
      },
    ],
  };

  return (
    <div className="p-4">
      <h3 className="text-xl">
        Average distribution of bribery and corruption involvement by legal
        status and gender
      </h3>
      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={setFilters}
      />
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error}></ErrorAlert>
        </div>
      )}
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question3Chart2;
