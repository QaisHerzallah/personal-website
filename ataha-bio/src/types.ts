export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  price: string;
  startDate: string;
  startTime: string;
  topics: string[];
  order: number;
  isActive: boolean;
  registrationUrl?: string;
  registrationButtonText?: string;
  targetAudience?: string;
}

export interface AppSettings {
  centerName: string;
  logoUrl?: string;
  mapEmbedUrl?: string;
  socialMedia: {
    platform: string;
    url: string;
  }[];
}
