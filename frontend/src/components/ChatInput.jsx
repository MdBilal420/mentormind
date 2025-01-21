import React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChatInput = ({
  input,
  setInput,
  isListening,
  handleSend,
  handleVoiceToggle,
}) => (
  <div className='flex gap-2'>
    <Button
      variant={isListening ? "destructive" : "outline"}
      size='icon'
      onClick={handleVoiceToggle}
    >
      {isListening ? (
        <MicOff className='h-4 w-4' />
      ) : (
        <Mic className='h-4 w-4' />
      )}
    </Button>

    <Input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={(e) => e.key === "Enter" && handleSend()}
      placeholder='Type your message...'
      className='flex-grow'
    />

    <Button onClick={handleSend}>
      <Send className='h-4 w-4' />
    </Button>
  </div>
);

export default ChatInput;
