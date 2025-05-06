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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // ...envoyer les données à Strapi
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="text-white max-w-md mx-auto p-8 rounded-2xl space-y-4 text-center h-[550px] relative"
        >
            <h2 className="text-2xl font-semibold mb-4">S'inscrire</h2>

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
                            type={field.includes("password") ? "password" : "text"}
                            name={field}
                            placeholder={
                                field === "username"
                                    ? "Pseudo *"
                                    : field === "email"
                                        ? "Adresse email *"
                                        : field === "password"
                                            ? "Mot de passe *"
                                            : "confirmation du mot de passe *"
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
                    className="w-full bg-green-900 text-white py-2 rounded-full hover:bg-green-800"
                >
                    s'inscrire
                </button>
            </div>
        </form>
    )
}
