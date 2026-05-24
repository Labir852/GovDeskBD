'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCategory, deleteCategory } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const frequencyOptions = ['Monthly', 'Quarterly', 'Yearly', 'One-time'];

interface EditCategoryFormProps {
  category: {
    id: string;
    name: string;
    frequency: string;
    portalUrl?: string | null;
  };
  hasProfiles: boolean;
}

export function EditCategoryForm({ category, hasProfiles }: EditCategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [frequency, setFrequency] = useState(category.frequency);
  const [portalUrl, setPortalUrl] = useState(category.portalUrl ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    formData.set('frequency', frequency);
    formData.set('portalUrl', portalUrl);

    const result = await updateCategory(category.id, formData);
    setIsSaving(false);

    if (!result.success) {
      window.alert(result.error || 'Failed to update category.');
      return;
    }

    router.push('/dashboard/categories');
    router.refresh();
  }

  async function handleDelete() {
    if (hasProfiles) {
      window.alert('Cannot delete a category with attached service profiles.');
      return;
    }

    if (!window.confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteCategory(category.id);
    setIsDeleting(false);

    if (!result.success) {
      window.alert(result.error || 'Failed to delete category.');
      return;
    }

    router.push('/dashboard/categories');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
        <CardDescription>Update the category details or remove it if there are no linked service profiles.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="e.g., VAT, eReturn, IRC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={frequency} onValueChange={setFrequency} required>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="portalUrl">Portal URL</Label>
            <Input
              id="portalUrl"
              name="portalUrl"
              type="url"
              value={portalUrl}
              onChange={(event) => setPortalUrl(event.target.value)}
              placeholder="https://portal.example.gov.bd/login"
            />
            <p className="text-xs text-muted-foreground">Optional portal login URL for this category.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/categories">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSaving || !name || !frequency}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            <Button
              variant="destructive"
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || hasProfiles}
            >
              {isDeleting ? 'Deleting...' : 'Delete Category'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
