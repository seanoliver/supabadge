import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectUrl, anonKey, label, metricType, tableName, color, serviceRoleKey } = body;

    // Validate required fields
    if (!projectUrl || !anonKey || !label || !metricType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate table name for table_count metric
    if (metricType === 'table_count' && !tableName) {
      return NextResponse.json(
        { error: 'Table name is required for table_count metric' },
        { status: 400 }
      );
    }

    // Test the connection to the user's Supabase project
    try {
      const testUrl = `${projectUrl}/rest/v1/`;
      const response = await fetch(testUrl, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Invalid project URL or API key' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to connect to Supabase project' },
        { status: 400 }
      );
    }

    let cachedValue = null;
    
    // For table_count metrics, check if RLS is enabled and get initial count
    if (metricType === 'table_count' && tableName) {
      // First try with anon key to see if we get a count
      const anonCountUrl = `${projectUrl}/rest/v1/${tableName}?select=*&limit=0`;
      const anonResponse = await fetch(anonCountUrl, {
        method: 'HEAD',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Prefer': 'count=exact',
        },
      });

      const anonCount = anonResponse.headers.get('content-range')?.split('/')[1] || '0';
      
      // If service role key provided, get the actual count
      if (serviceRoleKey) {
        const serviceCountUrl = `${projectUrl}/rest/v1/${tableName}?select=*&limit=0`;
        const serviceResponse = await fetch(serviceCountUrl, {
          method: 'HEAD',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'count=exact',
          },
        });

        const serviceCount = serviceResponse.headers.get('content-range')?.split('/')[1] || '0';
        
        // If counts differ, RLS is likely enabled, so cache the service role count
        if (anonCount !== serviceCount) {
          cachedValue = serviceCount;
        }
      }
    }

    // Create the badge in our database
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('badges')
      .insert({
        project_url: projectUrl,
        anon_key: anonKey,
        label,
        metric_type: metricType,
        table_name: tableName || null,
        color: color || '#4F46E5',
        cached_value: cachedValue,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating badge:', error);
      return NextResponse.json(
        { error: 'Failed to create badge' },
        { status: 500 }
      );
    }

    // Get our project URL for the badge URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const badgeUrl = `${supabaseUrl}/functions/v1/badge/${data.id}`;

    return NextResponse.json({
      badgeId: data.id,
      badgeUrl,
      hasRLS: !!cachedValue,
      refreshUrl: cachedValue ? `${supabaseUrl}/functions/v1/badge-refresh/${data.id}` : null,
    });
  } catch (error) {
    console.error('Error in badge setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}