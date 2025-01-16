import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Resource = ({ setInput, setResourceType, videos }) => {
  const handleIput = (value, type) => {
    setResourceType(type);
    setInput(value);
  };

  return (
    <Card className='flex-grow flex flex-col w-[300px] h-[540] mr-4'>
      <CardHeader>
        <CardTitle>Sources</CardTitle>
      </CardHeader>
      <CardContent className='flex-grow flex flex-col overflow-y-auto'>
        <div className='h-[200px]'>
          <Accordion
            type='multiple'
            collapsible='true'
            defaultValue={videos[0].title}
          >
            <AccordionItem value={videos[0].title}>
              <AccordionTrigger>Videos</AccordionTrigger>
              {videos.map((video, index) => (
                <AccordionContent key={`${video.url}-${video.title}`}>
                  <Button
                    variant='ghost'
                    onClick={() => handleIput(video.title, "video")}
                  >
                    <Youtube />
                    {video.title}
                  </Button>
                </AccordionContent>
              ))}
            </AccordionItem>
            <AccordionItem value='item-1'>
              <AccordionTrigger>Documents</AccordionTrigger>
              <AccordionContent>
                {/* <Button variant="link" onClick={()=>handleIput("video-ghost","pdf")}>Link</Button> */}
                <blockquote className='mt-6 border-l-2 pl-6 italic'>
                  Coming Soon...
                </blockquote>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default Resource;
