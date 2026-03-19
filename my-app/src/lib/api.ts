// Core API client for communicating with Strapi backend.

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

interface StrapiError {
  error: { status: number; name: string; message: string };
}

async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res  = await fetch(`${STRAPI_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = data as StrapiError;
    throw new Error(err?.error?.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: { id: number; name: string; type: string };
  fullName?: string;
  profileImage?: { url: string; } | null;
  bio?: string;
  location?: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  location: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// Registers a new user. The Strapi extension automatically sends the OTP email.
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/local/register", {
    method: "POST",
    body: JSON.stringify({
      username: payload.email,
      email:    payload.email,
      password: payload.password,
      fullName: payload.fullName,
      location: payload.location,
    }),
  });
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/local", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(email: string): Promise<{ ok: boolean }> {
  return strapiRequest<{ ok: boolean }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  code: string, password: string, passwordConfirmation: string
): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });
}

export async function getMe(token: string): Promise<StrapiUser> {
  return strapiRequest<StrapiUser>("/api/users/me?populate=role&populate=profileImage&fields[0]=id&fields[1]=username&fields[2]=email&fields[3]=confirmed&fields[4]=blocked&fields[5]=fullName&fields[6]=location&fields[7]=bio", {}, token);
}

// Updates user profile fields (fullName, location, bio).
export async function updateUser(
  id: number,
  data: Partial<Pick<StrapiUser, "fullName" | "location" | "username" | "bio">>,
  token: string
): Promise<StrapiUser> {
  return strapiRequest<StrapiUser>(
    `/api/users/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    token
  );
}

// Uploads a new profile image and attaches it to the user record.
// Returns the updated user object.
export async function updateUserAvatar(
  userId: number,
  file: File,
  token: string
): Promise<StrapiUser> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

  const formData = new FormData();
  formData.append("files",  file);
  formData.append("ref",    "plugin::users-permissions.user");
  formData.append("refId",  String(userId));
  formData.append("field",  "profileImage");

  const res = await fetch(`${strapiUrl}/api/upload`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}` },
    body:    formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `Avatar upload failed (${res.status})`);
  }

  // Fetch updated user so caller gets the new profileImage url.
  return getMe(token);
}

// ─── Custom OTP API ───────────────────────────────────────────────────────────

// Resends the OTP email to the given address (called from OTP page resend button).
export async function resendOtp(email: string): Promise<{ ok: boolean }> {
  return strapiRequest<{ ok: boolean }>("/api/otp/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Verifies the 6-digit code and returns a JWT + confirmed user on success.
export async function verifyOtp(email: string, code: string): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

// Confirms email via the token from the link in the email (used by /confirm-email page).
export async function confirmEmailToken(token: string): Promise<{ jwt: string; user: StrapiUser }> {
  const res = await fetch(
    `${STRAPI_URL}/api/auth/email-confirmation?confirmation=${token}`
  );
  if (!res.ok) {
    const data = (await res.json()) as StrapiError;
    throw new Error(data?.error?.message ?? "Email confirmation failed.");
  }
  return res.json();
}

// ─── Skill Types ──────────────────────────────────────────────────────────────

export interface StrapiSkill {
  id:            number;
  title:         string;
  description:   string;
  category:      string;
  level:         string;
  location:      string;
  availability:  string;
  state:         "pending" | "approved" | "rejected";
  provider_name: string;
  provider_email: string;
  publishedAt:   string | null;
  image?: { url: string } | null;
}

// Strapi v5 REST returns flat objects: { id, title, ... } not { id, attributes: {...} }
export interface StrapiSkillsResponse {
  data: (StrapiSkill & { id: number })[];
  meta: { pagination: { total: number } };
}

// ─── Skill API ────────────────────────────────────────────────────────────────

// Fetches skills filtered by state — used by admin manage-skills page.
export async function getSkillsByState(
  state: "pending" | "approved" | "rejected",
  token: string
): Promise<StrapiSkill[]> {
  const params = new URLSearchParams({
    "filters[state][$eq]": state,
    "populate":            "image",
    "pagination[limit]":   "200",
    // Include drafts (pending/rejected are unpublished)
    "publicationState":    "preview",
  });

  const res = await strapiRequest<StrapiSkillsResponse>(
    `/api/skills?${params.toString()}`,
    {},
    token
  );

  return res.data.map((item: any) => ({
    ...item,
    // Strapi v5: image is flat { id, url, ... } not wrapped in data.attributes
    image: item.image?.url ? item.image : item.image?.data?.attributes ?? item.image ?? null,
  }));
}

// Approves a skill — sets state to approved and publishes it.
export async function approveSkill(id: number, token: string): Promise<void> {
  await strapiRequest(`/api/skills/${id}/approve`, { method: "PATCH" }, token);
}

// Rejects a skill — sets state to rejected.
export async function rejectSkill(id: number, token: string): Promise<void> {
  await strapiRequest(`/api/skills/${id}/reject`, { method: "PATCH" }, token);
}

// Deletes a skill permanently.
export async function deleteSkill(id: number, token: string): Promise<void> {
  // Our custom delete controller returns { data: null } (not 204)
  // so strapiRequest can parse it normally.
  await strapiRequest(`/api/skills/${id}`, { method: "DELETE" }, token);
}


// Fetches all approved (published) skills for the browse page.
// No auth required — public endpoint.
// Fetches approved skills — requires authenticated token (Authenticated role only).
export async function getApprovedSkills(token: string): Promise<StrapiSkill[]> {
  const params = new URLSearchParams({
    "filters[state][$eq]": "approved",
    "populate":            "image",
    "pagination[limit]":   "200",
  });

  const res = await strapiRequest<StrapiSkillsResponse>(
    `/api/skills?${params.toString()}`,
    {},
    token
  );

  return res.data.map((item: any) => ({
    ...item,
    image: item.image?.url ? item.image : item.image?.data?.attributes ?? item.image ?? null,
  }));
}

// ─── User Skill API ───────────────────────────────────────────────────────────

// Fetches skills belonging to the currently logged-in user.
export async function getMySkills(token: string): Promise<StrapiSkill[]> {
  const params = new URLSearchParams({
    "populate":         "image",
    "pagination[limit]":"200",
    "publicationState": "preview", // include pending drafts
  });

  const res = await strapiRequest<StrapiSkillsResponse>(
    `/api/skills/my-skills?${params.toString()}`,
    {},
    token
  );

  return res.data.map((item: any) => ({
    ...(item.attributes ?? item),
    id:    item.id ?? (item.attributes ?? item).id,
    image: item.attributes?.image?.data?.attributes
        ?? item.attributes?.image
        ?? item.image
        ?? null,
  }));
}

// Uploads a file to Strapi media library and returns its media ID.
export async function uploadFile(file: File, token: string): Promise<number> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
  const formData  = new FormData();
  formData.append("files", file);

  const res = await fetch(`${strapiUrl}/api/upload`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}` },
    body:    formData,
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `Upload failed (${res.status})`);
  }

  const data = await res.json() as { id: number }[];
  if (!data?.[0]?.id) throw new Error("Upload succeeded but returned no file ID.");
  return data[0].id;
}

// Creates a new skill as a pending draft.
// If imageFile is provided, uploads it first then attaches via image ID.
export async function createSkill(
  payload: {
    title:          string;
    description:    string;
    category:       string;
    level:          string;
    location:       string;
    availability:   string;
    provider_name:  string;
    provider_email: string;
  },
  token: string,
  imageFile?: File | null
): Promise<StrapiSkill> {
  // Step 1 — upload image first if provided, get media ID
  let imageId: number | undefined;
  if (imageFile) {
    imageId = await uploadFile(imageFile, token);
  }

  // Step 2 — create skill with image ID attached in the same request
  const res = await strapiRequest<{ data: { id: number; attributes: any } }>(
    "/api/skills",
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          ...payload,
          state: "pending",
          ...(imageId ? { image: imageId } : {}),
        },
      }),
    },
    token
  );
  return { id: res.data.id, ...res.data.attributes };
}

// Updates an existing skill — resets state to pending for re-review.
export async function updateSkill(
  id: number,
  payload: {
    title:        string;
    description:  string;
    category:     string;
    level:        string;
    location:     string;
    availability: string;
  },
  token: string,
  imageFile?: File | null
): Promise<StrapiSkill> {
  // Upload new image first if provided
  let imageId: number | undefined;
  if (imageFile) {
    imageId = await uploadFile(imageFile, token);
  }

  const res = await strapiRequest<{ data: { id: number; attributes: any } }>(
    `/api/skills/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        data: {
          ...payload,
          state: "pending",
          ...(imageId ? { image: imageId } : {}),
        },
      }),
    },
    token
  );
  return { id: res.data.id, ...res.data.attributes };
}

// uploadSkillImage removed — image is now uploaded via uploadFile() inside createSkill()