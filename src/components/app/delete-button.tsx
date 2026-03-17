"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

type DeleteButtonProps = {
  itemLabel: string;
  onDelete: (id: string) => Promise<ActionResult>;
  id: string;
};

export function DeleteButton({ itemLabel, onDelete, id }: DeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-muted-foreground hover:text-destructive"
      disabled={pending}
      onClick={() => {
        const confirmed = window.confirm(
          `Delete ${itemLabel}? This action cannot be undone.`,
        );

        if (!confirmed) return;

        startTransition(async () => {
          const result = await onDelete(id);

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success(result.message);
          router.refresh();
        });
      }}
    >
      <Trash2 className="size-4" />
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
