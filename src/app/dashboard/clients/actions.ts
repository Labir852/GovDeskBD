'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { encrypt } from '@/lib/encryption';

export async function getClients() {
  try {
    return await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { organizations: true, serviceProfiles: true }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw new Error('Failed to fetch clients');
  }
}

export async function getClientById(id: string) {
  try {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        organizations: true,
        serviceProfiles: {
          include: {
            category: true,
          }
        },
        _count: {
          select: { organizations: true, serviceProfiles: true }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch client:', error);
    throw new Error('Failed to fetch client');
  }
}

export async function createClient(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string | null;
  const phone = formData.get('phone') as string | null;
  const nid = formData.get('nid') as string | null;
  const emailPassword = formData.get('emailPassword') as string | null;
  const notes = formData.get('notes') as string | null;

  try {
    const encryptedPassword = emailPassword ? encrypt(emailPassword) : null;

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        nid,
        encryptedEmailPassword: encryptedPassword,
        notes,
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Client',
        entityId: newClient.id,
        details: { name: newClient.name }
      }
    });

    revalidatePath('/dashboard/clients');
    return { success: true, clientId: newClient.id };
  } catch (error) {
    console.error('Failed to create client:', error);
    return { success: false, error: 'Failed to create client' };
  }
}
