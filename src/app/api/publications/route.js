import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Helper: get embedding from Gemini
async function getGeminiEmbedding(text) {
  const response = await client.embeddings.create({
    model: "gemini-text-embedding-3-large",
    input: text
  });
  return response.data[0].embedding;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const weaviateUrl = process.env.WEAVIATE_URL;
    const apiKey = process.env.WEAVIATE_API_KEY;

    let nearVectorClause = '';
    if (search) {
      const embedding = await getGeminiEmbedding(search);
      nearVectorClause = `nearVector: { vector: [${embedding.join(',')}] }`;
    }

    const query = {
      query: `
        {
          Get {
            Publication(
              limit: ${limit}
              ${nearVectorClause}
              offset: ${offset}
            ) {
              title
              pmcid
              source_url
              abstract
              _additional {
                id
                certainty
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
