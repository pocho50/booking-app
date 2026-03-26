import type {
  UserCreateInput,
  UserDto,
  UserUpdateInput,
} from "~~/shared/types/user";

export type { UserCreateInput, UserDto, UserUpdateInput };

export async function listUsers(): Promise<UserDto[]> {
  const { $api } = useNuxtApp();

  return $api<UserDto[]>("/users");
}

export async function getUser(id: string): Promise<UserDto> {
  const { $api } = useNuxtApp();

  return $api<UserDto>(`/users/${id}`);
}

export async function createUser(
  data: UserCreateInput,
): Promise<UserDto> {
  const { $api } = useNuxtApp();

  return $api<UserDto>("/users", {
    method: "POST",
    body: data,
  });
}

export async function updateUser(
  id: string,
  data: UserUpdateInput,
): Promise<UserDto> {
  const { $api } = useNuxtApp();

  return $api<UserDto>(`/users/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteUser(id: string): Promise<void> {
  const { $api } = useNuxtApp();

  await $api<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
