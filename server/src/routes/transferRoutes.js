import express from 'express'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import { requireAuth } from '../middleware/auth.js'
import { verifyPin } from '../utils/pinHash.js'

const router = express.Router()

// Paystack API base URL
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

function getPaystackSecretKey() {
    return String(process.env.PAYSTACK_SECRET_KEY || '').trim()
}

function sanitizeNarration(value) {
    return String(value || '')
        .replace(/[^A-Za-z0-9\s.,'-]/g, '')
        .trim()
        .slice(0, 120)
}

router.get('/history', requireAuth, async (req, res) => {
    try {
        const requestedLimit = Number(req.query.limit || 20)
        const safeLimit = Number.isFinite(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 500)
            : 20

        const transactions = await Transaction.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(safeLimit)
            .lean()

        return res.json({ transactions })
    } catch (error) {
        console.error('Fetch transfer history error:', error)
        return res.status(500).json({ message: 'Unable to fetch transaction history' })
    }
})

router.get('/banks', requireAuth, async (req, res) => {
    try {
        const paystackSecretKey = getPaystackSecretKey()

        if (!paystackSecretKey) {
            return res.status(400).json({ message: 'Paystack is not configured' })
        }

        const response = await fetch(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
            },
        })

        const data = await response.json()

        if (!response.ok || !data?.status) {
            return res.status(502).json({ message: data?.message || 'Unable to fetch banks from Paystack' })
        }

        const banks = Array.isArray(data.data)
            ? (() => {
                const uniqueByCode = new Map()

                data.data
                    .filter((bank) => bank?.active === true)
                    .forEach((bank) => {
                        const code = String(bank.code || '').trim()
                        const name = String(bank.name || '').trim()

                        if (code && name && !uniqueByCode.has(code)) {
                            uniqueByCode.set(code, { code, name })
                        }
                    })

                return [...uniqueByCode.values()].sort((a, b) => a.name.localeCompare(b.name))
            })()
            : []

        return res.json({ banks })
    } catch (error) {
        console.error('Fetch banks error:', error)
        return res.status(500).json({ message: 'Unable to fetch bank list' })
    }
})

/**
 * Validate recipient account
 * Supports:
 * - To Trusta: validates Trusta user exists
 * - To Bank: validates bank account using Paystack
 */
router.post('/validate-account', requireAuth, async (req, res) => {
    try {
        const paystackSecretKey = getPaystackSecretKey()
        const { transferType, recipient, bankCode } = req.body

        if (!transferType || !recipient) {
            return res.status(400).json({ message: 'Transfer type and recipient are required' })
        }

        if (transferType === 'to-trusta') {
            // Validate Trusta recipient
            const recipientUser = await User.findOne({
                $or: [
                    { email: String(recipient).toLowerCase().trim() },
                    { accountNumber: String(recipient).trim() },
                ],
            })

            if (!recipientUser) {
                return res.status(404).json({ message: 'Trusta user not found' })
            }

            if (recipientUser._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'Cannot transfer to yourself' })
            }

            return res.json({
                account: {
                    accountName: recipientUser.fullName,
                    accountNumber: recipientUser.accountNumber,
                    email: recipientUser.email,
                },
            })
        } else if (transferType === 'to-bank') {
            // Validate bank account using Paystack
            if (!bankCode || !paystackSecretKey) {
                return res.status(400).json({ message: 'Bank code required or Paystack not configured' })
            }

            try {
                // Paystack account verification endpoint
                // https://paystack.com/docs/api/#verify-account-number
                const response = await fetch(
                    `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${recipient}&bank_code=${bankCode}`,
                    {
                        headers: {
                            Authorization: `Bearer ${paystackSecretKey}`,
                        },
                    },
                )

                const data = await response.json()

                if (response.ok && data?.status) {
                    return res.json({
                        account: {
                            accountName: data.data.account_name,
                            accountNumber: data.data.account_number,
                            bankCode,
                        },
                    })
                }

                return res.status(400).json({
                    message: data?.message || 'Account not found on selected bank',
                })
            } catch (error) {
                console.error('Paystack validation error:', error.message)
                return res.status(400).json({
                    message: 'Account validation failed',
                })
            }
        } else {
            return res.status(400).json({ message: 'Invalid transfer type' })
        }
    } catch (error) {
        console.error('Validate account error:', error)
        res.status(500).json({ message: 'Failed to validate account' })
    }
})

/**
 * Process transfer
 * Validates balance, PIN, and executes transfer
 */
router.post('/send', requireAuth, async (req, res) => {
    try {
        const { transferType, recipient, bankCode, amount, pin, validatedAccount, narration } = req.body

        // Validate inputs
        if (!transferType || !recipient || !amount || !pin) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const transferAmount = Number(amount)

        if (transferAmount <= 0 || transferAmount > 1000000) {
            return res.status(400).json({ message: 'Invalid transfer amount' })
        }

        if (!/^\d{4}$/.test(String(pin))) {
            return res.status(400).json({ message: 'Transaction PIN must be exactly 4 digits' })
        }

        const sanitizedNarration = sanitizeNarration(narration)

        if (!sanitizedNarration) {
            return res.status(400).json({ message: 'Narration is required for this transaction' })
        }

        // Get current user
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Check balance
        if (user.walletBalance < transferAmount) {
            return res.status(400).json({
                message: `Insufficient balance. You have ₦${Number(user.walletBalance).toLocaleString()}`,
            })
        }

        // Verify transaction PIN
        if (!user.transactionPinHash) {
            return res.status(400).json({ message: 'Please set up a transaction PIN first' })
        }

        const isPinValid = await verifyPin(pin, user.transactionPinHash)

        if (!isPinValid) {
            return res.status(400).json({ message: 'Invalid transaction PIN' })
        }

        // Process transfer based on type
        let recipientData = {}
        let transactionType = ''
        let transactionMeta = {}
        let recipientUser = null

        if (transferType === 'to-trusta') {
            // Find recipient Trusta user
            recipientUser = await User.findOne({
                $or: [
                    { email: String(recipient).toLowerCase().trim() },
                    { accountNumber: String(recipient).trim() },
                ],
            })

            if (!recipientUser) {
                return res.status(404).json({ message: 'Recipient not found' })
            }

            // Debit sender
            user.walletBalance -= transferAmount
            user.totalExpenses = (user.totalExpenses || 0) + transferAmount

            // Credit recipient
            recipientUser.walletBalance = (recipientUser.walletBalance || 0) + transferAmount
            recipientUser.totalIncome = (recipientUser.totalIncome || 0) + transferAmount

            await recipientUser.save()

            transactionType = 'transfer_to_trusta'
            recipientData = {
                name: recipientUser.fullName,
                account: recipientUser.accountNumber,
                email: recipientUser.email,
            }
            transactionMeta = {
                recipientId: recipientUser._id,
                recipientEmail: recipientUser.email,
            }
        } else if (transferType === 'to-bank') {
            // Debit sender
            user.walletBalance -= transferAmount
            user.totalExpenses = (user.totalExpenses || 0) + transferAmount

            transactionType = 'transfer_to_bank'
            recipientData = {
                name: validatedAccount?.accountName,
                accountNumber: validatedAccount?.accountNumber,
                bankCode,
            }
            transactionMeta = {
                bankCode,
                accountNumber: validatedAccount?.accountNumber,
            }
        } else {
            return res.status(400).json({ message: 'Invalid transfer type' })
        }

        // Save sender
        await user.save()

        // Create transaction record (if tracking is needed)
        // You can create a Transaction model later

        const senderTransaction = await Transaction.create({
            userId: user._id,
            type: transactionType,
            direction: 'debit',
            amount: transferAmount,
            narration: sanitizedNarration,
            counterpartyName: recipientData.name,
            counterpartyAccount: recipientData.account || recipientData.accountNumber,
            counterpartyBankCode: recipientData.bankCode || null,
            status: 'completed',
        })

        if (transferType === 'to-trusta' && recipientUser) {
            await Transaction.create({
                userId: recipientUser._id,
                type: 'receive_from_trusta',
                direction: 'credit',
                amount: transferAmount,
                narration: sanitizedNarration,
                counterpartyName: user.fullName,
                counterpartyAccount: user.accountNumber,
                counterpartyBankCode: null,
                status: 'completed',
            })
        }

        res.json({
            message: `Successfully transferred ₦${Number(transferAmount).toLocaleString()} to ${recipientData.name}`,
            transaction: senderTransaction,
            newBalance: user.walletBalance,
        })
    } catch (error) {
        console.error('Transfer error:', error)
        res.status(500).json({ message: 'Transfer failed. Please try again.' })
    }
})

export default router
