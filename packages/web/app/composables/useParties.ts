import { useAuthStore } from "~~/stores/auth";
import { useToast } from "@/composables/useToast";

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

interface ApiPartyMember {
  id: string;
  partyId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  profile?: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface ApiParty {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  inviteCode: string;
  ownerId: string;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
  members: ApiPartyMember[];
}

export function useParties() {
  const authStore = useAuthStore();
  const toast = useToast();
  const authContext = useAuthContext();
  const apiClient = useApiClient();

  async function refreshAuthContext() {
    try {
      await authContext.refresh();
    } catch {
      // no-op: dejamos que la request falle normalizada
    }
  }

  function mapApiToParty(row: ApiParty): Party {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      inviteCode: row.inviteCode,
      ownerId: row.ownerId,
      maxMembers: row.maxMembers,
      createdAt: new Date(row.createdAt),
      members: row.members
        .map((member) => ({
          id: member.id,
          partyId: member.partyId,
          userId: member.userId,
          role: member.role,
          joinedAt: new Date(member.joinedAt),
          profile: member.profile,
        }))
        .sort((a, b) => {
          if (a.role === "owner") return -1;
          if (b.role === "owner") return 1;
          if (a.role === "admin") return -1;
          if (b.role === "admin") return 1;
          return a.joinedAt.getTime() - b.joinedAt.getTime();
        }),
    };
  }

  async function fetchUserParties(): Promise<Party[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const parties = await apiClient.get<ApiParty[]>("/v1/party", {
        requireOrg: true,
      });

      return parties.map((party) => mapApiToParty(party));
    } catch {
      return [];
    }
  }

  async function createParty(name: string, description?: string): Promise<Party | null> {
    if (!authStore.userId) {
      toast.error("Debes estar autenticado para crear una party");
      return null;
    }

    if (!name.trim()) {
      toast.error("El nombre de la party es obligatorio");
      return null;
    }

    if (name.length > 50) {
      toast.error("El nombre no puede tener más de 50 caracteres");
      return null;
    }

    await refreshAuthContext();

    try {
      const created = await apiClient.post<ApiParty>(
        "/v1/party",
        {
          name: name.trim(),
          description: description?.trim() || null,
        },
        { requireOrg: true }
      );

      const party = mapApiToParty(created);
      toast.success("Party creada correctamente");
      return party;
    } catch (error) {
      const normalized = apiClient.normalizeApiError(error);
      toast.error(normalized.message || "Error al crear la party");
      return null;
    }
  }

  async function joinByCode(code: string): Promise<Party | null> {
    if (!authStore.userId) {
      toast.error("Debes estar autenticado para unirte a una party");
      return null;
    }

    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length !== 6) {
      toast.error("El código debe tener 6 caracteres");
      return null;
    }

    await refreshAuthContext();

    try {
      const joined = await apiClient.post<ApiParty>(
        "/v1/party/join",
        { inviteCode: normalizedCode },
        { requireOrg: true }
      );

      const party = mapApiToParty(joined);
      toast.success(`Te has unido a "${party.name}"`);
      return party;
    } catch (error) {
      const normalized = apiClient.normalizeApiError(error);
      toast.error(normalized.message || "Error al unirte a la party");
      return null;
    }
  }

  async function fetchPartyById(id: string): Promise<Party | null> {
    await refreshAuthContext();

    try {
      const party = await apiClient.get<ApiParty>(`/v1/party/${id}`, {
        requireOrg: true,
      });

      return mapApiToParty(party);
    } catch {
      return null;
    }
  }

  async function leaveParty(partyId: string): Promise<boolean> {
    if (!authStore.userId) {
      toast.error("Debes estar autenticado");
      return false;
    }

    await refreshAuthContext();

    try {
      await apiClient.post<{ success: true }>(
        `/v1/party/${partyId}/leave`,
        undefined,
        { requireOrg: true }
      );

      toast.success("Has salido de la party");
      return true;
    } catch (error) {
      const normalized = apiClient.normalizeApiError(error);
      toast.error(normalized.message || "Error al salir de la party");
      return false;
    }
  }

  async function regenerateInviteCode(partyId: string): Promise<string | null> {
    if (!authStore.userId) {
      toast.error("Debes estar autenticado");
      return null;
    }

    await refreshAuthContext();

    try {
      const response = await apiClient.post<{ inviteCode: string }>(
        `/v1/party/${partyId}/regenerate-invite-code`,
        undefined,
        { requireOrg: true }
      );

      toast.success("Código de invitación regenerado");
      return response.inviteCode;
    } catch (error) {
      const normalized = apiClient.normalizeApiError(error);
      toast.error(normalized.message || "Error al regenerar el código");
      return null;
    }
  }

  async function removeMember(partyId: string, memberUserId: string): Promise<boolean> {
    if (!authStore.userId) {
      toast.error("Debes estar autenticado");
      return false;
    }

    await refreshAuthContext();

    try {
      await apiClient.del<{ success: true }>(
        `/v1/party/${partyId}/members/${memberUserId}`,
        { requireOrg: true }
      );

      toast.success("Miembro expulsado correctamente");
      return true;
    } catch (error) {
      const normalized = apiClient.normalizeApiError(error);
      toast.error(normalized.message || "Error al expulsar al miembro");
      return false;
    }
  }

  async function deleteParty(partyId: string): Promise<boolean> {
    if (!authStore.userId) {
      toast.error("Debes estar autenticado");
      return false;
    }

    await refreshAuthContext();

    try {
      await apiClient.del<{ success: true }>(`/v1/party/${partyId}`, {
        requireOrg: true,
      });

      toast.success("Party eliminada correctamente");
      return true;
    } catch (error) {
      const normalized = apiClient.normalizeApiError(error);
      toast.error(normalized.message || "Error al eliminar la party");
      return false;
    }
  }

  return {
    fetchUserParties,
    createParty,
    joinByCode,
    fetchPartyById,
    leaveParty,
    regenerateInviteCode,
    removeMember,
    deleteParty,
  };
}
