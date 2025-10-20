import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useChatStore } from "@/hooks/useChatStore"
import { MODELS } from "@/lib/chat"
import { BrainCircuit } from "lucide-react"
export function ModelSelector() {
  const model = useChatStore((s) => s.model)
  const setModel = useChatStore((s) => s.setModel)
  const isProcessing = useChatStore((s) => s.isProcessing)
  return (
    <Select value={model} onValueChange={setModel} disabled={isProcessing}>
      <SelectTrigger className="w-full md:w-[200px] bg-transparent border h-8 text-xs">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-primary" />
          <SelectValue placeholder="Select a model" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-popover border">
        {MODELS.map((m) => (
          <SelectItem key={m.id} value={m.id} className="text-xs">
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}