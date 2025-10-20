import { useState } from "react"
import { useChatStore } from "@/hooks/useChatStore"
import { useAuthStore } from "@/hooks/useAuthStore"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { MessageSquarePlus, Trash2, Menu, Bot, Pencil, LogOut } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
function RenameSessionDialog({
  session,
  children,
}: {
  session: { id: string; title: string }
  children: React.ReactNode
}) {
  const [newTitle, setNewTitle] = useState(session.title)
  const updateSessionTitle = useChatStore((s) => s.updateSessionTitle)
  const handleRename = () => {
    if (newTitle.trim() && newTitle.trim() !== session.title) {
      updateSessionTitle(session.id, newTitle.trim())
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="bg-card border">
        <AlertDialogHeader>
          <AlertDialogTitle>Rename Session</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a new name for this conversation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-background border"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleRename();
              // Manually close the dialog by clicking the action button
              document.getElementById(`rename-action-${session.id}`)?.click();
            }
          }}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction id={`rename-action-${session.id}`} onClick={handleRename}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
function SidebarContent() {
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const createSession = useChatStore((s) => s.createSession)
  const switchSession = useChatStore((s) => s.switchSession)
  const deleteSession = useChatStore((s) => s.deleteSession)
  const { user, logout } = useAuthStore();
  return (
    <div className="h-full flex flex-col bg-secondary p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-display font-bold">NexusAI</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent"
          onClick={createSession}
        >
          <MessageSquarePlus className="w-5 h-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 -mx-4">
        <div className="px-4 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => switchSession(session.id)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                activeSessionId === session.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent"
              )}
            >
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <RenameSessionDialog session={session}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </RenameSessionDialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSession(session.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${user?.email}`} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="w-9 h-9" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
export function SessionSidebar() {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10 bg-card/80 hover:bg-card"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-full max-w-xs bg-card border-r">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }
  return <SidebarContent />
}