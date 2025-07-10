export interface PresetMetric {
  label: string;
  endpoint: string;
  description: string;
  requiresTableName?: boolean;
  requiresServiceKey?: boolean;
  usesAnonKey: boolean;
  dynamic: boolean;
}

export const PRESET_METRICS: Record<string, PresetMetric> = {
  table_count: {
    label: "Records",
    endpoint: "/rest/v1/{table_name}?select=*&head=true",
    description: "Row count for any table",
    requiresTableName: true,
    usesAnonKey: true,
    dynamic: true
  },
  users: {
    label: "Users",
    endpoint: "/auth/v1/admin/users",
    description: "Total authenticated users",
    requiresServiceKey: true,
    usesAnonKey: false,
    dynamic: false
  }
};

export const PRESET_COLORS = [
  { label: "Supabase Green", value: "#3ECF8E" },
  { label: "Blue", value: "#4F46E5" },
  { label: "Green", value: "#10B981" },
  { label: "Red", value: "#EF4444" },
  { label: "Yellow", value: "#F59E0B" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Pink", value: "#EC4899" },
];