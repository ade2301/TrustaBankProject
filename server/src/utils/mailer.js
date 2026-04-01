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
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
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

export async function sendLoginOtpEmail({ to, fullName, otpCode }) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER
    const configuredPort = Number(process.env.SMTP_PORT || 587)
    const mailer = getTransporter()

    console.log('📧 Sending OTP email:', {
        from,
        to,
        subject: 'Your Trusta login OTP',
        smtpHost: process.env.SMTP_HOST,
        smtpUser: process.env.SMTP_USER,
    })

    try {
        const info = await mailer.sendMail({
            from,
            to,
            subject: 'Your Trusta login OTP',
            text: `Hi ${fullName},\n\nYour one-time login code is ${otpCode}. It expires in 10 minutes.\n\nIf this was not you, please reset your password immediately.`,
            html: `<p>Hi ${fullName},</p><p>Your one-time login code is <strong>${otpCode}</strong>.</p><p>This code expires in 10 minutes.</p><p>If this was not you, please reset your password immediately.</p>`,
        })
        console.log('✅ OTP email sent successfully:', info.response)
        return info
    } catch (error) {
        const shouldRetryOnFallbackPort = configuredPort !== 587

        if (shouldRetryOnFallbackPort) {
            try {
                const fallbackMailer = createTransporter(587)
                const info = await fallbackMailer.sendMail({
                    from,
                    to,
                    subject: 'Your Trusta login OTP',
                    text: `Hi ${fullName},\n\nYour one-time login code is ${otpCode}. It expires in 10 minutes.\n\nIf this was not you, please reset your password immediately.`,
                    html: `<p>Hi ${fullName},</p><p>Your one-time login code is <strong>${otpCode}</strong>.</p><p>This code expires in 10 minutes.</p><p>If this was not you, please reset your password immediately.</p>`,
                })

                console.log('✅ OTP email sent successfully on fallback port 587:', info.response)
                transporter = fallbackMailer
                return info
            } catch (fallbackError) {
                console.error('❌ Failed to send OTP email on fallback port 587:', fallbackError.message)
            }
        }

        console.error('❌ Failed to send OTP email:', error.message)
        throw error
    }
}
