'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getOrganizations() {
  try {
    return await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        serviceProfiles: {
          include: {
            servicePeriods: { select: { paymentAmount: true, isPaid: true } }
          }
        },
        _count: { select: { serviceProfiles: true } }
      }
    });
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    throw new Error('Failed to fetch organizations');
  }
}

export async function createOrganization(formData: FormData) {
  const clientId = formData.get('clientId') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string | null;
  const tradeLicenseNo = formData.get('tradeLicenseNo') as string | null;

  try {
    if (!clientId) {
      return { success: false, error: 'Missing clientId' };
    }
    const newOrg = await prisma.organization.create({
      data: {
        clientId,
        name,
        address,
        tradeLicenseNo,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Organization',
        entityId: newOrg.id,
        details: { name: newOrg.name, clientId }
      }
    });

    revalidatePath('/dashboard/organizations');
    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: true, orgId: newOrg.id };
  } catch (error) {
    console.error('Failed to create organization:', error);
    return { success: false, error: 'Failed to create organization' };
  }
}

export async function getClientsForSelect() {
  try {
    return await prisma.client.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch clients for select:', error);
    throw new Error('Failed to fetch clients');
  }
}

export async function getOrganizationById(id: string) {
  if (!id || id === 'undefined' || id === 'null') return null;
  try {
    return await prisma.organization.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        serviceProfiles: {
          include: {
            category: true,
            servicePeriods: { select: { paymentAmount: true, isPaid: true } },
          },
        },
        _count: {
          select: { serviceProfiles: true },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    throw new Error('Failed to fetch organization');
  }
}

export async function updateOrganization(id: string, formData: FormData) {
  const clientId = formData.get('clientId') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string | null;
  const tradeLicenseNo = formData.get('tradeLicenseNo') as string | null;

  try {
    if (!clientId) {
      return { success: false, error: 'Missing clientId' };
    }
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        clientId,
        name,
        address,
        tradeLicenseNo,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Organization',
        entityId: updatedOrg.id,
        details: { name: updatedOrg.name, clientId },
      },
    });

    revalidatePath('/dashboard/organizations');
    revalidatePath(`/dashboard/organizations/${id}`);
    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update organization:', error);
    return { success: false, error: 'Failed to update organization' };
  }
}

export async function deleteOrganization(id: string) {
  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) return { success: false, error: 'Organization not found' };

    await prisma.organization.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Organization',
        entityId: id,
        details: { name: org.name, clientId: org.clientId },
      },
    });

    revalidatePath('/dashboard/organizations');
    revalidatePath(`/dashboard/clients/${org.clientId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete organization:', error);
    return { success: false, error: 'Failed to delete organization' };
  }
}
