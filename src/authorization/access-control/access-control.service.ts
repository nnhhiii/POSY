import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../common/enums';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

interface IsAuthorizedParams {
  currentRole: Role;
  requiredRole: Role;
}

@Injectable()
export class AccessControlService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  private hierarchies: Array<Map<string, number>> = [];

  constructor() {
    this.buildRoles([Role.STAFF, Role.MANAGER, Role.ADMIN]);
    this.buildRoles([Role.KITCHEN, Role.ADMIN]);
    this.buildRoles([Role.MANAGER, Role.ADMIN]);
  }

  public isAuthorized({ currentRole, requiredRole }: IsAuthorizedParams) {
    this.logger.debug(
      `AccessControl - Checking if ${currentRole} is authorized for ${requiredRole}`,
    );
    this.logger.debug(
      `AccessControl - Hierarchies count: ${this.hierarchies.length}`,
    );

    for (let i = 0; i < this.hierarchies.length; i++) {
      const hierarchy = this.hierarchies[i];
      this.logger.debug(
        `AccessControl - Hierarchy ${i}: ${JSON.stringify(Array.from(hierarchy.entries()))}`,
      );

      const priority = hierarchy.get(currentRole);
      const requiredPriority = hierarchy.get(requiredRole);

      this.logger.debug(
        `AccessControl - Current role priority: ${priority}, Required role priority: ${requiredPriority}`,
      );

      if (priority && requiredPriority && priority >= requiredPriority) {
        this.logger.debug(
          `AccessControl - Authorization granted in hierarchy ${i}`,
        );
        return true;
      }
    }

    this.logger.debug('AccessControl - Authorization denied');
    return false;
  }

  private buildRoles(roles: Role[]) {
    const hierarchy: Map<string, number> = new Map<string, number>();
    let priority = 1;

    roles.forEach((role) => {
      hierarchy.set(role, priority);
      priority++;
    });
    // Push the hierarchy to the outer one
    this.hierarchies.push(hierarchy);
  }
}
