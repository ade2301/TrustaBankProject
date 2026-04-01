import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import DemoBonusModal from '../components/DemoBonusModal'
import copyIcon from '../assets/copy-icon.svg'
import eyeIcon from '../assets/eye-icon.svg'
import eyeSlashIcon from '../assets/eye-slash-icon.svg'
import '../styles/dashboard.css'

function Dashboard({ theme = 'light', onToggleTheme }) {
    const { user, logout } = useAuth()
    const isDark = theme === 'dark'
    const [activeTab, setActiveTab] = useState('home')
    const [cardType, setCardType] = useState('virtual')
    const [isBalanceVisible, setIsBalanceVisible] = useState(false)
    const [showDemoBonus, setShowDemoBonus] = useState(user?.loginBonusJustReceived === true)
    const [isAccountCopied, setIsAccountCopied] = useState(false)
    const [showCopyToast, setShowCopyToast] = useState(false)
    const [showCardUnavailableModal, setShowCardUnavailableModal] = useState(false)

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
            window.setTimeout(() => setIsAccountCopied(false), 1400)
            window.setTimeout(() => setShowCopyToast(false), 1800)
        } catch {
            // Ignore clipboard failures to avoid interrupting dashboard usage.
        }
    }

    const transactions = [
        { icon: '👤', name: 'Sarmistha | Work', date: '12 Feb, 2025', amount: '+₦90', type: 'positive' },
        { icon: '☕', name: 'Mocha Coffee | Food', date: '10 Jan, 2025', amount: '-₦10', type: 'negative' },
        { icon: '🛍️', name: 'Amazon | Subscription', date: '10 Jan, 2025', amount: '-₦48', type: 'negative' },
        { icon: '🏥', name: 'Reliance HMO | Health', date: '08 Jan, 2025', amount: '-₦25,000', type: 'negative' },
        { icon: '💡', name: 'IKEDC | Electricity', date: '07 Jan, 2025', amount: '-₦12,500', type: 'negative' },
        { icon: '📱', name: 'Airtime Top-up', date: '05 Jan, 2025', amount: '-₦2,000', type: 'negative' },
        { icon: '🏦', name: 'Salary Credit', date: '03 Jan, 2025', amount: '+₦320,000', type: 'positive' },
        { icon: '🚌', name: 'BRT Card | Transport', date: '02 Jan, 2025', amount: '-₦1,500', type: 'negative' },
        { icon: '🎓', name: 'Course Payment', date: '29 Dec, 2024', amount: '-₦35,000', type: 'negative' },
        { icon: '🎁', name: 'Gift from Ada', date: '25 Dec, 2024', amount: '+₦15,000', type: 'positive' }
    ]

    const handleLogout = async () => {
        await logout()
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
                    icon: '⚡',
                    title: 'Instant Access',
                    description: 'Use it instantly after quick application',
                },
                {
                    icon: '🌐',
                    title: 'Accepted Across Online Merchants',
                    description: 'Including Google Play, Netflix, Shein, Uber and more.',
                },
                {
                    icon: '🛠',
                    title: 'Self-managed Transactions',
                    description: 'Set card controls and monitor payments in real time.',
                },
                {
                    icon: '🟢',
                    title: 'No Maintenance Fee',
                    description: 'Free application and zero maintenance fees.',
                },
                {
                    icon: '✅',
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
                    icon: '🆓',
                    title: 'Free Application and Usage',
                    description: 'Free application and zero maintenance fees.',
                },
                {
                    icon: '🌍',
                    title: 'Works Everywhere',
                    description: 'Accepted for online payments, POS, and ATM transactions globally.',
                },
                {
                    icon: '🎁',
                    title: 'Exclusive Benefits',
                    description: 'Enjoy special offers and discounts at selected merchants.',
                },
                {
                    icon: '🛡',
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
                                    <h1>Cards</h1>
                                    <p className="account-number">{selectedCard.label}</p>
                                </>
                            )}
                        </div>
                        {activeTab === 'home' ? (
                            <Button variant="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        ) : (
                            <button type="button" className="cards-help-btn">
                                Q&amp;A
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
                                            <img 
                                                src={isBalanceVisible ? eyeIcon : eyeSlashIcon} 
                                                alt="" 
                                                aria-hidden="true" 
                                                className="balance-visibility-icon"
                                            />
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
                                <button className="action-btn" title="Transfer to a Trusta user">
                                    <span className="icon">⇄</span>
                                    <span>To Trusta</span>
                                </button>
                                <button className="action-btn" title="Transfer to another bank account">
                                    <span className="icon">🏦</span>
                                    <span>To Bank</span>
                                </button>
                                <button className="action-btn" title="Withdraw from your Trusta wallet">
                                    <span className="icon">💸</span>
                                    <span>Withdraw</span>
                                </button>
                                <button className="action-btn" title="Pay utility and service bills">
                                    <span className="icon">🧾</span>
                                    <span>Pay Bills</span>
                                </button>
                            </div>
                            <p className="quick-actions-note">To Trusta means transfer to a Trusta account.</p>
                        </>
                    ) : (
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
                    )}
                </div>

                {/* Scrollable Transactions Section */}
                <div className="dashboard-container">
                    {activeTab === 'home' ? (
                        <>
                            {/* Recent Transactions */}
                            <div className="recent-transactions">
                                <div className="transactions-header">
                                    <h3>Recent Transactions</h3>
                                    <a href="#" className="see-all">
                                        See All
                                    </a>
                                </div>

                                <div className="transactions-list">
                                    {transactions.map((transaction) => (
                                        <div className="transaction-item" key={`${transaction.name}-${transaction.date}`}>
                                            <div className="transaction-info">
                                                <div className="transaction-icon">{transaction.icon}</div>
                                                <div className="transaction-details">
                                                    <span className="transaction-name">{transaction.name}</span>
                                                    <span className="transaction-date">{transaction.date}</span>
                                                </div>
                                            </div>
                                            <span className={`transaction-amount ${transaction.type}`}>
                                                {transaction.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
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
                        <span className="icon">🏠</span>
                        <span>Home</span>
                    </button>
                    <button className="nav-item">
                        <span className="icon">💡</span>
                        <span>Insights</span>
                    </button>
                    <button
                        className="nav-item nav-toggle-item"
                        onClick={onToggleTheme}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        <span className="icon nav-toggle-icon">{isDark ? '☀' : '🌙'}</span>
                        <span>{isDark ? 'Light' : 'Dark'}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                    >
                        <span className="icon">💳</span>
                        <span>Cards</span>
                    </button>
                    <button className="nav-item">
                        <span className="icon">👤</span>
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
            {showDemoBonus && <DemoBonusModal onClose={() => setShowDemoBonus(false)} />}
        </div>
    )
}

export default Dashboard
