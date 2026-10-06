import bcrypt from 'bcryptjs';
import { User, Role } from '@/models';
import { ALL_PERMISSIONS } from '@/lib/permissions';

let adminCheckPromise: Promise<void> | null = null;

export async function ensureAdminUser(): Promise<void> {
  // Prevent parallel/duplicate executions if called simultaneously
  if (adminCheckPromise) {
    return adminCheckPromise;
  }

  adminCheckPromise = (async () => {
    try {
      // 1. Ensure ADMIN Role exists
      let adminRole = await Role.findOne({ name: 'ADMIN' });
      if (!adminRole) {
        adminRole = await Role.create({
          name: 'ADMIN',
          description: 'Super Administrator with full unrestricted access',
          permissions: ALL_PERMISSIONS.map((p) => p.id),
          isSystemRole: true,
        });
        console.log('🛡️ [System] ADMIN role created.');
      }

      // 2. Check if an Admin user already exists (by role or by default email)
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@restra.com').toLowerCase().trim();
      const existingAdmin = await User.findOne({
        $or: [{ role: 'ADMIN' }, { email: adminEmail }],
      });

      if (existingAdmin) {
        // Admin user exists, skip creation
        return;
      }

      // 3. Create default Admin user if not present
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        roleId: adminRole._id,
        phone: '9876543210',
        isActive: true,
        avatar: '/images/staff/admin-avatar.png',
      });

      console.log(`👑 [System] Admin user automatically generated: ${adminEmail} (password: ${adminPassword})`);
    } catch (error) {
      console.error('⚠️ [System] Error in ensureAdminUser:', error);
    } finally {
      adminCheckPromise = null;
    }
  })();

  return adminCheckPromise;
}
