import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CompanyService } from 'src/app/core/services/company.service';
import { Company, CompanyListQuery } from 'src/app/models/company.model';
import { Pagination } from 'src/app/models/pagination.model';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {

  /* =======================
     DATA STATE
  ======================= */
  companies: Company[] = [];
  filteredCompanies: Company[] = [];

  loading = false;

  /* =======================
     PAGINATION
  ======================= */
  currentPage = 1;
  itemsPerPage = 12;
  totalCompanies = 0;

  /* =======================
     FILTER & SORT STATE
  ======================= */
  searchForm: FormGroup;
  selectedIndustry = '';
  selectedVerified: boolean | null = null;
  sortBy: 'name' | 'rating' | 'reviews' | 'newest' = 'name';

  showAllCategories = false;

  /* =======================
     STATIC DATA
  ======================= */
  industries: string[] = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
    'Education', 'Real Estate', 'Transportation', 'Media', 'Energy',
    'Pharmaceutical', 'Hospitality', 'Telecommunications', 'Construction',
    'Agriculture', 'Logistics', 'Marketing', 'Consulting', 'Insurance',
    'Automotive'
  ];

  /* =======================
     CONSTRUCTOR
  ======================= */
  constructor(
    private companyService: CompanyService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      keyword: [''],
      industry: [''],
      verified: [null]
    });
  }

  /* =======================
     LIFECYCLE
  ======================= */
  ngOnInit(): void {
    this.loadCompanies();
    this.setupSearchListeners();
  }

  /* =======================
     LOAD COMPANIES
  ======================= */
  loadCompanies(): void {
    this.loading = true;

    const query = {
      page: this.currentPage - 1,
      size: this.itemsPerPage,
      q: this.searchForm.value.keyword || undefined,
      industry: this.selectedIndustry || undefined,
      verified: this.selectedVerified ?? undefined
    };

    this.companyService.list(query).subscribe({
      next: (res: Pagination<Company>) => {
        this.companies = res.items;
        this.filteredCompanies = [...this.companies];
        this.totalCompanies = res.totalItems;
        this.sortCompanies();
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load companies', err);
        this.loading = false;
      }
    });
  }

  /* =======================
     SEARCH LISTENER
  ======================= */
  setupSearchListeners(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadCompanies();
    });
  }

  /* =======================
     SORTING
  ======================= */
  sortCompanies(): void {
    this.filteredCompanies.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  /* =======================
     PAGINATION
  ======================= */
  onPageChange(page: number): void {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.loadCompanies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTotalPages(): number {
    return Math.ceil(this.totalCompanies / this.itemsPerPage);
  }

  getPaginationArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  /* =======================
     FILTER CONTROLS
  ======================= */
  clearFilters(): void {
    this.searchForm.reset();
    this.selectedIndustry = '';
    this.selectedVerified = null;
    this.sortBy = 'name';
    this.currentPage = 1;
    this.loadCompanies();
  }

  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  /* =======================
     UI HELPERS
  ======================= */

  getIndustryIcon(industry: string): string {
    const icons: Record<string, string> = {
      Technology: 'bi-cpu',
      Healthcare: 'bi-heart-pulse',
      Finance: 'bi-cash-coin',
      Retail: 'bi-shop',
      Manufacturing: 'bi-gear',
      Education: 'bi-mortarboard',
      RealEstate: 'bi-house',
      Transportation: 'bi-truck',
      Media: 'bi-camera-video',
      Energy: 'bi-lightning',
      Pharmaceutical: 'bi-capsule',
      Hospitality: 'bi-cup',
      Telecommunications: 'bi-phone',
      Construction: 'bi-building',
      Agriculture: 'bi-tree',
      Logistics: 'bi-truck',
      Marketing: 'bi-megaphone',
      Consulting: 'bi-chat-left-text',
      Insurance: 'bi-shield-check',
      Automotive: 'bi-car'
    };

    return icons[industry] || 'bi-building';
  }

  getCompanySizeLabel(size?: string): string {
    if (!size) return 'Not specified';

    const sizes: Record<string, string> = {
      '1-10': 'Micro (1–10)',
      '11-50': 'Small (11–50)',
      '51-200': 'Medium (51–200)',
      '201-500': 'Large (201–500)',
      '501-1000': 'Enterprise (501–1000)',
      '1001-5000': 'Large Enterprise (1001–5000)',
      '5000+': 'Corporate (5000+)'
    };

    return sizes[size] || size;
  }

  /* =======================
     RATING STARS (FIXED)
  ======================= */
  getRatingStars(rating = 0): {
    full: any[];
    half: boolean;
    empty: any[];
  } {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return {
      full: Array(full),
      half,
      empty: Array(empty)
    };
  }

  /* =======================
     ADVANCED FEATURES
  ======================= */

  isFeatured(company: Company): boolean {
    return !!company.featured;
  }

  trackByCompanyId(index: number, company: Company): number {
    return company.id;
  }
}
