import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// --- IN-MEMORY DATABASE ---
const db = {
  users: [] as any[],
  companyProfiles: [] as any[],
  jobs: [] as any[],
  applications: [] as any[],
};

// Generate pseudo-IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MIDDLEWARE FOR AUTH ---
  // In a real app we'd use JWTs, here we use a fake token format: "{userId}_{role}"
  const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Invalid token format' });

    const [userId, role] = token.split('_');
    const user = db.users.find(u => u.id === userId);
    
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    req.user = user;
    next();
  };

  const roleMiddleware = (allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Permission denied" });
      }
      next();
    };
  };

  // --- API ROUTES ---

  // Auth Group
  app.post('/api/auth/register', (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });

    const newUser = { id: generateId(), email, password, role, is_active: true };
    db.users.push(newUser);

    if (role === 'company') {
      db.companyProfiles.push({ id: generateId(), userId: newUser.id, name: '', website: '', location: '', description: '', logo_url: '' });
    }

    res.status(201).json({ message: 'User registered', user: { id: newUser.id, email: newUser.email, role: newUser.role } });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Simulate JWT with a fake predictable token
    const token = `${user.id}_${user.role}`;
    res.json({ access_token: token, refresh_token: token + '_refresh' });
  });

  app.post('/api/auth/logout', authMiddleware, (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authMiddleware, (req: any, res: any) => {
    const { password, ...safeUser } = req.user;
    res.json(safeUser);
  });

  // Company Profile Group
  app.get('/api/company/profile', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const profile = db.companyProfiles.find(p => p.userId === req.user.id);
    res.json(profile);
  });

  app.put('/api/company/profile', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const profileIndex = db.companyProfiles.findIndex(p => p.userId === req.user.id);
    if (profileIndex > -1) {
      db.companyProfiles[profileIndex] = { ...db.companyProfiles[profileIndex], ...req.body };
      res.json(db.companyProfiles[profileIndex]);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  });

  // Jobs Group
  app.get('/api/jobs', (req, res) => {
    const { search, location, job_type } = req.query;
    let results = db.jobs.filter(j => j.is_active !== false);

    if (search) results = results.filter(j => j.title.toLowerCase().includes(String(search).toLowerCase()));
    if (location) results = results.filter(j => j.location.toLowerCase().includes(String(location).toLowerCase()));
    if (job_type) results = results.filter(j => j.job_type === job_type);

    // Provide company names along with jobs
    const populated = results.map(j => {
      const company = db.companyProfiles.find(c => c.id === j.companyId);
      return { ...j, companyName: company ? company.name : 'Unknown Company', companyLogo: company ? company.logo_url : '' };
    });

    res.json({ count: populated.length, results: populated });
  });

  app.get('/api/jobs/:id', (req, res) => {
    const job = db.jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const company = db.companyProfiles.find(c => c.id === job.companyId);
    res.json({ ...job, companyDetails: company });
  });

  app.post('/api/jobs', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const profile = db.companyProfiles.find(p => p.userId === req.user.id);
    if (!profile) return res.status(404).json({ error: 'Company profile missing' });

    const newJob = {
      id: generateId(),
      companyId: profile.id,
      ...req.body,
      is_active: true,
      created_at: new Date().toISOString()
    };
    db.jobs.push(newJob);
    res.status(201).json(newJob);
  });

  app.put('/api/jobs/:id', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const profile = db.companyProfiles.find(p => p.userId === req.user.id);
    const jobIndex = db.jobs.findIndex(j => j.id === req.params.id && j.companyId === profile?.id);
    if (jobIndex > -1) {
      db.jobs[jobIndex] = { ...db.jobs[jobIndex], ...req.body };
      res.json(db.jobs[jobIndex]);
    } else {
      res.status(404).json({ error: 'Job not found or unauthorized' });
    }
  });

  app.delete('/api/jobs/:id', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const profile = db.companyProfiles.find(p => p.userId === req.user.id);
    const jobIndex = db.jobs.findIndex(j => j.id === req.params.id && j.companyId === profile?.id);
    if (jobIndex > -1) {
      db.jobs.splice(jobIndex, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Job not found or unauthorized' });
    }
  });

  app.patch('/api/jobs/:id/close', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const profile = db.companyProfiles.find(p => p.userId === req.user.id);
    const jobIndex = db.jobs.findIndex(j => j.id === req.params.id && j.companyId === profile?.id);
    if (jobIndex > -1) {
      db.jobs[jobIndex].is_active = false;
      res.json(db.jobs[jobIndex]);
    } else {
      res.status(404).json({ error: 'Job not found or unauthorized' });
    }
  });

  // Applications Group
  app.post('/api/jobs/:id/apply', authMiddleware, roleMiddleware(['seeker']), (req: any, res: any) => {
    const existing = db.applications.find(a => a.jobId === req.params.id && a.seekerId === req.user.id);
    if (existing) return res.status(400).json({ error: 'Already applied' });

    const newApp = {
      id: generateId(),
      jobId: req.params.id,
      seekerId: req.user.id,
      ...req.body,
      status: 'pending',
      applied_at: new Date().toISOString()
    };
    db.applications.push(newApp);

    // Simulate Celery background task email
    console.log(`[Celery mock] Sending email notification to company for job ${req.params.id}...`);

    res.status(201).json(newApp);
  });

  app.get('/api/applications/mine', authMiddleware, roleMiddleware(['seeker']), (req: any, res: any) => {
    const apps = db.applications.filter(a => a.seekerId === req.user.id);
    const populated = apps.map(a => {
      const job = db.jobs.find(j => j.id === a.jobId);
      return { ...a, jobTitle: job?.title };
    });
    res.json(populated);
  });

  app.get('/api/jobs/:id/applications', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const profile = db.companyProfiles.find(p => p.userId === req.user.id);
    const job = db.jobs.find(j => j.id === req.params.id);
    
    if (!job || job.companyId !== profile?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const apps = db.applications.filter(a => a.jobId === req.params.id);
    res.json(apps);
  });

  app.patch('/api/applications/:id/status', authMiddleware, roleMiddleware(['company']), (req: any, res: any) => {
    const { status } = req.body;
    const appIndex = db.applications.findIndex(a => a.id === req.params.id);
    if (appIndex === -1) return res.status(404).json({ error: 'Application not found' });
    
    const appEntry = db.applications[appIndex];
    const job = db.jobs.find(j => j.id === appEntry.jobId);
    const profile = db.companyProfiles.find(p => p.userId === req.user.id);

    if (!job || job.companyId !== profile?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    db.applications[appIndex].status = status;

    // Simulate async email logic
    console.log(`[Celery mock] Notifying seeker ${appEntry.seekerId} application is now ${status}`);

    res.json(db.applications[appIndex]);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
