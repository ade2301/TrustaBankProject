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
}) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        className="form-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  )
}

export default Input
