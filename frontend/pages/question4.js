import Question4Chart1 from "@/components/question4/chart1";
import Question4Chart2 from "@/components/question4/chart2";
import Question4Chart3 from "@/components/question4/chart3";
import FancyDivider from "@/components/fancyDivider";
import SectionHeader from "@/components/sectionHeader";

const Question4 = () => {
  return (
    <div>
      <SectionHeader
        number={4}
        title="To what extent is there a correlation between population size, economic
        growth, and the development of crime rates in European countries?"
      ></SectionHeader>
      <Question4Chart1 />
      <FancyDivider />
      <Question4Chart2 />
      <FancyDivider />
      <Question4Chart3 />
    </div>
  );
};

export default Question4;
