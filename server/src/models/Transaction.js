import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['transfer_to_trusta', 'transfer_to_bank', 'receive_from_trusta'],
            required: true,
        },
        direction: {
            type: String,
            enum: ['debit', 'credit'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        narration: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        counterpartyName: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        counterpartyAccount: {
            type: String,
            trim: true,
            maxlength: 20,
        },
        counterpartyBankCode: {
            type: String,
            trim: true,
            maxlength: 10,
            default: null,
        },
        status: {
            type: String,
            default: 'completed',
            enum: ['completed', 'failed', 'pending'],
        },
    },
    {
        timestamps: true,
    },
)

export default mongoose.model('Transaction', transactionSchema)
