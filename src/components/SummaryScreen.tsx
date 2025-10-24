import { useState } from "react";
import {
  ArrowLeft,
  FileJson,
  FileSpreadsheet,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
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
  numCups: number;
  sessionNotes: string;
  cupScores: CupScore[];
}

interface SummaryScreenProps {
  session: Session;
  onBack: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession: (
    id: string,
    updates: { title: string; numCups: number; sessionNotes: string }
  ) => void;
}

export function SummaryScreen({
  session,
  onBack,
  onDeleteSession,
  onUpdateSession,
}: SummaryScreenProps) {
  const [openCups, setOpenCups] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [editNumCups, setEditNumCups] = useState(session.numCups);
  const [editNotes, setEditNotes] = useState(session.sessionNotes);

  const toggleCup = (index: number) => {
    if (openCups.includes(index)) {
      setOpenCups(openCups.filter((i) => i !== index));
    } else {
      setOpenCups([...openCups, index]);
    }
  };

  const handleDeleteConfirm = () => {
    onDeleteSession(session.id);
    setDeleteDialogOpen(false);
  };

  const handleEditSave = () => {
    onUpdateSession(session.id, {
      title: editTitle,
      numCups: editNumCups,
      sessionNotes: editNotes,
    });
    setEditSheetOpen(false);
    toast.success("Session updated successfully");
  };

  const calculateTotal = (cup: CupScore): number => {
    // Calculate scores from issue arrays
    const uniformityScore = 10 - (cup.uniformityIssues.filter(x => x).length * 2);
    const cleanCupScore = 10 - (cup.cleanCupIssues.filter(x => x).length * 2);
    const sweetnessScore = 10 - (cup.sweetnessIssues.filter(x => x).length * 2);

    const scoreSum =
      cup.fragrance +
      cup.flavor +
      cup.aftertaste +
      cup.acidity +
      cup.body +
      cup.balance +
      cup.overall +
      uniformityScore +
      cleanCupScore +
      sweetnessScore;

    const defectDeduction = cup.taintCups * 2 + cup.faultCups * 4;

    return Number((scoreSum - defectDeduction).toFixed(2));
  };

  const getLevelLabel = (value: number, labels: string[]): string => {
    return labels[value - 1] || "";
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `cupping-${session.id}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast.success("JSON exported successfully");
  };

  const exportCSV = () => {
    const headers = [
      "Cup",
      "Roast Level",
      "Fragrance/Aroma",
      "Aroma Dry Intensity",
      "Aroma Break Intensity",
      "Aroma Qualities",
      "Flavor",
      "Flavor Notes",
      "Aftertaste",
      "Aftertaste Notes",
      "Acidity",
      "Acidity Intensity",
      "Body",
      "Body Level",
      "Balance",
      "Uniformity",
      "Clean Cup",
      "Sweetness",
      "Overall",
      "Taint Cups",
      "Fault Cups",
      "Defect Deduction",
      "Total",
      "Notes",
    ];

    const rows = session.cupScores.map((cup, index) => {
      const defectDeduction = cup.taintCups * 2 + cup.faultCups * 4;
      const uniformityScore = 10 - (cup.uniformityIssues.filter(x => x).length * 2);
      const cleanCupScore = 10 - (cup.cleanCupIssues.filter(x => x).length * 2);
      const sweetnessScore = 10 - (cup.sweetnessIssues.filter(x => x).length * 2);

      return [
        `"${cup.cupTitle || `Cup #${index + 1}`}"`,
        cup.roastLevel,
        cup.fragrance,
        cup.aromaDryIntensity,
        cup.aromaBreakIntensity,
        `"${cup.aromaQualities || ""}"`,
        cup.flavor,
        `"${cup.flavorNotes || ""}"`,
        cup.aftertaste,
        `"${cup.aftertasteNotes || ""}"`,
        cup.acidity,
        cup.acidityIntensity,
        cup.body,
        cup.bodyLevel,
        cup.balance,
        uniformityScore,
        cleanCupScore,
        sweetnessScore,
        cup.overall,
        cup.taintCups,
        cup.faultCups,
        `-${defectDeduction}`,
        calculateTotal(cup),
        `"${(cup.notes || "").replace(/"/g, '""')}"`, // Escape double quotes in notes
      ];
    });

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    // Add BOM for UTF-8 to prevent character encoding issues on Windows
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    // Create a Blob with UTF-8 encoding
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const exportFileDefaultName = `cupping-${session.id}.csv`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    // Clean up the URL object
    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const intensityLabels = ["Very Low", "Low", "Medium", "High", "Very High"];
  const bodyLabels = ["Very Light", "Light", "Medium", "Heavy", "Very Heavy"];
  const roastLabels = ["Light", "Med-Light", "Medium", "Med-Dark", "Dark"];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-xl min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-[#1a1a1a] dark:text-[#f5f5f5]">Session Summary</h1>
          </div>
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
                  setEditSheetOpen(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Session
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Session Info */}
        <Card className="p-5 rounded-xl">
          <h2 className="text-[#1a1a1a] dark:text-[#f5f5f5] mb-2">
            {session.title || "Untitled Session"}
          </h2>
          <p className="text-sm text-[#666] dark:text-[#aaa]">
            {new Date(session.date).toLocaleDateString()} • {session.numCups} cups
          </p>
          {session.sessionNotes && (
            <p className="mt-3 text-sm text-[#666] dark:text-[#aaa]">
              {session.sessionNotes}
            </p>
          )}
        </Card>

        {/* Cup Results */}
        <div>
          <h2 className="text-sm uppercase tracking-wide text-[#666] dark:text-[#999] mb-3 px-1">
            Cup Scores
          </h2>
          <div className="space-y-3">
            {session.cupScores.map((cup, index) => (
              <Collapsible
                key={index}
                open={openCups.includes(index)}
                onOpenChange={() => toggleCup(index)}
              >
                <Card className="rounded-xl overflow-hidden">
                  <CollapsibleTrigger className="w-full p-5 text-left hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors min-h-[60px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[#1a1a1a] dark:text-[#f5f5f5]">
                          {cup.cupTitle || `Cup #${index + 1}`}
                        </h3>
                      </div>
                      <div className="text-2xl text-[#1a1a1a] dark:text-[#E5E5E5] tabular-nums">
                        {calculateTotal(cup)}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-5 pb-5 space-y-5 border-t pt-5">
                      {/* Roast Level */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wide text-[#666] dark:text-[#999] mb-2">
                          Roast Level
                        </h3>
                        <div className="text-[#1a1a1a] dark:text-[#f5f5f5]">
                          {roastLabels[cup.roastLevel - 1]} ({cup.roastLevel}/5)
                        </div>
                      </div>

                      {/* Fragrance/Aroma */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wide text-[#666] dark:text-[#999] mb-3">
                          Fragrance / Aroma
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-[#666] dark:text-[#aaa]">Score</span>
                            <span className="text-[#1a1a1a] dark:text-[#f5f5f5] tabular-nums">
                              {cup.fragrance.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#666] dark:text-[#aaa]">Dry Intensity</span>
                            <span className="text-[#1a1a1a] dark:text-[#f5f5f5]">
                              {getLevelLabel(cup.aromaDryIntensity, intensityLabels)} ({cup.aromaDryIntensity}/5)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#666] dark:text-[#aaa]">Break Intensity</span>
                            <span className="text-[#1a1a1a] dark:text-[#f5f5f5]">
                              {getLevelLabel(cup.aromaBreakIntensity, intensityLabels)} ({cup.aromaBreakIntensity}/5)
                            </span>
                          </div>
                          {cup.aromaQualities && (
                            <div className="pt-1">
                              <div className="text-xs text-[#666] dark:text-[#aaa]">Qualities</div>
                              <div className="text-sm text-[#1a1a1a] dark:text-[#f5f5f5] italic">
                                {cup.aromaQualities}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Taste Attributes */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wide text-[#666] dark:text-[#999] mb-3">
                          Taste
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Flavor</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5] tabular-nums">
                              {cup.flavor.toFixed(2)}
                            </div>
                            {cup.flavorNotes && (
                              <div className="text-xs text-[#666] dark:text-[#aaa] italic mt-0.5">
                                {cup.flavorNotes}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Aftertaste</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5] tabular-nums">
                              {cup.aftertaste.toFixed(2)}
                            </div>
                            {cup.aftertasteNotes && (
                              <div className="text-xs text-[#666] dark:text-[#aaa] italic mt-0.5">
                                {cup.aftertasteNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Structure */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wide text-[#666] dark:text-[#999] mb-3">
                          Structure
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Acidity</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5] tabular-nums">
                              {cup.acidity.toFixed(2)}
                            </div>
                            <div className="text-xs text-[#666] dark:text-[#aaa] mt-0.5">
                              Intensity: {getLevelLabel(cup.acidityIntensity, intensityLabels)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Body</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5] tabular-nums">
                              {cup.body.toFixed(2)}
                            </div>
                            <div className="text-xs text-[#666] dark:text-[#aaa] mt-0.5">
                              Level: {getLevelLabel(cup.bodyLevel, bodyLabels)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Balance</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5] tabular-nums">
                              {cup.balance.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Consistency */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wide text-[#666] dark:text-[#999] mb-3">
                          Consistency
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Uniformity</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5]">
                              {10 - (cup.uniformityIssues.filter(x => x).length * 2)}/10
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Clean Cup</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5]">
                              {10 - (cup.cleanCupIssues.filter(x => x).length * 2)}/10
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-[#666] dark:text-[#aaa]">Sweetness</div>
                            <div className="text-[#1a1a1a] dark:text-[#f5f5f5]">
                              {10 - (cup.sweetnessIssues.filter(x => x).length * 2)}/10
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Overall */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wide text-[#666] dark:text-[#999] mb-3">
                          Overall
                        </h3>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#666] dark:text-[#aaa]">Score</span>
                          <span className="text-[#1a1a1a] dark:text-[#f5f5f5] tabular-nums">
                            {cup.overall.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Defects */}
                      {(cup.taintCups > 0 || cup.faultCups > 0) && (
                        <div>
                          <h3 className="text-xs uppercase tracking-wide text-[#666] dark:text-[#999] mb-3">
                            Defects
                          </h3>
                          <div className="space-y-1">
                            {cup.taintCups > 0 && (
                              <div className="text-sm text-[#1a1a1a] dark:text-[#f5f5f5]">
                                Taint: {cup.taintCups} cups (−{cup.taintCups * 2} pts)
                              </div>
                            )}
                            {cup.faultCups > 0 && (
                              <div className="text-sm text-[#1a1a1a] dark:text-[#f5f5f5]">
                                Fault: {cup.faultCups} cups (−{cup.faultCups * 4} pts)
                              </div>
                            )}
                            <div className="text-sm text-[#666] dark:text-[#999] pt-1">
                              Total Deduction: −{cup.taintCups * 2 + cup.faultCups * 4} points
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {cup.notes && (
                        <div className="pt-3 border-t">
                          <div className="text-sm text-[#666] dark:text-[#aaa] mb-1">
                            Additional Notes
                          </div>
                          <div className="text-sm text-[#1a1a1a] dark:text-[#f5f5f5] whitespace-pre-wrap">
                            {cup.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={exportJSON}
            variant="outline"
            className="w-full h-12 rounded-xl min-h-[44px]"
          >
            <FileJson className="h-5 w-5 mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={exportCSV}
            variant="outline"
            className="w-full h-12 rounded-xl min-h-[44px]"
          >
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={onBack}
            className="w-full h-12 rounded-xl bg-[#1a1a1a] hover:bg-[#000] dark:bg-[#f5f5f5] dark:text-[#1a1a1a] dark:hover:bg-white min-h-[44px]"
          >
            Back to Home
          </Button>
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
              className="rounded-xl bg-[#1a1a1a] hover:bg-[#000] dark:bg-[#f5f5f5] dark:text-[#1a1a1a] dark:hover:bg-white"
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
                {editNumCups > session.numCups
                  ? `Adding ${editNumCups - session.numCups} new cups with default scores`
                  : editNumCups < session.numCups
                  ? `Warning: Removing ${session.numCups - editNumCups} cups will delete their scores`
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
                className="flex-1 h-12 rounded-xl bg-[#1a1a1a] hover:bg-[#000] dark:bg-[#f5f5f5] dark:text-[#1a1a1a] dark:hover:bg-white"
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
