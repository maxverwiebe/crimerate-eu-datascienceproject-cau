import Question4Chart1 from "@/components/question4/chart1";
import Question4Chart2 from "@/components/question4/chart2";
import Question4Chart3 from "@/components/question4/chart3";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Question4 = () => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Question 4</h1>
      <h2 className="text-3xl font-bold mb-4">
        To what extent is there a correlation between population size, economic
        growth, and the development of crime rates in European countries?
      </h2>
      <Question4Chart1 />
      <Question4Chart2 />
      <Question4Chart3 />
    </div>
  );
};

export default Question4;
