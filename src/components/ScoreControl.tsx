import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ScoreControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function ScoreControl({
  label,
  value,
  onChange,
  min = 0.0,
  max = 10.0,
  step = 0.25,
}: ScoreControlProps) {
  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(Number(newValue.toFixed(2)));
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(Number(newValue.toFixed(2)));
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(Number(newValue.toFixed(2)));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[#2C2C2C] dark:text-[#E5E5E5]">{label}</Label>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          className="h-12 w-12 rounded-xl min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <Input
          type="number"
          value={value.toFixed(2)}
          onChange={handleDirectInput}
          step={step}
          min={min}
          max={max}
          className="h-12 text-center rounded-xl transition-all duration-300 focus:shadow-md"
          inputMode="decimal"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          className="h-12 w-12 rounded-xl min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
