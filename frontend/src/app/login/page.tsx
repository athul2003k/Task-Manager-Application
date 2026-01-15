"use client";

import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    User
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");

    const handleAuthSuccess = async (user: User) => {
        try {
            const token = await user.getIdToken();
            console.log("Token retrieved, fetching /auth/me...");
            const response = await api(token).getMe();
            console.log("Backend /auth/me response:", response);
            const { role } = response;

            if (role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (e: unknown) {
            console.error("Auth Success Error", e);
            // Fallback or error handling
            router.push('/dashboard');
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await handleAuthSuccess(result.user);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            await handleAuthSuccess(userCredential.user);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="w-96 p-8 shadow-lg rounded-xl bg-white">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {isRegistering ? "Create Account" : "Welcome Back"}
                </h1>

                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <button
                    onClick={loginWithGoogle}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors mb-6 font-medium"
                >
                    <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
                    Sign in with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        {isRegistering ? "Sign Up" : "Sign In"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {isRegistering ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
