"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", text: input };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error fetching response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#0B3D91] text-white rounded-full p-4 shadow-lg hover:bg-[#061f49] transition-all duration-300 animate-pulse"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-[#000000] shadow-xl rounded-2xl border border-[#0B3D91] flex flex-col">
          <div className="flex justify-between items-center bg-[#0B3D91] text-white px-4 py-2 rounded-t-2xl">
            <div className="flex items-center">
              <span className="font-bold tracking-wider">Your High5 Assistant</span>
              <img
                src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg"
                alt="NASA Logo"
                className="h-4 ml-2"
              />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-[#061f49] p-1 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto max-h-96 bg-[#000000] space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-[#0B3D91] text-white self-end text-right"
                    : "bg-[#1E2A3A] text-white text-left"
                } shadow-lg border border-[#0B3D91]/30`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <p className="text-sm text-[#FC3D21] animate-pulse">
                Thinking...
              </p>
            )}
          </div>

          <div className="flex border-t border-[#0B3D91] p-3 bg-[#000000]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border border-[#0B3D91] rounded-lg px-3 py-2 text-sm bg-[#1E2A3A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              placeholder="Ask me anything..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-[#0B3D91] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#061f49] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}