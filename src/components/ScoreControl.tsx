import React, { useState, useEffect } from "react";
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
  const [inputValue, setInputValue] = useState(value.toFixed(2));

  // Sync input value when external value changes
  useEffect(() => {
    setInputValue(value.toFixed(2));
  }, [value]);

  const increment = () => {
    const newValue = Math.min(max, value + step);
    const finalValue = Number(newValue.toFixed(2));
    onChange(finalValue);
    setInputValue(finalValue.toFixed(2));
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    const finalValue = Number(newValue.toFixed(2));
    onChange(finalValue);
    setInputValue(finalValue.toFixed(2));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'Tab' ||
      e.key === 'Escape' ||
      e.key === 'Enter' ||
      e.key === '.' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      return;
    }
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      return;
    }
    
    // Ensure that it is a number
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    
    // Validate input: allow empty string, digits, and decimal point only
    if (newInputValue === '' || /^[0-9]*\.?[0-9]*$/.test(newInputValue)) {
      setInputValue(newInputValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentInputValue = e.target.value;
    
    // Reset to minimum value if empty or only decimal point
    if (currentInputValue === '' || currentInputValue === '.') {
      const resetValue = Number(min.toFixed(2));
      onChange(resetValue);
      setInputValue(resetValue.toFixed(2));
      return;
    }
    
    const numericValue = parseFloat(currentInputValue);
    
    if (!isNaN(numericValue)) {
      // Clamp value within min/max range
      const clampedValue = Math.max(min, Math.min(max, numericValue));
      const finalValue = Number(clampedValue.toFixed(2));
      onChange(finalValue);
      setInputValue(finalValue.toFixed(2));
    } else {
      // Reset to current value if invalid
      setInputValue(value.toFixed(2));
    }
  };

  // Format value with larger integer part for display
  const formatValue = (inputStr: string) => {
    // If empty or just a decimal point, show placeholder format
    if (!inputStr || inputStr === '.') {
      return { integer: '0', decimal: '00' };
    }
    
    // Parse the input string
    const numValue = parseFloat(inputStr);
    if (isNaN(numValue)) {
      return { integer: '0', decimal: '00' };
    }
    
    const formatted = numValue.toFixed(2);
    const [integer, decimal] = formatted.split('.');
    return { integer, decimal };
  };

  const { integer, decimal } = formatValue(inputValue);

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
        <div className="relative flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="h-14 text-center rounded-xl transition-all duration-300 focus:shadow-md tabular-nums text-[22px] text-transparent caret-[#1a1a1a] dark:caret-[#E5E5E5]"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            placeholder="0.00"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[22px] tabular-nums text-[#1a1a1a] dark:text-[#E5E5E5]">
            <span className="text-[25px]">{integer}</span>
            <span>.{decimal}</span>
          </div>
        </div>
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
