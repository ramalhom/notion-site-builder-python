import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const authSchema = z.object({
  email: z.string().email("Email invalide").max(255),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(128),
});

const emailSchema = z.object({
  email: z.string().email("Email invalide").max(255),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if there are any active menu items (accessible by anonymous users via RLS)
  const { data: hasExistingUsers, isLoading: checkingUsers } = useQuery({
    queryKey: ["has-existing-users"],
    queryFn: async () => {
      const { count } = await supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return (count ?? 0) > 0;
    },
  });

  // Detect password recovery mode from URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    if (type === "recovery") {
      setIsResetPassword(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && user && !isResetPassword) {
      navigate("/admin");
    }
  }, [user, loading, navigate, isResetPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Handle password reset (new password form)
    if (isResetPassword) {
      if (newPassword.length < 6) {
        toast({
          title: "Erreur de validation",
          description: "Le mot de passe doit contenir au moins 6 caractères",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast({
          title: "Erreur de validation",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été réinitialisé avec succès.",
        });
        setIsResetPassword(false);
        // Clear the hash from URL
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/admin");
      }
      setIsSubmitting(false);
      return;
    }

    if (isForgotPassword) {
      const validation = emailSchema.safeParse({ email });
      if (!validation.success) {
        toast({
          title: "Erreur de validation",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
        });
        setIsForgotPassword(false);
      }
      setIsSubmitting(false);
      return;
    }

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Erreur de validation",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      let message = error.message;
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect";
      } else if (error.message.includes("User already registered")) {
        message = "Cet email est déjà utilisé";
      }
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } else if (!isLogin) {
      toast({
        title: "Compte créé",
        description: "Vous pouvez maintenant vous connecter.",
      });
      setIsLogin(true);
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getTitle = () => {
    if (isResetPassword) return "Nouveau mot de passe";
    if (isForgotPassword) return "Mot de passe oublié";
    return isLogin ? "Connexion Admin" : "Créer un compte";
  };

  const getDescription = () => {
    if (isResetPassword) return "Entrez votre nouveau mot de passe";
    if (isForgotPassword) return "Entrez votre email pour recevoir un lien de réinitialisation";
    return isLogin
      ? "Connectez-vous pour accéder à l'administration"
      : "Créez votre compte administrateur";
  };

  // Never show signup link if there are existing users or still checking
  const showSignupLink = checkingUsers ? false : !hasExistingUsers;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemple.com"
                  required
                />
              </div>
            )}
            {isResetPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}
            {!isForgotPassword && !isResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isResetPassword
                ? "Réinitialiser"
                : isForgotPassword
                ? "Envoyer le lien"
                : isLogin
                ? "Se connecter"
                : "Créer le compte"}
            </Button>
          </form>
          {!isResetPassword && (
            <div className="mt-4 text-center text-sm space-y-2">
              {isLogin && !isForgotPassword && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-muted-foreground hover:text-foreground underline block w-full"
                >
                  Mot de passe oublié ?
                </button>
              )}
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-muted-foreground hover:text-foreground underline"
                >
                  Retour à la connexion
                </button>
              ) : (
                showSignupLink && (
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-muted-foreground hover:text-foreground underline"
                  >
                    {isLogin ? "Créer un compte" : "Déjà un compte ? Se connecter"}
                  </button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
