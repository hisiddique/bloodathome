import { MessageCircle } from "lucide-react";
import { Button } from "./button";

export function ChatButton() {
  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 flex items-center gap-2 rounded-2xl shadow-lg hover:shadow-xl z-50"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-medium">Chat</span>
    </Button>
  );
}
