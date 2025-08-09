import { getJsonData } from "./utils";

// TODO(noituri): Make it configurable via env
const ENDPOINT = "http://localhost:3003/users";

export async function sendGetProfileRequest(user) {
  const resp = await fetch(`${ENDPOINT}/me`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });

  return await getJsonData(resp);
}

export async function sendUpdateProfileRequest(user, profile) {
  const resp = await fetch(`${ENDPOINT}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify(profile),
  });

  return await getJsonData(resp);
}
