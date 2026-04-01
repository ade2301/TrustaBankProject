import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { completeRegistration } from '../lib/authApi'
import Button from '../components/Button'
import DemoBonusModal from '../components/DemoBonusModal'
import TransferModal from '../components/TransferModal'
import copyIcon from '../assets/copy-icon.svg'
import '../styles/dashboard.css'

const API_ROOT = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function BenefitIcon({ variant }) {
    if (variant === 'speed') {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (variant === 'global') {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M3 12h18M12 3c2.8 3 4.2 6.4 4.2 9S14.8 18 12 21c-2.8-3-4.2-6.4-4.2-9S9.2 6 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (variant === 'tools') {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m14.7 6.3 3 3m-1.6-5.3a3.5 3.5 0 0 0-4.95 4.95L4 16.1V20h3.9l7.1-7.1a3.5 3.5 0 0 0 4.95-4.95l-1.25 1.25-2.98-2.98 1.98-1.97Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (variant === 'fee') {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 18.5 18.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="16" r="1.8" stroke="currentColor" strokeWidth="2" />
            </svg>
        )
    }

    if (variant === 'shield') {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 20 6.5V12c0 5-3.4 7.9-8 9-4.6-1.1-8-4-8-9V6.5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="m9.2 12 2 2.1 3.9-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    return null
}

function Dashboard({ theme = 'light', onToggleTheme }) {
    const { user, logout, refreshSession } = useAuth()
    const isDark = theme === 'dark'
    const [activeTab, setActiveTab] = useState('home')
    const [cardType, setCardType] = useState('virtual')
    const [isBalanceVisible, setIsBalanceVisible] = useState(false)
    const [showDemoBonus, setShowDemoBonus] = useState(user?.loginBonusJustReceived === true)
    const [isAccountCopied, setIsAccountCopied] = useState(false)
    const [showCopyToast, setShowCopyToast] = useState(false)
    const [showCardUnavailableModal, setShowCardUnavailableModal] = useState(false)
    const [showWithdrawUnavailableModal, setShowWithdrawUnavailableModal] = useState(false)
    const [showBillsUnavailableModal, setShowBillsUnavailableModal] = useState(false)
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [selectedTransferType, setSelectedTransferType] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)
    const [historyCategory, setHistoryCategory] = useState('all')
    const [historyStatus, setHistoryStatus] = useState('all')
    const [historySort, setHistorySort] = useState('newest')
    const [transactionsRefreshTick, setTransactionsRefreshTick] = useState(0)
    const [showCompleteRegistrationModal, setShowCompleteRegistrationModal] = useState(false)
    const [firstNameInput, setFirstNameInput] = useState('')
    const [lastNameInput, setLastNameInput] = useState('')
    const [isCompletingRegistration, setIsCompletingRegistration] = useState(false)
    const [completeRegistrationError, setCompleteRegistrationError] = useState('')

    useEffect(() => {
        setShowDemoBonus(user?.loginBonusJustReceived === true)
    }, [user?.loginBonusJustReceived])

    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat('en-NG', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        [],
    )

    const walletBalance = Number(user?.walletBalance || 0)
    const totalIncome = Number(user?.totalIncome || 0)
    const totalExpenses = Number(user?.totalExpenses || 0)
    const maskedAccountNumber = `${user?.accountNumber?.substring(0, 2) || ''}${'*'.repeat(8)}`

    const fullNameTokens = String(user?.fullName || '').trim().split(/\s+/).filter(Boolean)
    const derivedFirstName = user?.firstName || fullNameTokens[0] || ''
    const derivedLastName = user?.lastName || fullNameTokens.slice(1).join(' ')
    const isNameIncomplete = !derivedFirstName || !derivedLastName

    const formatLastLogin = (date) => {
        if (!date) return 'Just now'
        const loginDate = new Date(date)
        const now = new Date()
        const diffMs = now - loginDate
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return loginDate.toLocaleDateString('en-NG', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleCopyAccountNumber = async () => {
        const accountNumber = String(user?.accountNumber || '')

        if (!accountNumber) {
            return
        }
        try {
            await navigator.clipboard.writeText(accountNumber)
            setIsAccountCopied(true)
            setShowCopyToast(true)

            window.setTimeout(() => setIsAccountCopied(false), 1500)
            window.setTimeout(() => setShowCopyToast(false), 2200)
        } catch {
            setIsAccountCopied(false)
        }
    }

    useEffect(() => {
        let isCancelled = false

        const loadTransactions = async () => {
            setIsTransactionsLoading(true)
            try {
                const response = await fetch(`${API_ROOT}/api/transfers/history?limit=300`, {
                    method: 'GET',
                    credentials: 'include',
                })
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Unable to load transactions')
                }

                if (!isCancelled) {
                    setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
                }
            } catch {
                if (!isCancelled) {
                    setTransactions([])
                }
            } finally {
                if (!isCancelled) {
                    setIsTransactionsLoading(false)
                }
            }
        }

        loadTransactions()

        return () => {
            isCancelled = true
        }
    }, [transactionsRefreshTick])

    useEffect(() => {
        if (activeTab === 'profile' && isNameIncomplete) {
            setFirstNameInput(derivedFirstName)
            setLastNameInput(derivedLastName)
            setShowCompleteRegistrationModal(true)
        }
    }, [activeTab, isNameIncomplete, derivedFirstName, derivedLastName])

    const formatTransactionDate = (dateValue) => {
        if (!dateValue) return 'Just now'
        return new Date(dateValue).toLocaleString('en-NG', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatTransactionAmount = (amountValue, direction) => {
        const sign = direction === 'credit' ? '+' : '-'
        return `${sign}₦${currencyFormatter.format(Number(amountValue || 0))}`
    }

    const getTransactionIcon = (type, direction) => {
        if (direction === 'credit') {
            return '⬇️'
        }
        if (type === 'transfer_to_bank') {
            return '🏦'
        }
        return '⇄'
    }

    const filteredTransactions = useMemo(() => {
        const byCategory = transactions.filter((transaction) => {
            if (historyCategory === 'all') return true
            if (historyCategory === 'credit' || historyCategory === 'debit') {
                return transaction.direction === historyCategory
            }
            return transaction.type === historyCategory
        })

        const byStatus = byCategory.filter((transaction) => {
            if (historyStatus === 'all') return true
            return String(transaction.status || '').toLowerCase() === historyStatus
        })

        return [...byStatus].sort((a, b) => {
            const aAmount = Number(a.amount || 0)
            const bAmount = Number(b.amount || 0)
            const aTime = new Date(a.createdAt).getTime()
            const bTime = new Date(b.createdAt).getTime()

            if (historySort === 'oldest') return aTime - bTime
            if (historySort === 'highest') return bAmount - aAmount
            if (historySort === 'lowest') return aAmount - bAmount
            return bTime - aTime
        })
    }, [transactions, historyCategory, historyStatus, historySort])

    const groupedTransactions = useMemo(() => {
        const groups = filteredTransactions.reduce((accumulator, transaction) => {
            const date = new Date(transaction.createdAt)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const label = date.toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })

            if (!accumulator[key]) {
                accumulator[key] = {
                    key,
                    label,
                    inflow: 0,
                    outflow: 0,
                    items: [],
                }
            }

            const amount = Number(transaction.amount || 0)
            if (transaction.direction === 'credit') {
                accumulator[key].inflow += amount
            } else {
                accumulator[key].outflow += amount
            }

            accumulator[key].items.push(transaction)
            return accumulator
        }, {})

        return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key))
    }, [filteredTransactions])

    const handleLogout = async () => {
        await logout()
    }

    const handleCompleteRegistration = async (event) => {
        event.preventDefault()
        setCompleteRegistrationError('')

        const firstName = String(firstNameInput).replace(/[^A-Za-z\s'-]/g, '').trim()
        const lastName = String(lastNameInput).replace(/[^A-Za-z\s'-]/g, '').trim()

        if (!firstName || !lastName) {
            setCompleteRegistrationError('First name and last name are required')
            return
        }

        setIsCompletingRegistration(true)
        try {
            await completeRegistration(firstName, lastName)
            await refreshSession()
            setShowCompleteRegistrationModal(false)
        } catch (error) {
            setCompleteRegistrationError(error.message || 'Unable to complete registration')
        } finally {
            setIsCompletingRegistration(false)
        }
    }

    const cardsContent = {
        virtual: {
            label: 'Virtual Card',
            planName: 'Trusta Verve Classic',
            brand: 'Trusta',
            network: 'Verve',
            showcaseClassName: 'cards-showcase-card virtual',
            benefits: [
                {
                    icon: <BenefitIcon variant="speed" />,
                    title: 'Instant Access',
                    description: 'Use it instantly after quick application',
                },
                {
                    icon: <BenefitIcon variant="global" />,
                    title: 'Accepted Across Online Merchants',
                    description: 'Including Google Play, Netflix, Shein, Uber and more.',
                },
                {
                    icon: <BenefitIcon variant="tools" />,
                    title: 'Self-managed Transactions',
                    description: 'Set card controls and monitor payments in real time.',
                },
                {
                    icon: <BenefitIcon variant="fee" />,
                    title: 'No Maintenance Fee',
                    description: 'Free application and zero maintenance fees.',
                },
                {
                    icon: <BenefitIcon variant="shield" />,
                    title: 'Safe and Secure',
                    description: 'CBN licensed, NDIC insured.',
                },
            ],
        },
        physical: {
            label: 'Physical Card',
            planName: 'Trusta Verve Classic',
            brand: 'Trusta',
            network: 'Verve Debit',
            showcaseClassName: 'cards-showcase-card physical',
            benefits: [
                {
                    icon: <BenefitIcon variant="fee" />,
                    title: 'Free Application and Usage',
                    description: 'Free application and zero maintenance fees.',
                },
                {
                    icon: <BenefitIcon variant="global" />,
                    title: 'Works Everywhere',
                    description: 'Accepted for online payments, POS, and ATM transactions globally.',
                },
                {
                    icon: <BenefitIcon variant="tools" />,
                    title: 'Exclusive Benefits',
                    description: 'Enjoy special offers and discounts at selected merchants.',
                },
                {
                    icon: <BenefitIcon variant="shield" />,
                    title: 'Maximum Security',
                    description: 'Secure transactions with strict fraud protection.',
                },
            ],
        },
    }

    const selectedCard = cardsContent[cardType]

    return (
        <div className="dashboard-page">
            <div className="dashboard-phone-shell">
                {/* Fixed Header Section */}
                <div className="dashboard-fixed-header">
                    <div className="dashboard-header">
                        <div className="user-greeting">
                            {activeTab === 'home' ? (
                                <>
                                    <h1>Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
                                    <div className="account-number-row">
                                        <p className="account-number">Account: {maskedAccountNumber}</p>
                                        <button
                                            type="button"
                                            className={`copy-account-btn ${isAccountCopied ? 'copied' : ''}`}
                                            onClick={handleCopyAccountNumber}
                                            aria-label="Copy account number"
                                            title="Copy account number"
                                        >
                                            <img src={copyIcon} alt="" aria-hidden="true" className="copy-account-icon" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1>
                                        {activeTab === 'cards'
                                            ? 'Cards'
                                            : activeTab === 'analysis'
                                                ? 'Transactions'
                                                : 'Profile'}
                                    </h1>
                                    <p className="account-number">
                                        {activeTab === 'cards'
                                            ? selectedCard.label
                                            : activeTab === 'analysis'
                                                ? 'Analysis'
                                                : 'Your information'}
                                    </p>
                                </>
                            )}
                        </div>
                        {activeTab === 'home' ? (
                            <Button variant="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        ) : (
                            <button type="button" className="cards-help-btn" onClick={() => setActiveTab('home')}>
                                Back
                            </button>
                        )}
                    </div>

                    {activeTab === 'home' ? (
                        <>
                            {/* Account Summary Card */}
                            <div className="account-card">
                                <div className="card-header">
                                    <h2>Available Balance</h2>
                                    <div className="card-header-actions">
                                        <button
                                            type="button"
                                            className="balance-visibility-btn"
                                            onClick={() => setIsBalanceVisible((current) => !current)}
                                            aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
                                            title={isBalanceVisible ? 'Hide balance' : 'Show balance'}
                                        >
                                            {isBalanceVisible ? (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="balance-visibility-icon" fill="none">
                                                    <path
                                                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="balance-visibility-icon" fill="none">
                                                    <path
                                                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <line
                                                        x1="1"
                                                        y1="1"
                                                        x2="23"
                                                        y2="23"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                        <span className="updated-at">Last login: {formatLastLogin(user?.lastLoginAt)}</span>
                                    </div>
                                </div>
                                <div className="balance-display">
                                    {isBalanceVisible ? (
                                        <>
                                            <span className="currency">₦</span>
                                            <span className="amount">{currencyFormatter.format(walletBalance)}</span>
                                        </>
                                    ) : (
                                        <span className="amount amount-masked">****</span>
                                    )}
                                </div>
                                <div className="balance-breakdown">
                                    <div className="breakdown-item">
                                        <span className="label">Expenses</span>
                                        <span className="amount">₦{currencyFormatter.format(totalExpenses)}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="label">Income</span>
                                        <span className="amount">₦{currencyFormatter.format(totalIncome)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <button 
                                    className="action-btn" 
                                    title="Transfer to a Trusta user"
                                    onClick={() => {
                                        setSelectedTransferType('to-trusta')
                                        setShowTransferModal(true)
                                    }}
                                >
                                    <span className="icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span>To Trusta</span>
                                </button>
                                <button 
                                    className="action-btn" 
                                    title="Transfer to another bank account"
                                    onClick={() => {
                                        setSelectedTransferType('to-bank')
                                        setShowTransferModal(true)
                                    }}
                                >
                                    <span className="icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M3 10h18M5 10v8m4-8v8m4-8v8m4-8v8M3 20h18M12 4l9 4H3l9-4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span>To Bank</span>
                                </button>
                                <button
                                    className="action-btn"
                                    title="Withdraw from your Trusta wallet"
                                    onClick={() => setShowWithdrawUnavailableModal(true)}
                                >
                                    <span className="icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M3 7h18v10H3V7Z" stroke="currentColor" strokeWidth="2" />
                                            <path d="M7 12h10M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <span>Withdraw</span>
                                </button>
                                <button
                                    className="action-btn"
                                    title="Pay utility and service bills"
                                    onClick={() => setShowBillsUnavailableModal(true)}
                                >
                                    <span className="icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M7 3h10v18l-2-1.3L13 21l-2-1.3L9 21l-2-1.3L5 21V3h2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <span>Pay Bills</span>
                                </button>
                            </div>
                            <p className="quick-actions-note">To Trusta means transfer to a Trusta account.</p>
                        </>
                    ) : activeTab === 'cards' ? (
                        <>
                            <div className="cards-toggle-row">
                                <button
                                    className={`cards-toggle-btn ${cardType === 'virtual' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setCardType('virtual')}
                                >
                                    Virtual Card
                                </button>
                                <button
                                    className={`cards-toggle-btn ${cardType === 'physical' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setCardType('physical')}
                                >
                                    Physical Card <span className="cards-discount-badge">20% OFF</span>
                                </button>
                            </div>

                            <div className="cards-plan-chip">{selectedCard.planName}</div>

                            <div className={selectedCard.showcaseClassName}>
                                <div className="cards-showcase-brand">{selectedCard.brand}</div>
                                <div className="cards-showcase-name">{selectedCard.label}</div>
                                <div className="cards-showcase-network">{selectedCard.network}</div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Scrollable Transactions Section */}
                <div className="dashboard-container">
                    {activeTab === 'home' ? (
                        <>
                            {/* Recent Transactions */}
                            <div className="recent-transactions">
                                <div className="transactions-header">
                                    <h3>Recent Transactions</h3>
                                    <button type="button" className="see-all see-all-btn" onClick={() => setActiveTab('analysis')}>
                                        See All
                                    </button>
                                </div>

                                <div className="transactions-list">
                                    {isTransactionsLoading && (
                                        <div className="transaction-empty-state">Loading transactions...</div>
                                    )}

                                    {!isTransactionsLoading && transactions.length === 0 && (
                                        <div className="transaction-empty-state">No transactions yet</div>
                                    )}

                                    {!isTransactionsLoading && transactions.map((transaction) => (
                                        <div className="transaction-item" key={transaction._id}>
                                            <div className="transaction-info">
                                                <div className="transaction-icon">
                                                    {getTransactionIcon(transaction.type, transaction.direction)}
                                                </div>
                                                <div className="transaction-details">
                                                    <span className="transaction-name">
                                                        {transaction.counterpartyName || 'Transfer'}
                                                    </span>
                                                    <span className="transaction-narration">
                                                        {transaction.narration || 'No narration'}
                                                    </span>
                                                    <span className="transaction-date">
                                                        {formatTransactionDate(transaction.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`transaction-amount ${transaction.direction === 'credit' ? 'positive' : 'negative'}`}>
                                                {formatTransactionAmount(transaction.amount, transaction.direction)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'cards' ? (
                        <div className="cards-details-panel">
                            {selectedCard.benefits.map((benefit) => (
                                <div className="cards-benefit-item" key={benefit.title}>
                                    <span className="cards-benefit-icon" aria-hidden="true">
                                        {benefit.icon}
                                    </span>
                                    <div className="cards-benefit-copy">
                                        <h4>{benefit.title}</h4>
                                        <p>{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeTab === 'analysis' ? (
                        <div className="analysis-tab-wrap">
                            <div className="analysis-filters-row">
                                <select value={historyCategory} onChange={(event) => setHistoryCategory(event.target.value)}>
                                    <option value="all">All Categories</option>
                                    <option value="credit">Inflow</option>
                                    <option value="debit">Outflow</option>
                                    <option value="transfer_to_trusta">To Trusta</option>
                                    <option value="transfer_to_bank">To Bank</option>
                                    <option value="receive_from_trusta">From Trusta</option>
                                </select>
                                <select value={historyStatus} onChange={(event) => setHistoryStatus(event.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="completed">Successful</option>
                                </select>
                                <select value={historySort} onChange={(event) => setHistorySort(event.target.value)}>
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="highest">Highest Amount</option>
                                    <option value="lowest">Lowest Amount</option>
                                </select>
                            </div>

                            {isTransactionsLoading && <div className="transaction-empty-state">Loading transactions...</div>}
                            {!isTransactionsLoading && groupedTransactions.length === 0 && (
                                <div className="transaction-empty-state">No transactions for selected filters.</div>
                            )}

                            {!isTransactionsLoading && groupedTransactions.map((group) => (
                                <section className="analysis-month-group" key={group.key}>
                                    <div className="analysis-month-header">
                                        <h3>{group.label}</h3>
                                        <span className="analysis-pill">Analysis</span>
                                    </div>
                                    <div className="analysis-month-totals">
                                        <span>In: ₦{currencyFormatter.format(group.inflow)}</span>
                                        <span>Out: ₦{currencyFormatter.format(group.outflow)}</span>
                                    </div>

                                    <div className="analysis-month-list">
                                        {group.items.map((transaction) => (
                                            <article className="analysis-history-item" key={transaction._id}>
                                                <div className="analysis-history-main">
                                                    <span className="analysis-direction-icon">
                                                        {transaction.direction === 'credit' ? '↓' : '↑'}
                                                    </span>
                                                    <div>
                                                        <h4>{transaction.counterpartyName || 'Transfer'}</h4>
                                                        <p>{formatTransactionDate(transaction.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="analysis-history-end">
                                                    <strong className={transaction.direction === 'credit' ? 'positive' : 'negative'}>
                                                        {formatTransactionAmount(transaction.amount, transaction.direction)}
                                                    </strong>
                                                    <small>{String(transaction.status || 'completed')}</small>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="profile-tab-wrap">
                            <section className="profile-card profile-security-top">
                                <h3>Account Number</h3>
                                <div className="profile-account-inline">
                                    <strong className="profile-account-value">{user?.accountNumber || '-'}</strong>
                                    <button
                                        type="button"
                                        className={`copy-account-btn ${isAccountCopied ? 'copied' : ''}`}
                                        onClick={handleCopyAccountNumber}
                                        aria-label="Copy account number"
                                        title="Copy account number"
                                    >
                                        <img src={copyIcon} alt="" aria-hidden="true" className="copy-account-icon" />
                                    </button>
                                </div>
                            </section>

                            <section className="profile-card">
                                <h3>Personal Information</h3>
                                <div className="profile-grid">
                                    <div className="profile-item">
                                        <span>First Name</span>
                                        <strong>{derivedFirstName || 'Not provided'}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Last Name</span>
                                        <strong>{derivedLastName || 'Not provided'}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Email</span>
                                        <strong>{user?.email || '-'}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Phone Number</span>
                                        <strong>{user?.contactInfo?.phoneNumber || 'Not provided'}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Nationality</span>
                                        <strong>{user?.personalInfo?.nationality || 'Not provided'}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Country</span>
                                        <strong>{user?.personalInfo?.countryOfResidence || 'Not provided'}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="profile-card">
                                <h3>Banking Information</h3>
                                <div className="profile-grid">
                                    <div className="profile-item">
                                        <span>Account Number</span>
                                        <strong>{user?.accountNumber || '-'}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Current Balance</span>
                                        <strong>₦{currencyFormatter.format(walletBalance)}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Total Inflow</span>
                                        <strong>₦{currencyFormatter.format(totalIncome)}</strong>
                                    </div>
                                    <div className="profile-item">
                                        <span>Total Outflow</span>
                                        <strong>₦{currencyFormatter.format(totalExpenses)}</strong>
                                    </div>
                                </div>
                            </section>

                            {isNameIncomplete && (
                                <button
                                    type="button"
                                    className="profile-complete-btn"
                                    onClick={() => setShowCompleteRegistrationModal(true)}
                                >
                                    Complete Registration Details
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {activeTab === 'home' && (
                    <div className="scroll-hint" aria-hidden="true">
                        <span>Scroll for more</span>
                        <span className="scroll-hint-chevron">⌄</span>
                    </div>
                )}

                {activeTab === 'cards' && (
                    <div className="cards-cta-wrap">
                        <p className="cards-discount-text">20% discount expires in 5 days 13h</p>
                        <button type="button" className="cards-cta-btn" onClick={() => setShowCardUnavailableModal(true)}>
                            Get It Now
                        </button>
                    </div>
                )}

                {/* Bottom Navigation */}
                <nav className="bottom-nav">
                    <button
                        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        <span className="icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 9.5V20h14V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>Home</span>
                    </button>
                    <button className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>
                        <span className="icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M8.5 14.5c-1.5-1.2-2.5-3-2.5-5a6 6 0 1 1 12 0c0 2-1 3.8-2.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>Analysis</span>
                    </button>
                    <button
                        className="nav-item nav-toggle-item"
                        onClick={onToggleTheme}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        <span className="icon nav-toggle-icon" aria-hidden="true">
                            {isDark ? (
                                <svg viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M21 14.8A9 9 0 1 1 9.2 3a7 7 0 1 0 11.8 11.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </span>
                        <span>{isDark ? 'Light' : 'Dark'}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                    >
                        <span className="icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
                                <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
                                <path d="M6 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span>Cards</span>
                    </button>
                    <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        <span className="icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
                                <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span>Profile</span>
                    </button>
                </nav>

                {showCopyToast && (
                    <div className="copy-toast" role="status" aria-live="polite">
                        Account number copied to clipboard
                    </div>
                )}
            </div>
            {showCardUnavailableModal && (
                <div className="feature-modal-overlay" role="dialog" aria-modal="true" aria-label="Feature unavailable">
                    <div className="feature-modal-card">
                        <h3>Feature not yet available</h3>
                        <p>This card service is coming soon. Please check back later.</p>
                        <button
                            type="button"
                            className="feature-modal-btn"
                            onClick={() => setShowCardUnavailableModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {showWithdrawUnavailableModal && (
                <div className="feature-modal-overlay" role="dialog" aria-modal="true" aria-label="Withdraw unavailable">
                    <div className="feature-modal-card">
                        <h3>Feature not yet available</h3>
                        <p>We do not have physical merchants at the moment. It will be available soon.</p>
                        <button
                            type="button"
                            className="feature-modal-btn"
                            onClick={() => setShowWithdrawUnavailableModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {showBillsUnavailableModal && (
                <div className="feature-modal-overlay" role="dialog" aria-modal="true" aria-label="Bills unavailable">
                    <div className="feature-modal-card">
                        <h3>Feature not yet available</h3>
                        <p>Pay Bills is coming soon. Please check back later for utilities and bill payments.</p>
                        <button
                            type="button"
                            className="feature-modal-btn"
                            onClick={() => setShowBillsUnavailableModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {showDemoBonus && <DemoBonusModal onClose={() => setShowDemoBonus(false)} />}
            {showTransferModal && selectedTransferType && (
                <TransferModal
                    transferType={selectedTransferType}
                    onClose={() => {
                        setShowTransferModal(false)
                        setSelectedTransferType(null)
                    }}
                    onTransferComplete={() => {
                        setShowTransferModal(false)
                        setSelectedTransferType(null)

                        refreshSession()
                        setTransactionsRefreshTick((value) => value + 1)
                    }}
                />
            )}
            {showCompleteRegistrationModal && (
                <div className="feature-modal-overlay" role="dialog" aria-modal="true" aria-label="Complete registration">
                    <div className="feature-modal-card">
                        <h3>Complete Registration</h3>
                        <p>Please provide your first and last name to complete your profile.</p>

                        <form className="profile-complete-form" onSubmit={handleCompleteRegistration}>
                            <input
                                type="text"
                                value={firstNameInput}
                                placeholder="First name"
                                onChange={(event) => setFirstNameInput(event.target.value.replace(/[^A-Za-z\s'-]/g, ''))}
                                required
                            />
                            <input
                                type="text"
                                value={lastNameInput}
                                placeholder="Last name"
                                onChange={(event) => setLastNameInput(event.target.value.replace(/[^A-Za-z\s'-]/g, ''))}
                                required
                            />

                            {completeRegistrationError && (
                                <p className="profile-form-error">{completeRegistrationError}</p>
                            )}

                            <button type="submit" className="feature-modal-btn" disabled={isCompletingRegistration}>
                                {isCompletingRegistration ? 'Saving...' : 'Save'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
