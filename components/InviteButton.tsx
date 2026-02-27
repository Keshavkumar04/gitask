"use client";

import { useProject } from "@/hooks/use-project";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Copy, UserPlus } from "lucide-react";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <p className="text-sm text-gray-500">
              Share this link with your team to collaborate on this project.
            </p>
          </DialogHeader>

          <div className="flex items-center space-x-2 mt-4">
            <div
              className="flex-1 text-sm bg-gray-50 border rounded-md px-3 py-2 truncate cursor-pointer select-all hover:bg-gray-100 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/join/${projectId}`,
                );
                toast.success("Link copied to clipboard!");
              }}
            >
              {`${window.location.origin}/join/${projectId}`}
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/join/${projectId}`,
                );
                toast.success("Link copied to clipboard!");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4" />
      </Button>
    </>
  );
};

export default InviteButton;
