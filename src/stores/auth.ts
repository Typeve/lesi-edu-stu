import { computed, reactive } from "vue";
import { getPermissionsByRole } from "../constants/rbac";
import { authApi } from "../services/auth";
import { configureAuthLifecycle, setAccessToken } from "../services/http";
import type { AuthRole, AuthUser, FirstLoginVerifyPayload, SessionUser, UnifiedLoginResponse } from "../types/auth";

interface PersistedAuthState {
  firstLoginVerified: boolean;
  verifiedUserId: string | null;
}

interface AuthState {
  initialized: boolean;
  initializing: boolean;
  accessToken: string;
  user: SessionUser | null;
  firstLoginVerified: boolean;
  verifiedUserId: string | null;
}

const STORAGE_KEY = "lesi_stu_auth";

const readPersistedState = (): PersistedAuthState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      firstLoginVerified: false,
      verifiedUserId: null
    };
  }

  try {
    const parsed = JSON.parse(raw) as PersistedAuthState;
    return {
      firstLoginVerified: Boolean(parsed.firstLoginVerified),
      verifiedUserId: parsed.verifiedUserId ?? null
    };
  } catch {
    return {
      firstLoginVerified: false,
      verifiedUserId: null
    };
  }
};

const persisted = readPersistedState();

const state = reactive<AuthState>({
  initialized: false,
  initializing: false,
  accessToken: "",
  user: null,
  firstLoginVerified: persisted.firstLoginVerified,
  verifiedUserId: persisted.verifiedUserId
});

const persist = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      firstLoginVerified: state.firstLoginVerified,
      verifiedUserId: state.verifiedUserId
    } satisfies PersistedAuthState)
  );
};

const toSessionUser = (user: AuthUser): SessionUser => ({
  ...user,
  permissions: getPermissionsByRole(user.role)
});

const applyAuthResult = (result: UnifiedLoginResponse) => {
  const nextToken = result.accessToken.trim();
  state.accessToken = nextToken;
  setAccessToken(nextToken);

  state.user = toSessionUser(result.user);

  if (!state.user || state.verifiedUserId !== state.user.userId) {
    state.firstLoginVerified = false;
  }
};

const clearSession = () => {
  state.accessToken = "";
  state.user = null;
  setAccessToken(null);
};

const fetchCurrentUserInternal = async (): Promise<SessionUser | null> => {
  if (!state.accessToken) {
    state.user = null;
    return null;
  }

  const current = await authApi.me();
  state.user = toSessionUser(current);

  if (!state.user || state.verifiedUserId !== state.user.userId) {
    state.firstLoginVerified = false;
  }

  return state.user;
};

const refreshSession = async (): Promise<string | null> => {
  try {
    const refreshed = await authApi.refresh();
    applyAuthResult(refreshed);
    persist();
    return refreshed.accessToken;
  } catch {
    clearSession();
    return null;
  }
};

configureAuthLifecycle({
  onRefreshAccessToken: refreshSession,
  onUnauthorized: () => {
    clearSession();
  }
});

export const getDefaultRouteByRole = (role: AuthRole): string => {
  if (role === "student") {
    return state.firstLoginVerified ? "/reports" : "/first-verify";
  }

  return "/login";
};

export const useAuthStore = () => {
  const isLoggedIn = computed(() => !!state.user && !!state.accessToken);
  const requiresFirstVerify = computed(() => isLoggedIn.value && !state.firstLoginVerified);

  const initialize = async () => {
    if (state.initialized || state.initializing) {
      return;
    }

    state.initializing = true;
    try {
      await refreshSession();
      if (state.accessToken) {
        await fetchCurrentUserInternal().catch(() => undefined);
      }
      persist();
    } finally {
      state.initializing = false;
      state.initialized = true;
    }
  };

  const loginByAccount = async (input: { account: string; password: string }) => {
    const result = await authApi.login({
      account: input.account.trim(),
      password: input.password
    });

    applyAuthResult(result);

    if (state.user?.role !== "student") {
      clearSession();
      throw new Error("请使用学生账号登录学生端");
    }

    persist();
    return state.user;
  };

  const fetchCurrentUser = async () => {
    const user = await fetchCurrentUserInternal();
    persist();
    return user;
  };

  const firstLoginVerify = async (payload: FirstLoginVerifyPayload) => {
    if (!state.accessToken || !state.user) {
      throw new Error("未登录");
    }

    const result = await authApi.firstLoginVerify(payload);
    state.firstLoginVerified = result.verified;
    state.verifiedUserId = result.verified ? state.user.userId : null;
    persist();
    return result;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      state.initialized = true;
    }
  };

  const hasRole = (roles: AuthRole[]) => {
    return Boolean(state.user && roles.includes(state.user.role));
  };

  const hasPermissions = (permissions: string[]) => {
    if (!state.user) {
      return false;
    }

    return permissions.every((permission) => state.user!.permissions.includes(permission));
  };

  return {
    state,
    isLoggedIn,
    requiresFirstVerify,
    initialize,
    loginByAccount,
    fetchCurrentUser,
    firstLoginVerify,
    logout,
    hasRole,
    hasPermissions
  };
};
