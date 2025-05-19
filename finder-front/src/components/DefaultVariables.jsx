import { create } from "zustand";

export const DefaultVariables = create((set) => ({
    isAuthenticated: false,
    username: "Unauthorized",
    email: "email None",
    phone_number: "phone_number None",
    avatarUrl: "avatarUrl None",
    csrfToken: "csrfToken None",


    setAuthorization: (isAuthenticated) => set({ isAuthenticated }),
    setUsername: (username) => set({ username }),
    setEmail: (email) => set({ email }),
    setPhone_number: (phone_number) => set({ phone_number }),
    setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
    setCsrfToken: (csrfToken) => set({ csrfToken }),
}))