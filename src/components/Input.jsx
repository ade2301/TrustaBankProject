import { useState } from 'react'

function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
  required = false,
  enablePasswordToggle = false,
  disabled = false,
  ...rest
}) {
  const isPasswordField = type === 'password' && enablePasswordToggle
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const resolvedType = isPasswordField && isPasswordVisible ? 'text' : type

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      {isPasswordField ? (
        <div className="input-with-action">
          <input
            id={id}
            className="form-input"
            type={resolvedType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            {...rest}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 3l18 18M10.6 10.6a2 2 0 1 0 2.8 2.8M9.9 5.2A10.9 10.9 0 0 1 12 5c4.6 0 8.3 2.6 10 7-1 2.6-2.6 4.5-4.8 5.6M6.6 8.1C5 9 3.8 10.3 3 12c.8 2 2 3.5 3.6 4.6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        </div>
      ) : (
        <input
          id={id}
          className="form-input"
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          {...rest}
        />
      )}
    </div>
  )
}

export default Input
