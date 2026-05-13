import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, type Ref } from 'vue';

import type { OrganizationMembership } from '../../../app/composables/useOrganizations';
import { useOrganizations } from '../../../app/composables/useOrganizations';

const mockGet = vi.fn();
const mockPost = vi.fn();
const setActiveOrgIdMock = vi.fn();
const clearActiveOrgIdMock = vi.fn();
const activeOrgIdRef = ref<string | null>(null);

vi.mock('../../../app/composables/useApiClient', () => ({
  useApiClient: () => ({
    get: mockGet,
    post: mockPost,
  }),
}));

vi.mock('../../../app/composables/useOrganizationContext', () => ({
  useOrganizationContext: () => ({
    activeOrgId: activeOrgIdRef,
    setActiveOrgId: setActiveOrgIdMock,
    clearActiveOrgId: clearActiveOrgIdMock,
  }),
}));

describe('useOrganizations', () => {
  const stateMap = new Map<string, Ref<unknown>>();

  const memberships: OrganizationMembership[] = [
    {
      organizationId: 'org-owner',
      clerkOrgId: 'clerk-org-owner',
      slug: 'team-owner',
      name: 'Equipo Owner',
      role: 'owner',
    },
    {
      organizationId: 'org-member',
      clerkOrgId: 'clerk-org-member',
      slug: 'team-member',
      name: 'Equipo Member',
      role: 'member',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    stateMap.clear();
    activeOrgIdRef.value = null;

    vi.stubGlobal('useState', <T>(key: string, init?: () => T): Ref<T> => {
      if (!stateMap.has(key)) {
        stateMap.set(key, ref(init ? init() : undefined));
      }

      return stateMap.get(key) as Ref<T>;
    });
  });

  it('conserva la org activa cuando sigue existiendo en memberships', async () => {
    activeOrgIdRef.value = 'org-member';
    mockGet.mockResolvedValue(memberships);

    const organizations = useOrganizations();
    const result = await organizations.initializeActiveOrganization();

    expect(result).toEqual(memberships);
    expect(setActiveOrgIdMock).not.toHaveBeenCalled();
    expect(clearActiveOrgIdMock).not.toHaveBeenCalled();
  });

  it('setea la primera organización cuando la org activa no es válida', async () => {
    activeOrgIdRef.value = 'org-inexistente';
    mockGet.mockResolvedValue(memberships);

    const organizations = useOrganizations();
    await organizations.initializeActiveOrganization();

    expect(setActiveOrgIdMock).toHaveBeenCalledWith('org-owner');
    expect(clearActiveOrgIdMock).not.toHaveBeenCalled();
  });

  it('si backend no está disponible, hace fallback a lista vacía', async () => {
    mockGet.mockRejectedValue(new Error('Failed to fetch'));

    const organizations = useOrganizations();
    const result = await organizations.fetchMyOrganizations();

    expect(result).toEqual([]);
    expect(organizations.items.value).toEqual([]);
  });

  it('bootstrappea organización personal cuando onboarding no tiene org activa', async () => {
    const bootstrappedMembership: OrganizationMembership = {
      organizationId: 'org-personal',
      clerkOrgId: null,
      slug: 'aventura-de-nico-user12',
      name: 'Aventura de Nico',
      role: 'owner',
    };

    mockPost.mockResolvedValue(bootstrappedMembership);

    const organizations = useOrganizations();
    const result = await organizations.bootstrapPersonalOrganization();

    expect(result).toEqual(bootstrappedMembership);
    expect(organizations.items.value).toEqual([bootstrappedMembership]);
    expect(mockPost).toHaveBeenCalledWith('/v1/organizations/bootstrap-personal');
  });
});
