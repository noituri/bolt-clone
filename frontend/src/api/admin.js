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

export async function sendAddUserRequest(user, username, password, role, fullName, phone) {
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

export async function sendAdminChangePasswordRequest(user, userId, newPassword) {
  const resp = await fetch(`${ENDPOINT}/users/${userId}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      new_password: newPassword,
    }),
  });

  return await getJsonData(resp);
}

export async function sendCreateDriverRequest(user, driverUserId, carMake, carModel, licensePlate) {
  const resp = await fetch(`${ENDPOINT}/drivers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      id: driverUserId,
      car_make: carMake,
      car_model: carModel,
      car_plate: licensePlate,
    }),
  });

  return await getJsonData(resp);
}

export async function sendUpdateDriverRequest(user, driverUserId, carMake, carModel, licensePlate) {
  const resp = await fetch(`${ENDPOINT}/drivers/${driverUserId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      car_make: carMake,
      car_model: carModel,
      car_plate: licensePlate,
    }),
  });

  return await getJsonData(resp);
}

export async function sendGetDriverRequest(user, driverUserId) {
  const resp = await fetch(`${ENDPOINT}/drivers/${driverUserId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
  });

  return await getJsonData(resp);
}
