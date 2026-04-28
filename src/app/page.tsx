"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/chat");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center p-8 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(91,127,255,0.08)_0%,transparent_70%)] blur-[40px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] blur-[40px] pointer-events-none" />

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center pt-16 pb-24 text-center">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in">

          {/* Heading */}
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-text-primary mb-6 leading-tight max-w-4xl">
            Communication at the <span className="bg-[linear-gradient(135deg,#e8eaf6,#5b7fff)] bg-clip-text text-transparent">speed of thought</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-text-secondary mb-10 max-w-2xl">
            Seamless collaboration for modern teams. Relay strips away the noise, leaving you with a clean, focused, and blazingly fast environment to get work done.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-20 w-full sm:w-auto">
            <SignUpButton mode="modal">
              <button className="w-full sm:w-auto py-4 px-8 rounded-lg bg-[linear-gradient(135deg,#5b7fff,#4a6ef5)] text-white font-semibold text-lg cursor-pointer shadow-[0_4px_20px_rgba(91,127,255,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(91,127,255,0.4)] border-none flex items-center justify-center gap-2">
                Get Started for Free
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto py-4 px-8 rounded-lg bg-transparent text-text-primary border border-border-primary font-semibold text-lg cursor-pointer transition-colors duration-200 hover:border-[#5b7fff] hover:bg-[rgba(91,127,255,0.05)] flex items-center justify-center">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>

      </main>
    </div>
  );
}

