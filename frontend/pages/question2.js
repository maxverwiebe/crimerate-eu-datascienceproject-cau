import React, { useState, useEffect } from "react";
import SectionHeader from "@/components/sectionHeader";
import FancyDivider from "@/components/fancyDivider";

import Question2Chart1 from "@/components/question2/chart1";
import Question2Chart2 from "@/components/question2/chart2";

const Question2 = () => {
  return (
    <div>
      <SectionHeader
        number={2}
        title={
          "How has the trend of police-recorded crimes evolved in various cities across the EU?"
        }
      />
      <Question2Chart1 />
      <FancyDivider />
      <Question2Chart2 />
    </div>
  );
};

export default Question2;
