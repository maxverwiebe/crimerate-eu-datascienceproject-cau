/*
 * question6.js
 * This page combines all components related to Question 6.
 */

import Question6Chart1 from "@/components/question6/chart1";
import Question6Chart2 from "@/components/question6/chart2";
import FancyDivider from "@/components/fancyDivider";
import SectionHeader from "@/components/sectionHeader";

const Question6 = () => {
  return (
    <div>
      <SectionHeader
        number={6}
        title="How does crime distribution vary by gender across European countries?"
      />
      <Question6Chart1 />
      <FancyDivider />
      <Question6Chart2 />
    </div>
  );
};

export default Question6;
