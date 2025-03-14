"use client"
import { AlertTriangle, Ban } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ReportActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  action: "warn" | "block"
  targetType: "user" | "post"
  targetName: string
}

export function ReportActionDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  targetType,
  targetName,
}: ReportActionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "warn" ? "Send Warning" : "Block"} {targetType === "user" ? "User" : "Post"}
          </DialogTitle>
          <DialogDescription>
            {action === "warn" ? (
              <>
                Are you sure you want to send a warning to {targetType === "user" ? "user" : "post owner"} &quot;
                {targetName}&quot;?
                {targetType === "user" && " They will be notified about this action."}
              </>
            ) : (
              <>
                Are you sure you want to block {targetType === "user" ? "user" : "post"} &quot;{targetName}&quot;? This
                action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={action === "warn" ? "default" : "destructive"} onClick={onConfirm} className="gap-2">
            {action === "warn" ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Send Warning
              </>
            ) : (
              <>
                <Ban className="h-4 w-4" />
                Block {targetType === "user" ? "User" : "Post"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

