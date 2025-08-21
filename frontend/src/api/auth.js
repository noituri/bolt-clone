import { getJsonData } from "./utils";

// TODO(noituri): Make it configurable via env
const ENDPOINT = "http://localhost:3010";

export const AUTH_ROLE_CLIENT = "client";
export const AUTH_ROLE_DRIVER = "driver";
export const AUTH_ROLE_ADMIN = "admin";

export async function sendRegisterRequest(username, password, role) {
  const resp = await fetch(`${ENDPOINT}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      role,
    }),
  });

  return await getJsonData(resp);
}

export async function sendLoginRequest(username, password) {
  const resp = await fetch(`${ENDPOINT}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  return await getJsonData(resp);
}

// TODO(noituri): Add sendChangePasswordRequest
export async function sendChangePasswordRequest(user, oldPassword, newPassword) {
  const resp = await fetch(`${ENDPOINT}/users/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });


  return await getJsonData(resp);
}
