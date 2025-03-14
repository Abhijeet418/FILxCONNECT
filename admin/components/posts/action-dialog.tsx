"use client"

import { motion } from "framer-motion"
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
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  action: "approve" | "reject"
  postTitle: string
}

export function PostActionDialog({ open, onOpenChange, onConfirm, action, postTitle }: PostActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{action === "approve" ? "Approve" : "Reject"} Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to {action} &quot;{postTitle}&quot;?
            {action === "reject" && " This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={action === "approve" ? "default" : "destructive"} onClick={onConfirm} className="gap-2">
            {action === "approve" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Approve
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Reject
              </motion.div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

