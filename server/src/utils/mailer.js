import nodemailer from 'nodemailer'

let transporter

function getEmailContent(fullName, otpCode) {
    return {
        subject: 'Your Trusta login OTP',
        text: `Hi ${fullName},\n\nYour one-time login code is ${otpCode}. It expires in 10 minutes.\n\nIf this was not you, please reset your password immediately.`,
        html: `<p>Hi ${fullName},</p><p>Your one-time login code is <strong>${otpCode}</strong>.</p><p>This code expires in 10 minutes.</p><p>If this was not you, please reset your password immediately.</p>`,
    }
}

function getMailProvider() {
    return String(process.env.MAIL_PROVIDER || 'auto').trim().toLowerCase()
}

function getResendApiKey() {
    return String(process.env.RESEND_API_KEY || '').trim()
}

function getResendFrom() {
    return String(process.env.RESEND_FROM || process.env.SMTP_FROM || '').trim()
}

function createTransporter(portOverride) {
    const host = process.env.SMTP_HOST
    const rawPort = Number(portOverride || process.env.SMTP_PORT || 587)
    const port = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 587
    const user = process.env.SMTP_USER
    const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '')
    const service = String(process.env.SMTP_SERVICE || 'gmail').trim().toLowerCase()

    if (!host || !user || !pass) {
        throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured for OTP email delivery')
    }

    return nodemailer.createTransport({
        service,
        host,
        port,
        secure: port === 465,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        auth: {
            user,
            pass,
        },
    })
}

function getTransporter() {
    if (!transporter) {
        transporter = createTransporter()
    }

    return transporter
}

async function sendViaResend({ to, fullName, otpCode }) {
    const apiKey = getResendApiKey()
    const from = getResendFrom()

    if (!apiKey) {
        throw new Error('RESEND_API_KEY is required when MAIL_PROVIDER is set to resend')
    }

    if (!from) {
        throw new Error('RESEND_FROM (or SMTP_FROM) must be set for Resend email delivery')
    }

    const content = getEmailContent(fullName, otpCode)

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to,
            subject: content.subject,
            text: content.text,
            html: content.html,
        }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
        const message = payload?.message || payload?.error || 'Resend API request failed'
        throw new Error(`Resend delivery failed: ${message}`)
    }

    console.log('OTP email sent via Resend:', { to, id: payload?.id || null })
    return payload
}

async function sendViaSmtp({ to, fullName, otpCode }) {
    const content = getEmailContent(fullName, otpCode)
    const configuredPort = Number(process.env.SMTP_PORT || 587)
    const port = Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 587
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
        smtpService: process.env.SMTP_SERVICE || 'gmail',
        smtpUser: process.env.SMTP_USER,
        smtpPort: port,
    })

    let lastError = null

    try {
        const mailer = getTransporter()
        const info = await mailer.sendMail(mailOptions)

        transporter = mailer
        console.log(`OTP email sent via SMTP on port ${port}:`, info.response)
        return info
    } catch (error) {
        lastError = error
        console.error(`SMTP OTP send failed on port ${port}:`, error)
    }

    throw lastError || new Error('Unable to send OTP email over SMTP. Check SMTP settings.')
}

export async function sendLoginOtpEmail({ to, fullName, otpCode }) {
    const provider = getMailProvider()

    if (provider === 'resend') {
        return sendViaResend({ to, fullName, otpCode })
    }

    if (provider === 'smtp') {
        return sendViaSmtp({ to, fullName, otpCode })
    }

    if (getResendApiKey()) {
        try {
            return await sendViaResend({ to, fullName, otpCode })
        } catch (resendError) {
            console.error('Resend delivery failed in auto mode, falling back to SMTP:', resendError)
        }
    }

    return sendViaSmtp({ to, fullName, otpCode })
}
