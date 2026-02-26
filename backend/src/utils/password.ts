import bcrypt from "bcrypt";

export async function hash_password(password: string): Promise<string> {
  const hashed_password = await bcrypt.hash(password, 10);
  return hashed_password;
}

export async function verify_password(
  password: string,
  hashed_password: string,
): Promise<boolean> {
  const verify = await bcrypt.compare(password, hashed_password);
  return verify;
}
