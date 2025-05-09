"use client"

import { useState } from "react"

interface RegisterFormProps {
    onModeChange: (mode: "login") => void;
}

export default function RegisterForm({ onModeChange }: RegisterFormProps) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.error?.message) {
                    throw new Error(data.error.message)
                } else if (data.error?.details?.errors) {
                    // Handle Strapi validation errors
                    const errorMessages = data.error.details.errors
                        .map((error: any) => error.message)
                        .join(', ')
                    throw new Error(errorMessages)
                } else {
                    throw new Error("Une erreur est survenue lors de l'inscription")
                }
            }

            // Stockage du token dans le localStorage
            localStorage.setItem('jwt', data.jwt)
            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('userId', data.user.id.toString())
            
            // Redirection ou mise à jour de l'état de l'application
            window.location.href = '/' // ou utilisez un router pour la navigation
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'inscription")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="text-white max-w-md mx-auto p-8 rounded-2xl space-y-4 text-center h-[550px] relative"
        >
            <h2 className="text-2xl font-semibold mb-4">S'inscrire</h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <p className="text-sm mb-4">
                En continuant, tu acceptes notre{" "}
                <a href="#" className="underline text-blue-400">Contrat d'utilisation</a>{" "}
                et reconnais que tu comprends notre{" "}
                <a href="#" className="underline text-blue-400">Politique de confidentialité</a>.
            </p>

            <div className="space-y-4">
                {["username", "email", "password", "confirmPassword"].map((field) => (
                    <div key={field}>
                        <input
                            type={["password", "confirmPassword"].includes(field) ? "password" : "text"}
                            name={field}
                            placeholder={
                                field === "username"
                                    ? "Pseudo *"
                                    : field === "email"
                                        ? "Adresse email *"
                                        : field === "password"
                                            ? "Mot de passe *"
                                            : "Confirmation du mot de passe *"
                            }
                            className="w-full bg-green-100 text-black placeholder:text-gray-500 placeholder:italic px-4 py-2 rounded-lg outline-none border-2 border-[#75BB99]"
                            value={(form as any)[field]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
                <div className="text-sm mb-4">
                    <p>
                        Déjà hedditor ?{" "}
                        <button 
                            type="button"
                            onClick={() => onModeChange("login")}
                            className="text-blue-400 underline"
                        >
                            Se connecter
                        </button>
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-900 text-white py-2 rounded-full hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Inscription en cours..." : "s'inscrire"}
                </button>
            </div>
        </form>
    )
}
