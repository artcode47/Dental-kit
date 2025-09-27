import React from 'react';

const Select = ({
  value,
  onChange,
  options,
  placeholder = '',
  disabled = false,
  className = '',
  menuClassName = '',
  'aria-describedby': ariaDescribedby
}) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  const listRef = React.useRef(null);
  const [highlightIndex, setHighlightIndex] = React.useState(-1);

  const selected = options.find(o => o.value === value) || null;

  const toggleOpen = () => {
    if (disabled) return;
    setOpen(prev => !prev);
  };

  const close = () => setOpen(false);

  const handleSelect = (val) => {
    onChange?.(val);
    close();
    // restore focus to button for accessibility
    buttonRef.current?.focus();
  };

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(options.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (highlightIndex >= 0 && highlightIndex < options.length) {
          e.preventDefault();
          handleSelect(options[highlightIndex].value);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, highlightIndex, options]);

  React.useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (
        !buttonRef.current?.contains(e.target) &&
        !listRef.current?.contains(e.target)
      ) {
        close();
      }
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('touchstart', onClick);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('touchstart', onClick);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) {
      // set highlight to current selected option
      const idx = options.findIndex(o => o.value === value);
      setHighlightIndex(idx >= 0 ? idx : 0);
    }
  }, [open, value, options]);

  return (
    <div className={`relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <button
        type="button"
        ref={buttonRef}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={ariaDescribedby}
        disabled={disabled}
        className={`styled-select w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
      >
        <span className={selected ? '' : 'text-gray-500 dark:text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className={`absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 ${menuClassName}`}
        >
          {options.map((opt, idx) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setHighlightIndex(idx)}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value); }}
              className={`px-3 py-2 cursor-pointer select-none text-sm ${
                idx === highlightIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
              } ${opt.value === value ? 'font-semibold' : 'font-normal'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;


