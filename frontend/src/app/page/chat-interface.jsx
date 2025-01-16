"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import useChat from "@/hooks/useChat";
import Resource from "@/components/resource/Resource";
import Quiz from "@/components/quiz/Quiz";

const ChatInterface = () => {
  const [
    { messages, input, videos, isListening, messagesEndRef, quiz },
    {
      setResourceType,
      handleSend,
      handleVoiceToggle,
      setInput,
      handleFileUpload,
    },
  ] = useChat();

  return (
    <div className='flex flex-col w-mx mx-auto p-4 h-mx-[500px]'>
      <ChatHeader />
      <div className='flex flex-row w-mx mx-auto p-4 h-full'>
        <Resource
          setInput={setInput}
          setResourceType={setResourceType}
          videos={videos}
        />
        <Card className='flex-grow flex flex-col w-[800px] h-full mr-4 ml-4'>
          <CardHeader>
            <CardTitle>Edubot</CardTitle>
          </CardHeader>
          <CardContent className='flex-grow flex flex-col overflow-y-auto'>
            <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
            <ChatInput
              input={input}
              setInput={setInput}
              isListening={isListening}
              handleSend={handleSend}
              handleVoiceToggle={handleVoiceToggle}
            />
          </CardContent>
        </Card>
        <Quiz quiz={quiz} />
      </div>
    </div>
  );
};

export default ChatInterface;
