import { Injectable } from '@nestjs/common';

import { IdentityContextService } from '../common/identity/identity-context.service';

export interface CurrentUserView {
  clerkUserId: string;
  email: string | null;
  orgId: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly identityContext: IdentityContextService) {}

  async getCurrentUser(clerkUserId: string, orgId: string | null): Promise<CurrentUserView> {
    const user = await this.identityContext.getActiveUserByClerkIdOrThrow(clerkUserId);

    return {
      clerkUserId: user.clerkUserId,
      email: null,
      orgId,
    };
  }
}
