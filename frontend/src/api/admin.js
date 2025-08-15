import { getJsonData } from "./utils";

// TODO(noituri): Make it configurable via env
const ENDPOINT = "http://localhost:3003/admin";

export async function sendGetAllUsersRequest(user) {
  const resp = await fetch(`${ENDPOINT}/users`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });

  return await getJsonData(resp);
}

export async function sendAddUserRequest(username, password, role, fullName, phone) {
  const resp = await fetch(`${ENDPOINT}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      username,
      password,
      role,
      full_name: fullName,
      phone,
    }),
  });

  return await getJsonData(resp);
}

export async function sendGetUserRequest(user, userId) {
  const resp = await fetch(`${ENDPOINT}/users/${userId}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });

  return await getJsonData(resp);
}

export async function sendUpdateUserRequest(user, userId, isActive, fullName, phone, role) {
  const resp = await fetch(`${ENDPOINT}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      role,
      full_name: fullName,
      phone,
      is_active: isActive,
    }),
  });

  return await getJsonData(resp);
}

export async function sendDeleteUserRequest(user, userId) {
  const resp = await fetch(`${ENDPOINT}/users/${userId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });

  return await getJsonData(resp);
}
