"use client"

import { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    defaultMode?: 'login' | 'register'
}

// Fonction utilitaire pour vérifier la validité du token
export const verifyToken = async () => {
    const token = localStorage.getItem('jwt')
    if (!token) return false

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            // Si le token n'est pas valide, on nettoie le localStorage
            localStorage.removeItem('jwt')
            localStorage.removeItem('user')
            localStorage.removeItem('userId')
            return false
        }

        return true
    } catch (error) {
        localStorage.removeItem('jwt')
        localStorage.removeItem('user')
        localStorage.removeItem('userId')
        return false
    }
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>(defaultMode)

    // Vérification du token à l'ouverture du modal
    useEffect(() => {
        if (isOpen) {
            verifyToken()
        }
    }, [isOpen])

    // Gestion de la touche Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    // Gestion du clic en dehors du modal
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-neutral-900 rounded-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-50"
                >
                    ✕
                </button>
                
                {mode === 'login' ? (
                    <LoginForm onModeChange={() => setMode('register')} onSuccess={onClose} />
                ) : (
                    <RegisterForm onModeChange={() => setMode('login')} onSuccess={onClose} />
                )}
            </div>
        </div>
    )
}
