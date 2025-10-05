import { NextResponse } from "next/server";
import fetch from "node-fetch";

// Function to get embeddings from Hugging Face - CORRECTED
async function getHfEmbedding(text) {
  if (!text) return null;

  const endpoint = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text
        // NO "sentences" parameter needed - the library handles this internally
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to get embedding: ${res.status} ${errorText}`);
    }

    const result = await res.json();
    
    // Handle the response format - it should be a nested array
    if (Array.isArray(result)) {
      if (Array.isArray(result[0])) {
        return result[0]; // Return the first embedding array
      }
      return result; // Return the direct array
    }
    
    throw new Error("Unexpected response format from Hugging Face");
  } catch (error) {
    console.error("Error getting embedding:", error.message);
    throw error;
  }
}

// Alternative: Use the Inference library approach (recommended)
import { HfInference } from '@huggingface/inference';

let hf;
function getHfClient() {
  if (!hf && process.env.HUGGING_FACE_API_KEY) {
    hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
  }
  return hf;
}

async function getHfEmbeddingWithLibrary(text) {
  if (!text) return null;

  try {
    const hfClient = getHfClient();
    if (!hfClient) {
      throw new Error("Hugging Face client not initialized");
    }

    const queryEmbedding = await hfClient.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });

    // Handle the response format as you did before
    const embedding = Array.isArray(queryEmbedding[0]) 
      ? queryEmbedding[0] 
      : queryEmbedding;

    return embedding;
  } catch (error) {
    console.error("Error getting embedding with library:", error.message);
    throw error;
  }
}

// Function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to perform semantic search
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const weaviateUrl = process.env.WEAVIATE_URL;
    const apiKey = process.env.WEAVIATE_API_KEY;

    let queryEmbedding;
    let embeddingError = null;
    let embeddingSource = null;
    
    if (search) {
      try {
        // Try with the library approach first (recommended)
        queryEmbedding = await getHfEmbeddingWithLibrary(search);
        embeddingSource = 'hf_library';
      } catch (error) {
        console.warn("Library approach failed, trying raw API:", error.message);
        try {
          // Fallback to raw API
          queryEmbedding = await getHfEmbedding(search);
          embeddingSource = 'hf_raw_api';
        } catch (rawError) {
          console.warn("All embedding methods failed:", rawError.message);
          embeddingError = rawError.message;
        }
      }
    }

    const weaviateQuery = {
      query: `{
        Get {
          Publication(
            limit: 1000
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
      }`
    };

    const response = await fetch(`${weaviateUrl}/v1/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(weaviateQuery),
    });

    if (!response.ok) {
      throw new Error(`Weaviate query failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const publications = data.data.Get.Publication || [];

    if (queryEmbedding && search && !embeddingError) {
      const scoredPublications = publications.map(pub => {
        // TODO: You need to store actual embeddings in Weaviate
        // For now, create a simple text-based embedding for each publication
        const pubText = `${pub.title || ''} ${pub.abstract || ''}`.toLowerCase();
        let pubEmbedding;
        
        try {
          // Create a simple hash-based embedding for demonstration
          pubEmbedding = createSimpleEmbedding(pubText, queryEmbedding.length);
        } catch (e) {
          console.warn("Failed to create publication embedding:", e.message);
          pubEmbedding = new Array(queryEmbedding.length).fill(0);
        }
        
        const similarity = cosineSimilarity(queryEmbedding, pubEmbedding);
        return { 
          ...pub, 
          similarity: parseFloat(similarity.toFixed(4))
        };
      });

      scoredPublications.sort((a, b) => b.similarity - a.similarity);
      const topPublications = scoredPublications.slice(offset, offset + limit);

      return NextResponse.json({
        publications: topPublications,
        total: scoredPublications.length,
        searchType: 'semantic',
        embeddingSource: embeddingSource,
        query: search
      });
    } else {
      // Fallback to keyword search if embedding fails or no search term
      const filteredPublications = search ? 
        publications.filter(pub => 
          pub.title?.toLowerCase().includes(search.toLowerCase()) ||
          pub.abstract?.toLowerCase().includes(search.toLowerCase())
        ) : 
        publications;

      return NextResponse.json({
        publications: filteredPublications.slice(offset, offset + limit),
        total: filteredPublications.length,
        searchType: 'keyword',
        embeddingSource: embeddingError ? 'failed' : null,
        embeddingError: embeddingError,
        query: search
      });
    }
  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch publications", 
        error: error.message,
        searchTerm: search
      },
      { status: 500 }
    );
  }
}

// Helper function for simple embeddings (temporary solution)
function createSimpleEmbedding(text, length = 384) {
  const embedding = new Array(length).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach(word => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % length;
    embedding[index] += 0.1;
  });
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
}