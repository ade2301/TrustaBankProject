const DEVICE_STORAGE_KEY = 'trusta_device_id'

function createDeviceId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }

    return `device_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

export function getDeviceId() {
    const stored = window.localStorage.getItem(DEVICE_STORAGE_KEY)

    if (stored) {
        return stored
    }

    const generated = createDeviceId()
    window.localStorage.setItem(DEVICE_STORAGE_KEY, generated)
    return generated
}
