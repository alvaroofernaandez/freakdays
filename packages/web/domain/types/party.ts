import type { AnimeStatus } from "./anime";

export interface Party {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string | null;
  ownerId: string;
  maxMembers: number;
  createdAt: Date;
  members: PartyMember[];
}

export interface PartyMember {
  id: string;
  partyId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
  profile?: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export type SharedListType = "anime" | "manga" | "quests" | "tier_list";

export interface PartySharedList {
  id: string;
  partyId: string;
  name: string;
  listType: SharedListType;
  content: TierListState | null;
  createdBy: string;
  createdAt: Date;
  creator?: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  animeItems?: PartyAnimeItem[];
  _count?: {
    animeItems: number;
  };
}

export interface PartyAnimeItem {
  id: string;
  listId: string;
  addedBy: string | null;
  title: string;
  status: AnimeStatus;
  currentEpisode: number;
  totalEpisodes: number | null;
  score: number | null;
  notes: string | null;
  coverUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  rewatchCount: number;
  createdAt: Date;
  updatedAt: Date;
  addedByUser?: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface TierListState {
  tiers: Tier[];
  pool: TierItem[];
}

export interface Tier {
  id: string;
  name: string;
  color: string;
  items: TierItem[];
}

export interface TierItem {
  id: string;
  content: string;
  type: "text" | "image";
  meta?: any;
}
