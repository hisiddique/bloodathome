import { MessageCircle } from "lucide-react";

export function ChatButton() {
  return (
    <button className="fixed bottom-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
      <MessageCircle className="w-5 h-5" />
      <span className="font-medium">Chat</span>
    </button>
  );
}

export default ChatButton;
