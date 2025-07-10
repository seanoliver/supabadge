import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Badge {
  id: string;
  project_url: string;
  anon_key: string;
  label: string;
  metric_type: string;
  table_name?: string;
  color: string;
}

function generateSVG(label: string, value: string, color: string): string {
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <rect width="${labelWidth}" height="20" fill="#555"/>
      <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#b)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="${labelWidth / 2}" y="14">${label}</text>
      <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
      <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
    </g>
  </svg>`;
}

function generateOfflineSVG(label: string): string {
  return generateSVG(label, "Offline", "#e74c3c");
}

async function fetchTableCount(projectUrl: string, anonKey: string, tableName: string): Promise<number> {
  const url = `${projectUrl}/rest/v1/${tableName}?select=*`;
  
  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Prefer': 'count=exact',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch table count: ${response.status}`);
  }

  const contentRange = response.headers.get('content-range');
  if (!contentRange) {
    throw new Error('No content-range header found');
  }

  // Handle both "0-9/10" and "*/0" formats
  const match = contentRange.match(/(\d+|\*)\/(\d+)/);
  if (!match) {
    throw new Error('Invalid content-range format');
  }

  return parseInt(match[2], 10);
}

async function fetchUserCount(projectUrl: string, serviceKey: string): Promise<number> {
  const url = `${projectUrl}/auth/v1/admin/users`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user count: ${response.status}`);
  }

  const { users } = await response.json();
  return users.length;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const badgeId = pathSegments[pathSegments.length - 1];

    if (!badgeId) {
      return new Response('Badge ID required', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: badge, error } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (error || !badge) {
      return new Response(generateOfflineSVG('Badge'), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    let value: string;
    
    try {
      if (badge.metric_type === 'table_count' && badge.table_name) {
        const count = await fetchTableCount(badge.project_url, badge.anon_key, badge.table_name);
        value = count.toLocaleString();
      } else if (badge.metric_type === 'users') {
        // For user metrics, we would need the service key passed in the request
        // For now, return a placeholder since this requires manual refresh
        value = "Refresh Required";
      } else {
        value = "Unknown";
      }
    } catch (error) {
      console.error('Error fetching metric:', error);
      value = "Offline";
    }

    const svg = generateSVG(badge.label, value, badge.color);

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(generateOfflineSVG('Error'), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
});