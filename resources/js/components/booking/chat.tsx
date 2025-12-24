import { useState, useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

interface BookingChatProps {
  bookingId: string;
  phlebotomistName: string;
  phlebotomistImage?: string;
  onClose: () => void;
}

export function BookingChat({
  bookingId,
  phlebotomistName,
  phlebotomistImage,
  onClose,
}: BookingChatProps) {
  const { auth } = usePage<{ auth?: { user?: { id: string } } }>().props;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = auth?.user?.id || null;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          sender_type: "patient",
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <img
          src={phlebotomistImage || "/placeholder.svg"}
          alt={phlebotomistName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{phlebotomistName}</h3>
          <p className="text-xs text-muted-foreground">Your Phlebotomist</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet.</p>
            <p className="text-sm">Send a message to your phlebotomist!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === "patient" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  msg.sender_type === "patient"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p>{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_type === "patient"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(new Date(msg.created_at), "HH:mm")}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full py-6"
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            size="icon"
            className="rounded-full h-12 w-12"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BookingChat;
