import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import ErrorAlert from "../errorAlert";

/**
 * Transformiert die Rohdaten in das Format für ein Sankey-Diagramm.
 * Hier wird angenommen, dass jedes Datenelement die Felder `geo`, `leg_stat`, `sex` und `value` besitzt.
 */
const buildSankeyData = (data) => {
  // Filtere Gesamtwerte (z.B. "Total") aus, um Doppeldeutigkeiten zu vermeiden
  const filteredData = data.filter((item) => item.sex !== "Total");

  // Aggregiere Werte von geo zu leg_stat und von leg_stat zu sex
  const geoLegMap = {};
  const legSexMap = {};
  const nodesSet = new Set();

  filteredData.forEach(({ geo, leg_stat, sex, value }) => {
    // Stelle sicher, dass alle Knoten registriert werden
    nodesSet.add(geo);
    nodesSet.add(leg_stat);
    nodesSet.add(sex);

    // Aggregation für geo -> leg_stat
    const geoLegKey = `${geo} -> ${leg_stat}`;
    geoLegMap[geoLegKey] = (geoLegMap[geoLegKey] || 0) + value;

    // Aggregation für leg_stat -> sex
    const legSexKey = `${leg_stat} -> ${sex}`;
    legSexMap[legSexKey] = (legSexMap[legSexKey] || 0) + value;
  });

  // Erstelle Knoten-Array
  const nodes = Array.from(nodesSet).map((name) => ({ name }));

  // Erstelle Links aus den aggregierten Werten
  const links = [
    ...Object.entries(geoLegMap).map(([key, value]) => {
      const [source, target] = key.split(" -> ");
      return { source, target, value };
    }),
    ...Object.entries(legSexMap).map(([key, value]) => {
      const [source, target] = key.split(" -> ");
      return { source, target, value };
    }),
  ];

  return { nodes, links };
};

const Question3Chart4 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    if (filters.unit) params.append("unit", filters.unit);

    // Verwende hier den API-Endpunkt für Chart4
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

  // Zeige eine Ladeanzeige, wenn noch keine Daten vorhanden sind
  if (!data || data.length === 0) {
    return <div>Lade Daten...</div>;
  }

  // Transformiere die Daten in das Sankey-Format
  const sankeyData = buildSankeyData(data);

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.dataType === "edge") {
          return `${params.data.source} → ${params.data.target}: ${params.data.value}`;
        }
        return `${params.data.name}`;
      },
    },
    series: [
      {
        type: "sankey",
        layout: "none",
        data: sankeyData.nodes,
        links: sankeyData.links,
        emphasis: {
          focus: "adjacency",
        },
        lineStyle: {
          color: "source",
          curveness: 0.5,
        },
      },
    ],
  };

  return (
    <div className="p-4">
      <h3 className="text-xl">
        Sankey diagram: Links between countries, legal status and gender
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

export default Question3Chart4;
