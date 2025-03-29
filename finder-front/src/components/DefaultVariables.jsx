import { create } from "zustand";

export const DefaultVariables = create((set) => ({
    isAuthenticated: false,
    username: "Unauthorized",
    avatarUrl: "avatarUrl None",
    csrfToken: "csrfToken None",

    setAuthorization: (isAuthenticated) => set({ isAuthenticated }),
    setUsername: (username) => set({ username }),
    setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
    setCsrfToken: (csrfToken) => set({ csrfToken }),
}))