"use client"

import { useState, useEffect } from "react"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "register">("login")

    // Fermer avec ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md h-[550px] relative rounded-2xl overflow-hidden flex items-center justify-center bg-[#2a2a2a]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white hover:text-gray-300 text-xl z-10"
                >
                    ✕
                </button>

                {/* Contenu du formulaire */}
                {mode === "login" ? (
                    <LoginForm onModeChange={setMode} />
                ) : (
                    <RegisterForm onModeChange={setMode} />
                )}
            </div>
        </div>
    )
}
