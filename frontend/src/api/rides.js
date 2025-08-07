import { getJsonData } from "./utils";

// TODO(noituri): Make it configurable via env
const ENDPOINT = "http://localhost:3001/rides";

export async function sendRequestRideRequest(
  user,
  pickupAddress,
  destination,
  price,
) {
  const resp = await fetch(`${ENDPOINT}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      from_address: pickupAddress,
      to_address: destination,
      amount: price,
    }),
  });

  return await getJsonData(resp);
}

export async function sendGetRideRequest(user, rideId) {
  const resp = await fetch(`${ENDPOINT}/${rideId}`, {
    method: "GET",
    headers: { authorization: `Bearer ${user.token}` },
  });

  return await getJsonData(resp);
}

export async function sendGetRideHistoryRequest(user) {
  const resp = await fetch(`${ENDPOINT}/history`, {
    method: "GET",
    headers: { authorization: `Bearer ${user.token}` },
  });

  return await getJsonData(resp);
}

export async function sendCancelRideRequest(user, rideId) {
  const resp = await fetch(`${ENDPOINT}/cancel/${rideId}`, {
    method: "PUT",
    headers: { authorization: `Bearer ${user.token}` },
  });

  return await getJsonData(resp);
}
