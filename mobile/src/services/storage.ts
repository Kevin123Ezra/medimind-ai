import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "medimind_access_token";
const REFRESH_TOKEN_KEY = "medimind_refresh_token";
const USER_ROLE_KEY = "medimind_user_role";

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      console.error("Error reading access token from AsyncStorage", e);
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      console.error("Error saving access token to AsyncStorage", e);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error("Error reading refresh token from AsyncStorage", e);
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.error("Error saving refresh token to AsyncStorage", e);
    }
  },

  async getUserRole(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_ROLE_KEY);
    } catch (e) {
      console.error("Error reading user role from AsyncStorage", e);
      return null;
    }
  },

  async setUserRole(role: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_ROLE_KEY, role);
    } catch (e) {
      console.error("Error saving user role to AsyncStorage", e);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_ROLE_KEY);
    } catch (e) {
      console.error("Error clearing tokens from AsyncStorage", e);
    }
  },
};
