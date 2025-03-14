"use client"
import { Check, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PostActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  action: "approve" | "reject"
  title: string
}

export function PostActionDialog({ isOpen, onClose, onConfirm, action, title }: PostActionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === "approve" ? "Approve" : "Reject"} Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to {action} &quot;{title}&quot;?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={action === "approve" ? "default" : "destructive"} onClick={onConfirm} className="gap-2">
            {action === "approve" ? (
              <>
                <Check className="h-4 w-4" />
                Approve
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

