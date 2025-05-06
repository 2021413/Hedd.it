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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // logique de connexion vers Strapi ici
        console.log(form)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="text-white max-w-md mx-auto p-8 rounded-2xl space-y-4 text-center h-[550px] relative"
        >
            <h1 className="text-2xl font-semibold mb-4">se connecter</h1>

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
                    className="w-full bg-green-900 text-white py-2 rounded-full hover:bg-green-800"
                >
                    se connecter
                </button>
            </div>
        </form>
    )
}
