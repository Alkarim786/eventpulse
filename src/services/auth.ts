export interface AuthSession {
  id: string;
  role: 'HEAD_ADMIN' | 'STAFF_COORDINATOR' | 'STUDENT';
  name: string;
  identifier: string; // email, staff ID, or roll number
  department: string;
  designationOrBatch: string;
  loginTime: string;
  avatarUrl?: string;
}

const STORAGE_KEYS = {
  ACTIVE_SESSION: 'auth_active_session',
  HEAD: 'auth_session_head',
  STAFF: 'auth_session_staff',
  STUDENT: 'auth_session_student',
};

// Demo Preset Accounts
export const DEMO_USERS = {
  HEAD: {
    identifier: 'head.iqac@institution.edu',
    name: 'Dr. K. R. Ramanathan',
    department: 'IQAC / Directorate',
    designationOrBatch: 'Director of IQAC & Principal',
    password: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  STAFF: {
    identifier: 'dr.swaminathan@institution.edu',
    name: 'Dr. Priya Swaminathan',
    department: 'CSE',
    designationOrBatch: 'Associate Professor & Event Coordinator',
    password: 'staff',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  STUDENTS: [
    {
      rollNo: '24CS101',
      name: 'Aarav Patel',
      department: 'CSE',
      batch: '2024 - 2028',
      batchPrefix: '24CS',
      pin: '1234',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    },
    {
      rollNo: '23IT042',
      name: 'Ananya Rao',
      department: 'IT',
      batch: '2023 - 2027',
      batchPrefix: '23IT',
      pin: '1234',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    },
    {
      rollNo: '22EC015',
      name: 'Rohan Verma',
      department: 'ECE',
      batch: '2022 - 2026',
      batchPrefix: '22EC',
      pin: '1234',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
  ],
};

export const authService = {
  getActiveSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setActiveSession(session: AuthSession) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  },

  clearActiveSession() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  getHeadSession(): AuthSession | null {
    const active = this.getActiveSession();
    if (active && active.role === 'HEAD_ADMIN') return active;
    return null;
  },

  setHeadSession(session: AuthSession) {
    this.setActiveSession(session);
  },

  clearHeadSession() {
    this.clearActiveSession();
  },

  getStaffSession(): AuthSession | null {
    const active = this.getActiveSession();
    if (active && active.role === 'STAFF_COORDINATOR') return active;
    return null;
  },

  setStaffSession(session: AuthSession) {
    this.setActiveSession(session);
  },

  clearStaffSession() {
    this.clearActiveSession();
  },

  getStudentSession(): AuthSession | null {
    const active = this.getActiveSession();
    if (active && active.role === 'STUDENT') return active;
    return null;
  },

  setStudentSession(session: AuthSession) {
    this.setActiveSession(session);
  },

  clearStudentSession() {
    this.clearActiveSession();
  },
};

