export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User not found: ${id}`);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User already exists: ${email}`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid or expired refresh token');
    this.name = 'InvalidRefreshTokenError';
  }
}
