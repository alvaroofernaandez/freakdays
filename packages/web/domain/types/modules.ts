export type ModuleId =
  | "workouts"
  | "manga"
  | "anime"
  | "quests"
  | "party"
  | "calendar";

export interface AppModule {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export const ALL_MODULES: readonly AppModule[] = [
  {
    id: "workouts",
    name: "Entrenamientos",
    description: "Registra y sigue tus entrenamientos",
    icon: "dumbbell",
    enabled: false,
  },
  {
    id: "manga",
    name: "Colección Manga",
    description: "Gestiona tu colección de mangas",
    icon: "book-open",
    enabled: false,
  },
  {
    id: "anime",
    name: "Anime",
    description: "Lleva el control de tus animes",
    icon: "tv",
    enabled: false,
  },
  {
    id: "quests",
    name: "Misiones Diarias",
    description: "Convierte tus tareas en quests",
    icon: "sword",
    enabled: false,
  },
  {
    id: "party",
    name: "Party System",
    description: "Crea grupos con amigos",
    icon: "users",
    enabled: false,
  },
  {
    id: "calendar",
    name: "Calendario",
    description: "Próximos lanzamientos y eventos",
    icon: "calendar",
    enabled: false,
  },
] as const;
