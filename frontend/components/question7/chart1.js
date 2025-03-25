import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import InteractiveFilter from "@/components/interactiveFilter";
import ErrorAlert from "../errorAlert";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#FF8042",
];

export default function Question7Chart1Mini() {
  const [nestedData, setNestedData] = useState({});
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filterCriteria).forEach(([key, values]) =>
        values.forEach((v) => params.append(key, v))
      );
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question7/chart1${
        params.toString() ? `?${params}` : ""
      }`;

      try {
        const res = await fetch(url);
        const json = await res.json();

        if (json.error) {
          throw new Error(json.error);
        }

        setNestedData(json.chart_data || {});
        setInteractiveData(json.interactive_data);
        setError(json.error);
      } catch (err) {
        setError(err.message || "Unknown error fetching data");
      }
    }

    fetchData();
  }, [filterCriteria]);

  const handleFilterChange = (criteria) => setFilterCriteria(criteria);

  const getMiniChartData = (data) => {
    const result = {};
    Object.entries(data).forEach(([country, times]) =>
      Object.entries(times).forEach(([time, groups]) =>
        Object.entries(groups).forEach(([age, { percentage }]) => {
          result[age] ??= {};
          result[age][time] ??= { time };
          result[age][time][country] = percentage;
        })
      )
    );
    return Object.fromEntries(
      Object.entries(result).map(([age, times]) => [
        age,
        Object.values(times).sort((a, b) => a.time.localeCompare(b.time)),
      ])
    );
  };

  const combinedCountries = (miniData) =>
    Array.from(
      new Set(
        Object.values(miniData)
          .flatMap((arr) => arr.flatMap(Object.keys))
          .filter((key) => key !== "time")
      )
    );

  if (!nestedData || Object.keys(nestedData).length === 0) {
    return <div>Lade Daten…</div>;
  }

  const miniChartData = getMiniChartData(nestedData);
  const ageGroups = Object.keys(miniChartData).sort();
  const countries = combinedCountries(miniChartData);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">
        Question 7 Chart 1 (Mini-Charts)
      </h2>
      <p className="mb-4">Trends der Anteile je Altersgruppe über die Zeit.</p>

      {interactiveData && (
        <InteractiveFilter
          interactiveData={interactiveData}
          onFilterChange={handleFilterChange}
        />
      )}

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="flex flex-wrap mb-4">
        {countries.map((c, i) => (
          <div key={c} className="flex items-center mr-6 mb-2">
            <span
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {c}
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {ageGroups.map((age) => (
          <div key={age} className="border p-4 rounded shadow-sm">
            <h3 className="text-xl mb-2">{age}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={miniChartData[age]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 50]} />
                <Tooltip />
                {countries.map((country, i) => (
                  <Line
                    key={country}
                    dataKey={country}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 1 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
