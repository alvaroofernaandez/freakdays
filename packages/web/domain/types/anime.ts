export type AnimeStatus =
  | "watching"
  | "completed"
  | "on_hold"
  | "dropped"
  | "plan_to_watch"
  | "rewatching";

export interface Anime {
  id: string;
  title: string;
  status: AnimeStatus;
  currentEpisode: number;
  totalEpisodes: number | null;
  score: number | null;
  notes: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ANIME_STATUS_LABELS: Record<AnimeStatus, string> = {
  watching: "En curso",
  completed: "Visto",
  on_hold: "En pausa",
  dropped: "Droppeado",
  plan_to_watch: "Pendiente",
  rewatching: "Rewatch",
};
