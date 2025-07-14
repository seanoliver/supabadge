declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
  cached_value?: string;
}

interface RefreshRequest {
  serviceKey: string;
}

// Use the same badge generation function as the main badge function
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

function generateOfflineSVG(label: string): string {
  return generateBadgeSVG(label, "Offline", "#e74c3c");
}

async function fetchTableCount(projectUrl: string, serviceKey: string, tableName: string): Promise<number> {
  // Handle schema.table format
  let schema = 'public';
  let table = tableName;

  if (tableName.includes('.')) {
    const parts = tableName.split('.');
    schema = parts[0];
    table = parts[1];
  }

  const headers: Record<string, string> = {
    'apikey': serviceKey,
    'Prefer': 'count=exact',
  };
  
  // Only add Authorization header for old JWT keys
  if (!serviceKey.startsWith('sb_secret_')) {
    headers['Authorization'] = `Bearer ${serviceKey}`;
  }

  if (schema !== 'public') {
    headers['Accept-Profile'] = schema;
  }

  const url = `${projectUrl}/rest/v1/${encodeURIComponent(table)}?select=*`;

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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const badgeId = pathSegments[pathSegments.length - 1];

    if (!badgeId) {
      return new Response('Badge ID required', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { serviceKey }: RefreshRequest = await req.json();

    if (!serviceKey) {
      return new Response('Service key required', {
        status: 400,
        headers: corsHeaders,
      });
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
        // Fetch the current count using the service key
        const count = await fetchTableCount(badge.project_url, serviceKey, badge.table_name);
        value = count.toLocaleString();
        
        // Update the cached value in the database
        const { error: updateError } = await supabase
          .from('badges')
          .update({ cached_value: count.toString() })
          .eq('id', badgeId);
          
        if (updateError) {
          console.error('Error updating cached value:', updateError);
        }
      } else {
        return new Response(generateOfflineSVG(badge.label), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=60',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching count:', error);
      return new Response(generateOfflineSVG(badge.label), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60',
        },
      });
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
