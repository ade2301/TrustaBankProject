import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import '../styles/dashboard.css'

function Dashboard({ theme = 'light', onToggleTheme }) {
    const { user, logout } = useAuth()
    const isDark = theme === 'dark'
    const [isBalanceVisible, setIsBalanceVisible] = useState(false)

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

    return (
        <div className="dashboard-page">
            <div className="dashboard-phone-shell">
                {/* Fixed Header Section */}
                <div className="dashboard-fixed-header">
                    <div className="dashboard-header">
                        <div className="user-greeting">
                            <h1>Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
                            <p className="account-number">
                                Account: {user?.accountNumber?.substring(0, 2)}
                                {'*'.repeat(8)}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>

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
                                    {isBalanceVisible ? '🙈' : '👁'}
                                </button>
                                <span className="updated-at">Updated just now</span>
                            </div>
                        </div>
                        <div className="balance-display">
                            {isBalanceVisible ? (
                                <>
                                    <span className="currency">₦</span>
                                    <span className="amount">25,415.25</span>
                                </>
                            ) : (
                                <span className="amount amount-masked">****</span>
                            )}
                        </div>
                        <div className="balance-breakdown">
                            <div className="breakdown-item">
                                <span className="label">Expenses</span>
                                <span className="amount">₦15,256</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="label">Income</span>
                                <span className="amount">₦90,530</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <button className="action-btn">
                            <span className="icon">+</span>
                            <span>Add</span>
                        </button>
                        <button className="action-btn">
                            <span className="icon">↑</span>
                            <span>Send</span>
                        </button>
                        <button className="action-btn">
                            <span className="icon">📋</span>
                            <span>Request</span>
                        </button>
                        <button className="action-btn">
                            <span className="icon">💳</span>
                            <span>Pay Bill</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Transactions Section */}
                <div className="dashboard-container">
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
                </div>

                <div className="scroll-hint" aria-hidden="true">
                    <span>Scroll for more</span>
                    <span className="scroll-hint-chevron">⌄</span>
                </div>

                {/* Bottom Navigation */}
                <nav className="bottom-nav">
                    <button className="nav-item active">
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
                    <button className="nav-item">
                        <span className="icon">💳</span>
                        <span>Cards</span>
                    </button>
                    <button className="nav-item">
                        <span className="icon">👤</span>
                        <span>Profile</span>
                    </button>
                </nav>
            </div>
        </div>
    )
}

export default Dashboard
