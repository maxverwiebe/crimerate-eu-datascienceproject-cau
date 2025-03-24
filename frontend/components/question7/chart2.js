import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import InteractiveFilter from "@/components/interactiveFilter";
import ErrorAlert from "../errorAlert";

export default function Question7Chart2() {
  const [histogramData, setHistogramData] = useState([]);
  const [interactiveData, setInteractiveData] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [usePercentage, setUsePercentage] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filterCriteria).forEach(([key, values]) =>
        values.forEach((value) => params.append(key, value))
      );
      params.append("display", usePercentage ? "percentage" : "whole");

      const url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/question7/chart2${
        params.toString() ? `?${params}` : ""
      }`;

      try {
        const response = await fetch(url);
        const json = await response.json();
        if (json.error) throw new Error(json.error);

        const raw = json.chart_data || {};
        const formatted = Object.entries(raw).map(([age, value]) => ({
          age,
          percentage: value,
        }));

        setHistogramData(formatted);
        setInteractiveData(json.interactive_data);
        setError(json.error);
      } catch (err) {
        setError(err.message || "Failed to load data");
      }
    }

    fetchData();
  }, [filterCriteria, usePercentage]);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">
        Crime rate distribution by age groups
      </h2>
      <p className="mb-4">
        Histogram: x-axis = age groups, y-axis ={" "}
        {usePercentage ? "percentage" : "total crimes"}
      </p>

      <label className="mb-4 inline-flex items-center">
        <input
          type="checkbox"
          className="mr-2"
          checked={usePercentage}
          onChange={() => setUsePercentage((prev) => !prev)}
        />
        Use Percentage
      </label>

      {interactiveData && (
        <div className="mb-6">
          <InteractiveFilter
            interactiveData={interactiveData}
            onFilterChange={setFilterCriteria}
          />
        </div>
      )}

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={histogramData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="percentage"
            name={usePercentage ? "Percentage" : "Total Crimes"}
            fill="#8884d8"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
