import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ReservationsService } from '../reservations/services/reservations.service';
import { SetMetadata } from '@nestjs/common';

@Injectable()
export class InitializationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly reservationsService: ReservationsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isInitializationRoute = this.reflector.get<boolean>(
      'isInitializationRoute',
      context.getHandler(),
    );
    if (isInitializationRoute) {
      return true;
    }

    if (!this.reservationsService.isTablesInitialized()) {
      throw new BadRequestException('Tables have not been initialized');
    }

    return true;
  }
}

export const SkipInitializationCheck = () =>
  SetMetadata('isInitializationRoute', true);
