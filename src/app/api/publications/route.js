import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const limit = searchParams.get('limit') || 20;

  try {
    const weaviateUrl = process.env.WEAVIATE_URL;
    const apiKey = process.env.WEAVIATE_API_KEY;

    let query = {
      query: `
        {
          Get {
            Publication(
              limit: ${parseInt(limit)}
              ${search ? `where: {
                path: ["title"],
                operator: Like,
                valueString: "*${search}*"
              }` : ''}
            ) {
              title
              pmcid
              source_url
              abstract
              _additional {
                id
              }
            }
          }
        }
      `
    };

    const response = await fetch(`${weaviateUrl}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Weaviate query failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return NextResponse.json({
      publications: data.data.Get.Publication,
      total: data.data.Get.Publication.length
    });
  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch publications',
        error: error.message 
      },
      { status: 500 }
    );
  }
}