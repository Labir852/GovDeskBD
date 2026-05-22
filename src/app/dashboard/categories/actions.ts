'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { serviceProfiles: true },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function getCategoryById(id: string) {
  try {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { serviceProfiles: true },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch category:', error);
    throw new Error('Failed to fetch category');
  }
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const frequency = formData.get('frequency') as string;

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        frequency,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Category',
        entityId: newCategory.id,
        details: { name: newCategory.name, frequency: newCategory.frequency },
      },
    });

    revalidatePath('/dashboard/categories');
    return { success: true, categoryId: newCategory.id };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category. Name may already exist.' };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const frequency = formData.get('frequency') as string;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        frequency,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Category',
        entityId: updatedCategory.id,
        details: { name: updatedCategory.name, frequency: updatedCategory.frequency },
      },
    });

    revalidatePath('/dashboard/categories');
    revalidatePath(`/dashboard/categories/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category. Name may already exist.' };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if category has attached service profiles
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { serviceProfiles: true } } },
    });

    if (!category) {
      return { success: false, error: 'Category not found.' };
    }

    if (category._count.serviceProfiles > 0) {
      return {
        success: false,
        error: `Cannot delete category. ${category._count.serviceProfiles} service profile(s) are still attached.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Category',
        entityId: id,
        details: { name: category.name, frequency: category.frequency },
      },
    });

    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category.' };
  }
}
