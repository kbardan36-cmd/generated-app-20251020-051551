import { Bot, User, Wrench, Copy, Check } from "lucide-react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { cn } from "@/lib/utils"
import type { Message } from "../../worker/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { renderToolCall } from "@/lib/chat"
import { useState } from "react"
interface ChatMessageProps {
  message: Message
}
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({})
  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedStates((prev) => ({ ...prev, [index]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [index]: false }))
      }, 2000)
    })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-start gap-4", isUser && "justify-end")}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-xl p-4 rounded-2xl",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-secondary rounded-bl-none"
        )}
      >
        <article className={cn("prose prose-sm max-w-none", isUser && "prose-invert")}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ref, ...props }) {
                const match = /language-(\w+)/.exec(className || "")
                const codeString = String(children).replace(/\n$/, "")
                const codeBlockId = node.position?.start.offset ?? 0
                return match ? (
                  <div className="relative group">
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy(codeString, codeBlockId)}
                    >
                      {copiedStates[codeBlockId] ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </article>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className={cn("mt-4 pt-3 border-t", isUser ? "border-primary-foreground/20" : "border-border")}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Wrench className="w-3 h-3" />
              <span>Tools Used</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.toolCalls.map((tool, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={cn("text-xs", isUser ? "bg-primary-foreground/10 text-primary-foreground" : "bg-background")}
                >
                  {renderToolCall(tool)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  )
}