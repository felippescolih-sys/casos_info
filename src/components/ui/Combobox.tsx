import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { normalize } from '@/lib/text';

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  maxVisible?: number;
}

/** Input de texto livre com sugestões filtradas (substring, sem acento). */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  id,
  maxVisible = 8,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = normalize(value);
    const list = q
      ? options.filter((o) => normalize(o).includes(q))
      : options;
    return list.slice(0, maxVisible);
  }, [value, options, maxVisible]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => setHighlight(0), [value]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  const showList = open && matches.length > 0 && !(matches.length === 1 && matches[0] === value);

  return (
    <div className="relative" ref={wrapRef}>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(matches[highlight]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={cn(
          'block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300',
          'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600',
        )}
      />
      {showList && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-gray-200">
          {matches.map((o, i) => (
            <li key={o}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  'block w-full px-3 py-1.5 text-left',
                  i === highlight ? 'bg-brand-50 text-brand-800' : 'text-gray-700',
                )}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
