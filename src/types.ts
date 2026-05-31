export interface User {
  id: string;
  email: string;
  role: 'seeker' | 'company';
}

export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  website: string;
  location: string;
  description: string;
  logo_url: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  is_active: boolean;
  created_at: string;
  companyName?: string;
  companyLogo?: string;
  companyDetails?: CompanyProfile;
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  resume_url: string;
  cover_letter: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  jobTitle?: string;
}
