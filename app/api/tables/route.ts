import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { projectUrl, serviceKey } = await request.json();

    if (!projectUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Missing project URL or service key" },
        { status: 400 }
      );
    }

    // Use the Supabase Management API to get database information
    // Extract the project ref from the URL
    const projectRef = projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

    if (!projectRef) {
      throw new Error("Invalid project URL format");
    }

    // Try multiple approaches to get table information

    // Approach 1: Try to use the REST API with a direct query
    const approaches = [
      // Try the SQL endpoint
      async () => {
        const response = await fetch(`${projectUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // The OpenAPI spec returns paths which correspond to tables
          const tables: any[] = [];

          if (data.paths) {
            Object.keys(data.paths).forEach(path => {
              if (path.startsWith('/') && !path.includes('/rpc/')) {
                const tableName = path.substring(1);
                if (tableName && !tableName.includes('/')) {
                  // Try to determine schema from the response
                  tables.push({
                    schema: 'public', // Default to public, will be refined
                    table: tableName,
                    fullName: tableName
                  });
                }
              }
            });
          }

          return tables;
        }
        throw new Error('Failed to get OpenAPI spec');
      },

      // Try a known Supabase internal endpoint
      async () => {
        const response = await fetch(`${projectUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: `
              SELECT schemaname, tablename
              FROM pg_catalog.pg_tables
              WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'supabase_migrations', 'vault')
              ORDER BY schemaname, tablename
            `
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return (data || []).map((row: any) => ({
            schema: row.schemaname,
            table: row.tablename,
            fullName: `${row.schemaname}.${row.tablename}`
          }));
        }
        throw new Error('SQL query failed');
      }
    ];

    // Try each approach
    for (const approach of approaches) {
      try {
        const tables = await approach();
        if (tables && tables.length > 0) {
          return NextResponse.json({ tables });
        }
      } catch (e) {
        console.error('Approach failed:', e);
        continue;
      }
    }

    // If all approaches fail, return empty array to trigger manual input
    console.log('All approaches to fetch tables failed, returning empty array');
    return NextResponse.json({ tables: [] });

  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}
