import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore } from "@/hooks/useChatStore"
import { useRef, useEffect } from "react"
export function ChatInput() {
  const input = useChatStore((s) => s.input)
  const setInput = useChatStore((s) => s.setInput)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const isProcessing = useChatStore((s) => s.isProcessing)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])
  const handleSend = () => {
    if (input.trim()) {
      sendMessage()
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  return (
    <div className="p-4 bg-card border-t">
      <div className="relative max-w-3xl mx-auto">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask NexusAI anything..."
          rows={1}
          className="w-full bg-background border rounded-full resize-none py-3 pl-4 pr-12 text-base focus-visible:ring-1 focus-visible:ring-ring"
          disabled={isProcessing}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90"
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
        >
          <ArrowUp className="w-5 h-5 text-primary-foreground" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">
        NexusAI may produce inaccurate information. A limited number of requests can be made to the AI servers.
      </p>
    </div>
  )
}