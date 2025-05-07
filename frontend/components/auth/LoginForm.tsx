"use client"

import { useState } from "react"

interface LoginFormProps {
    onModeChange: (mode: "register") => void;
}

export default function LoginForm({ onModeChange }: LoginFormProps) {
    const [form, setForm] = useState({
        identifier: "",
        password: "",
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

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: form.identifier, // Strapi accepte email ou username
                    password: form.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error?.message || "Identifiants incorrects")
            }

            // Stockage du token dans le localStorage
            localStorage.setItem('jwt', data.jwt)
            localStorage.setItem('user', JSON.stringify(data.user))
            
            // Redirection ou mise à jour de l'état de l'application
            window.location.href = '/' // ou utilisez un router pour la navigation
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la connexion")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="text-white max-w-md mx-auto p-8 rounded-2xl space-y-4 text-center h-[550px] relative"
        >
            <h1 className="text-2xl font-semibold mb-4">se connecter</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <p className="text-sm mb-4">
                En continuant, tu acceptes notre{" "}
                <a href="#" className="underline text-blue-400">Contrat d'utilisation</a> et reconnais que tu comprends notre{" "}
                <a href="#" className="underline text-blue-400">Politique de confidentialité</a>.
            </p>

            <div className="space-y-4 py-8">
                <div>
                    <input
                        type="text"
                        name="identifier"
                        placeholder="Adresse email ou pseudo *"
                        value={form.identifier}
                        onChange={handleChange}
                        className="w-full bg-green-100 text-black placeholder:text-gray-500 placeholder:italic px-4 py-2 rounded-lg outline-none border-2 border-[#75BB99]"
                        required
                    />
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Mot de passe *"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-green-100 text-black placeholder:text-gray-500 placeholder:italic px-4 py-2 rounded-lg outline-none border-2 border-[#75BB99]"
                        required
                    />
                </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
                <div className="text-sm mb-4">
                    <a href="#" className="text-blue-400 underline block mb-1">Mot de passe oublié ?</a>
                    <p>
                        Première fois sur Hedd.it ?{" "}
                        <button 
                            type="button"
                            onClick={() => onModeChange("register")}
                            className="text-blue-400 underline"
                        >
                            Inscris-toi
                        </button>
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-900 text-white py-2 rounded-full hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Connexion en cours..." : "se connecter"}
                </button>
            </div>
        </form>
    )
}
