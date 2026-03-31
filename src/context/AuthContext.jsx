/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
    recognizeDevice,
    fetchCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    verifyLoginOtp,
    verifyPin as verifyPinApi,
} from '../lib/authApi'
import { getDeviceId } from '../lib/device'

const AuthContext = createContext(null)

function rememberPinProfile(user) {
    if (!user?.email || !user?.fullName || !user?.accountNumber) {
        return
    }

    const profile = {
        email: user.email,
        firstName: String(user.fullName).split(' ')[0],
        maskedAccount: `${String(user.accountNumber).slice(0, 2)}********`,
    }

    window.localStorage.setItem('trusta_pin_profile', JSON.stringify(profile))
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isSessionUnlocked, setIsSessionUnlocked] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const persistSessionUnlocked = useCallback((value) => {
        setIsSessionUnlocked(value)
    }, [])

    const refreshSession = useCallback(async () => {
        try {
            const response = await fetchCurrentUser()
            setUser(response.user)
            rememberPinProfile(response.user)
            return response.user
        } catch {
            setUser(null)
            persistSessionUnlocked(false)
            return null
        }
    }, [persistSessionUnlocked])

    useEffect(() => {
        const bootstrapAuth = async () => {
            const existingUser = await refreshSession()

            if (!existingUser) {
                persistSessionUnlocked(false)
            }

            setIsLoading(false)
        }

        bootstrapAuth()
    }, [refreshSession, persistSessionUnlocked])

    const register = useCallback(async (payload) => {
        const response = await registerUser(payload)
        return response
    }, [])

    const login = useCallback(async (payload) => {
        return loginUser(payload)
    }, [])

    const verifyOtp = useCallback(async (payload) => {
        const response = await verifyLoginOtp(payload)
        setUser(response.user)
        rememberPinProfile(response.user)
        persistSessionUnlocked(true)

        try {
            await recognizeDevice(getDeviceId())
        } catch {
            // Ignore device-registration errors to avoid blocking successful login.
        }

        return response.user
    }, [persistSessionUnlocked])

    const verifyPin = useCallback(async ({ email, pin }) => {
        const response = await verifyPinApi(email, pin, getDeviceId())
        setUser(response.user)
        rememberPinProfile(response.user)
        persistSessionUnlocked(true)

        try {
            await recognizeDevice(getDeviceId())
        } catch {
            // Ignore device-registration errors to avoid blocking successful login.
        }

        return response.user
    }, [persistSessionUnlocked])

    const logout = useCallback(async () => {
        try {
            await logoutUser()
        } finally {
            setUser(null)
            persistSessionUnlocked(false)
        }
    }, [persistSessionUnlocked])

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isSessionUnlocked,
            isAuthenticated: Boolean(user),
            register,
            login,
            verifyOtp,
            verifyPin,
            logout,
            refreshSession,
        }),
        [user, isLoading, isSessionUnlocked, register, login, verifyOtp, verifyPin, logout, refreshSession],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}
