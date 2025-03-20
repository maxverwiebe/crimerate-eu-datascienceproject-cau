import Question4Chart1 from "@/components/question4/chart1";
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
      <h1>Question 4</h1>
      <p>This is the page for Question 4.</p>
      <Question4Chart1 />
    </div>
  );
};

export default Question4;
