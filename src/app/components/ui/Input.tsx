import React from 'react';

interface InputProps {
  type: 'text' | 'email' | 'password' | 'checkbox' | 'textarea' | 'number' | 'tel' | 'date';
  name: string;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  name,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className = '',
  disabled = false,
  error,
}) => {
  const baseInputStyles = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorStyles = "border-red-500 focus:ring-red-500";
  const disabledStyles = "bg-gray-100 cursor-not-allowed";

  if (type === 'textarea') {
    return (
      <div className="flex flex-col mb-4">
        {label && (
          <label htmlFor={name} className="mb-2 font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${baseInputStyles} min-h-[100px] resize-y ${error ? errorStyles : ''} ${disabled ? disabledStyles : ''} ${className}`}
          disabled={disabled}
        />
        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={value as boolean}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
        />
        {label && (
          <label htmlFor={name} className="ml-2 font-medium text-gray-700">
            {label}
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-4 text-black">
      {label && (
        <label htmlFor={name} className="mb-2 font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value as string}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${baseInputStyles} ${error ? errorStyles : ''} ${disabled ? disabledStyles : ''} ${className}`}
      />
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
