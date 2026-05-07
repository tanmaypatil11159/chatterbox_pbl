import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

function LoginPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const { registerPasskey, loginWithPasskey, authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const success = await registerPasskey(username, bio);
    if (success) navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await loginWithPasskey();
    if (success) navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE - BRANDING */}
        <div className="hidden md:flex flex-col gap-6 scale-110 origin-left">
          <h2 className="text-7xl font-black leading-tight text-black tracking-tight">
            The Future of <br/>
            <span className="text-[#8B5CF6]">Secure Chat</span> <br/>
            is Here.
          </h2>
          <p className="text-xl font-bold text-gray-700">
            No passwords. No hacks. Just you <br/> and your devices.
          </p>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-full max-w-[440px] mx-auto">
          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="bg-white border-2 sm:border-4 border-[#8B5CF6] rounded-2xl sm:rounded-[40px] p-6 sm:p-10 flex flex-col gap-5 sm:gap-6 shadow-[8px_8px_0px_0px_rgba(139,92,246,0.1)] transition-all duration-300"
          >
            <h1 className="text-3xl sm:text-4xl font-black text-center text-[#5B21B6] mb-1 sm:mb-2">
              {mode === "login" ? "Login" : "Sign Up"}
              
            </h1>

            {/* Username/Bio input — only on register */}
            {mode === "sign-up" && (
              <div className="flex flex-col gap-4">
                <input
                  className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-5 py-4 font-bold text-gray-800 placeholder-gray-400 focus:border-[#8B5CF6] outline-none transition-all"
                  placeholder="Choose a username"
                  value={username}
                  required
                  onChange={(e) => setUsername(e.target.value)}
                />
                <textarea
                  className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-5 py-4 font-bold text-gray-800 placeholder-gray-400 focus:border-[#8B5CF6] outline-none transition-all min-h-[120px] resize-none"
                  placeholder="Tell us about yourself (Bio)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            )}



            {/* Main action button */}
            <button
              type="submit"
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl py-4 font-black flex items-center justify-center gap-3 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] active:scale-95 transition-all text-lg"
            >
              {mode === "login" ? "Login with Passkey" : "Create Account with Passkey"}
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="absolute bg-white px-4 text-[10px] text-gray-400 font-black tracking-widest uppercase">
                HOW IT WORKS
              </span>
            </div>

            <p className="text-center text-[13px] text-gray-500 font-bold leading-relaxed px-4">
              {mode === "login"
                ? "Your device will show a passkey picker — just touch the sensor. No password needed."
                : "Your device will ask for Face ID, fingerprint, or PIN — that's your password."}
            </p>

            <p
              onClick={() => {
                setMode(mode === "login" ? "sign-up" : "login");
                setUsername("");
                setBio("");
              }}
              className="text-center font-black text-sm cursor-pointer hover:text-[#8B5CF6] transition-colors"
            >
              {mode === "login" ? "Create an account" : "Already have an account?"}
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
