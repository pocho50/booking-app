export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type UserCreateInput = {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

export type UserUpdateInput = Partial<UserCreateInput>;
