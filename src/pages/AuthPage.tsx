import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useMidnightWalletContext } from "@/context/MidnightWalletContext";
import { useAuth } from "@/context/AuthContext";
import { WalletGate } from "@/components/WalletGate";
import { isUIPersona, type UIPersona } from "@/lib/personaMap";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { toast } from "sonner";

const personaLabels: Record<UIPersona, string> = {
  doctor: "Doctor",
  patient: "Patient",
  hospital: "Hospital",
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
  const label = personaLabels[validPersona];

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
    if (
      !validate({ name, email: signupEmail, password: signupPassword })
    )
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">VaultMed</span>
        </div>
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">
              {label} Portal
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
                      <p className="text-sm text-destructive">
                        {errors.email}
                      </p>
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
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
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
                      <p className="text-sm text-destructive">
                        {errors.email}
                      </p>
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
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
