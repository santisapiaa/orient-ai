export type MyUniversity = {
  id: string;
  name: string;
  is_premium: boolean;
  description: string | null;
};

export type UnclaimedUniversity = {
  id: string;
  name: string;
};

export type LeadRow = {
  id: string;
  location: string;
  matched_category: string;
  created_at: string | null;
};

export type VideoRow = {
  id: string;
  video_url: string;
  author_name: string;
  author_role: "profesional" | "egresado" | "alumno_actual";
  caption: string | null;
};

export type CareerRow = {
  id: string;
  name: string;
  category: string;
  study_plan_url: string | null;
};

export type DayPoint = {
  date: string;
  impressions: number;
  clicks: number;
  leads: number;
};
