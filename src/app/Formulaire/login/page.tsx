"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { ToastContainer, toast } from 'react-toastify';
import { authService } from '@/services/authService';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    })); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authService.login(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success('Connexion réussie !');
      
      // Redirect based on role ID
      const redirectPath = data.user.role_id === 1 ? '/Page' : '/Page/rendez_vous';
      setTimeout(() => router.push(redirectPath), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-right" />
      
      {/* Card contenant l'image et le formulaire */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Section Image */}
        <div className="w-full md:w-1/2">
          <div className="flex h-130 items-center justify-center">
            <img
              src="/img/login_image.jpg"
              alt="Medical Login"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        {/* Section Formulaire */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                Connectez-vous à votre compte
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Accédez à votre espace personnel
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Adresse email"
                placeholder="exemple@email.com"
                required
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  required
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[45px] text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a
                  href="/Formulaire/forgotPassword"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 h-12 text-lg"
                >
                  Se connecter
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
