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

const Question3 = () => {
  return (
    <div>
      <h1>Question 1</h1>
      <p>This is the page for Question 1.</p>
      <h2 className="mb-5">add stuff here...</h2>
      <hr></hr>
      <h3 className="text-xl">
        Sub question: How do trends in police recorded crimes differ between all
        EU countries? Whats the most happening crime in the EU?
      </h3>
      <Question3Chart1 />
    </div>
  );
};

export default Question3;
