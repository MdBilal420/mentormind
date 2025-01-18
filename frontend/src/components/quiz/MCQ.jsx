import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const MCQ = ({ mcq, onSubmit }) => {
  //console.log("MCQ", mcq);
  const { question, options, c } = mcq;
  const [selectedOption, setSelectedOption] = useState({});

  const handleOptionChange = (event, option) => {
    const selection = { [option]: event.target.value };
    setSelectedOption((pre) => ({ ...pre, ...selection }));
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSubmit(selectedOption);
    }
  };

  console.log("SELECTED", selectedOption);

  return (
    <div className='mb-4'>
      <h3 className='font-bold mb-2'>{question}</h3>
      {options.map((option, index) => (
        <div key={option} className='mb-2'>
          <label className='flex items-center'>
            <input
              type='radio'
              name='mcq'
              value={option}
              //checked={selectedOption === option}
              onChange={(e) => handleOptionChange(e, option)}
              className='mr-2'
            />
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default MCQ;
