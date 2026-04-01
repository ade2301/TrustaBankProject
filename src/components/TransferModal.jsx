import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/transfer-modal.css'

const API_ROOT = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function requestTransferApi(path, options = {}) {
    let response

    try {
        response = await fetch(`${API_ROOT}/api/transfers${path}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
        })
    } catch {
        const error = new Error('Unable to reach the server. Ensure backend is running, then try again.')
        error.status = 0
        throw error
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        const message = data.message || (response.status === 401 ? 'Session expired. Please login again.' : 'Request failed')
        const error = new Error(message)
        error.status = response.status
        throw error
    }

    return data
}

function TransferModal({ transferType, onClose, onTransferComplete }) {
    const { user } = useAuth()
    const [stage, setStage] = useState(1) // 1: Recipient/Details, 2: Amount, 3: PIN, 4: Success/Error
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Stage 1: Recipient/Details
    const [recipient, setRecipient] = useState('')
    const [recipientName, setRecipientName] = useState('')
    const [bankCode, setBankCode] = useState('')
    const [bankName, setBankName] = useState('')
    const [banks, setBanks] = useState([])
    const [isBanksLoading, setIsBanksLoading] = useState(false)
    const [recentRecipients, setRecentRecipients] = useState([])
    const [validatedAccount, setValidatedAccount] = useState(null)

    // Stage 2: Amount
    const [amount, setAmount] = useState('')
    const [narration, setNarration] = useState('')

    // Stage 3: PIN
    const [pin, setPin] = useState('')

    const sanitizeRecipient = (value) => {
        const raw = String(value)

        if (transferType === 'to-bank' || transferType === 'to-trusta') {
            return raw.replace(/\D/g, '').slice(0, 10)
        }

        return raw.replace(/[^A-Za-z0-9@._-]/g, '')
    }

    const sanitizeAmount = (value) => {
        const sanitized = String(value).replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
        const [whole, fraction = ''] = sanitized.split('.')
        return fraction.length ? `${whole}.${fraction.slice(0, 2)}` : whole
    }

    const sanitizeNarration = (value) => String(value).replace(/[^A-Za-z0-9\s.,'-]/g, '').slice(0, 120)

    const recentStorageKey = `trusta_recent_recipients_${user?.id || user?.accountNumber || user?.email || 'guest'}_${transferType}`

    const walletBalance = Number(user?.walletBalance || 0)

    useEffect(() => {
        if (transferType !== 'to-bank') {
            return
        }

        let isCancelled = false

        const loadBanks = async () => {
            setIsBanksLoading(true)

            try {
                const data = await requestTransferApi('/banks', {
                    method: 'GET',
                })

                if (!isCancelled) {
                    setBanks(Array.isArray(data.banks) ? data.banks : [])
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message || 'Unable to load banks')
                    setBanks([])
                }
            } finally {
                if (!isCancelled) {
                    setIsBanksLoading(false)
                }
            }
        }

        loadBanks()

        return () => {
            isCancelled = true
        }
    }, [transferType])

    useEffect(() => {
        try {
            const cached = window.localStorage.getItem(recentStorageKey)
            const parsed = cached ? JSON.parse(cached) : []
            setRecentRecipients(Array.isArray(parsed) ? parsed.slice(0, 2) : [])
        } catch {
            setRecentRecipients([])
        }
    }, [recentStorageKey])

    const saveRecentRecipient = (item) => {
        const existing = recentRecipients.filter(
            (entry) => !(entry.recipient === item.recipient && entry.bankCode === item.bankCode),
        )
        const next = [item, ...existing].slice(0, 2)
        setRecentRecipients(next)
        window.localStorage.setItem(recentStorageKey, JSON.stringify(next))
    }

    const handleValidateAccount = async () => {
        setError('')
        setValidatedAccount(null)

        if (!recipient.trim()) {
            setError('Please enter recipient details')
            return
        }

        if ((transferType === 'to-trusta' || transferType === 'to-bank') && recipient.trim().length !== 10) {
            setError('Account number must be exactly 10 digits')
            return
        }

        if (transferType === 'to-bank' && !bankCode) {
            setError('Please select a bank')
            return
        }

        if (transferType === 'to-bank' && banks.length === 0) {
            setError('Bank list is still loading. Please try again.')
            return
        }

        setLoading(true)
        try {
            const payload = {
                transferType,
                recipient: recipient.trim(),
            }

            if (transferType === 'to-bank') {
                payload.bankCode = bankCode
            }

            const data = await requestTransferApi('/validate-account', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

            setValidatedAccount(data.account)
            setRecipientName(data.account.accountName || data.account.name)
            setStage(2)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleProceedToPin = () => {
        setError('')

        if (!amount || Number(amount) <= 0) {
            setError('Please enter a valid amount')
            return
        }

        if (Number(amount) > walletBalance) {
            setError(`Insufficient balance. You have ₦${walletBalance.toLocaleString()}`)
            return
        }

        if (!narration.trim()) {
            setError('Narration is compulsory for this transaction')
            return
        }

        setStage(3)
    }

    const handleTransfer = async () => {
        setError('')

        if (!pin || pin.length !== 4) {
            setError('Please enter a valid 4-digit transaction PIN')
            return
        }

        setLoading(true)
        try {
            const payload = {
                transferType,
                recipient: recipient.trim(),
                bankCode: transferType === 'to-bank' ? bankCode : undefined,
                amount: Number(amount),
                pin,
                narration: narration.trim(),
                validatedAccount,
            }

            const data = await requestTransferApi('/send', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

            setSuccessMessage(data.message)
            setStage(4)

            saveRecentRecipient({
                recipient: recipient.trim(),
                recipientName: data?.transaction?.counterpartyName || recipientName,
                bankCode: transferType === 'to-bank' ? bankCode : '',
                bankName: transferType === 'to-bank' ? bankName : '',
            })

            // Callback to refresh dashboard
            if (onTransferComplete) {
                setTimeout(() => {
                    onTransferComplete()
                }, 2000)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        if (transferType === 'to-trusta') return 'Transfer to Trusta'
        if (transferType === 'to-bank') return 'Transfer to Bank'
        return 'Transfer'
    }

    const handleClose = () => {
        if (stage === 4) {
            onClose()
        } else if (stage > 1) {
            setStage(stage - 1)
            setError('')
        } else {
            onClose()
        }
    }

    return (
        <div className="transfer-modal-overlay" onClick={onClose}>
            <div className="transfer-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="transfer-modal-header">
                    <h2>{getTitle()}</h2>
                    <button
                        type="button"
                        className="transfer-modal-close"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Stage 1: Recipient/Details */}
                {stage === 1 && (
                    <div className="transfer-modal-stage">
                        {recentRecipients.length > 0 && (
                            <div className="recent-recipients-wrap">
                                <p className="recent-recipients-title">Last two recipients</p>
                                <div className="recent-recipients-list">
                                    {recentRecipients.map((entry) => (
                                        <button
                                            key={`${entry.recipient}-${entry.bankCode || 'trusta'}`}
                                            type="button"
                                            className="recent-recipient-chip"
                                            onClick={() => {
                                                setRecipient(entry.recipient)
                                                setRecipientName(entry.recipientName || '')
                                                if (transferType === 'to-bank') {
                                                    setBankCode(entry.bankCode || '')
                                                    setBankName(entry.bankName || '')
                                                }
                                            }}
                                        >
                                            <span>{entry.recipientName || entry.recipient}</span>
                                            <small>{entry.recipient}</small>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="transfer-form-group">
                            <label htmlFor="recipient">
                                Account Number
                            </label>
                            <input
                                id="recipient"
                                type="text"
                                placeholder="Enter 10-digit account number"
                                value={recipient}
                                onChange={(e) => setRecipient(sanitizeRecipient(e.target.value))}
                                inputMode="numeric"
                                disabled={loading}
                            />
                        </div>

                        {transferType === 'to-bank' && (
                            <div className="transfer-form-group">
                                <label htmlFor="bank">Bank</label>
                                <select
                                    id="bank"
                                    value={bankCode}
                                    onChange={(e) => {
                                        const selected = banks.find((b) => b.code === e.target.value)
                                        if (selected) {
                                            setBankCode(selected.code)
                                            setBankName(selected.name)
                                        }
                                    }}
                                    disabled={loading || isBanksLoading}
                                >
                                    <option value="">{isBanksLoading ? 'Loading banks...' : 'Select a bank'}</option>
                                    {banks.map((bank) => (
                                        <option key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {error && <div className="transfer-error">{error}</div>}

                        <button
                            type="button"
                            className="transfer-btn-primary"
                            onClick={handleValidateAccount}
                            disabled={loading || (transferType === 'to-bank' && (isBanksLoading || banks.length === 0))}
                        >
                            {loading ? 'Validating...' : 'Validate Account'}
                        </button>
                    </div>
                )}

                {/* Stage 2: Amount */}
                {stage === 2 && (
                    <div className="transfer-modal-stage">
                        <div className="transfer-recipient-info">
                            <p className="transfer-label">Sending to</p>
                            <p className="transfer-recipient-name">{recipientName}</p>
                            {transferType === 'to-bank' && (
                                <p className="transfer-recipient-detail">{bankName}</p>
                            )}
                        </div>

                        <div className="transfer-form-group">
                            <label htmlFor="amount">Amount</label>
                            <div className="transfer-amount-input">
                                <span className="transfer-currency">₦</span>
                                <input
                                    id="amount"
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                                    disabled={loading}
                                />
                            </div>
                            <p className="transfer-balance">Available: ₦{walletBalance.toLocaleString()}</p>
                        </div>

                        <div className="transfer-form-group">
                            <label htmlFor="narration">Narration (Compulsory)</label>
                            <input
                                id="narration"
                                type="text"
                                placeholder="e.g. Rent for April"
                                value={narration}
                                onChange={(e) => setNarration(sanitizeNarration(e.target.value))}
                                disabled={loading}
                            />
                        </div>

                        {error && <div className="transfer-error">{error}</div>}

                        <button
                            type="button"
                            className="transfer-btn-primary"
                            onClick={handleProceedToPin}
                            disabled={loading || !amount}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Stage 3: PIN */}
                {stage === 3 && (
                    <div className="transfer-modal-stage">
                        <div className="transfer-summary">
                            <div className="transfer-summary-item">
                                <span>From</span>
                                <span>{user?.fullName}</span>
                            </div>
                            <div className="transfer-summary-item">
                                <span>To</span>
                                <span>{recipientName}</span>
                            </div>
                            <div className="transfer-summary-item transfer-amount-row">
                                <span>Amount</span>
                                <span className="transfer-amount-value">₦{Number(amount).toLocaleString()}</span>
                            </div>
                            <div className="transfer-summary-item">
                                <span>Narration</span>
                                <span>{narration}</span>
                            </div>
                        </div>

                        <div className="transfer-form-group">
                            <label htmlFor="pin">4-Digit Transaction PIN</label>
                            <input
                                id="pin"
                                type="password"
                                placeholder="••••"
                                maxLength="4"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                disabled={loading}
                            />
                        </div>

                        {error && <div className="transfer-error">{error}</div>}

                        <button
                            type="button"
                            className="transfer-btn-primary"
                            onClick={handleTransfer}
                            disabled={loading || pin.length !== 4}
                        >
                            {loading ? 'Processing...' : 'Confirm Transfer'}
                        </button>
                    </div>
                )}

                {/* Stage 4: Success */}
                {stage === 4 && (
                    <div className="transfer-modal-stage transfer-success-stage">
                        <div className="transfer-success-icon">✓</div>
                        <h3>Transfer Successful!</h3>
                        <p className="transfer-success-message">{successMessage}</p>
                        <div className="transfer-receipt">
                            <div className="receipt-item">
                                <span>Amount</span>
                                <span>₦{Number(amount).toLocaleString()}</span>
                            </div>
                            <div className="receipt-item">
                                <span>To</span>
                                <span>{recipientName}</span>
                            </div>
                            <div className="receipt-item">
                                <span>Narration</span>
                                <span>{narration}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="transfer-btn-primary"
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TransferModal
