import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import PinInput from '../components/PinInput'
import '../styles/onboarding.css'

function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshSession } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [personalInfo, setPersonalInfo] = useState({
    dateOfBirth: '',
    gender: '',
    nationality: 'Nigeria',
    countryOfResidence: 'Nigeria',
  })

  const [contactInfo, setContactInfo] = useState({
    phoneNumber: user?.phoneNumber || '',
    physicalAddress: '',
  })

  const [pins, setPins] = useState({
    pin: '',
    transactionPin: '',
    pinError: '',
    transactionPinError: '',
  })

  const [pinInput, setPinInput] = useState({
    pin: '',
    transactionPin: '',
  })

  useEffect(() => {
    if (user?.isOnboarded) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError('')
  }

  const handleContactInfoChange = (field, value) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError('')
  }

  const validatePersonalInfo = () => {
    if (!personalInfo.dateOfBirth) {
      setError('Date of birth is required')
      return false
    }
    if (!personalInfo.gender) {
      setError('Gender is required')
      return false
    }
    return true
  }

  const validateContactInfo = () => {
    if (!contactInfo.phoneNumber) {
      setError('Phone number is required')
      return false
    }
    if (!contactInfo.physicalAddress) {
      setError('Physical address is required')
      return false
    }
    return true
  }

  const handleSetupPins = async () => {
    if (!pins.pin || !pins.transactionPin) {
      setError('Both PINs are required')
      return
    }

    if (pins.pin === pins.transactionPin) {
      setPins((prev) => ({
        ...prev,
        pinError: 'PINs must be different',
      }))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/setup-pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pin: pins.pin,
          transactionPin: pins.transactionPin,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to setup PINs')
      }

      setSuccessMessage('PINs created successfully!')
      setCurrentStep(4)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteOnboarding = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          personalInfo,
          contactInfo,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to complete onboarding')
      }

      setSuccessMessage('Onboarding completed successfully!')
      await refreshSession()
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !validatePersonalInfo()) {
      return
    }
    if (currentStep === 2 && !validateContactInfo()) {
      return
    }
    if (currentStep === 3) {
      handleSetupPins()
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Complete Your Profile</h1>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
          </div>
          <p className="progress-text">
            Step {currentStep} of 4
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="onboarding-content">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="onboarding-step">
              <h2>Personal Information</h2>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  value={personalInfo.gender}
                  onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <input
                  id="nationality"
                  type="text"
                  value={personalInfo.nationality}
                  onChange={(e) => handlePersonalInfoChange('nationality', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Nigerian"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country of Residence</label>
                <input
                  id="country"
                  type="text"
                  value={personalInfo.countryOfResidence}
                  onChange={(e) => handlePersonalInfoChange('countryOfResidence', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Nigeria"
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="onboarding-step">
              <h2>Contact Information</h2>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="form-input"
                />
                <small className="text-muted">Email is from your account and cannot be changed here</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+234..."
                  value={contactInfo.phoneNumber}
                  onChange={(e) => handleContactInfoChange('phoneNumber', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Physical Address *</label>
                <textarea
                  id="address"
                  placeholder="Street address, city, state"
                  value={contactInfo.physicalAddress}
                  onChange={(e) => handleContactInfoChange('physicalAddress', e.target.value)}
                  className="form-input form-textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>
          )}

          {/* Step 3: Create PINs */}
          {currentStep === 3 && (
            <div className="onboarding-step">
              <h2>Create Security PINs</h2>
              <p className="step-description">
                Create a 6-digit login PIN and a 4-digit transaction PIN. They must be different.
              </p>

              <div className="form-group">
                <label>Login PIN (6 digits)</label>
                <p className="label-hint">You'll use this to login on recognized devices</p>
                <PinInput
                  length={6}
                  onChange={(value) => {
                    setPinInput((prev) => ({ ...prev, pin: value }))
                    setPins((prev) => ({ ...prev, pin: value, pinError: '' }))
                  }}
                  error={pins.pinError}
                />
              </div>

              <div className="form-group">
                <label>Transaction PIN (4 digits)</label>
                <p className="label-hint">You'll need this to approve transactions</p>
                <PinInput
                  length={4}
                  onChange={(value) => {
                    setPinInput((prev) => ({ ...prev, transactionPin: value }))
                    setPins((prev) => ({ ...prev, transactionPin: value, transactionPinError: '' }))
                  }}
                  error={pins.transactionPinError}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="onboarding-step">
              <h2>Review Your Information</h2>
              <div className="review-section">
                <h3>Personal Details</h3>
                <div className="review-group">
                  <span className="label">Date of Birth:</span>
                  <span className="value">{personalInfo.dateOfBirth}</span>
                </div>
                <div className="review-group">
                  <span className="label">Gender:</span>
                  <span className="value">{personalInfo.gender}</span>
                </div>
                <div className="review-group">
                  <span className="label">Nationality:</span>
                  <span className="value">{personalInfo.nationality}</span>
                </div>
                <div className="review-group">
                  <span className="label">Country:</span>
                  <span className="value">{personalInfo.countryOfResidence}</span>
                </div>
              </div>

              <div className="review-section">
                <h3>Contact Details</h3>
                <div className="review-group">
                  <span className="label">Email:</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="review-group">
                  <span className="label">Phone:</span>
                  <span className="value">{contactInfo.phoneNumber}</span>
                </div>
                <div className="review-group">
                  <span className="label">Address:</span>
                  <span className="value">{contactInfo.physicalAddress}</span>
                </div>
              </div>

              <div className="review-section">
                <h3>Security</h3>
                <div className="review-group">
                  <span className="label">Login PIN:</span>
                  <span className="value">••••••</span>
                </div>
                <div className="review-group">
                  <span className="label">Transaction PIN:</span>
                  <span className="value">••••</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-actions">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={loading}
            >
              Back
            </Button>
          )}

          <Button
            variant="primary"
            onClick={currentStep === 4 ? handleCompleteOnboarding : handleNextStep}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : currentStep === 4 ? 'Complete Onboarding' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
