import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
}

export const CustomDatePicker = ({ value, onChange, minDate, placeholder = "Select Date" }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    return new Date();
  });
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const formattedDate = `${dayStr}-${month}-${year}`;
    
    onChange(formattedDate);
    setIsOpen(false);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blankDays = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0);
    
    const [mYear, mMonth, mDay] = minDate.split('-').map(Number);
    const minLocal = new Date(mYear, mMonth - 1, mDay);
    minLocal.setHours(0, 0, 0, 0);
    
    return dateToCheck < minLocal;
  };

  const isSelectedDate = (day: number) => {
    if (!value) return false;
    const parts = value.split('-');
    let vYear, vMonth, vDay;
    if (parts[0].length === 4) {
      [vYear, vMonth, vDay] = parts.map(Number);
    } else {
      [vDay, vMonth, vYear] = parts.map(Number);
    }
    return year === vYear && month === vMonth - 1 && day === vDay;
  };

  return (
    <div className="relative w-full" ref={datePickerRef}>
      <div 
        className="bg-slate-800/50 border border-white/10 text-slate-200 rounded-xl px-4 py-3 flex justify-between items-center cursor-none focus-within:ring-2 focus-within:ring-teal-500/50 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? "text-slate-500" : ""}>{value || placeholder}</span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-[50] cursor-none w-72"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors cursor-none"
                type="button"
              >
                <ChevronLeft className="w-5 h-5 cursor-none" />
              </button>
              <div className="font-bold text-slate-200 cursor-none">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <button 
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors cursor-none"
                type="button"
              >
                <ChevronRight className="w-5 h-5 cursor-none" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 cursor-none">
                  {day}
                </div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1">
              {blankDays.map((_, idx) => (
                <div key={`blank-${idx}`} className="w-8 h-8 cursor-none" />
              ))}
              {days.map(day => {
                const disabled = isDateDisabled(day);
                const selected = isSelectedDate(day);
                return (
                  <button
                    key={day}
                    onClick={() => !disabled && handleDateClick(day)}
                    disabled={disabled}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-none transition-colors
                      ${selected ? 'bg-teal-500 text-slate-900 font-bold shadow-md shadow-teal-500/20' : ''}
                      ${!selected && !disabled ? 'text-slate-200 hover:bg-teal-500/20' : ''}
                      ${disabled ? 'text-slate-600 opacity-50' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
