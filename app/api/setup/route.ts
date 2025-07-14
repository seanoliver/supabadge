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

    // We'll validate the connection when we actually try to fetch data
    // For now, just validate the key formats
    const isValidPublishableKey = anonKey.startsWith('sb_publishable_') || 
                                 (anonKey.startsWith('eyJ') && anonKey.length > 40);
    const isValidSecretKey = serviceRoleKey && (serviceRoleKey.startsWith('sb_secret_') || 
                            (serviceRoleKey.startsWith('eyJ') && serviceRoleKey.length > 40));
    
    if (!isValidPublishableKey) {
      return NextResponse.json(
        { error: 'Invalid publishable/anon key format' },
        { status: 400 }
      );
    }

    let cachedValue = null;
    let hasRLS = false;
    
    // For table_count metrics, check if RLS is enabled and get initial count
    if (metricType === 'table_count' && tableName) {
      // Handle schema.table format
      let schema = 'public';
      let table = tableName;
      
      if (tableName.includes('.')) {
        const parts = tableName.split('.');
        schema = parts[0];
        table = parts[1];
      }
      
      // For non-public schemas, we MUST cache the value since anon keys can't access them
      const isNonPublicSchema = schema !== 'public';
      
      // Prepare headers
      const anonHeaders: Record<string, string> = {
        'apikey': anonKey,
        'Prefer': 'count=exact',
      };
      
      // Only add Authorization header for old JWT keys
      if (!anonKey.startsWith('sb_')) {
        anonHeaders['Authorization'] = `Bearer ${anonKey}`;
      }
      
      // For non-public schemas, skip the anon key check entirely
      let anonResponse;
      let anonAccessBlocked = false;
      let anonCount = 0;
      
      if (!isNonPublicSchema) {
        // Only try with anon key for public schema tables
        const anonCountUrl = `${projectUrl}/rest/v1/${encodeURIComponent(table)}?select=*`;
        anonResponse = await fetch(anonCountUrl, {
          method: 'HEAD',
          headers: anonHeaders,
        });
        
        anonAccessBlocked = anonResponse.status === 403 || anonResponse.status === 401;
        const anonContentRange = anonResponse.headers.get('content-range') || '';
        const anonMatch = anonContentRange.match(/(\d+|\*)\/(\d+)/);
        anonCount = anonMatch ? parseInt(anonMatch[2], 10) : 0;
      } else {
        // For non-public schemas, assume anon access is blocked
        anonAccessBlocked = true;
      }

      console.log('Anon key check:', {
        isNonPublicSchema,
        anonAccessBlocked,
        anonCount,
      });

      // If we get 0 rows with a 200 response, RLS might still be active
      const possibleRLS = !isNonPublicSchema && anonCount === 0 && anonResponse?.status === 200;
      
      // If service role key provided, get the actual count
      if (serviceRoleKey) {
        const serviceHeaders: Record<string, string> = {
          'apikey': serviceRoleKey,
          'Prefer': 'count=exact',
        };
        
        // Only add Authorization header for old JWT keys
        if (!serviceRoleKey.startsWith('sb_')) {
          serviceHeaders['Authorization'] = `Bearer ${serviceRoleKey}`;
        }
        
        if (schema !== 'public') {
          serviceHeaders['Accept-Profile'] = schema;
        }
        
        const serviceCountUrl = `${projectUrl}/rest/v1/${encodeURIComponent(table)}?select=*`;
        const serviceResponse = await fetch(serviceCountUrl, {
          method: 'HEAD',
          headers: serviceHeaders,
        });

        console.log('Service key response:', {
          status: serviceResponse.status,
          headers: Object.fromEntries(serviceResponse.headers.entries())
        });

        const serviceContentRange = serviceResponse.headers.get('content-range') || '';
        const serviceMatch = serviceContentRange.match(/(\d+|\*)\/(\d+)/);
        const serviceCount = serviceMatch ? parseInt(serviceMatch[2], 10) : 0;
        
        // RLS is detected if:
        // 1. Anon access is blocked (403/401)
        // 2. Counts differ between anon and service keys
        // 3. Anon returns 0 but service returns > 0 (likely RLS filtering all rows)
        // 4. Table is in non-public schema (always requires service key)
        const rlsDetected = isNonPublicSchema ||
                           anonAccessBlocked || 
                           anonCount !== serviceCount || 
                           (possibleRLS && serviceCount > 0);
        
        console.log('RLS Detection:', {
          table: tableName,
          schema,
          isNonPublicSchema,
          anonCount,
          serviceCount,
          anonAccessBlocked,
          possibleRLS,
          hasRLS: rlsDetected
        });
        
        if (rlsDetected || isNonPublicSchema) {
          hasRLS = true;
          cachedValue = serviceCount.toString();
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
      hasRLS: hasRLS,
      refreshUrl: hasRLS ? `${supabaseUrl}/functions/v1/badge-refresh/${data.id}` : null,
    });
  } catch (error) {
    console.error('Error in badge setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}