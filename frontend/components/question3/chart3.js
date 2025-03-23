import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const buildSunburstData = (data) => {
  const filteredData = data.filter((item) => item.sex !== "Total");

  const geoMap = {};
  filteredData.forEach(({ geo, leg_stat, sex, value }) => {
    if (!geoMap[geo]) {
      geoMap[geo] = {};
    }
    if (!geoMap[geo][leg_stat]) {
      geoMap[geo][leg_stat] = {};
    }
    geoMap[geo][leg_stat][sex] = (geoMap[geo][leg_stat][sex] || 0) + value;
  });

  const sunburstData = Object.keys(geoMap).map((geo) => {
    const legStatChildren = Object.keys(geoMap[geo]).map((leg_stat) => {
      const sexChildren = Object.keys(geoMap[geo][leg_stat]).map((sex) => ({
        name: sex,
        value: geoMap[geo][leg_stat][sex],
      }));
      return {
        name: leg_stat,
        children: sexChildren,
        value: sexChildren.reduce((sum, child) => sum + child.value, 0),
      };
    });
    return {
      name: geo,
      children: legStatChildren,
      value: legStatChildren.reduce((sum, child) => sum + child.value, 0),
    };
  });
  return sunburstData;
};

const Question3Chart3 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));
    if (filters.unit) params.append("unit", filters.unit);

    // Verwende hier den API-Endpunkt für Chart3 (ggf. den gleichen Endpunkt, falls die Daten identisch sind)
    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question3/chart2?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data }) => {
        setInteractiveData(interactive_data);
        setData(chart_data);
      })
      .catch(console.error);
  }, [filters]);

  const sunburstData = buildSunburstData(data);

  const option = {
    tooltip: {
      formatter: (info) => {
        const value = info.value;
        return `${info.name}: ${value}`;
      },
    },
    series: [
      {
        type: "sunburst",
        radius: [0, "90%"],
        data: sunburstData,
        label: {
          rotate: "radial",
          formatter: "{b}\n({c})",
        },
        levels: [
          {},
          {
            r0: "15%",
            r: "45%",
            label: {
              align: "right",
            },
          },
          {
            r0: "45%",
            r: "70%",
            label: {
              position: "outside",
              padding: 3,
              silent: false,
            },
            itemStyle: {
              borderWidth: 2,
            },
          },
          {
            r0: "70%",
            r: "72%",
            label: {
              position: "outside",
            },
            itemStyle: {
              borderWidth: 3,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="p-4">
      <h3 className="text-xl">
        Distribution of bribery and corruption involvement by legal status and
        gender per country
      </h3>
      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={setFilters}
      />
      <ReactECharts option={option} style={{ width: "100%", height: 500 }} />
    </div>
  );
};

export default Question3Chart3;
