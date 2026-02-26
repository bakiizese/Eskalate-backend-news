import jwt, { JwtPayload } from "jsonwebtoken";

interface JwtPayloadCustom extends JwtPayload {
  sub?: string;
  role?: string;
}

export function gen_jwt_token(payload: JwtPayloadCustom): string {
  const secret: any = process.env.JWT_SECRET_KEY;
  if (!secret) throw new Error("JWT secret key is not defined");
  const token = jwt.sign(payload, secret, {
    expiresIn: "24h",
  });

  return token;
}

export function jwt_verify(jwt_token: string): JwtPayloadCustom | false {
  const secret: any = process.env.JWT_SECRET_KEY;

  if (!secret) throw new Error("JWT secret key is not defined");

  try {
    const decoded = jwt.verify(jwt_token, secret) as JwtPayloadCustom;
    return decoded;
  } catch (err) {
    return false;
  }
}
