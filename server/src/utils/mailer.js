import nodemailer from 'nodemailer'

let transporter

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
        host,
        port,
        secure: port === 465,
        requireTLS: port !== 465,
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 12000,
        tls: {
            minVersion: 'TLSv1.2',
        },
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

function getPortAttempts() {
    const configured = Number(process.env.SMTP_PORT || 587)
    const primary = Number.isFinite(configured) && configured > 0 ? configured : 587
    const fallback = primary === 465 ? 587 : 465

    // Try configured port first, then the alternate SMTP submission port.
    return [primary, fallback]
}

export async function sendLoginOtpEmail({ to, fullName, otpCode }) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER
    const mailOptions = {
        from,
        to,
        subject: 'Your Trusta login OTP',
        text: `Hi ${fullName},\n\nYour one-time login code is ${otpCode}. It expires in 10 minutes.\n\nIf this was not you, please reset your password immediately.`,
        html: `<p>Hi ${fullName},</p><p>Your one-time login code is <strong>${otpCode}</strong>.</p><p>This code expires in 10 minutes.</p><p>If this was not you, please reset your password immediately.</p>`,
    }

    console.log('📧 Sending OTP email:', {
        from,
        to,
        subject: 'Your Trusta login OTP',
        smtpHost: process.env.SMTP_HOST,
        smtpUser: process.env.SMTP_USER,
    })

    const ports = getPortAttempts()
    let lastError = null

    for (const port of ports) {
        try {
            const mailer = port === Number(process.env.SMTP_PORT || 587) ? getTransporter() : createTransporter(port)
            const info = await mailer.sendMail(mailOptions)

            // Cache the successful transporter for future OTP sends.
            transporter = mailer
            console.log(`✅ OTP email sent successfully on port ${port}:`, info.response)
            return info
        } catch (error) {
            lastError = error
            console.error(`❌ Failed to send OTP email on port ${port}:`, error.message)
        }
    }

    throw lastError || new Error('Unable to send OTP email. Check SMTP settings.')
}
