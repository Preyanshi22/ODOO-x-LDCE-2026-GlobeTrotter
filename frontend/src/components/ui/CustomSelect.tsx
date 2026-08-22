import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: (string | SelectOption)[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function CustomSelect({
  value,
  options,
  onChange,
  icon,
  placeholder,
  className = '',
  ariaLabel
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formattedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find((o) => o.value === value) || formattedOptions[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${open ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={ariaLabel || 'Select option'}
        aria-expanded={open}
      >
        {icon && <span className="select-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
        <span className="select-label">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`select-arrow ${open ? 'open' : ''}`} />
      </button>

      {open && (
        <div className="custom-select-dropdown" role="listbox">
          {formattedOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} className="option-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
