import React, { useState, useEffect } from "react";
import Question5Chart1 from "@/components/question5/chart1";
import Question5Chart2 from "@/components/question5/chart2";




const Question5 = () => {
    return (
        <div>
            <h1>Question 7</h1>
            <p>This is the page for Question 1.</p>
            <h2 className="mb-5">add stuff here...</h2>
            <hr></hr>
            <h3 className="text-xl">
                Sub question: How do trends in police recorded crimes differ between all
                EU countries? Whats the most happening crime in the EU?
            </h3>
            <Question5Chart1 />
            <Question5Chart2 />


        </div>
    );
};

export default Question5;
