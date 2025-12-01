// src/types/index.ts

export interface Absence {
  id: number;
  badge_number: string;
  location_name: string;
  covering_badge_number: string;
  absence_date: string;
  notes: string;
  created_by_email?: string;
  created_by_name?: string;
  updated_by_email?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Equipment {
  id: number;
  equipment_type: string;
  equipment_id_number: string;
  title: string;
  status: string;
  notes: string;
  entry_date: string;
  created_by_email?: string;
  created_by_name?: string;
  updated_by_email?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnCall {
  id: number;
  department_name: string;
  person_name: string;
  phone_number: string;
  created_by_email?: string;
  created_by_name?: string;
  updated_by_email?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notice {
  id: number;
  notice_date: string;
  title: string;
  text_content: string;
  created_by_email?: string;
  created_by_name?: string;
  updated_by_email?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Alert {
  id: number;
  severity_level: "Low" | "Medium" | "High" | "Critical";
  title: string;
  active: boolean;
  created_by_email?: string;
  created_by_name?: string;
  updated_by_email?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
}
