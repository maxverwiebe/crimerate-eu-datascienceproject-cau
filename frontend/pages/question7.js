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

import Question7Chart1 from "@/components/question7/chart1";
import Question7Chart2 from "@/components/question7/chart2";
import SectionHeader from "@/components/sectionHeader";
import FancyDivider from "@/components/fancyDivider";

const Question7 = () => {
  return (
    <div>
      <SectionHeader
        number={7}
        title="How does crime distribution vary across different age group in European countries?"
      />
      <Question7Chart1 />
      <FancyDivider></FancyDivider>
      <Question7Chart2 />
    </div>
  );
};

export default Question7;
