import React, { useState, useEffect } from 'react'
import '../styles/demo-bonus-modal.css'

function DemoBonusModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div className="demo-bonus-overlay">
      <div className="demo-bonus-modal">
        <div className="modal-icon">🎉</div>
        <h2>This is a demo account</h2>
        <p className="bonus-text">You have received ₦10,000 login bonus.</p>
        <p className="thank-you-text">Thanks for choosing us.</p>
        <button className="modal-dismiss-btn" onClick={() => {
          setIsVisible(false)
          onClose()
        }}>
          Got it
        </button>
      </div>
    </div>
  )
}

export default DemoBonusModal
