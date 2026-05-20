export type UIPersona = "doctor" | "patient" | "hospital";
export type ApiPersona = "creator" | "owner" | "viewer";

const UI_TO_API: Record<UIPersona, ApiPersona> = {
  doctor: "creator",
  patient: "owner",
  hospital: "viewer",
};

const API_TO_UI: Record<ApiPersona, UIPersona> = {
  creator: "doctor",
  owner: "patient",
  viewer: "hospital",
};

export const uiToApiPersona = (p: UIPersona): ApiPersona => UI_TO_API[p];
export const apiToUiPersona = (p: ApiPersona): UIPersona => API_TO_UI[p];

export const isUIPersona = (v: unknown): v is UIPersona =>
  v === "doctor" || v === "patient" || v === "hospital";

export const isApiPersona = (v: unknown): v is ApiPersona =>
  v === "creator" || v === "owner" || v === "viewer";
