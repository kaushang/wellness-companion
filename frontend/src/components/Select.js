import React, { useState, useRef } from 'react';

const Select = ({ label, name, value, onChange, placeholder = 'Select...', children, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ignoreClick = useRef(false);

  return (
    <div>
      {label && (
        <label className="block text-gray-700 font-semibold mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => {
            ignoreClick.current = true;
            setIsOpen(false);
            if (onChange) onChange(e);
          }}
          onClick={() => {
            if (ignoreClick.current) {
              ignoreClick.current = false;
              return;
            }
            setIsOpen(!isOpen);
          }}
          onBlur={() => setIsOpen(false)}
          required={required}
          className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white text-gray-800 pr-10 shadow-sm hover:shadow-md"
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;


