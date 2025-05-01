import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
  label?: string;
}

export function DatePicker({
  date,
  onDateChange,
  className,
  placeholder = "Select date",
  label
}: DatePickerProps) {
  return (
    <div className="flex flex-col space-y-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              "transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            {date ? format(date, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-white dark:bg-slate-900 border rounded-md shadow-lg z-50 p-0 transition-all duration-200 hover:shadow-xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(selectedDate) => onDateChange(selectedDate || null)}
            initialFocus
            className="border-none"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DatePicker;