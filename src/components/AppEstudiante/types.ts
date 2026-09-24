export type Career = {
  id: string;
  name: string;
  category: string;
  duration: string;
  badge: string;
  market_demand: string | null;
  avg_salary: string | null;
  work_mode: string | null;
  study_plan_url: string | null;
};

export type UniversityVideo = {
  id: string;
  video_url: string;
  author_name: string;
  author_role: "profesional" | "egresado" | "alumno_actual";
  caption: string | null;
};

export type University = {
  id: string;
  name: string;
  city: string;
  is_premium: boolean;
  description: string | null;
  video_text: string | null;
  author_handle: string | null;
  careers: Career[];
  university_videos: UniversityVideo[];
};

export type LikedItem = {
  text: string;
  category: string;
};

export type MicroCase = {
  career: string;
  text: string;
  optionA: string;
  optionB: string;
  correct: "A" | "B";
  explanation: string;
};
