import argon2 from 'argon2'

/**
 * Hash a PIN using Argon2
 * @param {string} pin - The plain text PIN to hash
 * @returns {Promise<string>} - The hashed PIN
 */
export async function hashPin(pin) {
    try {
        return await argon2.hash(String(pin))
    } catch (error) {
        console.error('Error hashing PIN:', error)
        throw new Error('Failed to hash PIN')
    }
}

/**
 * Verify a plain text PIN against a hash
 * @param {string} pin - The plain text PIN to verify
 * @param {string} hash - The hashed PIN to verify against
 * @returns {Promise<boolean>} - True if PIN matches, false otherwise
 */
export async function verifyPin(pin, hash) {
    try {
        return await argon2.verify(hash, String(pin))
    } catch (error) {
        console.error('Error verifying PIN:', error)
        return false
    }
}
