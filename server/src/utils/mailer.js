import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const transporterCache = new Map()
let resendClient = null

function getEmailContent(fullName, otpCode) {
    return {
        subject: 'Your Trusta login OTP',
        text: `Hi ${fullName},\n\nYour one-time login code is ${otpCode}. It expires in 10 minutes.\n\nIf this was not you, please reset your password immediately.`,
        html: `<p>Hi ${fullName},</p><p>Your one-time login code is <strong>${otpCode}</strong>.</p><p>This code expires in 10 minutes.</p><p>If this was not you, please reset your password immediately.</p>`,
    }
}

function createTransporter(portOverride) {
    const host = process.env.SMTP_HOST
    const rawPort = Number(portOverride || process.env.SMTP_PORT || 587)
    const port = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 587
    const user = process.env.SMTP_USER
    const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '')

    if (!host || !user || !pass) {
        throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured for OTP email delivery')
    }

    return nodemailer.createTransport({
        host: host.trim(),
        port,
        secure: port === 465,
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000,
        auth: {
            user: user.trim(),
            pass,
        },
    })
}

function getMailProvider() {
    const provider = String(process.env.MAIL_PROVIDER || 'smtp').toLowerCase().trim()

    if (provider === 'resend' || provider === 'smtp' || provider === 'auto') {
        return provider
    }

    throw new Error('MAIL_PROVIDER must be one of: smtp, resend, auto')
}

function getResendClient() {
    const apiKey = String(process.env.RESEND_API_KEY || '').trim()

    if (!apiKey) {
        throw new Error('RESEND_API_KEY must be configured when MAIL_PROVIDER is resend or auto')
    }

    if (!resendClient) {
        resendClient = new Resend(apiKey)
    }

    return resendClient
}

function getResendFromAddress() {
    const fromAddress = String(process.env.RESEND_FROM || process.env.SMTP_FROM || '').trim()

    if (!fromAddress) {
        throw new Error('RESEND_FROM must be configured when using Resend')
    }

    return fromAddress
}

function getTransporter(port) {
    const cacheKey = String(port || process.env.SMTP_PORT || 587)
    const cachedTransporter = transporterCache.get(cacheKey)

    if (cachedTransporter) {
        return cachedTransporter
    }

    const newTransporter = createTransporter(port)
    transporterCache.set(cacheKey, newTransporter)
    return newTransporter
}

function getSmtpPorts() {
    const configuredPort = Number(process.env.SMTP_PORT || 587)
    const primaryPort = Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 587
    const fallbackPort = primaryPort === 465 ? 587 : 465

    return [primaryPort, fallbackPort].filter((port, index, ports) => ports.indexOf(port) === index)
}

async function sendViaResend({ to, content }) {
    const resend = getResendClient()
    const from = getResendFromAddress()

    console.log('Sending OTP email via Resend:', {
        from,
        to,
    })

    const response = await resend.emails.send({
        from,
        to,
        subject: content.subject,
        text: content.text,
        html: content.html,
    })

    if (response?.error) {
        throw new Error(`Resend delivery failed: ${response.error.message || 'Unknown Resend error'}`)
    }

    console.log('OTP email sent via Resend:', response?.data?.id || 'no-id')
    return response
}

async function sendViaSmtp({ to, content }) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER

    const mailOptions = {
        from,
        to,
        subject: content.subject,
        text: content.text,
        html: content.html,
    }

    console.log('Sending OTP email via SMTP:', {
        from,
        to,
        smtpHost: process.env.SMTP_HOST,
        smtpUser: process.env.SMTP_USER,
        smtpPorts: getSmtpPorts(),
    })

    const errors = []

    for (const port of getSmtpPorts()) {
        try {
            const mailer = getTransporter(port)
            const info = await mailer.sendMail(mailOptions)

            console.log(`OTP email sent via SMTP on port ${port}:`, info.response)
            return info
        } catch (error) {
            errors.push({ port, error })
            transporterCache.delete(String(port))
            console.error(`SMTP OTP send failed on port ${port}:`, error)
        }
    }

    const message = errors.length
        ? errors.map(({ port, error }) => `[${port}] ${error?.message || String(error)}`).join(' | ')
        : 'Unable to send OTP email over SMTP. Check SMTP settings.'

    throw new Error(message)
}

export async function sendLoginOtpEmail({ to, fullName, otpCode }) {
    const content = getEmailContent(fullName, otpCode)
    const provider = getMailProvider()

    if (provider === 'resend') {
        return sendViaResend({ to, content })
    }

    if (provider === 'smtp') {
        return sendViaSmtp({ to, content })
    }

    try {
        return await sendViaResend({ to, content })
    } catch (resendError) {
        console.error('Resend send failed in auto mode, falling back to SMTP:', resendError)
        return sendViaSmtp({ to, content })
    }
}
