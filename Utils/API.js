export async function fetchData(endpoint) {
  const res = await fetch(endpoint);
  return res.json();
}
