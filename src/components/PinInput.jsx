import { useEffect, useRef, useState } from 'react'
import '../styles/pin-input.css'

function normalizePinValue(value, length) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, length)
    .split('')
    .concat(new Array(length).fill(''))
    .slice(0, length)
}

function PinInput({ length = 6, value, onComplete, onChange, error = null }) {
  const [pin, setPin] = useState(() => normalizePinValue(value, length))
  const inputRefs = useRef([])
  const isControlled = typeof value !== 'undefined'
  const displayedPin = isControlled ? normalizePinValue(value, length) : pin

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (e, index) => {
    const value = e.target.value
    const digit = value.replace(/[^0-9]/g, '')

    if (digit === '' || digit.length <= 1) {
      const newPin = [...displayedPin]
      newPin[index] = digit
      if (!isControlled) {
        setPin(newPin)
      }
      onChange?.(newPin.join(''))

      if (digit && index < length - 1) {
        inputRefs.current[index + 1].focus()
      }

      if (!digit && index > 0) {
        inputRefs.current[index - 1].focus()
      }

      if (newPin.every((p) => p !== '') && index === length - 1) {
        onComplete?.(newPin.join(''))
      }
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !displayedPin[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus()
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, length)

    if (digits.length > 0) {
      const newPin = normalizePinValue(digits, length)
      if (!isControlled) {
        setPin(newPin)
      }
      onChange?.(newPin.join(''))

      if (newPin.every((p) => p !== '')) {
        onComplete?.(newPin.join(''))
      } else {
        const firstEmptyIndex = newPin.findIndex((p) => p === '')
        if (firstEmptyIndex > -1) {
          setTimeout(() => inputRefs.current[firstEmptyIndex].focus(), 0)
        }
      }
    }
  }

  return (
    <div className="pin-input-container">
      <div className="pin-input-group">
        {displayedPin.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`pin-input ${error ? 'error' : ''}`}
            aria-label={`PIN digit ${index + 1}`}
          />
        ))}
      </div>
      {error && <div className="pin-error">{error}</div>}
    </div>
  )
}

export default PinInput
