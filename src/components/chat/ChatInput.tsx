"use client";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";

interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } = useContext(ChatContext);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    addMessage();
    textareaRef.current?.focus();
  };

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form
        className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
        onSubmit={handleSubmit}
      >
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                rows={1}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                placeholder="Ask quill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Prevent form submission on Enter
                    addMessage();
                    textareaRef.current?.focus();
                  }
                }}
                className="resize-none pr-12 text-base py-3  scrollbar-thumb-purple scrollbar-thumb-rounded scrollbar-track-purple-lighter scrollbar-w-2 scrolling-touch"
              />

              <Button
                className="absolute bottom-1 right-[8px]"
                aria-label="send message"
                disabled={isLoading || isDisabled}
                type="submit"
              >
                <Send className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
