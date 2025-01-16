import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MCQ from "./MCQ";
import { Button } from "../ui/button";

const Quiz = ({ quiz }) => {
  const onSubmit = (option) => {
    console.log(option);
  };

  return (
    <Card className='flex-grow flex flex-col w-[300px] h-[540px] ml-4'>
      <CardHeader>
        <CardTitle>Quiz</CardTitle>
        <CardDescription>Let's have some fun with these MCQs.</CardDescription>
      </CardHeader>
      <CardContent className='flex-grow flex flex-col overflow-y-auto'>
        {quiz.map((question, index) => (
          <MCQ
            key={index}
            question={question.question}
            options={question.options}
            onSubmit={onSubmit}
          />
        ))}
      </CardContent>
      <Button onClick={onSubmit}>Submit</Button>
    </Card>
  );
};

export default Quiz;
