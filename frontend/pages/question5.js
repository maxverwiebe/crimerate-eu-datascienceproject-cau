/*
 * question5.js
 * This page combines all components related to Question 5.
 */

import Question5Chart1 from "@/components/question5/chart1";
import Question5Chart2 from "@/components/question5/chart2";
import SectionHeader from "@/components/sectionHeader";
import FancyDivider from "@/components/fancyDivider";

const Question5 = () => {
  return (
    <div>
      <SectionHeader
        number={5}
        title="How does an increased police presence impact crime rates across different countries in Europe?"
      />
      <Question5Chart1 />
      <FancyDivider />
      <Question5Chart2 />
    </div>
  );
};

export default Question5;
