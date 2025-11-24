import React, { useState, useRef } from 'react';

const UnitSelect = ({ id, name, value, onChange, children, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ignoreClick = useRef(false);

    return (
        <div className="relative h-full">
            <select
                id={id}
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
                className={`${className} appearance-none pr-8`}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};

export default UnitSelect;
