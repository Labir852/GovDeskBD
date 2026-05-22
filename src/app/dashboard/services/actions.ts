'use server';

import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

export async function getServiceProfiles() {
  try {
    return await prisma.serviceProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, client: { select: { name: true } } } },
        category: { select: { id: true, name: true, frequency: true } },
        _count: { select: { servicePeriods: true } }
      }
    });
  } catch (error) {
    logger.error('Failed to fetch service profiles', error);
    throw new Error('Failed to fetch service profiles');
  }
}

export async function getServiceProfileById(id: string) {
  try {
    return await prisma.serviceProfile.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        category: { select: { id: true, name: true, frequency: true } },
        servicePeriods: { orderBy: { period: 'desc' } },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch service profile', error);
    throw new Error('Failed to fetch service profile');
  }
}

export async function createServiceProfile(formData: FormData) {
  const organizationId = formData.get('organizationId') as string;
  const categoryId = formData.get('categoryId') as string;
  const portalUserId = formData.get('portalUserId') as string | null;
  const portalPassword = formData.get('portalPassword') as string | null;

  try {
    const encryptedPassword = portalPassword ? encrypt(portalPassword) : null;

    const newProfile = await prisma.serviceProfile.create({
      data: {
        organizationId,
        categoryId,
        portalUserId,
        portalEncryptedPassword: encryptedPassword,
      },
      include: {
        organization: true,
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'ServiceProfile',
        entityId: newProfile.id,
        details: { organizationId, categoryId, portalUserId },
      },
    });

    logger.info('Service profile created', { id: newProfile.id, organizationId, categoryId });
    revalidatePath('/dashboard/services');
    return { success: true, profileId: newProfile.id };
  } catch (error) {
    logger.error('Failed to create service profile', error);
    return { success: false, error: 'Failed to create service profile' };
  }
}

export async function updateServiceProfile(id: string, formData: FormData) {
  const organizationId = formData.get('organizationId') as string;
  const categoryId = formData.get('categoryId') as string;
  const portalUserId = formData.get('portalUserId') as string | null;
  const portalPassword = formData.get('portalPassword') as string | null;

  try {
    const encryptedPassword = portalPassword ? encrypt(portalPassword) : undefined;

    const updatedProfile = await prisma.serviceProfile.update({
      where: { id },
      data: {
        organizationId,
        categoryId,
        portalUserId,
        ...(encryptedPassword && { portalEncryptedPassword: encryptedPassword }),
      },
      include: {
        organization: true,
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'ServiceProfile',
        entityId: updatedProfile.id,
        details: { organizationId, categoryId, portalUserId },
      },
    });

    logger.info('Service profile updated', { id: updatedProfile.id });
    revalidatePath('/dashboard/services');
    revalidatePath(`/dashboard/services/${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Failed to update service profile', error);
    return { success: false, error: 'Failed to update service profile' };
  }
}

export async function deleteServiceProfile(id: string) {
  try {
    const profile = await prisma.serviceProfile.findUnique({ where: { id } });
    if (!profile) return { success: false, error: 'Service profile not found' };

    await prisma.serviceProfile.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'ServiceProfile',
        entityId: id,
        details: { organizationId: profile.organizationId, categoryId: profile.categoryId },
      },
    });

    logger.info('Service profile deleted', { id });
    revalidatePath('/dashboard/services');
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete service profile', error);
    return { success: false, error: 'Failed to delete service profile' };
  }
}

export async function getOrganizationsForSelect() {
  try {
    return await prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    logger.error('Failed to fetch organizations for select', error);
    throw new Error('Failed to fetch organizations');
  }
}

export async function getCategoriesForSelect() {
  try {
    return await prisma.category.findMany({
      select: { id: true, name: true, frequency: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    logger.error('Failed to fetch categories for select', error);
    throw new Error('Failed to fetch categories');
  }
}
