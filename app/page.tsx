"use client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-white/2 rounded-full blur-[100px]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none -translate-y-[15%]">
        <span className="text-[20vw] font-bold text-white/3 tracking-tighter leading-none">
          GitAsk
        </span>
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="10%"
          y1="20%"
          x2="30%"
          y2="35%"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        >
          <animate
            attributeName="opacity"
            values="0;0.5;0"
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="70%"
          y1="15%"
          x2="85%"
          y2="40%"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        >
          <animate
            attributeName="opacity"
            values="0;0.5;0"
            dur="5s"
            begin="1s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="15%"
          y1="70%"
          x2="35%"
          y2="85%"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        >
          <animate
            attributeName="opacity"
            values="0;0.5;0"
            dur="4.5s"
            begin="2s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="65%"
          y1="65%"
          x2="90%"
          y2="80%"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        >
          <animate
            attributeName="opacity"
            values="0;0.5;0"
            dur="3.5s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </line>
        <circle cx="30%" cy="35%" r="2" fill="rgba(255,255,255,0.05)">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="85%" cy="40%" r="2" fill="rgba(255,255,255,0.05)">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="5s"
            begin="1s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="35%" cy="85%" r="2" fill="rgba(255,255,255,0.05)">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="4.5s"
            begin="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-2xl" />
            <div className="relative  rounded-2xl p-4  ">
              <img
                src="/logo.png"
                alt="GitAsk"
                style={{ filter: "brightness(0) invert(1)" }}
                className="w-12 h-12"
              />
            </div>
          </div>
        </div>

        <p className="text-white/50 text-sm text-center mb-4 animate-fade-in [animation-delay:400ms] opacity-0 fill-mode-[forwards]">
          Ask your codebase anything.
        </p>

        <div className="flex items-center gap-3 mb-10 animate-fade-in [animation-delay:500ms] opacity-0 fill-mode-[forwards]">
          {["Index repos", "AI embeddings", "Instant answers"].map(
            (text, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full border border-white/6 bg-white/2 text-white/30 text-xs"
              >
                {text}
              </span>
            ),
          )}
        </div>

        <div className="animate-fade-in [animation-delay:700ms] opacity-0 fill-mode-[forwards]">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-3 px-8 py-3 bg-white text-black rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="transition-transform duration-300 group-hover:rotate-12"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connecting...
              </span>
            ) : (
              "Sign in with GitHub"
            )}
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in [animation-delay:1000ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.05] bg-white/[0.02]">
            <span className="text-white/20 text-xs font-mono">$</span>
            <span className="text-white/15 text-xs font-mono typing-animation">
              gitask index your-repo
            </span>
            <span className="w-1.5 h-4 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        .typing-animation {
          overflow: hidden;
          white-space: nowrap;
          animation: typing 2s steps(24) 1.5s forwards;
          width: 0;
        }
      `}</style>
    </div>
  );
}
