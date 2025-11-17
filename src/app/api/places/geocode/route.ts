import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const place_id = searchParams.get('place_id');

    if (!place_id) {
      return NextResponse.json(
        { error: 'place_id parameter is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_PLACES_API_KEY) {
      // Fallback mock data for development
      const mockResult = {
        results: [
          {
            geometry: {
              location: {
                lat: 38.4237 + Math.random() * 0.01,
                lng: 27.1428 + Math.random() * 0.01
              }
            },
            formatted_address: `${place_id}, Manisa, Türkiye`
          }
        ]
      };

      return NextResponse.json(mockResult);
    }

    // Google Geocoding API call
    const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${place_id}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return NextResponse.json({ results: data.results });
    } else {
      console.error('Google Geocoding API error:', data.status, data.error_message);
      
      // Fallback mock data
      const mockResult = {
        results: [
          {
            geometry: {
              location: {
                lat: 38.4237 + Math.random() * 0.01,
                lng: 27.1428 + Math.random() * 0.01
              }
            },
            formatted_address: `${place_id}, Manisa, Türkiye`
          }
        ]
      };

      return NextResponse.json(mockResult);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Fallback mock data
    const mockResult = {
      results: [
        {
          geometry: {
            location: {
              lat: 38.4237 + Math.random() * 0.01,
              lng: 27.1428 + Math.random() * 0.01
            }
          },
          formatted_address: `${searchParams.get('place_id') || 'Manisa'}, Türkiye`
        }
      ]
    };

    return NextResponse.json(mockResult);
  }
} 