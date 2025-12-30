import { SocialLink } from "./social-link.model";

export interface Company {
   id: number;

  owner: {
    id: number;
    fullName: string;
  };

  name: string;
  industry: string;
  companySize?: string;

  logoUrl?: string;
  coverImageUrl?: string;

  about?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;

  foundedYear?: number;
  rating?: number;
  verified?: boolean;
  reviewCount?: number;
  socialLinks: SocialLink[];
  createdAt: Date;
  activeJobCount?: number;
  featured?: boolean;

}
export interface CompanyListQuery {
  page?: number;
  size?: number;
 keyword?: string;
  industry?: string;
  verified?: boolean;
  sort?: 'name' | 'rating' | 'reviews' | 'newest';
}