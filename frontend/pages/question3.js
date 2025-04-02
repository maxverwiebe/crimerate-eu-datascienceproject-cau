/*
 * question3.js
 * This page combines all components related to Question 3.
 */

import Question3Chart1 from "@/components/question3/chart1";
import Question3Chart5 from "@/components/question3/chart5";
import SectionHeader from "@/components/sectionHeader";
import FancyDivider from "@/components/fancyDivider";

const Question3 = () => {
  return (
    <div>
      <SectionHeader
        number={3}
        title={
          "How do legal status influence involvement in bribery and corruption across European countries?"
        }
      />

      <Question3Chart1 />
      <FancyDivider />
      <Question3Chart5 />
    </div>
  );
};

export default Question3;
