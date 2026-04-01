import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/analysis.css'

const API_ROOT = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function Analysis() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('this_month')
  const [directionFilter, setDirectionFilter] = useState('all')

  useEffect(() => {
    let isCancelled = false

    async function loadHistory() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_ROOT}/api/transfers/history?limit=300`, {
          method: 'GET',
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load analysis')
        }

        if (!isCancelled) {
          setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(requestError.message || 'Unable to load analysis')
          setTransactions([])
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      isCancelled = true
    }
  }, [])

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  )

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const inSelectedRange = (createdAt) => {
    const value = new Date(createdAt)

    if (range === 'this_month') {
      return value >= startOfMonth
    }

    if (range === 'last_30_days') {
      return value >= thirtyDaysAgo
    }

    return true
  }

  const filteredTransactions = transactions
    .filter((tx) => inSelectedRange(tx.createdAt))
    .filter((tx) => (directionFilter === 'all' ? true : tx.direction === directionFilter))

  const totals = filteredTransactions.reduce(
    (acc, tx) => {
      if (tx.direction === 'credit') {
        acc.credit += Number(tx.amount || 0)
      } else {
        acc.debit += Number(tx.amount || 0)
      }
      return acc
    },
    { credit: 0, debit: 0 },
  )

  const monthTransactions = transactions.filter((tx) => new Date(tx.createdAt) >= startOfMonth)
  const monthCredit = monthTransactions
    .filter((tx) => tx.direction === 'credit')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  const monthDebit = monthTransactions
    .filter((tx) => tx.direction === 'debit')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

  const currentBalance = Number(user?.walletBalance || 0)
  const openingMonthBalanceEstimate = currentBalance - monthCredit + monthDebit

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="analysis-page page-load">
      <div className="analysis-container card-glass">
        <div className="analysis-header">
          <div>
            <p className="eyebrow">Analysis</p>
            <h1>Advanced Transaction History</h1>
            <p className="analysis-subtext">Track spending trends, opening month balance, and transaction flow.</p>
          </div>
          <Link to="/dashboard" className="analysis-back-link">
            Back to Dashboard
          </Link>
        </div>

        <div className="analysis-filters">
          <label>
            Range
            <select value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="this_month">This Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="all_time">All Time</option>
            </select>
          </label>

          <label>
            Flow
            <select value={directionFilter} onChange={(event) => setDirectionFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="debit">Debits</option>
              <option value="credit">Credits</option>
            </select>
          </label>
        </div>

        <div className="analysis-metrics">
          <div className="metric-card">
            <span>Opening Balance (Month Est.)</span>
            <strong>₦{currencyFormatter.format(openingMonthBalanceEstimate)}</strong>
          </div>
          <div className="metric-card">
            <span>Total Debit</span>
            <strong className="negative">₦{currencyFormatter.format(totals.debit)}</strong>
          </div>
          <div className="metric-card">
            <span>Total Credit</span>
            <strong className="positive">₦{currencyFormatter.format(totals.credit)}</strong>
          </div>
          <div className="metric-card">
            <span>Transactions Count</span>
            <strong>{filteredTransactions.length}</strong>
          </div>
        </div>

        <div className="analysis-history-list">
          {loading && <div className="analysis-empty">Loading analysis...</div>}
          {!loading && error && <div className="analysis-empty">{error}</div>}
          {!loading && !error && filteredTransactions.length === 0 && (
            <div className="analysis-empty">No transactions in this range.</div>
          )}

          {!loading && !error && filteredTransactions.map((transaction) => (
            <article className="analysis-history-item" key={transaction._id}>
              <div className="analysis-history-main">
                <h3>{transaction.counterpartyName || 'Transfer'}</h3>
                <p>{transaction.narration || 'No narration'}</p>
                <small>{formatDate(transaction.createdAt)}</small>
              </div>
              <div className={`analysis-history-amount ${transaction.direction === 'credit' ? 'positive' : 'negative'}`}>
                {transaction.direction === 'credit' ? '+' : '-'}₦{currencyFormatter.format(Number(transaction.amount || 0))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analysis
