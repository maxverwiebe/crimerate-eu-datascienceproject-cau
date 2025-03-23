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

import Question1Chart1 from "@/components/question1/chart1";
import Question1Chart2 from "@/components/question1/chart2";
import Question1Chart3 from "@/components/question1/chart3";

const Question1 = () => {
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
      <Question1Chart1 />
      <Question1Chart2 />
      <Question1Chart3 />
    </div>
  );
};

export default Question1;
