import { getJsonData } from "./utils";

// TODO(noituri): Make it configurable via env
const ENDPOINT = "http://localhost:3002/payments";

export async function sendCreatePaymentRequest(
  user,
  rideId,
  clientId,
  amount,
  method,
  status,
  reference,
) {
  const resp = await fetch(`${ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      ride_id: rideId,
      client_id: clientId,
      amount,
      method,
      status,
      reference,
    }),
  });

  return await getJsonData(resp);
}

export async function sendListPaymentsRequest(
  user,
) {
  const resp = await fetch(`${ENDPOINT}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });

  return await getJsonData(resp);
}

