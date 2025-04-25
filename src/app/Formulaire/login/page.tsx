"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Valider les variables d'environnement
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn("NEXT_PUBLIC_API_URL is not set - falling back to localhost");
    }
  }, []);

  const getApiUrl = (endpoint: string) => {
    const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    if (formData.password.length < 4) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
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
      const response = await fetch(getApiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Email ou mot de passe incorrect");
        }
        if (response.status === 500) {
          throw new Error("Erreur serveur - veuillez réessayer plus tard");
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur du serveur");
      }
      
      router.push('/Page');
      
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('failed to fetch')) {
        setError("Connexion échouée. Vérifiez votre connexion ou les permissions CORS du serveur.");
      } else if (error instanceof Error) {
        if (error.message.includes("CORS")) {
          setError("Erreur CORS : vérifiez les paramètres du serveur.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Une erreur inattendue s'est produite");
      }
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg w-full md:w-3/4 md:max-w-4xl md:flex">
        {/* Image Section */}
        <div className="relative h-48 md:h-auto md:w-1/2">
          <Image
            src="/img/login_image.jpg"
            alt="Medical login"
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg md:rounded-l-lg md:rounded-r-none"
            priority
          />
        </div>
        
        {/* Form Section */}
        <div className="p-6 md:w-1/2 md:p-8">
          <h2 className="text-4xl font-bold mb-2 text-gray-600">Bon retour!</h2>
          <p className="text-gray-500 mb-6">Entrez vos identifiants pour accéder à votre compte</p>

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
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <Link href="/Formulaire/forgotPassword" className="text-blue-600 text-sm block text-right mt-1">
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
                {isLoading ? "Connexion..." : "Connexion"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}