import User from '../models/User.js'

function generateTenDigitNumber() {
  const min = 1000000000
  const max = 9999999999
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

export async function createUniqueAccountNumber() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateTenDigitNumber()
    const existing = await User.exists({ accountNumber: candidate })

    if (!existing) {
      return candidate
    }
  }

  throw new Error('Unable to allocate unique account number right now')
}
