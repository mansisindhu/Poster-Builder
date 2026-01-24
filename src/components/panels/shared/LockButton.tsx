"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

interface LockButtonProps {
  locked: boolean;
  onToggleLock: () => void;
}

export function LockButton({ locked, onToggleLock }: LockButtonProps) {
  return (
    <Button
      variant={locked ? "default" : "outline"}
      size="sm"
      onClick={onToggleLock}
      className="w-full"
    >
      {locked ? (
        <>
          <Lock className="w-4 h-4 mr-2" />
          Unlock
        </>
      ) : (
        <>
          <Unlock className="w-4 h-4 mr-2" />
          Lock
        </>
      )}
    </Button>
  );
}