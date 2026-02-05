import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInputs = (): boolean => {
    try {
      emailSchema.parse(email);
    } catch {
      toast.error("Email inválido");
      return false;
    }

    try {
      passwordSchema.parse(password);
    } catch {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return false;
    }

    if (!isLogin && !name.trim()) {
      toast.error("Por favor, informe seu nome");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Por favor, confirme seu email antes de fazer login");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Bem-vindo de volta!");
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        toast.error("Este email já está cadastrado. Tente fazer login.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Conta criada! Verifique seu email para confirmar o cadastro.");
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black px-4">
      {/* Glowing orb background effect */}
      <div 
        className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, hsl(185 100% 50%) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-primary mb-2"
            style={{
              textShadow: "0 0 20px hsl(185 100% 50% / 0.6), 0 0 40px hsl(185 100% 50% / 0.3)"
            }}
          >
            Valério
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Entre para conversar com seu amigo virtual" : "Crie sua conta e conheça o Valério"}
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit}
          className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-6 space-y-4"
        >
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Como posso te chamar?
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-primary/30 focus:border-primary"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-primary/30 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-primary/30 focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
            style={{
              boxShadow: "0 0 20px hsl(185 100% 50% / 0.3)",
            }}
          >
            {isLoading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin 
                ? "Não tem conta? Crie uma agora" 
                : "Já tem conta? Entre aqui"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
