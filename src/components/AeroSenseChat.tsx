import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Plane, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/store/bookingStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aerosense-chat`;

const AeroSenseChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { searchParams, selectedFlight } = useBookingStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm **AeroSense**, your AI travel assistant. 🛫\n\nI can help you with:\n• **Fare predictions** - When will prices drop?\n• **Best seats** - Comfort & legroom recommendations\n• **Delay risks** - Historical on-time data\n• **Alternate routes** - Cheaper airports nearby\n\nWhat would you like to know?"
      }]);
    }
  }, [isOpen, messages.length]);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    
    const allMessages = [...messages, { id: `user-${Date.now()}`, role: 'user' as const, content: userMessage }];
    
    // Build context from current search
    const context = searchParams ? {
      from: searchParams.from,
      to: searchParams.to,
      date: searchParams.date,
      classType: searchParams.classType,
      passengers: searchParams.passengers,
      route: searchParams ? {
        origin: selectedFlight?.fromCode,
        destination: selectedFlight?.toCode,
      } : undefined,
    } : undefined;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content,
          })),
          context,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let streamDone = false;

      // Add empty assistant message
      const assistantId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🙏"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    streamChat(messageToSend);
  };

  // Format markdown-like content
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '&bull;')
      .replace(/\n/g, '<br/>');
  };

  const quickPrompts = [
    { icon: TrendingUp, text: 'When is the cheapest time to book?' },
    { icon: Plane, text: 'Best seats for comfort?' },
    { icon: MapPin, text: 'Any alternate airports nearby?' },
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-primary to-ocean text-primary-foreground",
          "hover:shadow-xl hover:scale-105",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)]",
          "bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden",
          "transition-all duration-300 transform",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-ocean p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-6 w-6" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold">AeroSense AI</h3>
                <p className="text-xs opacity-80">Powered by Gemini • Travel Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[380px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 rounded-2xl text-sm",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border shadow-sm rounded-bl-md'
                )}
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
              />
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-card border border-border shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(prompt.text);
                  setTimeout(() => handleSend(), 100);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
              >
                <prompt.icon className="h-3 w-3" />
                {prompt.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fares, seats, delays..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            AI-powered insights • All fares in ₹ INR
          </p>
        </div>
      </div>
    </>
  );
};

export default AeroSenseChat;