import React, { useState } from 'react';
import { Button } from '@/components/ui/button';


const MCQ = ({ question, options, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2">{question}</h3>
      {options.map((option, index) => (
        <div key={index} className="mb-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="mcq"
              value={option}
              checked={selectedOption === option}
              onChange={handleOptionChange}
              className="mr-2"
            />
            {option}
          </label>
        </div>
      ))}
     
    </div>
  );
};

export default MCQ;