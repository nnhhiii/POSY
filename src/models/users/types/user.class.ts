export class User {
  constructor(
    public id: string | null,
    public username: string,
    public email: string,
    public phone: string | null,
    public passwordHash: string | null,
    public fullName: string,
    public role: string,
    public isActive: boolean = true,
    public isDeleted: boolean = false,
    public resetCode: string | null,
    public resetCodeExp: Date | null,
    public resetToken: string | null,
    public resetTokenExp: Date | null,
    public refreshTokenHash: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public deletedAt: Date | null,
  ) {}
}
