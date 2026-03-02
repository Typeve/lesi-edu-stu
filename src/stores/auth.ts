import { computed, reactive } from "vue";
import { authApi } from "../services/auth";
import type { FirstLoginVerifyPayload } from "../types/auth";

interface AuthState {
  token: string | null;
  mustChangePassword: boolean;
  firstLoginVerified: boolean;
  studentNo: string | null;
}

const STORAGE_KEY = "lesi_stu_auth";

const readInitialState = (): AuthState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, mustChangePassword: false, firstLoginVerified: false, studentNo: null };
  }

  try {
    const parsed = JSON.parse(raw) as AuthState;
    return {
      token: parsed.token ?? null,
      mustChangePassword: Boolean(parsed.mustChangePassword),
      firstLoginVerified: Boolean(parsed.firstLoginVerified),
      studentNo: parsed.studentNo ?? null
    };
  } catch {
    return { token: null, mustChangePassword: false, firstLoginVerified: false, studentNo: null };
  }
};

const state = reactive<AuthState>(readInitialState());

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const useAuthStore = () => {
  const isLoggedIn = computed(() => !!state.token);
  const requiresFirstVerify = computed(() => isLoggedIn.value && !state.firstLoginVerified);

  const login = async (input: { studentNo: string; password: string }) => {
    const result = await authApi.login(input);
    state.token = result.token;
    state.mustChangePassword = result.mustChangePassword;
    state.firstLoginVerified = false;
    state.studentNo = input.studentNo.trim();
    persist();
  };

  const firstLoginVerify = async (payload: FirstLoginVerifyPayload) => {
    if (!state.token) {
      throw new Error("未登录");
    }

    const result = await authApi.firstLoginVerify(state.token, payload);
    state.firstLoginVerified = result.verified;
    persist();
    return result;
  };

  const logout = () => {
    state.token = null;
    state.studentNo = null;
    state.firstLoginVerified = false;
    state.mustChangePassword = false;
    persist();
  };

  return {
    state,
    isLoggedIn,
    requiresFirstVerify,
    login,
    firstLoginVerify,
    logout
  };
};
