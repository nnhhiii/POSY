import { PrismaClient } from '@prisma/client';
import { hash } from '../../common/utilities/hash.util';

export async function seedAdmin(prisma: PrismaClient) {
  const exists = await prisma.user.findUnique({
    where: { username: 'admin' },
  });
  if (exists) {
    return;
  }

  const email = 'admin@posy.vn';
  const username = 'admin';
  const full_name = 'POSY';
  const role = 'ADMIN';
  const password_hash = await hash('admin');

  await prisma.user.create({
    data: {
      email,
      username,
      full_name,
      role,
      password_hash,
    },
  });
}

export async function seedStaff(prisma: PrismaClient) {
  const exists = await prisma.user.findUnique({
    where: { username: 'staff' },
  });
  if (exists) {
    return;
  }

  const email = 'staff@posy.vn';
  const username = 'staff';
  const full_name = 'STAFF_01';
  const role = 'STAFF';
  const password_hash = await hash('staff');

  await prisma.user.create({
    data: {
      email,
      username,
      full_name,
      role,
      password_hash,
    },
  });
}
