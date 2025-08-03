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

  if (!(resp.status >= 200 && resp.status <= 399)) {
    const errResp = await resp.json();
    throw new Error(errResp.error);
  }
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

  const jsonResp = await resp.json();
  if (!(resp.status >= 200 && resp.status <= 399)) {
    throw new Error(jsonResp.error);
  }
  return jsonResp;
}

// TODO(noituri): Add sendChangePasswordRequest
