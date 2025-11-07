import React from 'react';

const Select = ({ label, name, value, onChange, placeholder = 'Select...', children, required = false }) => {
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
          onChange={onChange}
          required={required}
          className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 pr-10"
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;


