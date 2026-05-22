'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

export async function getServicePeriods(serviceProfileId: string) {
  try {
    return await prisma.servicePeriod.findMany({
      where: { serviceProfileId },
      orderBy: { period: 'desc' },
    });
  } catch (error) {
    logger.error('Failed to fetch service periods', error);
    throw new Error('Failed to fetch service periods');
  }
}

export async function createServicePeriod(formData: FormData) {
  const serviceProfileId = formData.get('serviceProfileId') as string;
  const period = formData.get('period') as string;
  const paymentAmount = parseFloat(formData.get('paymentAmount') as string) || 0;
  const isPaid = formData.get('isPaid') === 'true';
  const status = formData.get('status') as string || 'PENDING';
  const periodData = formData.get('periodData') as string;

  try {
    const newPeriod = await prisma.servicePeriod.create({
      data: {
        serviceProfileId,
        period,
        paymentAmount,
        isPaid,
        status,
        periodData: periodData ? JSON.parse(periodData) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'ServicePeriod',
        entityId: newPeriod.id,
        details: { serviceProfileId, period, paymentAmount },
      },
    });

    logger.info('Service period created', { id: newPeriod.id, serviceProfileId });
    revalidatePath(`/dashboard/services/${serviceProfileId}`);
    return { success: true, periodId: newPeriod.id };
  } catch (error) {
    logger.error('Failed to create service period', error);
    return { success: false, error: 'Failed to create service period' };
  }
}

export async function updateServicePeriod(id: string, formData: FormData) {
  const period = formData.get('period') as string;
  const paymentAmount = parseFloat(formData.get('paymentAmount') as string) || 0;
  const isPaid = formData.get('isPaid') === 'true';
  const status = formData.get('status') as string || 'PENDING';
  const periodData = formData.get('periodData') as string;

  try {
    const updatedPeriod = await prisma.servicePeriod.update({
      where: { id },
      data: {
        period,
        paymentAmount,
        isPaid,
        status,
        periodData: periodData ? JSON.parse(periodData) : null,
      },
      include: { serviceProfile: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'ServicePeriod',
        entityId: id,
        details: { period, paymentAmount, isPaid },
      },
    });

    logger.info('Service period updated', { id });
    revalidatePath(`/dashboard/services/${updatedPeriod.serviceProfileId}`);
    return { success: true };
  } catch (error) {
    logger.error('Failed to update service period', error);
    return { success: false, error: 'Failed to update service period' };
  }
}

export async function deleteServicePeriod(id: string) {
  try {
    const period = await prisma.servicePeriod.findUnique({ where: { id } });
    if (!period) return { success: false, error: 'Service period not found' };

    await prisma.servicePeriod.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'ServicePeriod',
        entityId: id,
        details: { period: period.period, serviceProfileId: period.serviceProfileId },
      },
    });

    logger.info('Service period deleted', { id });
    revalidatePath(`/dashboard/services/${period.serviceProfileId}`);
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete service period', error);
    return { success: false, error: 'Failed to delete service period' };
  }
}
