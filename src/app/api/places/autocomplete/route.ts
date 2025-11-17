import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_PLACES_API_KEY) {
      // Fallback mock data for development
      const mockResults = [
        {
          place_id: '1',
          description: `${query}, Manisa, Türkiye`,
          structured_formatting: {
            main_text: query,
            secondary_text: 'Manisa, Türkiye'
          }
        },
        {
          place_id: '2',
          description: `${query} Mahallesi, İzmir, Türkiye`,
          structured_formatting: {
            main_text: `${query} Mahallesi`,
            secondary_text: 'İzmir, Türkiye'
          }
        },
        {
          place_id: '3',
          description: `${query} Caddesi, İstanbul, Türkiye`,
          structured_formatting: {
            main_text: `${query} Caddesi`,
            secondary_text: 'İstanbul, Türkiye'
          }
        }
      ];

      return NextResponse.json({ predictions: mockResults });
    }

    // Google Places Autocomplete API call
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=geocode&components=country:tr&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return NextResponse.json({ predictions: data.predictions });
    } else {
      console.error('Google Places API error:', data.status, data.error_message);
      
      // Fallback mock data
      const mockResults = [
        {
          place_id: '1',
          description: `${query}, Manisa, Türkiye`,
          structured_formatting: {
            main_text: query,
            secondary_text: 'Manisa, Türkiye'
          }
        }
      ];

      return NextResponse.json({ predictions: mockResults });
    }
  } catch (error) {
    console.error('Places autocomplete error:', error);
    
    // Fallback mock data
    const mockResults = [
      {
        place_id: '1',
        description: `${searchParams.get('query') || 'Manisa'}, Türkiye`,
        structured_formatting: {
          main_text: searchParams.get('query') || 'Manisa',
          secondary_text: 'Türkiye'
        }
      }
    ];

    return NextResponse.json({ predictions: mockResults });
  }
} 