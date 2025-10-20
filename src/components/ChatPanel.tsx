import { useChatStore } from "@/hooks/useChatStore"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { ModelSelector } from "./ModelSelector"
import { getGreeting } from "@/lib/utils"
import { Bot, Loader } from "lucide-react"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
const examplePrompts = [
  "What is the weather in San Francisco?",
  "Write a simple React component for a counter.",
  "What are people on Twitter saying about the latest AI trends?",
  "Search the web for recent news about Cloudflare.",
]
export function ChatPanel() {
  const messages = useChatStore((s) => s.messages)
  const streamingMessage = useChatStore((s) => s.streamingMessage)
  const isProcessing = useChatStore((s) => s.isProcessing)
  const isLoading = useChatStore((s) => s.isLoading)
  const setInput = useChatStore((s) => s.setInput)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingMessage]);
  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt)
    // Use a timeout to ensure state update before sending
    setTimeout(() => {
      sendMessage()
    }, 0)
  }
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading session...</p>
      </div>
    )
  }
  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Conversation</h1>
        <ModelSelector />
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.length === 0 && !isProcessing && (
              <div className="text-center text-muted-foreground pt-16 flex flex-col items-center">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-6">{getGreeting()}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                  {examplePrompts.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="text-left justify-start h-auto whitespace-normal bg-background border hover:bg-accent"
                      onClick={() => handleExamplePrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {streamingMessage && (
              <ChatMessage
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingMessage,
                  timestamp: Date.now(),
                }}
              />
            )}
            {isProcessing && !streamingMessage && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="max-w-xl p-4 rounded-2xl bg-secondary border rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse-glow animation-delay-200" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse-glow animation-delay-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <footer className="px-4 pb-2">
        <p className="text-xs text-center text-muted-foreground">
          Although this project has AI capabilities, there is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period.
        </p>
      </footer>
      <ChatInput />
    </div>
  )
}