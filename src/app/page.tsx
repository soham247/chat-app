import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <h1 className="text-4xl text-blue-600 font-bold">Chat App</h1>
      <div className="flex gap-4">
        <SignInButton mode="modal">
          <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm text-white hover:bg-blue-500 cursor-pointer">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-lg border border-blue-600 px-6 py-2.5 text-sm text-blue-600 shadow-sm hover:bg-blue-50 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}
