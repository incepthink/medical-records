import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, Stethoscope, Heart, Building2, FileText, Lock, BarChart3, CheckCircle } from "lucide-react";
import { useMidnightWalletContext } from "@/context/MidnightWalletContext";
import { useAuth } from "@/context/AuthContext";
import { WalletGate } from "@/components/WalletGate";
import { isUIPersona, type UIPersona } from "@/lib/personaMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const personaConfig: Record<
  UIPersona,
  {
    label: string;
    icon: React.ElementType;
    headline: string;
    subheadline: string;
    features: { icon: React.ElementType; text: string }[];
  }
> = {
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    headline: "Doctor Portal",
    subheadline: "Mint and manage patient records as verifiable NFTs on Midnight.",
    features: [
      { icon: FileText, text: "Mint NFT medical records on-chain" },
      { icon: Lock, text: "Organize records into private collections" },
      { icon: CheckCircle, text: "Patient privacy guaranteed by ZK proofs" },
    ],
  },
  patient: {
    label: "Patient",
    icon: Heart,
    headline: "Patient Portal",
    subheadline: "Own your medical history. Decide who sees it.",
    features: [
      { icon: Shield, text: "You own your records, not your provider" },
      { icon: Lock, text: "Grant and revoke hospital access anytime" },
      { icon: BarChart3, text: "Audit every view with a signed log" },
    ],
  },
  hospital: {
    label: "Hospital",
    icon: Building2,
    headline: "Hospital Portal",
    subheadline: "Access patient-shared records with a full audit trail.",
    features: [
      { icon: CheckCircle, text: "Access only records explicitly shared" },
      { icon: BarChart3, text: "Full signed audit trail per record view" },
      { icon: Shield, text: "Verified, compliant record access" },
    ],
  },
};

const AuthPage = () => {
  const { persona } = useParams<{ persona: string }>();
  const { isConnected, address } = useMidnightWalletContext();
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!persona || !isUIPersona(persona)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-muted-foreground">Unknown persona "{persona}".</p>
      </div>
    );
  }

  const validPersona: UIPersona = persona;
  const config = personaConfig[validPersona];
  const PersonaIcon = config.icon;

  if (!isConnected) return <WalletGate />;

  const validate = (fields: Record<string, string>) => {
    const errs: Record<string, string> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (!val.trim()) {
        errs[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    }
    if (fields.email && !/\S+@\S+\.\S+/.test(fields.email)) {
      errs.email = "Enter a valid email";
    }
    if (fields.password && fields.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate({ email: loginEmail, password: loginPassword })) return;
    setLoading(true);
    try {
      await login(validPersona, loginEmail, loginPassword);
      toast.success("Welcome back!");
      navigate(`/${validPersona}/dashboard`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate({ name, email: signupEmail, password: signupPassword }))
      return;
    setLoading(true);
    try {
      await signup(
        validPersona,
        name,
        signupEmail,
        signupPassword,
        address ?? undefined,
      );
      toast.success("Account created!");
      navigate(`/${validPersona}/dashboard`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6 items-center">

          {/* Left brand panel — desktop only */}
          <div className="hidden md:flex flex-col justify-center gap-8 px-6 py-10 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-border/50 h-full min-h-[520px]">
            <div className="pointer-events-none absolute inset-0 w-40 h-40 rounded-full bg-primary/5 blur-3xl self-start" />

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-base font-bold text-foreground">VaultMed</span>
            </div>

            {/* Persona icon + headline */}
            <div className="flex flex-col gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <PersonaIcon size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gradient leading-tight">
                  {config.headline}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {config.subheadline}
                </p>
              </div>
            </div>

            {/* Feature list */}
            <div className="flex flex-col gap-3">
              {config.features.map(({ icon: FIcon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FIcon size={14} className="text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Persona switcher hint */}
            <p className="text-xs text-muted-foreground/60 mt-auto">
              Wrong portal?{" "}
              <a href="/" className="text-primary hover:underline">
                Go back
              </a>
            </p>
          </div>

          {/* Right form panel */}
          <div>
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2 mb-6 md:hidden">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">VaultMed</span>
            </div>

            <Card className="bg-card border border-border shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-lg">
                  {config.label} Portal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive">
                            {errors.password}
                          </p>
                        )}
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive">
                            {errors.password}
                          </p>
                        )}
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
