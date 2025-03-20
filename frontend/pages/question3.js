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

import Question3Chart1 from "@/components/question3/chart1";
import Question3Chart2 from "@/components/question3/chart2";
import Question3Chart3 from "@/components/question3/chart3";
import Question3Chart4 from "@/components/question3/chart4";

const Question3 = () => {
  return (
    <div>
      <h1>Question 1</h1>
      <p>This is the page for Question 3.</p>
      <h2 className="mb-5">add stuff here...</h2>
      <hr></hr>
      <h3 className="text-xl">
        How do legal status and gender influence involvement in bribery and
        corruption across European countries?
      </h3>
      <Question3Chart1 />
      <Question3Chart2 />
      <Question3Chart3 />
      <Question3Chart4 />
    </div>
  );
};

export default Question3;
