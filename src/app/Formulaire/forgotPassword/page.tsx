"use client";
import { useState } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implémenter la logique de réinitialisation du mot de passe
      toast.success('Email de réinitialisation envoyé !');
    } catch (error: any) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-right" />
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Adresse email"
            placeholder="exemple@email.com"
            required
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 h-12 text-lg"
          >
            Envoyer le lien de réinitialisation
          </Button>

          <div className="text-center mt-4">
            <a
              href="/Formulaire/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Retour à la connexion
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
