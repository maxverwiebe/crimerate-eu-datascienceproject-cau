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
  const filtered = data.filter((d) => d.sex !== "Total");

  // 1) Sammle alle Knotennamen
  const nodeSet = new Set(["Convicted person"]);
  filtered.forEach(({ geo, leg_stat, sex }) => {
    nodeSet.add(geo);
    nodeSet.add(leg_stat);
    nodeSet.add(sex);
  });
  const nodes = Array.from(nodeSet).map((name) => ({ name }));
  const indexOf = (name) => nodes.findIndex((n) => n.name === name);

  // 2) Hilfsfunktion zum Aggregieren
  const accumulate = (map, src, tgt, val) => {
    const key = `${src}→${tgt}`;
    map[key] = (map[key] || 0) + val;
  };

  const geoLeg = {},
    legConv = {},
    convSex = {},
    legSex = {};

  filtered.forEach(({ geo, leg_stat, sex, value }) => {
    accumulate(geoLeg, geo, leg_stat, value);

    if (leg_stat === "Suspected_person") {
      accumulate(legConv, "Suspected_person", "Convicted person", value);
      accumulate(convSex, "Convicted person", sex, value);
    } else {
      accumulate(legSex, leg_stat, sex, value);
    }
  });

  const makeLinks = (map) =>
    Object.entries(map).map(([k, v]) => {
      const [src, tgt] = k.split("→");
      return { source: indexOf(src), target: indexOf(tgt), value: v };
    });

  return {
    nodes,
    links: [
      ...makeLinks(geoLeg),
      ...makeLinks(legConv),
      ...makeLinks(convSex),
      ...makeLinks(legSex),
    ],
  };
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
