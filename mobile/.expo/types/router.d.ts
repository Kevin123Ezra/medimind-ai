/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/forgot-password` | `/(auth)/login` | `/(auth)/register` | `/(tabs)` | `/(tabs)/` | `/(tabs)/chat` | `/(tabs)/medications` | `/(tabs)/profile` | `/(tabs)/reports` | `/_sitemap` | `/chat` | `/forgot-password` | `/login` | `/medications` | `/modal` | `/profile` | `/register` | `/reports`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
