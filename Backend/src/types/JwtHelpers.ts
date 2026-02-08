export type JwtPayload = {
  id?: number
  username?: string
  exp?: number
}

export type JwtSignPayload = {
  id: number
  username: string
  exp: number
}

export type JwtVerifyResult = unknown

export type JwtHelpers = {
  sign: (payload: JwtSignPayload) => Promise<string>
  verify: (token: string) => Promise<JwtVerifyResult>
}
