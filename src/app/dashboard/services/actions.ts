'use server';

import { prisma } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

export async function getServiceProfiles() {
  try {
    const profiles = await prisma.serviceProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, client: { select: { name: true } } } },
        category: { select: { id: true, name: true, frequency: true } },
        servicePeriods: { 
          select: { id: true, period: true, paymentAmount: true, isPaid: true, status: true, periodData: true },
          orderBy: { period: 'desc' },
          take: 2 // Only load last 2 periods for current and previous month
        },
        _count: { select: { servicePeriods: true } }
      }
    });

    return profiles.map(profile => {
      const decryptedPassword = profile.portalEncryptedPassword 
        ? decrypt(profile.portalEncryptedPassword) 
        : null;
      return {
        ...profile,
        portalDecryptedPassword: decryptedPassword,
      };
    });
  } catch (error) {
    logger.error('Failed to fetch service profiles', error);
    throw new Error('Failed to fetch service profiles');
  }
}

export async function getServiceProfileById(id: string) {
  if (!id || id === 'undefined' || id === 'null') {
    return null;
  }

  try {
    const profile = await prisma.serviceProfile.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        category: { select: { id: true, name: true, frequency: true } },
        servicePeriods: { orderBy: { period: 'desc' } },
      },
    });
    
    if (!profile) return null;
    
    // Decrypt the password if it exists
    const decryptedPassword = profile.portalEncryptedPassword 
      ? decrypt(profile.portalEncryptedPassword) 
      : null;
    
    return {
      ...profile,
      portalDecryptedPassword: decryptedPassword,
    };
  } catch (error) {
    logger.error('Failed to fetch service profile', error);
    return null;
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

export async function getOrganizationsForSelect(clientId?: string) {
  try {
    return await prisma.organization.findMany({
      where: clientId ? { clientId } : undefined,
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

export async function updateServicePeriodStatus(periodId: string, status: string) {
  try {
    const updated = await prisma.servicePeriod.update({
      where: { id: periodId },
      data: { status },
      include: {
        serviceProfile: true,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_STATUS',
        entity: 'ServicePeriod',
        entityId: periodId,
        details: { status },
      },
    });

    logger.info('Service period status updated', { id: periodId, status });
    revalidatePath('/dashboard/services');
    if (updated.serviceProfileId) {
      revalidatePath(`/dashboard/services/${updated.serviceProfileId}`);
    }
    return { success: true };
  } catch (error) {
    logger.error('Failed to update service period status', error);
    return { success: false, error: 'Failed to update service period status' };
  }
}

export async function updateServicePeriodAmount(periodId: string, paymentAmount: number) {
  try {
    const updated = await prisma.servicePeriod.update({
      where: { id: periodId },
      data: { paymentAmount },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_AMOUNT',
        entity: 'ServicePeriod',
        entityId: periodId,
        details: { paymentAmount },
      },
    });

    logger.info('Service period amount updated', { id: periodId, paymentAmount });
    revalidatePath('/dashboard/services');
    if (updated.serviceProfileId) {
      revalidatePath(`/dashboard/services/${updated.serviceProfileId}`);
    }
    return { success: true };
  } catch (error) {
    logger.error('Failed to update service period amount', error);
    return { success: false, error: 'Failed to update service period amount' };
  }
}

export async function updateServicePeriodDataField(periodId: string, fieldName: string, value: string) {
  try {
    const period = await prisma.servicePeriod.findUnique({
      where: { id: periodId },
      select: { periodData: true, serviceProfileId: true }
    });

    if (!period) return { success: false, error: 'Service period not found' };

    const currentData = (period.periodData as Record<string, any>) || {};
    const updatedData = {
      ...currentData,
      [fieldName]: value
    };

    await prisma.servicePeriod.update({
      where: { id: periodId },
      data: {
        periodData: updatedData
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PERIOD_DATA',
        entity: 'ServicePeriod',
        entityId: periodId,
        details: { fieldName, value },
      },
    });

    logger.info('Service period JSON field updated', { id: periodId, fieldName, value });
    revalidatePath('/dashboard/services');
    if (period.serviceProfileId) {
      revalidatePath(`/dashboard/services/${period.serviceProfileId}`);
    }
    return { success: true };
  } catch (error) {
    logger.error('Failed to update service period JSON data field', error);
    return { success: false, error: 'Failed to update field value' };
  }
}
