import nodemailer from 'nodemailer'

const transporterCache = new Map()

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

export async function sendLoginOtpEmail({ to, fullName, otpCode }) {
    const content = getEmailContent(fullName, otpCode)
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
