import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || 'Select');

  return (
    <div className="custom-select" ref={wrapperRef}>
      <button
        type="button"
        className={`custom-select__trigger ${isOpen ? 'custom-select__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-select__label">{displayLabel}</span>
        <ChevronDown size={13} className={`custom-select__chevron ${isOpen ? 'custom-select__chevron--open' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-select__dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-select__option ${String(opt.value) === String(value) ? 'custom-select__option--selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {String(opt.value) === String(value) && (
                <span className="custom-select__check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
