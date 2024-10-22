export async function fetchJson(request) {
  const response = await fetch(request);
  return await response.json();
}

export async function fetchText(request) {
  const response = await fetch(request);
  return await response.text();
}
