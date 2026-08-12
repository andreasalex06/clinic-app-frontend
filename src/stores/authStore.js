import { create } from "zustand";
import { api } from "../api/client";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("clinic_token"),
  loading: true,

  loadMe: async () => {
    const token = get().token;

    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const response = await api.get("/auth/me");
      set({ user: response.data.data, loading: false });
    } catch {
      localStorage.removeItem("clinic_token");
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password
    });

    localStorage.setItem("clinic_token", response.data.data.token);
    set({
      token: response.data.data.token,
      user: response.data.data.user,
      loading: false
    });
  },

  logout: () => {
    localStorage.removeItem("clinic_token");
    set({ user: null, token: null, loading: false });
  }
}));
