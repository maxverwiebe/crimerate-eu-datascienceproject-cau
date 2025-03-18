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

import Question2Chart1 from "@/components/question2/chart1";

const Question2 = () => {
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
      <Question2Chart1 />
    </div>
  );
};

export default Question2;
