import { useRef, useEffect } from "react";

export interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  messages: Message[];
  isVisible: boolean;
}

const ConversationHistory = ({ messages, isVisible }: ConversationHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isVisible || messages.length === 0) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="absolute top-20 left-4 right-4 max-h-[30vh] overflow-hidden rounded-lg border border-primary/30 bg-black/80 backdrop-blur-sm"
      style={{
        boxShadow: "0 0 20px hsl(185 100% 50% / 0.1), inset 0 0 20px hsl(185 100% 50% / 0.05)"
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-primary/20 flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full bg-primary animate-pulse"
          style={{ boxShadow: "0 0 8px hsl(185 100% 50% / 0.8)" }}
        />
        <span className="text-primary/80 text-xs uppercase tracking-wider font-medium">
          Histórico de Conversa
        </span>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="overflow-y-auto max-h-[calc(30vh-40px)] p-3 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex flex-col gap-1 animate-fade-in ${
              message.type === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Label */}
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-1">
              {message.type === "user" ? "Você" : "JARVIS"} • {formatTime(message.timestamp)}
            </span>
            
            {/* Message bubble */}
            <div 
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                message.type === "user" 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "bg-muted/30 text-foreground border border-muted/40"
              }`}
              style={{
                boxShadow: message.type === "user" 
                  ? "0 0 10px hsl(185 100% 50% / 0.1)" 
                  : "none"
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationHistory;
