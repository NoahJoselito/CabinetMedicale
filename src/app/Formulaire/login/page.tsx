"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

// End-point racine
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

// Clé de stockage local
const LS_TOKEN_KEY = "authToken";

// Longueur minimale du mot de passe
const MIN_PASSWORD_LENGTH = 4;

/** Récupère le token stocké (ou null) */
export const getStoredToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(LS_TOKEN_KEY) : null;

/** fetch avec injection automatique du Bearer token */
export const authFetch: typeof fetch = (input, init = {}) => {
  const token = getStoredToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(
    input.toString().startsWith("http")
      ? input
      : `${API_BASE_URL}${input.toString().startsWith("/") ? "" : "/"}${input}`,
    { ...init, headers }
  );
};

/** Logout */
export const logout = (router: ReturnType<typeof useRouter>) => {
  localStorage.removeItem(LS_TOKEN_KEY);
  router.replace("/login");
};

/* ------------------------------------------------------------------ */
/*  Composant Login                                                   */
/* ------------------------------------------------------------------ */

export default function Login() {
  const router = useRouter();

  /* ------------------- state ------------------- */
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ------------------- effects ------------------- */
  useEffect(() => {
    if (getStoredToken()) router.replace("/Page");
  }, [router]);

  /* ------------------- handlers ------------------ */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      return false;
    }
    if (formData.password.trim().length < MIN_PASSWORD_LENGTH) {
      setError(
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Email ou mot de passe incorrect"
            : res.status === 500
            ? "Erreur serveur – veuillez réessayer plus tard"
            : (await res.json())?.message || "Erreur inconnue";
        throw new Error(msg);
      }

      const { token } = (await res.json()) as { token?: string };
      if (!token) throw new Error("Le serveur n’a pas renvoyé de jeton");

      localStorage.setItem(LS_TOKEN_KEY, token);
      router.push("/Page");
    } catch (err) {
      const msg =
        err instanceof TypeError && err.message.includes("failed to fetch")
          ? "Connexion échouée. Vérifiez votre connexion ou les permissions CORS."
          : err instanceof Error
          ? err.message
          : "Une erreur inattendue s’est produite";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*                               UI                                 */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg w-full md:w-3/4 md:max-w-4xl md:flex">
        <div className="relative h-48 md:h-auto md:w-1/2">
          <Image
            src="/img/login_image.jpg"
            alt="Medical login"
            fill
            className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-r-none"
            priority
          />
        </div>

        <div className="p-6 md:w-1/2 md:p-8">
          <h2 className="text-4xl font-bold mb-2 text-gray-600">
            Bon retour !
          </h2>
          <p className="text-gray-500 mb-6">
            Entrez vos identifiants pour accéder à votre compte
          </p>

          {error && (
            <p className="text-red-500 mb-4 p-2 bg-red-50 rounded border border-red-200">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              label="Adresse Email"
              placeholder="Entrez votre email"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <Link
                href="/Formulaire/forgotPassword"
                className="text-blue-600 text-sm block text-right mt-1"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                fullWidth
                type="submit"
                size="lg"
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading ? "Connexion…" : "Connexion"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
