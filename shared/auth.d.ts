declare module "#auth-utils" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  }
}

export {};
