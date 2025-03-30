import Question1Chart1 from "@/components/question1/chart1";
import Question1Chart2 from "@/components/question1/chart2";
import Question1Chart3 from "@/components/question1/chart3";
import Question1Chart4 from "@/components/question1/chart4";
import SectionHeader from "@/components/sectionHeader";
import FancyDivider from "@/components/fancyDivider";

const Question1 = () => {
  return (
    <div>
      <SectionHeader
        number={1}
        title="How do trends in police recorded crimes differ between European countries?"
      />
      <Question1Chart1 />
      <FancyDivider />
      <Question1Chart2 />
      <FancyDivider />
      <Question1Chart3 />
      <FancyDivider />
      <Question1Chart4 />
    </div>
  );
};

export default Question1;
