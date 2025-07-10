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

interface RefreshRequest {
  serviceKey: string;
}

function generateSVG(label: string, value: string, color: string): string {
  const iconWidth = 20;
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = iconWidth + labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <rect width="${iconWidth + labelWidth}" height="20" fill="#555"/>
      <rect x="${iconWidth + labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#b)"/>
    </g>
    <g fill="#fff">
      <!-- Simplified Supabase icon -->
      <path d="M 6 4 L 14 4 L 14 12 L 10 16 L 6 12 Z" fill="#3ECF8E" opacity="0.9" transform="scale(0.7) translate(4, 3)"/>
      <g text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="${iconWidth + labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
        <text x="${iconWidth + labelWidth / 2}" y="14">${label}</text>
        <text x="${iconWidth + labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
        <text x="${iconWidth + labelWidth + valueWidth / 2}" y="14">${value}</text>
      </g>
    </g>
  </svg>`;
}

function generateErrorSVG(label: string, message: string): string {
  return generateSVG(label, message, "#e74c3c");
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
      return new Response(generateErrorSVG('Badge', 'Not Found'), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
        },
      });
    }

    if (badge.metric_type !== 'users') {
      return new Response(generateErrorSVG(badge.label, 'Invalid Metric'), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
        },
      });
    }

    let value: string;

    try {
      const count = await fetchUserCount(badge.project_url, serviceKey);
      value = count.toLocaleString();
    } catch (error) {
      console.error('Error fetching user count:', error);
      return new Response(generateErrorSVG(badge.label, 'Auth Failed'), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
        },
      });
    }

    const svg = generateSVG(badge.label, value, badge.color);

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(generateErrorSVG('Error', 'Server Error'), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
      },
    });
  }
});
