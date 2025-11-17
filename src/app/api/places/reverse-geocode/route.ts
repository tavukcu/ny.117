import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng parameters are required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_PLACES_API_KEY) {
      // Fallback mock data for development
      const mockResult = {
        results: [
          {
            formatted_address: `${lat}, ${lng}, Manisa, Türkiye`
          }
        ]
      };

      return NextResponse.json(mockResult);
    }

    // Google Reverse Geocoding API call
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return NextResponse.json({ results: data.results });
    } else {
      console.error('Google Reverse Geocoding API error:', data.status, data.error_message);
      
      // Fallback mock data
      const mockResult = {
        results: [
          {
            formatted_address: `${lat}, ${lng}, Manisa, Türkiye`
          }
        ]
      };

      return NextResponse.json(mockResult);
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Fallback mock data
    const mockResult = {
      results: [
        {
          formatted_address: `${searchParams.get('lat') || '0'}, ${searchParams.get('lng') || '0'}, Türkiye`
        }
      ]
    };

    return NextResponse.json(mockResult);
  }
} 