export async function getJsonData(resp) {
  const body = await resp.json();
  if (!(resp.status >= 200 && resp.status <= 399)) {
    throw new Error(body.error);
  }

  return body;
}
