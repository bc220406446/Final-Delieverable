// src/lib/strapi.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

export async function strapiGet(path: string) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  } as RequestInit);
  if (!res.ok) throw new Error(`Strapi GET failed: ${res.statusText}`);
  return res.json();
}

export async function strapiPost(path: string, body: object) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data: body }),
  } as RequestInit);
  if (!res.ok) throw new Error(`Strapi POST failed: ${res.statusText}`);
  return res.json();
}

export async function strapiPut(path: string, body: object) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data: body }),
  } as RequestInit);
  if (!res.ok) throw new Error(`Strapi PUT failed: ${res.statusText}`);
  return res.json();
}

export async function strapiDelete(path: string) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  } as RequestInit);
  if (!res.ok) throw new Error(`Strapi DELETE failed: ${res.statusText}`);
  return res.json();
}