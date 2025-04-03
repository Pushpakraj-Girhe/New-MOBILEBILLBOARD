"use client";

import React, { useState, useRef, useEffect } from "react";

export function Select({ children, value, onValueChange, placeholder = "Select an option", className = "", ...props }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <div ref={ref} className={`relative ${className}`} {...props}>
      <SelectTrigger onClick={() => setOpen(!open)} value={value} placeholder={placeholder} />
      {open && (
        <SelectContent>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onSelect: (selectedValue) => {
                  onValueChange(selectedValue);
                  setOpen(false);
                },
                selectedValue: value, // Pass the currently selected value
              });
            }
            return child;
          })}
        </SelectContent>
      )}
    </div>
  );
}

export function SelectTrigger({ onClick, value, placeholder, className = "", ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={!!value}
      aria-haspopup="listbox"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <SelectValue value={value} placeholder={placeholder} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export function SelectValue({ value, placeholder }) {
  return <span className="text-sm">{value || <span className="text-muted-foreground">{placeholder}</span>}</span>;
}

export function SelectContent({ children, className = "", ...props }) {
  return (
    <div
      role="listbox"
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1 w-full ${className}`}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

export function SelectItem({ children, value, onSelect, className = "", selectedValue, ...props }) {
  return (
    <div
      role="option"
      aria-selected={selectedValue === value} // Add aria-selected
      onClick={() => onSelect && onSelect(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}