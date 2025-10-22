import { useState } from "react";
import { Plus, Coffee, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface Session {
  id: string;
  title: string;
  date: string;
  isComplete: boolean;
  numCups: number;
  sessionNotes: string;
}

interface HomeScreenProps {
  sessions: Session[];
  onNewSession: () => void;
  onResumeSession: (id: string) => void;
  onViewSummary: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession: (
    id: string,
    updates: { title: string; numCups: number; sessionNotes: string }
  ) => void;
}

export function HomeScreen({
  sessions,
  onNewSession,
  onResumeSession,
  onViewSummary,
  onDeleteSession,
  onUpdateSession,
}: HomeScreenProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNumCups, setEditNumCups] = useState(1);
  const [editNotes, setEditNotes] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session.id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const handleEditClick = (session: Session) => {
    setSessionToEdit(session);
    setEditTitle(session.title);
    setEditNumCups(session.numCups);
    setEditNotes(session.sessionNotes);
    setEditSheetOpen(true);
  };

  const handleEditSave = () => {
    if (sessionToEdit) {
      onUpdateSession(sessionToEdit.id, {
        title: editTitle,
        numCups: editNumCups,
        sessionNotes: editNotes,
      });
      setEditSheetOpen(false);
      setSessionToEdit(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pt-4">
          <Coffee className="h-8 w-8 text-[#2C2C2C] dark:text-[#E5E5E5]" />
          <h1 className="text-[#1a1a1a] dark:text-[#f5f5f5]">Cupping Sessions</h1>
        </div>

        {/* Primary CTA */}
        <Button
          onClick={onNewSession}
          className="w-full h-14 rounded-xl bg-[#2C2C2C] hover:bg-[#1a1a1a] text-white min-h-[56px]"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Cupping Session
        </Button>

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-[#666] dark:text-[#aaa]">Your Sessions</h2>
          {sessions.length === 0 ? (
            <Card className="p-6 text-center rounded-xl">
              <p className="text-[#999] dark:text-[#666]">
                No sessions yet. Start your first cupping!
              </p>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className="p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-[#1a1a1a] dark:text-[#f5f5f5] mb-1">
                      {session.title || "Untitled Session"}
                    </h3>
                    <p className="text-sm text-[#666] dark:text-[#aaa]">
                      {formatDate(session.date)} • {session.numCups} cups
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.isComplete ? (
                      <Button
                        onClick={() => onViewSummary(session.id)}
                        variant="outline"
                        className="rounded-lg min-h-[44px]"
                      >
                        View Summary
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onResumeSession(session.id)}
                        className="rounded-lg bg-[#2C2C2C] hover:bg-[#1a1a1a] min-h-[44px]"
                      >
                        Resume
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-lg"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            handleEditClick(session);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Session
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            handleDeleteClick(session);
                          }}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              session and all cup scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Session Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-6">
            <SheetTitle>Edit Session Details</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Session Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Ethiopian Naturals - October 2025"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cups">Number of Cups</Label>
              <Input
                id="edit-cups"
                type="number"
                min="1"
                max="30"
                value={editNumCups}
                onChange={(e) =>
                  setEditNumCups(Math.max(1, Math.min(30, Number(e.target.value))))
                }
                className="h-12 rounded-xl"
                inputMode="numeric"
              />
              <p className="text-sm text-[#666] dark:text-[#aaa]">
                {editNumCups > (sessionToEdit?.numCups || 0)
                  ? `Adding ${editNumCups - (sessionToEdit?.numCups || 0)} new cups with default scores`
                  : editNumCups < (sessionToEdit?.numCups || 0)
                  ? `Warning: Removing ${(sessionToEdit?.numCups || 0) - editNumCups} cups will delete their scores`
                  : "Cup count unchanged"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Session Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                placeholder="Roaster, location, cupping date, lot information..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditSheetOpen(false)}
                className="flex-1 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                className="flex-1 h-12 rounded-xl bg-[#2C2C2C] hover:bg-[#1a1a1a]"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
