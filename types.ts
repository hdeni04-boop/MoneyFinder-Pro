
export enum CollectorType {
  RSS = 'RSS',
  API = 'API',
  WEB = 'Web Scraper'
}

export type Language = 'en' | 'id';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Extreme';
export type TimeHorizon = 'Immediate' | 'Short-term' | 'Mid-term' | 'Long-term';
export type OpportunityStatus = 'Open' | 'Executed' | 'Expired';

export interface Source {
  id: string;
  name: string;
  url: string;
  type: CollectorType;
  isActive: boolean;
  lastRun?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  sourceId: string;
  sourceName: string;
  link: string;
  score: number;
  reasoning: string;
  timestamp: string;
  category: string;
  type: CollectorType;
  financialValue: number;
  isPremium: boolean;
  riskLevel: RiskLevel;
  timeHorizon: TimeHorizon;
  status: OpportunityStatus;
}

export interface Transaction {
  id: string;
  type: 'payout' | 'earning';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  method?: string;
}

export interface ScrapingLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'error' | 'warning';
}
