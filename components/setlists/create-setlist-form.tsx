"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { createSetlistAction } from "@/app/setlists/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CreateSetlistForm() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title for your setlist.");
      return;
    }

    startTransition(async () => {
      const result = await createSetlistAction({
        title,
        description,
      });

      if (!result.success || !result.data) {
        const message = result.success
          ? "Unable to create setlist."
          : result.error;
        toast.error(message);
        setError(message);
        return;
      }

      setTitle("");
      setDescription("");
      setIsExpanded(false);
      toast.success("Setlist created");
      router.push(`/setlists/${result.data.id}`);
      router.refresh();
    });
  };

  if (!isExpanded) {
    return (
      <div>
        <Button
          onClick={() => setIsExpanded(true)}
          className="gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Create New Setlist
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new setlist</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Sunday Morning Worship"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add context, scripture references, or rehearsal notes."
              rows={3}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create setlist"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setTitle("");
                setDescription("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


