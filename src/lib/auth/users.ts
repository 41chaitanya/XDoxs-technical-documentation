// Temporary in-memory user storage
// TODO: Replace with actual database (Supabase/PostgreSQL)

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'super_admin' | 'instructor' | 'student';
  isActive: boolean;
  createdAt: Date;
}

// In-memory storage (will be replaced with database)
const users: Map<string, User> = new Map();

// Initialize with a super admin (for testing)
const SUPER_ADMIN_EMAIL = 'admin@xdoxs.com';
const SUPER_ADMIN_PASSWORD_HASH = '$2a$10$rZ5qH8vK9X.YvZ5qH8vK9O7Z5qH8vK9X.YvZ5qH8vK9O7Z5qH8vK9'; // "admin123"

users.set(SUPER_ADMIN_EMAIL, {
  id: 'super-admin-1',
  email: SUPER_ADMIN_EMAIL,
  passwordHash: SUPER_ADMIN_PASSWORD_HASH,
  fullName: 'Super Admin',
  role: 'super_admin',
  isActive: true,
  createdAt: new Date(),
});

export async function createUser(data: {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: 'student' | 'instructor';
}): Promise<User> {
  if (users.has(data.email)) {
    throw new Error('User already exists');
  }

  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: data.email,
    passwordHash: data.passwordHash,
    fullName: data.fullName,
    role: data.role || 'student',
    isActive: true,
    createdAt: new Date(),
  };

  users.set(data.email, user);
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return users.get(email) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  for (const user of users.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
}

export async function updateUserRole(userId: string, role: 'instructor' | 'student'): Promise<User | null> {
  const user = await findUserById(userId);
  if (!user) return null;
  
  user.role = role;
  users.set(user.email, user);
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  return Array.from(users.values());
}
