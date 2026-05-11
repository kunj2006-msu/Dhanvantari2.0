import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface DropdownOption {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  options: (string | DropdownOption)[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CustomDropdown = ({ options, value, onChange, placeholder = "Select...", disabled = false }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );
  const displayLabel = typeof selectedOption === 'string' 
    ? selectedOption 
    : selectedOption?.label || placeholder;

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <div 
        className="bg-slate-800/50 border border-white/10 text-slate-200 rounded-lg p-2.5 flex justify-between items-center cursor-none focus-within:ring-2 focus-within:ring-teal-500/50 w-full"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={!value ? "text-slate-500" : ""}>{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl cursor-none z-[50] overflow-hidden"
          >
            <ul className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {options.length === 0 && (
                <li className="px-4 py-2 text-slate-500 text-sm">No options available</li>
              )}
              {options.map((opt, idx) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = value === optValue;
                return (
                  <li 
                    key={idx}
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-lg cursor-none text-slate-200 transition-colors ${isSelected ? 'bg-teal-500/20 text-teal-300' : 'hover:bg-teal-500/20'}`}
                  >
                    {optLabel}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
