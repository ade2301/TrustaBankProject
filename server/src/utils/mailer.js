import nodemailer from 'nodemailer'

let transporter

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

export async function sendLoginOtpEmail({ to, fullName, otpCode }) {
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
