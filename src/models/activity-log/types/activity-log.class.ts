export class ActivityLog {
  constructor(
    public id: string | null,
    public userId: string,
    public action: string,
    public entity: string | null,
    public entityId: string | null,
    public changes: any,
    public ipAddress: string | null,
    public userAgent: string | null,
    public createdAt: Date | null,
  ) {}
}
