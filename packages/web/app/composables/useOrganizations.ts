export interface OrganizationMembership {
  organizationId: string;
  clerkOrgId: string | null;
  slug: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
}

export function useOrganizations() {
  const apiClient = useApiClient();
  const organizationContext = useOrganizationContext();

  const items = useState<OrganizationMembership[]>('organizations:items', () => []);
  const loading = useState<boolean>('organizations:loading', () => false);

  async function fetchMyOrganizations(): Promise<OrganizationMembership[]> {
    loading.value = true;

    try {
      const data = await apiClient.get<OrganizationMembership[]>('/v1/organizations/me');
      items.value = data;
      return data;
    } catch {
      items.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function initializeActiveOrganization(): Promise<OrganizationMembership[]> {
    const memberships = await fetchMyOrganizations();
    const currentActiveOrgId = organizationContext.activeOrgId.value;

    const hasValidActiveOrg =
      !!currentActiveOrgId &&
      memberships.some((membership) => membership.organizationId === currentActiveOrgId);

    if (hasValidActiveOrg) {
      return memberships;
    }

    const firstMembership = memberships[0];

    if (firstMembership) {
      organizationContext.setActiveOrgId(firstMembership.organizationId);
      return memberships;
    }

    organizationContext.clearActiveOrgId();
    return memberships;
  }

  async function bootstrapPersonalOrganization(): Promise<OrganizationMembership> {
    const organization = await apiClient.post<OrganizationMembership>(
      '/v1/organizations/bootstrap-personal',
    );

    const existingIndex = items.value.findIndex(
      (membership) => membership.organizationId === organization.organizationId,
    );

    if (existingIndex >= 0) {
      items.value.splice(existingIndex, 1, organization);
    } else {
      items.value.unshift(organization);
    }

    return organization;
  }

  return {
    items,
    loading,
    fetchMyOrganizations,
    initializeActiveOrganization,
    bootstrapPersonalOrganization,
  };
}
