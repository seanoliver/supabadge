declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

import { createClient } from "@supabase/supabase-js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Inline the badge generation function since we can't import from lib in edge functions
function generateBadgeSVG(label: string, value: string, color: string): string {
  const iconWidth = 20;
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = iconWidth + labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <defs>
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <linearGradient id="supabase_paint0" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
        <stop stop-color="#249361"/>
        <stop offset="1" stop-color="#3ECF8E"/>
      </linearGradient>
      <linearGradient id="supabase_paint1" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
        <stop/>
        <stop offset="1" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <mask id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <rect width="${iconWidth + labelWidth}" height="20" fill="#555"/>
      <rect x="${iconWidth + labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#b)"/>
    </g>
    <g transform="translate(2, 2) scale(0.142)">
      <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase_paint0)"/>
      <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase_paint1)" fill-opacity="0.2"/>
      <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="${iconWidth + labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="${iconWidth + labelWidth / 2}" y="14">${label}</text>
      <text x="${iconWidth + labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
      <text x="${iconWidth + labelWidth + valueWidth / 2}" y="14">${value}</text>
    </g>
  </svg>`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateOfflineSVG(label: string): string {
  return generateBadgeSVG(label, "Offline", "#e74c3c");
}

async function fetchTableCount(projectUrl: string, anonKey: string, tableName: string): Promise<number> {
  // Handle schema.table format
  let schema = 'public';
  let table = tableName;

  if (tableName.includes('.')) {
    const parts = tableName.split('.');
    schema = parts[0];
    table = parts[1];
  }

  // For non-public schemas, we need to set the schema in headers
  const headers: Record<string, string> = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Prefer': 'count=exact',
  };

  if (schema !== 'public') {
    headers['Accept-Profile'] = schema;
  }

  const url = `${projectUrl}/rest/v1/${table}?select=*`;

  const response = await fetch(url, {
    method: 'HEAD',
    headers,
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

    const svg = generateBadgeSVG(badge.label, value, badge.color);

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
