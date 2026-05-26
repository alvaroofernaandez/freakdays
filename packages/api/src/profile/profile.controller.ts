import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import {
  type AddProfileExpInput,
  type ConfirmProfileMediaInput,
  type RequestUploadUrlInput,
  type SyncClerkProfileInput,
  type UpdateProfileInput,
  ProfileService,
} from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('v1/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMyProfile(@Req() request: Request) {
    const user = this.getRequestUser(request);

    return this.profileService.getMyProfile(user.sub);
  }

  @Put('me')
  updateMyProfile(@Req() request: Request, @Body() body: UpdateProfileInput) {
    const user = this.getRequestUser(request);

    return this.profileService.updateMyProfile(user.sub, body);
  }

  @Patch('me')
  patchMyProfile(@Req() request: Request, @Body() body: UpdateProfileInput) {
    const user = this.getRequestUser(request);

    return this.profileService.updateMyProfile(user.sub, body);
  }

  /**
   * Client-assist backfill: fills Profile.displayName / Profile.avatarUrl from Clerk
   * identity data when those fields are currently null. Only the caller's own profile
   * is affected (authz via JWT). Already-set values are never overwritten.
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('me/sync-clerk')
  syncClerkProfile(@Req() request: Request, @Body() body: SyncClerkProfileInput) {
    const user = this.getRequestUser(request);

    return this.profileService.syncClerkProfile(user.sub, body);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('me/exp')
  addExp(@Req() request: Request, @Body() body: AddProfileExpInput) {
    const user = this.getRequestUser(request);

    return this.profileService.addExp(user.sub, body);
  }

  @Post('me/avatar/upload-url')
  requestAvatarUploadUrl(@Req() request: Request, @Body() body: RequestUploadUrlInput) {
    const user = this.getRequestUser(request);

    return this.profileService.requestAvatarUploadUrl(user.sub, body);
  }

  @Post('me/banner/upload-url')
  requestBannerUploadUrl(@Req() request: Request, @Body() body: RequestUploadUrlInput) {
    const user = this.getRequestUser(request);

    return this.profileService.requestBannerUploadUrl(user.sub, body);
  }

  @Post('me/avatar/confirm')
  confirmAvatarUpload(@Req() request: Request, @Body() body: ConfirmProfileMediaInput) {
    const user = this.getRequestUser(request);

    return this.profileService.confirmAvatarUpload(user.sub, body);
  }

  @Post('me/banner/confirm')
  confirmBannerUpload(@Req() request: Request, @Body() body: ConfirmProfileMediaInput) {
    const user = this.getRequestUser(request);

    return this.profileService.confirmBannerUpload(user.sub, body);
  }

  @Delete('me/avatar')
  deleteAvatar(@Req() request: Request) {
    const user = this.getRequestUser(request);

    return this.profileService.deleteAvatar(user.sub);
  }

  @Delete('me/banner')
  deleteBanner(@Req() request: Request) {
    const user = this.getRequestUser(request);

    return this.profileService.deleteBanner(user.sub);
  }

  private getRequestUser(request: Request): { sub: string } {
    const sub = request.user?.sub;

    if (!sub) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return { sub };
  }
}
