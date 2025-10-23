import { useState, useEffect } from "react";
import { ArrowLeft, StickyNote, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ScoreControl } from "./ScoreControl";
import { IntensitySlider } from "./IntensitySlider";
import { RoastLevelSlider } from "./RoastLevelSlider";
import { DefectsControl } from "./DefectsControl";

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

  const currentCup = cupScores[activeCup];

  const updateScore = <K extends keyof CupScore>(key: K, value: CupScore[K]) => {
    onUpdateCup(activeCup, { ...currentCup, [key]: value });
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

  // Individual checkbox toggles
  const handleUniformityToggle = (index: number) => {
    const newIssues = [...currentCup.uniformityIssues];
    newIssues[index] = !newIssues[index];
    updateScore("uniformityIssues", newIssues);
  };

  const handleCleanCupToggle = (index: number) => {
    const newIssues = [...currentCup.cleanCupIssues];
    newIssues[index] = !newIssues[index];
    updateScore("cleanCupIssues", newIssues);
  };

  const handleSweetnessToggle = (index: number) => {
    const newIssues = [...currentCup.sweetnessIssues];
    newIssues[index] = !newIssues[index];
    updateScore("sweetnessIssues", newIssues);
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
            className="rounded-lg min-h-[44px] bg-[#1a1a1a] text-white hover:bg-[#000] dark:bg-[#f5f5f5] dark:text-[#1a1a1a] dark:hover:bg-white border-[#1a1a1a] dark:border-[#f5f5f5]"
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
                className="flex-shrink-0 px-6 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#1a1a1a] dark:data-[state=active]:border-[#f5f5f5] rounded-none"
              >
                #{i + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content - Following Sensory Evaluation Flow */}
        {Array.from({ length: numCups }, (_, i) => (
          <TabsContent key={i} value={i.toString()} className="p-4 pb-24">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Cup Title & Roast Level */}
              <Card className="p-5 rounded-xl space-y-5">
                <div>
                  <Label htmlFor="cupTitle" className="text-[#1a1a1a] dark:text-[#E5E5E5]">
                    Cup Name (optional)
                  </Label>
                  <Input
                    id="cupTitle"
                    placeholder={`Cup #${i + 1}`}
                    value={currentCup.cupTitle}
                    onChange={(e) => updateScore("cupTitle", e.target.value)}
                    className="mt-2 h-12 rounded-xl min-h-[44px]"
                  />
                </div>
                
                <RoastLevelSlider
                  value={currentCup.roastLevel}
                  onChange={(v) => updateScore("roastLevel", v)}
                />
              </Card>

              {/* 1. Fragrance / Aroma */}
              <Card className="p-6 rounded-xl space-y-5">
                <ScoreControl
                  label="Fragrance / Aroma"
                  value={currentCup.fragrance}
                  onChange={(v) => updateScore("fragrance", v)}
                  min={0.0}
                />
                
                <div className="space-y-4 pt-2">
                  <IntensitySlider
                    label="Dry Intensity"
                    leftLabel="Low"
                    rightLabel="High"
                    value={currentCup.aromaDryIntensity}
                    onChange={(v) => updateScore("aromaDryIntensity", v)}
                  />
                  
                  <IntensitySlider
                    label="Break Intensity"
                    leftLabel="Low"
                    rightLabel="High"
                    value={currentCup.aromaBreakIntensity}
                    onChange={(v) => updateScore("aromaBreakIntensity", v)}
                  />
                  
                  <div className="space-y-2">
                    <Label className="text-[#1a1a1a] dark:text-[#E5E5E5] text-sm">
                      Qualities
                    </Label>
                    <Input
                      placeholder="e.g., floral, honey, citrus"
                      value={currentCup.aromaQualities}
                      onChange={(e) => updateScore("aromaQualities", e.target.value)}
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>
              </Card>

              {/* 2. Flavor */}
              <Card className="p-6 rounded-xl">
                <ScoreControl
                  label="Flavor"
                  value={currentCup.flavor}
                  onChange={(v) => updateScore("flavor", v)}
                  min={0.0}
                />
              </Card>

              {/* 3. Aftertaste */}
              <Card className="p-6 rounded-xl">
                <ScoreControl
                  label="Aftertaste"
                  value={currentCup.aftertaste}
                  onChange={(v) => updateScore("aftertaste", v)}
                  min={0.0}
                />
              </Card>

              {/* 4. Acidity */}
              <Card className="p-6 rounded-xl space-y-5">
                <ScoreControl
                  label="Acidity"
                  value={currentCup.acidity}
                  onChange={(v) => updateScore("acidity", v)}
                  min={0.0}
                />
                <IntensitySlider
                  label="Acidity Intensity"
                  leftLabel="Low"
                  rightLabel="High"
                  value={currentCup.acidityIntensity}
                  onChange={(v) => updateScore("acidityIntensity", v)}
                />
              </Card>

              {/* 5. Body */}
              <Card className="p-6 rounded-xl space-y-5">
                <ScoreControl
                  label="Body"
                  value={currentCup.body}
                  onChange={(v) => updateScore("body", v)}
                  min={0.0}
                />
                <IntensitySlider
                  label="Body Level"
                  leftLabel="Thin"
                  rightLabel="Heavy"
                  value={currentCup.bodyLevel}
                  onChange={(v) => updateScore("bodyLevel", v)}
                />
              </Card>

              {/* 6. Balance */}
              <Card className="p-6 rounded-xl">
                <ScoreControl
                  label="Balance"
                  value={currentCup.balance}
                  onChange={(v) => updateScore("balance", v)}
                  min={0.0}
                />
              </Card>

              {/* 7. Uniformity */}
              <Card className="p-6 rounded-xl">
                <Label className="text-[#1a1a1a] dark:text-[#E5E5E5] mb-4 block">
                  Uniformity — Score: {10 - (currentCup.uniformityIssues.filter(x => x).length * 2)} / 10
                </Label>
                <div className="flex gap-3 justify-center md:gap-4">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const isMarked = currentCup.uniformityIssues[idx];
                    
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUniformityToggle(idx)}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-md border-2 transition-all active:scale-95 flex items-center justify-center bg-white dark:bg-[#1a1a1a] ${
                          isMarked
                            ? "border-[#1a1a1a] dark:border-[#e5e5e5]"
                            : "border-[#CCC] dark:border-[#555]"
                        }`}
                        aria-label={`Toggle uniformity issue cup ${idx + 1}`}
                      >
                        {isMarked && (
                          <X className="h-7 w-7 text-[#1a1a1a] dark:text-[#e5e5e5]" strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 8. Clean Cup */}
              <Card className="p-6 rounded-xl">
                <Label className="text-[#1a1a1a] dark:text-[#E5E5E5] mb-4 block">
                  Clean Cup — Score: {10 - (currentCup.cleanCupIssues.filter(x => x).length * 2)} / 10
                </Label>
                <div className="flex gap-3 justify-center md:gap-4">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const isMarked = currentCup.cleanCupIssues[idx];
                    
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCleanCupToggle(idx)}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-md border-2 transition-all active:scale-95 flex items-center justify-center bg-white dark:bg-[#1a1a1a] ${
                          isMarked
                            ? "border-[#1a1a1a] dark:border-[#e5e5e5]"
                            : "border-[#CCC] dark:border-[#555]"
                        }`}
                        aria-label={`Toggle clean cup issue cup ${idx + 1}`}
                      >
                        {isMarked && (
                          <X className="h-7 w-7 text-[#1a1a1a] dark:text-[#e5e5e5]" strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 9. Sweetness */}
              <Card className="p-6 rounded-xl">
                <Label className="text-[#1a1a1a] dark:text-[#E5E5E5] mb-4 block">
                  Sweetness — Score: {10 - (currentCup.sweetnessIssues.filter(x => x).length * 2)} / 10
                </Label>
                <div className="flex gap-3 justify-center md:gap-4">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const isMarked = currentCup.sweetnessIssues[idx];
                    
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSweetnessToggle(idx)}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-md border-2 transition-all active:scale-95 flex items-center justify-center bg-white dark:bg-[#1a1a1a] ${
                          isMarked
                            ? "border-[#1a1a1a] dark:border-[#e5e5e5]"
                            : "border-[#CCC] dark:border-[#555]"
                        }`}
                        aria-label={`Toggle sweetness issue cup ${idx + 1}`}
                      >
                        {isMarked && (
                          <X className="h-7 w-7 text-[#1a1a1a] dark:text-[#e5e5e5]" strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 10. Overall */}
              <Card className="p-6 rounded-xl">
                <ScoreControl
                  label="Overall"
                  value={currentCup.overall}
                  onChange={(v) => updateScore("overall", v)}
                  min={0.0}
                />
              </Card>

              {/* 11. Defects */}
              <Card className="p-6 rounded-xl">
                <DefectsControl
                  taintCups={currentCup.taintCups}
                  faultCups={currentCup.faultCups}
                  onTaintChange={(v) => updateScore("taintCups", v)}
                  onFaultChange={(v) => updateScore("faultCups", v)}
                />
              </Card>

              {/* Total Score */}
              <Card className="p-6 rounded-xl text-center bg-[#1a1a1a] text-white dark:bg-[#f5f5f5] dark:text-[#1a1a1a]">
                <div className="text-sm opacity-80 mb-1">Total Score</div>
                <div className="text-4xl tabular-nums">{calculateTotal(currentCup)}</div>
              </Card>

              {/* Secondary Finish Link */}
              <button
                onClick={() => setShowFinishDialog(true)}
                className="w-full flex items-center justify-center gap-2 text-[#666] dark:text-[#999] hover:text-[#1a1a1a] dark:hover:text-[#E5E5E5] transition-colors py-3"
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
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#1a1a1a] hover:bg-[#000] dark:bg-[#f5f5f5] dark:hover:bg-white shadow-lg min-h-[56px] min-w-[56px]"
          >
            <StickyNote className="h-6 w-6 text-white dark:text-[#1a1a1a]" />
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
              className="bg-[#1a1a1a] hover:bg-[#000] dark:bg-[#f5f5f5] dark:text-[#1a1a1a] dark:hover:bg-white"
            >
              Finish Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
