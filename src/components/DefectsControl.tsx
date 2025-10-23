import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface DefectsControlProps {
  taintCups: number;
  faultCups: number;
  onTaintChange: (value: number) => void;
  onFaultChange: (value: number) => void;
}

export function DefectsControl({
  taintCups,
  faultCups,
  onTaintChange,
  onFaultChange,
}: DefectsControlProps) {
  const totalDeduction = taintCups * 2 + faultCups * 4;
  const totalCups = taintCups + faultCups;
  const isOverLimit = totalCups > 5;

  const handleTaintIncrement = () => {
    if (taintCups < 5 && totalCups < 5) {
      onTaintChange(taintCups + 1);
    }
  };

  const handleTaintDecrement = () => {
    if (taintCups > 0) {
      onTaintChange(taintCups - 1);
    }
  };

  const handleFaultIncrement = () => {
    if (faultCups < 5 && totalCups < 5) {
      onFaultChange(faultCups + 1);
    }
  };

  const handleFaultDecrement = () => {
    if (faultCups > 0) {
      onFaultChange(faultCups - 1);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-[#2C2C2C] dark:text-[#E5E5E5]">Defects</Label>

      {/* Taint Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-[#666] dark:text-[#999]">
            Taint (-2 pts/cup)
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleTaintDecrement}
            disabled={taintCups === 0}
            className="h-10 w-10 rounded-lg min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-12 text-center tabular-nums">
            {taintCups}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleTaintIncrement}
            disabled={taintCups >= 5 || totalCups >= 5}
            className="h-10 w-10 rounded-lg min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Fault Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-[#666] dark:text-[#999]">
            Fault (-4 pts/cup)
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFaultDecrement}
            disabled={faultCups === 0}
            className="h-10 w-10 rounded-lg min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-12 text-center tabular-nums">
            {faultCups}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleFaultIncrement}
            disabled={faultCups >= 5 || totalCups >= 5}
            className="h-10 w-10 rounded-lg min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Formula and Total */}
      <div className="pt-2 border-t space-y-1">
        <div className="text-xs text-[#666] dark:text-[#999]">
          Deduction = (Taint × 2) + (Fault × 4)
        </div>
        <div className="text-sm text-[#1a1a1a] dark:text-[#E5E5E5]">
          Defect Deduction: {totalDeduction > 0 ? `− ${totalDeduction}` : "0"} points
        </div>
        {isOverLimit && (
          <div className="text-xs text-[#666] dark:text-[#999]">
            Warning: Total cups cannot exceed 5
          </div>
        )}
      </div>
    </div>
  );
}
