import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InteractiveFilter from "../interactiveFilter";
import ErrorAlert from "../errorAlert";
import { getCountryCode } from "@dkkoval/react-eu-stats-map";

const EUMap = dynamic(
  () => import("@dkkoval/react-eu-stats-map").then((mod) => mod.default),
  { ssr: false }
);

const Question3Chart5 = () => {
  const [data, setData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    filters.geo?.forEach((g) => params.append("geo", g));
    filters.time?.forEach((t) => params.append("time", t));

    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_API
      }/api/question3/chart5?${params.toString()}`
    )
      .then((res) => res.json())
      .then(({ chart_data, interactive_data, error }) => {
        setData(chart_data);
        setInteractiveData(interactive_data);
        setError(error);
      })
      .catch((err) => setError(err.message));
  }, [filters]);

  if (!data.length) return <div>Lade Daten...</div>;

  const aggregated = Object.values(
    data.reduce((acc, { geo, value }) => {
      if (!acc[geo]) acc[geo] = { geo, value: 0, count: 0 };
      acc[geo].value += value;
      acc[geo].count += 1;
      return acc;
    }, {})
  ).map(({ geo, value, count }) => ({ geo, value: value / count }));

  const mapData = aggregated.reduce((acc, { geo, value }) => {
    const code = getCountryCode(geo) || geo;
    acc[code] = value;
    return acc;
  }, {});

  const title =
    interactiveData?.title ||
    "Average number of people involved in bribery and corruption";
  const valueName = interactiveData?.valueName || "Value";

  return (
    <div>
      <h3 className="text-xl">{title}</h3>
      <InteractiveFilter
        interactiveData={interactiveData}
        onFilterChange={setFilters}
      />
      {error && (
        <div className="text-red-500 mt-4">
          <ErrorAlert message={error} />
        </div>
      )}
      <EUMap
        width={1000}
        height={600}
        title={""}
        valueName={valueName}
        data={mapData}
      />
    </div>
  );
};

export default Question3Chart5;
