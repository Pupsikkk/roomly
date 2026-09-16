/** HTTP paths for user-service (relative to service base URL) */
export const USER_HTTP_PATHS = {
  root: 'users',
  me: 'users/me',
  byId: 'users/:id',
} as const;

export type CreateUserRequest = {
  email: string;
  password: string;
};

export type UserResponse = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};
