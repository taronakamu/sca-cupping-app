import { useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";

interface NewSessionScreenProps {
  onBack: () => void;
  onStartSession: (title: string, numCups: number, notes: string) => void;
}

export function NewSessionScreen({
  onBack,
  onStartSession,
}: NewSessionScreenProps) {
  const [title, setTitle] = useState("");
  const [numCups, setNumCups] = useState(5);
  const [notes, setNotes] = useState("");

  const handleStart = () => {
    onStartSession(title, numCups, notes);
  };

  const incrementCups = () => {
    setNumCups((prev) => Math.min(30, prev + 1));
  };

  const decrementCups = () => {
    setNumCups((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-[#1a1a1a] dark:text-[#f5f5f5]">New Cupping Session</h1>
        </div>

        {/* Form */}
        <Card className="p-6 rounded-xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title (optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Panama Gesha"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Number of Cups</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementCups}
                className="h-12 w-12 rounded-xl min-h-[44px] min-w-[44px]"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <div className="flex-1 h-12 flex items-center justify-center rounded-xl border bg-background min-h-[44px]">
                <span className="text-2xl">{numCups}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementCups}
                className="h-12 w-12 rounded-xl min-h-[44px] min-w-[44px]"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any details about this cupping session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] rounded-xl"
            />
          </div>
        </Card>

        <Button
          onClick={handleStart}
          className="w-full h-14 rounded-xl bg-[#2C2C2C] hover:bg-[#1a1a1a] text-white min-h-[56px]"
        >
          Start Cupping
        </Button>
      </div>
    </div>
  );
}
