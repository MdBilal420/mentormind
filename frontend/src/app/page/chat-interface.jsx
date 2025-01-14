"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Markdown from 'react-markdown'

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  
  // Initialize session ID and speech recognition
  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(7));
    
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      // Store recognition instance
      window.recognition = recognition;
    }
  }, []);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Send message to backend
      const response = await fetch('http://localhost:8000/generate_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input
        }),
      });
      
      const data = await response.json();
      // console.log("DATA",data.explanation);
      // Add bot response to chat
      setMessages(prev => [...prev, { type: 'bot', content: data.explanation }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, there was an error processing your message.' 
      }]);
    }
  };
  
  
  const handleVoiceToggle = () => {
    if (isListening) {
      window.recognition?.stop();
    } else {
      window.recognition?.start();
    }
    setIsListening(!isListening);
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/upload/pdf', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'system',
        content: `Successfully uploaded ${file.name}. You can now ask questions about its content.`
      }]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Sorry, there was an error uploading your file.'
      }]);
    }
  };

  return (
    <div className="flex flex-col mx-auto p-4">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Training Assistant</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col">
          {/* Chat messages */}
          <div className="flex-grow overflow-y-auto mb-4 space-y-4 h-[500px] overflowX-scroll">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-100 ml-auto' 
                    : message.type === 'error'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                } max-w-[80%] ${
                  message.type === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {message.type==='user'? message.content: <Markdown>{message.content}</Markdown>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf"
            /> */}
            
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={handleVoiceToggle}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-grow"
            />
            
            <Button onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;