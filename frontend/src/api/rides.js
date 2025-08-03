// TODO(noituri): Make it configurable via env
const ENDPOINT = "http://localhost:3001";

export async function sendRequestRideRequest(
  pickupAddress,
  destination,
  price,
) {
  const resp = await fetch(`${ENDPOINT}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from_address: pickupAddress,
      to_address: destination,
      amount: price,
    }),
  });

  if (!(resp.status >= 200 && resp.status <= 399)) {
    const errResp = await resp.json();
    throw new Error(errResp.error);
  }
}
