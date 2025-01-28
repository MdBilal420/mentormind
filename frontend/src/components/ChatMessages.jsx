import React from "react";
import Markdown from "react-markdown";

const ChatMessages = ({ messages, messagesEndRef }) => (
  <div className='flex-grow overflow-y-auto mb-4 space-y-4 h-[400px] overflowX-scroll'>
    {messages.length === 0 ? (
      <div className='p-3 rounded-lg bg-gray-100 max-w-[80%] ml-auto'>
        Welcome to the Training Assistant! You can ask questions about the
        content of a PDF file by uploading it or typing your question.
      </div>
    ) : (
      messages.map((message, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            message.type === "user"
              ? "bg-blue-100 ml-auto"
              : message.type === "error"
              ? "bg-red-100"
              : "bg-gray-100"
          } max-w-[80%] ${message.type === "user" ? "ml-auto" : "mr-auto"}`}
        >
          {message.type === "user" ? (
            message.content
          ) : (
            <Markdown>{message.content}</Markdown>
          )}
        </div>
      ))
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;
