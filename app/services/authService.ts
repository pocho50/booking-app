import type { UserDto } from "../../shared/types/user";
import type { LoginSchema } from "../../shared/schemas/auth";

export async function loginUser(data: LoginSchema): Promise<UserDto> {
  const { $api } = useNuxtApp();

  return $api<UserDto>("/auth/login", {
    method: "POST",
    body: data,
  });
}
