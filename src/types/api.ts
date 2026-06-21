export interface LoyaltyCard {
  id: string;
  loyalty_points: number;
  reward_available: boolean;
  added_to_wallet: boolean;
  serial_number: string | null;
  status?: string | null;
}

export interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  contact_number: string | null;
  no_of_rewards: number;
  total_rewards?: number; // annotated available-reward count in list responses
  device?: "apple" | "google" | null;
  status?: string | null;
  loyalty_card: LoyaltyCard | null;
}

export interface Transaction {
  id: string;
  transaction_type: string;
  transaction_points: number;
  transaction_amount: number | string | null;
  points_remaining?: number | null;
  created_at: string;
  customer: Customer | null;
}

export interface Reward {
  id: string;
  status: "available" | "availed" | "expired";
  customer: string;
  availed_at: string | null;
  created_at?: string | null;
}

export type PointsSystem = "points" | "stamps";

export interface Configuration {
  id?: string;
  points_system: PointsSystem | null;
  total_points: number;
  business_name?: string | null;
  background_color?: string | null;
  foreground_color?: string | null;
  label_color?: string | null;
}

export interface Vendor {
  id: string;
  name: string | null;
  email: string;
  business_name: string | null;
  business_description?: string | null;
  phone_number?: string | null;
  created_at?: string;
  access_token: string;
  refresh_token: string;
}

export interface Subscription {
  status?: string;
  active?: boolean;
  [key: string]: unknown;
}
