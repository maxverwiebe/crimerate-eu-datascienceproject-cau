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
import SectionHeader from "@/components/sectionHeader";
import FancyDivider from "@/components/fancyDivider";

const Question1 = () => {
  return (
    <div>
      <SectionHeader
        number={1}
        title="How do trends in police recorded crimes differ between all EU countries? Whats the most happening crime in the EU?"
      />
      <Question1Chart1 />
      <FancyDivider />
      <Question1Chart2 />
      <FancyDivider />
      <Question1Chart3 />
    </div>
  );
};

export default Question1;
