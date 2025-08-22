import { getJsonData } from "./utils";

// TODO(noituri): Make it configurable via env
const ENDPOINT = "http://localhost:3001/rides";

export async function sendRequestRideRequest(
  user,
  fromAddress,
  toAddress,
  fromCoords,      // { lat, lng }
  toCoords         // { lat, lng }
) {
  const resp = await fetch(`${ENDPOINT}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      from_address: fromAddress,
      to_address: toAddress,
      from_lat: fromCoords?.lat,
      from_lon: fromCoords?.lng,
      to_lat: toCoords?.lat,
      to_lon: toCoords?.lng,
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

export async function sendRouteInfoRequest(user, fromCoords, toCoords) {
  const params = new URLSearchParams({
    from_lat: String(fromCoords.lat),
    from_lon: String(fromCoords.lng),
    to_lat: String(toCoords.lat),
    to_lon: String(toCoords.lng),
  });
  const resp = await fetch(`${ENDPOINT}/route-info?${params.toString()}`, {
    method: "GET",
    headers: { authorization: `Bearer ${user.token}` },
  });
  return await getJsonData(resp);
}

export async function sendGetAvailableRidesRequest(user) {
  const resp = await fetch(`${ENDPOINT}/available`, {
    method: "GET",
    headers: { authorization: `Bearer ${user.token}` },
  });
  return await getJsonData(resp);
}

export async function sendGetAssignedRidesRequest(user) {
  const resp = await fetch(`${ENDPOINT}/assigned`, {
    method: "GET",
    headers: { authorization: `Bearer ${user.token}` },
  });
  return await getJsonData(resp);
}

export async function sendAcceptRideRequest(user, rideId) {
  const resp = await fetch(`${ENDPOINT}/accept/${rideId}`, {
    method: "POST",
    headers: { authorization: `Bearer ${user.token}` },
  });
  return await getJsonData(resp);
}

export async function sendRejectRideRequest(user, rideId) {
  const resp = await fetch(`${ENDPOINT}/reject/${rideId}`, {
    method: "POST",
    headers: { authorization: `Bearer ${user.token}` },
  });
  return await getJsonData(resp);
}

export async function sendCompleteRideRequest(user, rideId) {
  const resp = await fetch(`${ENDPOINT}/complete/${rideId}`, {
    method: "POST",
    headers: { authorization: `Bearer ${user.token}` },
  });
  return await getJsonData(resp);
}