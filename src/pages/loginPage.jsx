import { roles } from "../data/data.js";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dbRole, setDbRole] = useState("Admin");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !department || !password || !dbRole || !jobRole) {
      alert("Please fill all required fields");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name: fullName,
        email,
        password,
        dbRole: dbRole,
        jobRole: jobRole,
        department,
        phone,
        joinDate: new Date(),
        estatus: "active"
      });
      console.log("Account created");
      setIsLogin(true);
      alert("Account created successfully! Please sign in.");
    } catch (err) {
      console.log("Account creation failed :", err);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.employee));
      console.log("Login successful", res.data.employee);
      navigate("/dashboard");
    } catch (err) {
      console.log("Login failed :", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 gradient-orb"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 gradient-orb"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/10 gradient-orb"></div>

      <main className="relative mt-10 z-10 w-full max-w-[520px] px-6">
        <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl relative">
          <div className="flex flex-col items-center mb-10">
            <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary box-glow-purple">
              <span className="material-symbols-outlined text-4xl">fingerprint</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white text-center">
              {isLogin ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-slate-400 mt-2 text-center text-sm">
              {isLogin ? "Welcome back to the future of management" : "Join the next generation of HR systems"}
            </p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">person</span>
                  <input
                    className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John Doe"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">mail</span>
                <input
                  className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">call</span>
                      <input
                        className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="0000000000"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Department</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">corporate_fare</span>
                      <input
                        className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Engineering"
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Job Role</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">badge</span>
                      <input
                        className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Developer"
                        type="text"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">System Role</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">admin_panel_settings</span>
                      <select
                        className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white bg-transparent appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={dbRole}
                        onChange={(e) => setDbRole(e.target.value)}
                      >
                        {roles.map(role => <option key={role} value={role} className="bg-slate-900">{role}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-slate-300">Password</label>
                {isLogin && <a className="text-xs text-primary hover:text-secondary transition-colors" href="#">Forgot password?</a>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock</span>
                <input
                  className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">verified_user</span>
                  <input
                    className="glass-input w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center gap-2 px-1">
                <input className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary accent-primary" id="remember" type="checkbox" />
                <label className="text-sm text-slate-400 select-none" htmlFor="remember">Remember me for 30 days</label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cta-gradient w-full h-14 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}</span>
              {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">{isLogin ? "login" : "how_to_reg"}</span>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:text-secondary transition-colors ml-2"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-xl glass-input flex items-center justify-center hover:bg-white/10 transition-colors">
              <img alt="Google" className="w-5 h-5" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" />
            </button>
            <button className="w-12 h-12 rounded-xl glass-input flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-xl text-slate-400">fingerprint</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-xs flex items-center justify-center gap-4">
          <a className="hover:text-slate-300 transition-colors" href="#">Privacy Policy</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
          <a className="hover:text-slate-300 transition-colors" href="#">Terms of Service</a>
        </div>
      </main>

      <style>{`
        .box-glow-purple {
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
        }
        
        select option {
            background-color: #171121;
            color: white;
            padding: 10px;
        }

        .cta-gradient:hover {
            box-shadow: 0 15px 30px -10px rgba(124, 59, 237, 0.6);
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
