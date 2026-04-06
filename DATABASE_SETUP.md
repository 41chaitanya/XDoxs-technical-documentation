# XDoxs Authentication System

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student', -- 'super_admin', 'instructor', 'student'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Sessions Table (Optional - for JWT blacklist)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## Roles & Permissions

### Super Admin
- Full system access
- Can assign instructor role
- Can manage all users
- Can manage all docs
- Manually added to database

### Instructor
- Can create/edit docs
- Can view students
- Assigned by Super Admin
- Cannot create other instructors

### Student
- Can register/login
- Can view docs
- Can save favorites (future)
- Public registration

## Environment Variables

Create `.env` file:
```
# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here

# Database (if using external DB)
DATABASE_URL=postgresql://user:password@localhost:5432/xdoxs

# Super Admin Email (for initial setup)
SUPER_ADMIN_EMAIL=admin@xdoxs.com
```

## Initial Super Admin Setup

Run this SQL to create first super admin:
```sql
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@xdoxs.com',
  '$2a$10$...',  -- bcrypt hash of password
  'Super Admin',
  'super_admin'
);
```

Or use the setup script (coming next).

## API Endpoints

### Public (No Auth Required)
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Login (all roles)
- `GET /docs/*` - View documentation

### Student Only
- `GET /api/user/profile` - Get own profile
- `PUT /api/user/profile` - Update own profile

### Instructor Only
- `POST /api/docs/create` - Create documentation
- `PUT /api/docs/:id` - Edit documentation

### Super Admin Only
- `POST /api/admin/assign-instructor` - Assign instructor role
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user

## Next Steps

1. Choose database: Supabase (easy) or PostgreSQL (self-hosted)
2. Create database tables
3. Implement auth API endpoints
4. Create login/register pages
5. Add protected routes middleware
