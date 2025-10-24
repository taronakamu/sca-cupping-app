import { useState, useRef } from "react";
import { Plus, Coffee, MoreVertical, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
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

interface CupScore {
  cupTitle: string;
  roastLevel: number;
  fragrance: number;
  aromaDryIntensity: number;
  aromaBreakIntensity: number;
  aromaQualities: string;
  flavor: number;
  flavorNotes: string;
  aftertaste: number;
  aftertasteNotes: string;
  acidity: number;
  acidityIntensity: number;
  body: number;
  bodyLevel: number;
  balance: number;
  uniformityIssues: boolean[];
  cleanCupIssues: boolean[];
  sweetnessIssues: boolean[];
  overall: number;
  taintCups: number;
  faultCups: number;
  notes: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  isComplete: boolean;
  numCups: number;
  sessionNotes: string;
  cupScores: CupScore[];
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
  onImportSession: (session: Session) => void;
}

export function HomeScreen({
  sessions,
  onNewSession,
  onResumeSession,
  onViewSummary,
  onDeleteSession,
  onUpdateSession,
  onImportSession,
}: HomeScreenProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNumCups, setEditNumCups] = useState(1);
  const [editNotes, setEditNotes] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        numCups: sessionToEdit.numCups, // Keep original numCups
        sessionNotes: editNotes,
      });
      setEditSheetOpen(false);
      setSessionToEdit(null);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Validate the imported data structure
        if (!importedData.id || !importedData.cupScores || !Array.isArray(importedData.cupScores)) {
          toast.error("Invalid JSON format. Please select a valid cupping session file.");
          return;
        }

        // Create a new session with a new ID and current timestamp
        const newSession: Session = {
          ...importedData,
          id: Date.now().toString(), // Generate new ID to avoid conflicts
          date: new Date().toISOString(), // Use current date
          isComplete: importedData.isComplete ?? false,
        };

        onImportSession(newSession);
        toast.success(`Successfully imported "${newSession.title || 'Untitled Session'}"`);
      } catch (error) {
        console.error("Failed to import session:", error);
        toast.error("Failed to import file. Please check the file format.");
      }
    };

    reader.readAsText(file);
    // Reset the input so the same file can be imported again if needed
    event.target.value = "";
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

        {/* Import Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Button
          onClick={handleImportClick}
          variant="outline"
          className="w-full h-14 rounded-xl min-h-[56px]"
        >
          <Upload className="h-5 w-5 mr-2" />
          Import Session from JSON
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
                    <DropdownMenu
                      open={dropdownOpen === session.id}
                      onOpenChange={(open: boolean) => {
                        setDropdownOpen(open ? session.id : null);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-lg"
                          aria-label="Session options"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        side="bottom"
                        className="w-48"
                        sideOffset={5}
                      >
                        <DropdownMenuItem
                          onSelect={() => {
                            setDropdownOpen(null);
                            handleEditClick(session);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Session
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setDropdownOpen(null);
                            handleDeleteClick(session);
                          }}
                          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
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
                value={editNumCups}
                className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800"
                readOnly
                disabled
              />
              <p className="text-sm text-[#666] dark:text-[#aaa]">
                Cup count cannot be changed after session creation
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
