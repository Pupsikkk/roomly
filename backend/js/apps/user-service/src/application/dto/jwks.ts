/** Public JWK set exposed by the auth signing port (not the HTTP route DTO). */
export type Jwk = {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  [param: string]: unknown;
};

export type Jwks = {
  keys: Jwk[];
};
