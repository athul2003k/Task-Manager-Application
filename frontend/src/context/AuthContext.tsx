"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import socket from "@/socket";

interface AuthContextType {
    user: User | null;
    token: string | null;
    backendUser: unknown | null; // Use unknown instead of any
}

const AuthContext = createContext<AuthContextType>({ user: null, token: null, backendUser: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [backendUser, setBackendUser] = useState<unknown | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const idToken = await firebaseUser.getIdToken(true);
                setToken(idToken);
                // Fetch backend user details
                try {
                    const me = await api(idToken).getMe();
                    console.log("AuthContext: Fetched backend user:", me);
                    setBackendUser(me);

                    // 🆕 CONNECT SOCKET AFTER LOGIN
                    if (!socket.connected) {
                        socket.connect();
                        // Join user-specific room and admin room if applicable
                        socket.emit("join", {
                            userId: (me as any).id,
                            role: (me as any).role
                        });
                        console.log("Socket connected and joined room");
                    }
                } catch (err) {
                    console.error("AuthContext: Failed to fetch backend user", err);
                }
            } else {
                setUser(null);
                setToken(null);
                setBackendUser(null);

                // 🆕 DISCONNECT SOCKET ON LOGOUT
                if (socket.connected) {
                    socket.disconnect();
                    console.log("Socket disconnected");
                }
            }
        });
        // 🆕 CLEANUP ON UNMOUNT
        return () => {
            unsubscribe();
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, backendUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
