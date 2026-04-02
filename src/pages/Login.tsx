import { useState } from "react";
import { useNavigate } from "react-router-dom";
import netscribesLogo from "@/assets/netscribes-logo-white.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0 0% 5%)" }}>
      <div className="w-full max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src={netscribesLogo} alt="Netscribes" className="h-8" />
        </div>

        {/* Card */}
        <div className="border rounded-sm p-8" style={{ borderColor: "hsl(60 4% 16%)", background: "hsl(0 0% 8%)" }}>
          <h1 className="font-display text-2xl text-center mb-1" style={{ color: "hsl(40 20% 95%)" }}>
            Sign In
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-center mb-8" style={{ color: "hsl(50 4% 54%)" }}>
            CXOWorld Intelligence Platform
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: "hsl(50 4% 54%)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 rounded-sm text-sm font-mono outline-none transition-colors"
                style={{
                  background: "hsl(0 0% 12%)",
                  border: "1px solid hsl(60 4% 16%)",
                  color: "hsl(40 20% 95%)",
                }}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] block mb-1.5" style={{ color: "hsl(50 4% 54%)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-sm text-sm font-mono outline-none transition-colors"
                style={{
                  background: "hsl(0 0% 12%)",
                  border: "1px solid hsl(60 4% 16%)",
                  color: "hsl(40 20% 95%)",
                }}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-sm font-mono text-xs uppercase tracking-[0.15em] transition-colors mt-2"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Sign In
            </button>
          </form>

          <p className="font-mono text-[10px] text-center mt-6" style={{ color: "hsl(50 4% 54%)" }}>
            Demo mode — any credentials will work
          </p>
        </div>
      </div>
    </div>
  );
}
