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
  username: string;
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

export interface StrapiSkillCategory {
  id:          number;
  name:        string;
  description: string;
  image?:      { url: string } | null;
}

export interface StrapiSkill {
  id:            number;
  title:         string;
  description:   string;
  // After relation migration: category is an object { id, name }.
  // resolveSkillCategory() always gives you the plain name string.
  category:      StrapiSkillCategory | null;
  level:         string;
  location:      string;
  availability:  string;
  state:         "pending" | "approved" | "rejected";
  provider_name: string;
  provider_email: string;
  publishedAt:   string | null;
  image?: { url: string } | null;
}

// Always returns the category name string regardless of data shape.
export function resolveSkillCategory(skill: StrapiSkill): string {
  if (!skill.category) return "";
  if (typeof skill.category === "string") return skill.category as string;
  return (skill.category as StrapiSkillCategory).name ?? "";
}

// Strapi v5 REST returns flat objects: { id, title, ... } not { id, attributes: {...} }
export interface StrapiSkillsResponse {
  data: (StrapiSkill & { id: number })[];
  meta: { pagination: { total: number } };
}

// ─── Skill API ────────────────────────────────────────────────────────────────

// Fetches skills filtered by state - used by admin manage-skills page.
export async function getSkillsByState(
  state: "pending" | "approved" | "rejected",
  token: string
): Promise<StrapiSkill[]> {
  const params = new URLSearchParams({
    "filters[state][$eq]": state,
    "populate[image]":     "true",
    "populate[category]":  "true",
    "pagination[limit]":   "200",
    "publicationState":    "preview",
  });

  const res = await strapiRequest<StrapiSkillsResponse>(
    `/api/skills?${params.toString()}`,
    {},
    token
  );

  return res.data.map((item: any) => ({
    ...item,
    image:    item.image?.url ? item.image : item.image?.data?.attributes ?? item.image ?? null,
    category: item.category?.data?.attributes ?? item.category?.data ?? item.category ?? null,
  }));
}

// Approves a skill - sets state to approved and publishes it.
export async function approveSkill(id: number, token: string): Promise<void> {
  await strapiRequest(`/api/skills/${id}/approve`, { method: "PATCH" }, token);
}

// Rejects a skill - sets state to rejected.
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
// No auth required - public endpoint.
// Fetches approved skills - requires authenticated token (Authenticated role only).
export async function getApprovedSkills(token: string): Promise<StrapiSkill[]> {
  const params = new URLSearchParams({
    "filters[state][$eq]": "approved",
    "populate[image]":     "true",
    "populate[category]":  "true",
    "pagination[limit]":   "200",
  });

  const res = await strapiRequest<StrapiSkillsResponse>(
    `/api/skills?${params.toString()}`,
    {},
    token
  );

  return res.data.map((item: any) => ({
    ...item,
    image:    item.image?.url ? item.image : item.image?.data?.attributes ?? item.image ?? null,
    category: item.category?.data?.attributes ?? item.category?.data ?? item.category ?? null,
  }));
}

// ─── User Skill API ───────────────────────────────────────────────────────────

// Fetches skills belonging to the currently logged-in user.
export async function getMySkills(token: string): Promise<StrapiSkill[]> {
  const params = new URLSearchParams({
    "populate[image]":    "true",
    "populate[category]":  "true",
    "pagination[limit]": "200",
    "publicationState":  "preview",
  });

  const res = await strapiRequest<StrapiSkillsResponse>(
    `/api/skills/my-skills?${params.toString()}`,
    {},
    token
  );

  return res.data.map((item: any) => {
    const base = item.attributes ?? item;
    return {
      ...base,
      id:       item.id ?? base.id,
      image:    base.image?.data?.attributes ?? base.image ?? null,
      // Relation: category comes back as { id, name, ... } flat object
      category: base.category?.data?.attributes
             ?? base.category?.data
             ?? base.category
             ?? null,
    };
  });
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
    // Do NOT set Content-Type - browser sets multipart boundary automatically
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
    category:       string | number; // name (legacy) or id (relation)
    level:          string;
    location:       string;
    availability:   string;
    provider_name:  string;
    provider_email: string;
  },
  token: string,
  imageFile?: File | null
): Promise<StrapiSkill> {
  let imageId: number | undefined;
  if (imageFile) imageId = await uploadFile(imageFile, token);

  // If category is a numeric string or number, send as relation id
  // If it's a name string, send as-is (legacy fallback)
  const categoryValue = typeof payload.category === "number" || /^\d+$/.test(String(payload.category))
    ? Number(payload.category)
    : payload.category;

  const res = await strapiRequest<{ data: { id: number; attributes: any } }>(
    "/api/skills",
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          ...payload,
          category: categoryValue,
          state: "pending",
          ...(imageId ? { image: imageId } : {}),
        },
      }),
    },
    token
  );
  return { id: res.data.id, ...res.data.attributes };
}

// Updates an existing skill - resets state to pending for re-review.
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

// uploadSkillImage removed - image is now uploaded via uploadFile() inside createSkill()

// ─── Request Types ────────────────────────────────────────────────────────────

export interface StrapiRequest {
  id:                    number;
  requester_name:        string;
  requester_email:       string;
  provider_name:         string;
  provider_email:        string;
  requested_skill_id:    number;
  requested_skill_title: string;
  offered_skill_id:      number;
  offered_skill_title:   string;
  preferred_slot:        string;
  mode:                  "Online" | "In-person";
  message:               string;
  status:                "pending" | "accepted" | "rejected";
  accepted_skill_title?: string;
  createdAt:             string;
}

export interface MyRequestsResponse {
  sent:     StrapiRequest[];
  received: StrapiRequest[];
}

// ─── Request API ──────────────────────────────────────────────────────────────

// Fetches sent and received requests for the logged-in user.
export async function getMyRequests(token: string): Promise<MyRequestsResponse> {
  return strapiRequest<MyRequestsResponse>("/api/requests/my-requests", {}, token);
}

// Sends a new skill exchange request.
export async function createRequest(
  payload: {
    provider_name:         string;
    provider_email:        string;
    requested_skill_id:    number;
    requested_skill_title: string;
    offered_skill_id:      number;
    offered_skill_title:   string;
    preferred_slot:        string;
    mode:                  "Online" | "In-person";
    message:               string;
  },
  token: string
): Promise<StrapiRequest> {
  const res = await strapiRequest<{ data: StrapiRequest }>(
    "/api/requests",
    { method: "POST", body: JSON.stringify({ data: payload }) },
    token
  );
  return res.data;
}

// Updates a pending request (requester edits their own request).
export async function updateRequest(
  id: number,
  payload: {
    offered_skill_id:    number;
    offered_skill_title: string;
    preferred_slot:      string;
    mode:                "Online" | "In-person";
    message:             string;
  },
  token: string
): Promise<StrapiRequest> {
  const res = await strapiRequest<{ data: StrapiRequest }>(
    `/api/requests/${id}`,
    { method: "PUT", body: JSON.stringify({ data: payload }) },
    token
  );
  return res.data;
}

// Provider accepts a received request with the skill they will provide.
export async function acceptRequest(
  id: number,
  token: string,
  acceptedSkillTitle?: string,
  responseMessage?: string,
  updatedSlot?: string
): Promise<void> {
  await strapiRequest(
    `/api/requests/${id}/accept`,
    {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          accepted_skill_title: acceptedSkillTitle ?? "",
          response_message:     responseMessage   ?? "",
          updated_slot:         updatedSlot        ?? "",
        },
      }),
    },
    token
  );
}

// Provider rejects a received request with optional reason.
export async function rejectRequest(
  id: number,
  token: string,
  rejectionReason?: string
): Promise<void> {
  await strapiRequest(
    `/api/requests/${id}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ data: { rejection_reason: rejectionReason ?? "" } }),
    },
    token
  );
}

// Requester cancels their own pending request.
export async function cancelRequest(id: number, token: string): Promise<void> {
  await strapiRequest(`/api/requests/${id}`, { method: "DELETE" }, token);
}

// ─── Exchange Types ───────────────────────────────────────────────────────────

export interface StrapiExchange {
  id:                   number;
  exchange_id:          string;
  requester_name:       string;
  requester_email:      string;
  provider_name:        string;
  provider_email:       string;
  skill_a_title:        string;  // what requester provides
  skill_b_title:        string;  // what provider provides
  preferred_slot:       string;
  mode:                 "Online" | "In-person";
  status:               "active" | "completed" | "cancelled";
  requester_confirmed:  boolean;
  provider_confirmed:   boolean;
  provider_delivered:   boolean;
  requester_received:   boolean;
  skill_a_delivered:    boolean;
  skill_a_received:     boolean;
  skill_b_delivered:    boolean;
  skill_b_received:     boolean;
  createdAt:            string;
}

// ─── Exchange API ─────────────────────────────────────────────────────────────

export async function getMyExchanges(token: string): Promise<StrapiExchange[]> {
  const res = await strapiRequest<{ data: StrapiExchange[] }>(
    "/api/exchanges/my-exchanges", {}, token
  );
  return res.data;
}

// User marks their side as done.
export async function confirmExchange(
  id: number,
  token: string,
  action: "deliver" | "receive"
): Promise<StrapiExchange> {
  const res = await strapiRequest<{ data: StrapiExchange }>(
    `/api/exchanges/${id}/confirm`,
    {
      method: "PATCH",
      body: JSON.stringify({ data: { action } }),  // ← send action in body
    },
    token
  );
  return res.data;
}

// Either party cancels the exchange.
export async function cancelExchange(id: number, token: string): Promise<StrapiExchange> {
  const res = await strapiRequest<{ data: StrapiExchange }>(
    `/api/exchanges/${id}/cancel`, { method: "PATCH" }, token
  );
  return res.data;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface StrapiReview {
  id:             number;
  exchange_id:    string;
  reviewer_name:  string;
  reviewer_email: string;
  reviewee_name:  string;
  reviewee_email: string;
  skill_title:    string;
  rating:         number;
  comment:        string;
  createdAt:      string;
}

export interface MyReviewsResponse {
  given:    StrapiReview[];
  received: StrapiReview[];
}

// ─── Review API ───────────────────────────────────────────────────────────────

export async function getMyReviews(token: string): Promise<MyReviewsResponse> {
  return strapiRequest<MyReviewsResponse>("/api/reviews/my-reviews", {}, token);
}

export async function createReview(
  payload: { exchange_id: string; rating: number; comment: string },
  token: string
): Promise<StrapiReview> {
  const res = await strapiRequest<{ data: StrapiReview }>(
    "/api/reviews",
    { method: "POST", body: JSON.stringify({ data: payload }) },
    token
  );
  return res.data;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export interface StrapiReport {
  id:             number;
  type:           "User" | "Skill" | "Exchange";
  target_id:      string;
  target_label:   string;
  reason:         string;
  description:    string;
  reporter_name:  string;
  reporter_email: string;
  report_status:  "pending" | "resolved" | "dismissed";
  admin_note:     string;
  createdAt:      string;
}

// ─── Report API ───────────────────────────────────────────────────────────────

export async function getMyReports(token: string): Promise<StrapiReport[]> {
  const res = await strapiRequest<{ data: StrapiReport[] }>(
    "/api/reports/my-reports", {}, token
  );
  return res.data;
}

export async function createReport(
  payload: {
    type:         "User" | "Skill" | "Exchange";
    target_id:    string;
    target_label: string;
    reason:       string;
    description:  string;
  },
  token: string
): Promise<StrapiReport> {
  const res = await strapiRequest<{ data: StrapiReport }>(
    "/api/reports",
    { method: "POST", body: JSON.stringify({ data: payload }) },
    token
  );
  return res.data;
}

// Fetch all users (for report User dropdown - public profiles)
export async function getAllUsers(token: string): Promise<StrapiUser[]> {
  // /api/users returns a plain array (not wrapped in data:{})
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}/api/users?fields[0]=id&fields[1]=username&fields[2]=email&fields[3]=fullName&fields[4]=blocked`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
  return res.json() as Promise<StrapiUser[]>;
}

// ─── CMS Content Types ────────────────────────────────────────────────────────

export interface CmsFaqItem      { question: string; answer: string; }
export interface CmsTeamMember   { name: string; role: string; desc: string; image?: { url: string } | null; }
export interface CmsProblemBlock { problem: string; solution: string; }

export interface CmsAboutPage {
  hero_title:       string;
  hero_description: string;
  hero_image?:      { url: string } | null;
  problem_blocks:   CmsProblemBlock[];
  team_members:     CmsTeamMember[];
}

export interface CmsFaqPage {
  hero_title:       string;
  hero_description: string;
  hero_image?:      { url: string } | null;
  section_heading:  string;
  faqs:             CmsFaqItem[];
}

export interface CmsPoliciesPage {
  last_updated:         string;
  privacy_policy:       unknown;   // Strapi blocks JSON
  terms_of_service:     unknown;
  exchange_policy:      unknown;
  community_guidelines: unknown;
}

// ─── CMS API (public - no token needed) ──────────────────────────────────────

// Helper for public CMS fetches - no auth, no-store cache for fresh content.
async function cmsGet(endpoint: string): Promise<any> {
  const url = `${STRAPI_URL}${endpoint}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CMS fetch failed: ${res.status}`);
  const json = await res.json();
  // Strapi v5 single types return flat { id, ..fields } NOT { data: { ... } }
  // But with populate, nested relations come under their field names directly.
  return json.data ?? json;
}

export async function getAboutPage(): Promise<CmsAboutPage | null> {
  try {
    return await cmsGet(
      "/api/about-page?populate[hero_image]=true&populate[problem_blocks]=true&populate[team_members][populate][image]=true"
    ) as CmsAboutPage;
  } catch { return null; }
}

export async function getFaqPage(): Promise<CmsFaqPage | null> {
  try {
    return await cmsGet("/api/faq-page?populate[hero_image]=true&populate[faqs]=true") as CmsFaqPage;
  } catch { return null; }
}

export async function getPoliciesPage(): Promise<CmsPoliciesPage | null> {
  try {
    return await cmsGet("/api/policies-page") as CmsPoliciesPage;
  } catch { return null; }
}

export interface CmsCategoryCard { title: string; desc: string; image?: { url: string } | null; }
export interface CmsStepCard     { num: number; title: string; desc: string; }

export interface CmsHomePage {
  hero_title:     string;
  hero_subtitle:  string;
  hero_cta_label: string;
  hero_cta_href:  string;
  hero_image?:    { url: string } | null;
  categories:     CmsCategoryCard[];
  steps:          CmsStepCard[];
  team_members:   CmsTeamMember[];
}

export async function getHomePage(): Promise<CmsHomePage | null> {
  try {
    return await cmsGet(
      "/api/home-page?populate[hero_image]=true&populate[categories][populate][image]=true&populate[steps]=true&populate[team_members][populate][image]=true"
    ) as CmsHomePage;
  } catch { return null; }
}

// ─── Skill Category ───────────────────────────────────────────────────────────

// Fetch all skill categories - used in add/edit skill form and browse filter.
export async function getSkillCategories(token: string): Promise<StrapiSkillCategory[]> {
  const res = await strapiRequest<{ data: StrapiSkillCategory[] }>(
    "/api/skill-categories?populate[image]=true",
    {},
    token
  );
  return res.data ?? [];
}

// ─── Default Avatar ───────────────────────────────────────────────────────────

// Fetches the default profile image URL from Strapi media library.
// Looks for a file named "noProfileImage.png" uploaded to Strapi.
// Returns the absolute URL or null if not found.
export async function getDefaultAvatarUrl(): Promise<string | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/upload/files?filters[name][$contains]=noProfileImage`,
      { cache: "force-cache" }  // cache aggressively - this never changes
    );
    if (!res.ok) return null;
    const files = await res.json();
    // files is a plain array from Strapi upload plugin
    const file = Array.isArray(files) ? files[0] : files?.data?.[0];
    if (!file?.url) return null;
    return file.url.startsWith("http") ? file.url : `${STRAPI_URL}${file.url}`;
  } catch {
    return null;
  }
}
