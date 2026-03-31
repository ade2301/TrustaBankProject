/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCurrentUser, loginUser, logoutUser, registerUser, verifyLoginOtp } from '../lib/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const refreshSession = useCallback(async () => {
        try {
            const response = await fetchCurrentUser()
            setUser(response.user)
            return response.user
        } catch {
            setUser(null)
            return null
        }
    }, [])

    useEffect(() => {
        const bootstrapAuth = async () => {
            await refreshSession()
            setIsLoading(false)
        }

        bootstrapAuth()
    }, [refreshSession])

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
        return response.user
    }, [])

    const logout = useCallback(async () => {
        try {
            await logoutUser()
        } finally {
            setUser(null)
        }
    }, [])

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: Boolean(user),
            register,
            login,
            verifyOtp,
            logout,
            refreshSession,
        }),
        [user, isLoading, register, login, verifyOtp, logout, refreshSession],
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
