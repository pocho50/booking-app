import type { UserDto } from "../../shared/types/user";
import type { LoginSchema } from "../../shared/schemas/auth";

export async function loginUser(data: LoginSchema): Promise<UserDto> {
  return $fetch<UserDto>("/api/auth/login", {
    method: "POST",
    body: data,
  });
}

export async function logoutUser(): Promise<void> {
  await $fetch("/api/auth/logout", {
    method: "POST",
  });
}
