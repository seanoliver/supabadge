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