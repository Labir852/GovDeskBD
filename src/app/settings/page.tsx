import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createTaxFiscalYear, getAllTaxFiscalYears } from '@/app/dashboard/tax-calculator/actions';
import TaxSlabEditor from '@/components/TaxSlabEditor';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from 'react';
import { Select } from '@/components/ui/select';

export const metadata = {
  title: 'Settings | GovDesk Admin',
};

const formatAmount = (amount: number | null | undefined) =>
  new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'BDT',
  }).format(amount ?? 0);

const getRedirectPath = (formData: FormData) =>
  String(formData.get('redirectPath') || '/settings');

async function updateSettings(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const redirectPath = getRedirectPath(formData);

  if (!name || !email) {
    throw new Error('Name and email are required.');
  }

  if (password && password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const updateData: { name: string; email: string; password?: string } = {
    name,
    email,
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id: user.sub },
    data: updateData,
  });

  revalidatePath(redirectPath);
  redirect(`${redirectPath}?updated=1`);
}

async function createUserAccount(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Only admin users can create portal accounts.');
  }

  const name = String(formData.get('newName') || '').trim();
  const email = String(formData.get('newEmail') || '').trim();
  const role = String(formData.get('newRole') || 'STAFF');
  const password = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('newConfirmPassword') || '');
  const redirectPath = getRedirectPath(formData);

  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required for new accounts.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role === 'ADMIN' ? 'ADMIN' : 'STAFF',
    },
  });

  revalidatePath(redirectPath);
  redirect(`${redirectPath}?created=1`);
}

async function seedDefaultAdmin(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Only admin users can seed portal data.');
  }

  const redirectPath = getRedirectPath(formData);
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@govdeskbd.com' },
    update: {
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Super Admin',
      email: 'admin@govdeskbd.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  revalidatePath(redirectPath);
  redirect(`${redirectPath}?seeded=default`);
}

async function seedSampleData(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Only admin users can seed portal data.');
  }

  const redirectPath = getRedirectPath(formData);

  const categories = [
    { name: 'VAT', frequency: 'Monthly' },
    { name: 'eReturn', frequency: 'Yearly' },
    { name: 'Trade License', frequency: 'Yearly' },
    { name: 'IRC', frequency: 'Yearly' },
  ];

  const categoryRecords = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: { frequency: category.frequency },
        create: category,
      }),
    ),
  );

  const sampleClient = await prisma.client.upsert({
    where: { id: 'demo-client-id' },
    update: {
      name: 'Demo Client',
      email: 'demo-client@govdeskbd.com',
      phone: '01700000000',
    },
    create: {
      id: 'demo-client-id',
      name: 'Demo Client',
      email: 'demo-client@govdeskbd.com',
      phone: '01700000000',
      nid: '1234567890',
      notes: 'Sample client created by portal settings.',
    },
  });

  const sampleOrg = await prisma.organization.upsert({
    where: { id: 'demo-organization-id' },
    update: {
      name: 'Demo Organization',
      address: 'Dhaka, Bangladesh',
      tradeLicenseNo: 'DL-2026-0001',
    },
    create: {
      id: 'demo-organization-id',
      clientId: sampleClient.id,
      name: 'Demo Organization',
      address: 'Dhaka, Bangladesh',
      tradeLicenseNo: 'DL-2026-0001',
    },
  });

  const vatCategory = categoryRecords.find((category) => category.name === 'VAT');
  if (vatCategory) {
    const serviceProfile = await prisma.serviceProfile.upsert({
      where: { id: 'demo-service-profile-id' },
      update: {
        organizationId: sampleOrg.id,
        categoryId: vatCategory.id,
        portalUserId: 'demo-user',
        portalEmail: 'demo@portal.govdeskbd.com',
      },
      create: {
        id: 'demo-service-profile-id',
        organizationId: sampleOrg.id,
        categoryId: vatCategory.id,
        portalUserId: 'demo-user',
        portalEmail: 'demo@portal.govdeskbd.com',
      },
    });

    await prisma.servicePeriod.upsert({
      where: { id: 'demo-period-id' },
      update: {
        paymentAmount: 12000,
        isPaid: false,
        period: new Date().toISOString().slice(0, 7),
        status: 'Pending',
      },
      create: {
        id: 'demo-period-id',
        serviceProfileId: serviceProfile.id,
        period: new Date().toISOString().slice(0, 7),
        paymentAmount: 12000,
        isPaid: false,
        status: 'Pending',
      },
    });
  }

  revalidatePath(redirectPath);
  redirect(`${redirectPath}?seeded=demo`);
}

async function clearDatabaseAndSeed(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Only admin users can clear and re-seed the database.');
  }

  const redirectPath = getRedirectPath(formData);
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.$transaction([
    prisma.taxSlab.deleteMany(),
    prisma.taxFiscalYear.deleteMany(),
    prisma.servicePeriod.deleteMany(),
    prisma.serviceProfile.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.client.deleteMany(),
    prisma.category.deleteMany(),
    prisma.auditLog.deleteMany(),
  ]);

  await prisma.user.upsert({
    where: { email: 'admin@govdeskbd.com' },
    update: {
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Super Admin',
      email: 'admin@govdeskbd.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const categories = [
    { name: 'VAT', frequency: 'Monthly' },
    { name: 'eReturn', frequency: 'Yearly' },
    { name: 'Trade License', frequency: 'Yearly' },
    { name: 'IRC', frequency: 'Yearly' },
  ];

  const categoryRecords = await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: category,
      }),
    ),
  );

  const sampleClient = await prisma.client.create({
    data: {
      id: 'demo-client-id',
      name: 'Demo Client',
      email: 'demo-client@govdeskbd.com',
      phone: '01700000000',
      nid: '1234567890',
      notes: 'Sample client created by portal settings.',
    },
  });

  const sampleOrg = await prisma.organization.create({
    data: {
      id: 'demo-organization-id',
      clientId: sampleClient.id,
      name: 'Demo Organization',
      address: 'Dhaka, Bangladesh',
      tradeLicenseNo: 'DL-2026-0001',
    },
  });

  const vatCategory = categoryRecords.find((category) => category.name === 'VAT');
  if (vatCategory) {
    const serviceProfile = await prisma.serviceProfile.create({
      data: {
        id: 'demo-service-profile-id',
        organizationId: sampleOrg.id,
        categoryId: vatCategory.id,
        portalUserId: 'demo-user',
        portalEmail: 'demo@portal.govdeskbd.com',
      },
    });

    await prisma.servicePeriod.create({
      data: {
        id: 'demo-period-id',
        serviceProfileId: serviceProfile.id,
        period: new Date().toISOString().slice(0, 7),
        paymentAmount: 12000,
        isPaid: false,
        status: 'Pending',
      },
    });
  }

  revalidatePath(redirectPath);
  redirect(`${redirectPath}?seeded=reset`);
}

async function getPortalUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

async function getFiscalYears() {
  return getAllTaxFiscalYears();
}

export async function createFiscalYearAction(formData: FormData) {
  'use server';

  await createTaxFiscalYear(formData);
}

type SettingsContentProps = {
  basePath: string;
  searchParams?: { updated?: string; created?: string; seeded?: string };
};

export async function SettingsContent({ basePath, searchParams }: SettingsContentProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const users = await getPortalUsers();
  const fiscalYears = await getFiscalYears();
  const updated = searchParams?.updated === '1';
  const created = searchParams?.created === '1';
  const seededDefault = searchParams?.seeded === 'default';
  const seededDemo = searchParams?.seeded === 'demo';
  const seededReset = searchParams?.seeded === 'reset';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Portal settings</p>
        <h1 className="text-3xl font-bold tracking-tight">Manage your portal and users</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Update account details, create portal users, and seed starter portal data from here.
        </p>
      </div>

      {(updated || created || seededDefault || seededDemo) && (
        <div className="space-y-2">
          {updated ? (
            <div className="rounded-lg border bg-emerald-50 p-4 text-emerald-700">Your settings were updated successfully.</div>
          ) : null}
          {created ? (
            <div className="rounded-lg border bg-sky-50 p-4 text-sky-700">A new portal account was created successfully.</div>
          ) : null}
          {seededDefault ? (
            <div className="rounded-lg border bg-amber-50 p-4 text-amber-700">Default admin account was seeded. Use admin@govdeskbd.com / Admin@123.</div>
          ) : null}
          {seededDemo ? (
            <div className="rounded-lg border bg-amber-50 p-4 text-amber-700">Demo portal data has been seeded.</div>
          ) : null}
          {seededReset ? (
            <div className="rounded-lg border bg-emerald-50 p-4 text-emerald-700">All domain records were cleared and the portal seed data was initialized.</div>
          ) : null}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="space-y-6">
            <input type="hidden" name="redirectPath" value={basePath} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" defaultValue={user.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" defaultValue={user.email} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" name="password" type="password" placeholder="Leave blank to keep current" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm new password" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portal accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.role === 'ADMIN' ? (
            <form action={createUserAccount} className="space-y-6">
              <input type="hidden" name="redirectPath" value={basePath} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newName">Name</Label>
                  <Input id="newName" name="newName" placeholder="New user name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmail">Email</Label>
                  <Input id="newEmail" name="newEmail" type="email" placeholder="user@example.com" required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newRole">Role</Label>
                  <select id="newRole" name="newRole" className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary">
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password</Label>
                  <Input id="newPassword" name="newPassword" type="password" placeholder="Set a password" required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newConfirmPassword">Confirm password</Label>
                  <Input id="newConfirmPassword" name="newConfirmPassword" type="password" placeholder="Confirm password" required />
                </div>
                <div className="flex items-end justify-end">
                  <Button type="submit">Create account</Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
              Only admin users can create new portal accounts.
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((portalUser) => (
                  <tr key={portalUser.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{portalUser.name}</td>
                    <td className="px-4 py-3">{portalUser.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={portalUser.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {portalUser.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(portalUser.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiscal year & tax slab rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">FY</th>
                  <th className="px-4 py-3 text-left font-semibold">Label</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fiscalYears.map((year: { id: Key | null | undefined; year: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; label: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; isActive: any; }) => (
                  <tr key={year.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{year.year}</td>
                    <td className="px-4 py-3">{year.label}</td>
                    <td className="px-4 py-3">
                      <Badge variant={year.isActive ? 'default' : 'secondary'}>
                        {year.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={createFiscalYearAction} className="space-y-6">
            <input type="hidden" name="redirectPath" value={basePath} />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year">Fiscal year</Label>
                <Input id="year" name="year" placeholder="2027-2028" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" placeholder="FY 2027-28" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Tax slab description" />
              </div>
            </div>

            <TaxSlabEditor />

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Add fiscal year rule</Button>
              <Badge variant="outline">আপনার কর নীতিকে নতুন অর্থবছর অনুযায়ী অ্যাড করুন</Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portal utilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.role === 'ADMIN' ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <form action={seedDefaultAdmin}>
                <input type="hidden" name="redirectPath" value={basePath} />
                <Button type="submit" variant="outline" className="w-full">
                  Seed default admin
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Creates or resets the default admin user with email admin@govdeskbd.com and password Admin@123.
                </p>
              </form>
              <form action={seedSampleData}>
                <input type="hidden" name="redirectPath" value={basePath} />
                <Button type="submit" variant="outline" className="w-full">
                  Seed demo data
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Adds sample categories, a demo client, organization, service profile, and a billing period.
                </p>
              </form>
              <form action={clearDatabaseAndSeed}>
                <input type="hidden" name="redirectPath" value={basePath} />
                <Button type="submit" variant="destructive" className="w-full">
                  Clear database & seed
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Remove all application records and reinitialize starter seed data while keeping admin login.
                </p>
              </form>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
              Admin access is required to run portal utility actions.
            </div>
          )}

          <div className="rounded-lg border bg-muted p-4">
            <p className="text-sm font-medium">Portal health</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Accounts</p>
                <p className="mt-1 text-lg font-semibold">{users.length}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Role</p>
                <p className="mt-1 text-lg font-semibold">{user.role}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Signed in as</p>
                <p className="mt-1 text-lg font-semibold">{user.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { updated?: string; created?: string; seeded?: string };
}) {
  return <SettingsContent basePath="/settings" searchParams={searchParams} />;
}
