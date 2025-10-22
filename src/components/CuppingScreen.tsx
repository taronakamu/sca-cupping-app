import { useState, useEffect } from "react";
import { ArrowLeft, StickyNote, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ScoreControl } from "./ScoreControl";

interface CupScore {
  cupTitle: string;
  fragrance: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
  overall: number;
  uniformity: number;
  cleanCup: number;
  sweetness: number;
  defectType: string;
  defectCount: number;
  notes: string;
}

interface CuppingScreenProps {
  sessionTitle: string;
  numCups: number;
  cupScores: CupScore[];
  onBack: () => void;
  onUpdateCup: (cupIndex: number, scores: CupScore) => void;
  onFinish: () => void;
}

export function CuppingScreen({
  sessionTitle,
  numCups,
  cupScores,
  onBack,
  onUpdateCup,
  onFinish,
}: CuppingScreenProps) {
  const [activeCup, setActiveCup] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [animateTotal, setAnimateTotal] = useState(false);

  const currentCup = cupScores[activeCup];

  const updateScore = <K extends keyof CupScore>(key: K, value: CupScore[K]) => {
    onUpdateCup(activeCup, { ...currentCup, [key]: value });
    // Trigger animation on score update
    setAnimateTotal(true);
  };

  useEffect(() => {
    if (animateTotal) {
      const timer = setTimeout(() => setAnimateTotal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animateTotal]);

  const calculateTotal = (cup: CupScore): number => {
    const scoreSum =
      cup.fragrance +
      cup.flavor +
      cup.aftertaste +
      cup.acidity +
      cup.body +
      cup.balance +
      cup.overall +
      cup.uniformity +
      cup.cleanCup +
      cup.sweetness;

    const defectDeduction = cup.defectType === "taint" 
      ? cup.defectCount * 2 
      : cup.defectType === "fault"
      ? cup.defectCount * 4
      : 0;

    return Number((scoreSum - defectDeduction).toFixed(2));
  };

  // Direct selection - clicking box 3 sets value to 3 (6 points)
  const handleUniformitySelect = (index: number) => {
    const newValue = (index + 1) * 2; // 0->2, 1->4, 2->6, 3->8, 4->10
    updateScore("uniformity", newValue);
  };

  const handleCleanCupSelect = (index: number) => {
    const newValue = (index + 1) * 2;
    updateScore("cleanCup", newValue);
  };

  const handleSweetnessSelect = (index: number) => {
    const newValue = (index + 1) * 2;
    updateScore("sweetness", newValue);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212]">
      {/* Header */}
      <div className="sticky top-0 bg-[#FAFAFA] dark:bg-[#121212] border-b z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-xl min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-[#1a1a1a] dark:text-[#f5f5f5]">
              {sessionTitle || "Cupping Session"}
            </h1>
          </div>
          <Button
            onClick={() => setShowFinishDialog(true)}
            variant="outline"
            className="rounded-lg min-h-[44px] bg-[#2C2C2C] text-white hover:bg-[#1a1a1a] border-[#2C2C2C]"
          >
            Finish
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeCup.toString()}
        onValueChange={(v) => setActiveCup(parseInt(v))}
        className="w-full"
      >
        <div className="sticky top-[57px] bg-[#FAFAFA] dark:bg-[#121212] border-b z-10 overflow-x-auto">
          <TabsList className="w-full max-w-2xl mx-auto flex justify-start h-12 bg-transparent">
            {Array.from({ length: numCups }, (_, i) => (
              <TabsTrigger
                key={i}
                value={i.toString()}
                className="flex-shrink-0 px-6 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#2C2C2C] rounded-none"
              >
                #{i + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content */}
        {Array.from({ length: numCups }, (_, i) => (
          <TabsContent key={i} value={i.toString()} className="p-4 pb-24">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Cup Title */}
              <Card className="p-5 rounded-xl">
                <Label htmlFor="cupTitle" className="text-[#2C2C2C] dark:text-[#E5E5E5]">
                  Cup Name (optional)
                </Label>
                <Input
                  id="cupTitle"
                  placeholder={`Cup #${i + 1}`}
                  value={currentCup.cupTitle}
                  onChange={(e) => updateScore("cupTitle", e.target.value)}
                  className="mt-2 h-12 rounded-xl min-h-[44px]"
                />
              </Card>

              {/* Core Attributes */}
              <div>
                <h2 className="text-sm uppercase tracking-wide text-[#666] dark:text-[#999] mb-3 px-1">
                  Core Attributes
                </h2>
                <Card className="p-5 rounded-xl space-y-6">
                  <ScoreControl
                    label="Fragrance/Aroma"
                    value={currentCup.fragrance}
                    onChange={(v) => updateScore("fragrance", v)}
                  />
                  <ScoreControl
                    label="Flavor"
                    value={currentCup.flavor}
                    onChange={(v) => updateScore("flavor", v)}
                  />
                  <ScoreControl
                    label="Aftertaste"
                    value={currentCup.aftertaste}
                    onChange={(v) => updateScore("aftertaste", v)}
                  />
                  <ScoreControl
                    label="Acidity"
                    value={currentCup.acidity}
                    onChange={(v) => updateScore("acidity", v)}
                  />
                  <ScoreControl
                    label="Body"
                    value={currentCup.body}
                    onChange={(v) => updateScore("body", v)}
                  />
                  <ScoreControl
                    label="Balance"
                    value={currentCup.balance}
                    onChange={(v) => updateScore("balance", v)}
                  />
                  <ScoreControl
                    label="Overall"
                    value={currentCup.overall}
                    onChange={(v) => updateScore("overall", v)}
                  />
                </Card>
              </div>

              {/* Consistency & Defects */}
              <div>
                <h2 className="text-sm uppercase tracking-wide text-[#666] dark:text-[#999] mb-3 px-1">
                  Consistency & Defects
                </h2>
                <Card className="p-5 rounded-xl space-y-6">
                  <div>
                    <Label className="text-[#2C2C2C] dark:text-[#E5E5E5] mb-3 block">
                      Uniformity ({currentCup.uniformity}/10)
                    </Label>
                    <div className="flex gap-3 justify-center md:gap-4">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleUniformitySelect(idx)}
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-md border-2 transition-all active:scale-90 ${
                            currentCup.uniformity >= (idx + 1) * 2
                              ? "bg-[#333] border-[#333] dark:bg-[#444] dark:border-[#444]"
                              : "bg-[#f5f5f5] border-[#CCC] dark:bg-[#1a1a1a] dark:border-[#555]"
                          }`}
                          aria-label={`Set uniformity to ${(idx + 1) * 2}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#2C2C2C] dark:text-[#E5E5E5] mb-3 block">
                      Clean Cup ({currentCup.cleanCup}/10)
                    </Label>
                    <div className="flex gap-3 justify-center md:gap-4">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCleanCupSelect(idx)}
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-md border-2 transition-all active:scale-90 ${
                            currentCup.cleanCup >= (idx + 1) * 2
                              ? "bg-[#333] border-[#333] dark:bg-[#444] dark:border-[#444]"
                              : "bg-[#f5f5f5] border-[#CCC] dark:bg-[#1a1a1a] dark:border-[#555]"
                          }`}
                          aria-label={`Set clean cup to ${(idx + 1) * 2}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#2C2C2C] dark:text-[#E5E5E5] mb-3 block">
                      Sweetness ({currentCup.sweetness}/10)
                    </Label>
                    <div className="flex gap-3 justify-center md:gap-4">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSweetnessSelect(idx)}
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-md border-2 transition-all active:scale-90 ${
                            currentCup.sweetness >= (idx + 1) * 2
                              ? "bg-[#333] border-[#333] dark:bg-[#444] dark:border-[#444]"
                              : "bg-[#f5f5f5] border-[#CCC] dark:bg-[#1a1a1a] dark:border-[#555]"
                          }`}
                          aria-label={`Set sweetness to ${(idx + 1) * 2}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[#2C2C2C] dark:text-[#E5E5E5]">Defects</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        value={currentCup.defectType}
                        onValueChange={(v) => updateScore("defectType", v)}
                      >
                        <SelectTrigger className="h-12 rounded-xl min-h-[44px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="taint">Taint (-2)</SelectItem>
                          <SelectItem value="fault">Fault (-4)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        value={currentCup.defectCount}
                        onChange={(e) =>
                          updateScore("defectCount", parseInt(e.target.value) || 0)
                        }
                        placeholder="Count"
                        className="h-12 rounded-xl min-h-[44px]"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Total Score */}
              <Card 
                className={`p-6 rounded-xl text-center bg-[#2C2C2C] text-white transition-all duration-300 ${
                  animateTotal ? "scale-105" : "scale-100"
                }`}
              >
                <div className="text-sm opacity-90 mb-1">Total Score</div>
                <div className="text-4xl">{calculateTotal(currentCup)}</div>
              </Card>

              {/* Secondary Finish Link */}
              <button
                onClick={() => setShowFinishDialog(true)}
                className="w-full flex items-center justify-center gap-2 text-[#666] dark:text-[#999] hover:text-[#2C2C2C] dark:hover:text-[#E5E5E5] transition-colors py-3"
              >
                Finish Session
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Floating Notes Button */}
      <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#2C2C2C] hover:bg-[#1a1a1a] shadow-lg min-h-[56px] min-w-[56px]"
          >
            <StickyNote className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>
              Notes — {currentCup.cupTitle || `Cup #${activeCup + 1}`}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-60px)]">
            <Textarea
              placeholder="Add freeform notes about this cup..."
              value={currentCup.notes}
              onChange={(e) => updateScore("notes", e.target.value)}
              className="flex-1 rounded-xl resize-none p-4 text-base leading-relaxed"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Finish Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Cupping Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the session as complete. You can still view the summary later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onFinish}
              className="bg-[#2C2C2C] hover:bg-[#1a1a1a]"
            >
              Finish Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
