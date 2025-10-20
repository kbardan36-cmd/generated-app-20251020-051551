import { useEffect } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { SessionSidebar } from "@/components/SessionSidebar"
import { ChatPanel } from "@/components/ChatPanel"
import { useChatStore } from "@/hooks/useChatStore"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
export function HomePage() {
  const initialize = useChatStore((s) => s.initialize)
  const isMobile = useIsMobile()
  useEffect(() => {
    initialize()
  }, [initialize])
  return (
    <div className="h-screen w-screen flex flex-col text-nexus-foreground overflow-hidden">
      <main className="flex-1 flex overflow-hidden">
        {isMobile ? (
          <>
            <SessionSidebar />
            <ChatPanel />
          </>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
              <SessionSidebar />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-transparent" />
            <ResizablePanel defaultSize={75}>
              <ChatPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>
    </div>
  )
}