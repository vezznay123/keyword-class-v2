import axios from 'axios';
import Papa from 'papaparse';

const MODEL_NAME = 'gpt-4o-mini';
const BATCH_SIZE = 1000;
const MAX_RETRIES = 5;
const RETRY_DELAY = 8000;

const generatePrompt = (queries, labels, examples = []) => {
  const basePrompt = `You are a query classifier that assigns queries to the most appropriate subcategory.
Output must be a JSON array where each object has the format {"Query": "query_text", "Label": "subcategory"}.

Available Labels for Classification:
${labels.map(label => `- ${label}`).join('\n')}

Classification Rules:
1. Each query must be assigned exactly one label
2. Labels must match exactly one from the provided list
3. Choose the most specific and appropriate label

${examples.length > 0 ? `
Example Classifications:
${examples.map(ex => `Input: "${ex.query}"
Output: {"Query": "${ex.query}", "Label": "${ex.label}"}`).join('\n\n')}

` : ''}
---

Queries to Classify:
${queries.map(query => `"${query}"`).join('\n')}`;

  return basePrompt;
};

class OpenAI {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.chat = {
      completions: {
        create: this.createChatCompletion.bind(this)
      }
    };
  }

  async createChatCompletion(params) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        params,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw { response: { status: 429 } };
      }
      throw error;
    }
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callOpenAI = async (openai, queries, labels, examples = [], retryCount = 0) => {
  const prompt = generatePrompt(queries, labels, examples);

  try {
    console.log('=== API REQUEST ===');
    console.log('Prompt:', prompt);
    const requestPayload = {
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful and precise query classifier. Respond only with valid JSON arrays."
        },
        { role: "user", content: prompt }
      ]
    };
    console.log('Request Payload:', JSON.stringify(requestPayload, null, 2));

    const response = await openai.chat.completions.create(requestPayload);
    
    console.log('=== API RESPONSE ===');
    console.log('Response:', JSON.stringify(response, null, 2));

    if (response.usage?.prompt_tokens_details?.cached_tokens) {
      console.log('=== CACHE USAGE ===');
      console.log('Cached Tokens:', response.usage.prompt_tokens_details.cached_tokens);
      console.log('Total Prompt Tokens:', response.usage.prompt_tokens);
      console.log('Cache Hit Rate:', 
        `${((response.usage.prompt_tokens_details.cached_tokens / response.usage.prompt_tokens) * 100).toFixed(2)}%`
      );
    }

    const content = response.choices[0].message.content;
    return parseResponse(content);

  } catch (error) {
    console.error('API Error:', error);

    if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
      console.log(`Rate limit hit. Retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY * Math.pow(2, retryCount));
      return callOpenAI(openai, queries, labels, examples, retryCount + 1);
    }

    throw error;
  }
};

const parseResponse = (content) => {
  try {
    // Extract the JSON content from within the markdown code blocks
    const jsonMatch = content.match(/\n([\s\S]*?)\n/);
    let cleanContent = jsonMatch ? jsonMatch[1].trim() : content.trim();
    
    // Remove any remaining newlines
    cleanContent = cleanContent.replace(/\n/g, '');
    
    if (!cleanContent.startsWith('[')) {
      cleanContent = '[' + cleanContent;
    }
    if (!cleanContent.endsWith(']')) {
      cleanContent = cleanContent + ']';
    }

    const parsed = JSON.parse(cleanContent);
    return parsed.map(item => ({
      Query: item.Query,
      Label: item.Label
    }));
  } catch (error) {
    console.error('Error parsing API response:', error);
    throw new Error('Failed to parse API response');
  }
};const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data
          .filter(row => row[0] && row[0].trim());
        
        if (results.data[0]?.length > 1) {
          return resolve(data.map(row => ({
            query: row[0].trim(),
            label: row[1].trim()
          })));
        }
        
        return resolve(data.map(row => row[0].trim()));
      },
      error: (error) => reject(error)
    });
  });
};

const processInBatches = async (queries, labels, examples, apiKey, setProgress) => {
  const results = [];
  const totalQueries = queries.length;
  
  for (let i = 0; i < queries.length; i += BATCH_SIZE) {
    const batchQueries = queries.slice(i, Math.min(i + BATCH_SIZE, queries.length));
    
    try {
      const openai = new OpenAI({ apiKey });
      const batchResults = await callOpenAI(openai, batchQueries, labels, examples);
      results.push(...batchResults);
      
      const progress = Math.min(((i + BATCH_SIZE) / totalQueries) * 100, 100);
      setProgress(progress);
      
    } catch (error) {
      console.error(`Error processing batch ${i / BATCH_SIZE + 1}:`, error);
      throw error;
    }
    
    await delay(100);
  }
  
  return results;
};

export const processQueries = async (files, apiKey, setProgress) => {
  try {
    const [queries, labels, examples] = await Promise.all([
      readCSVFile(files.queries),
      readCSVFile(files.labels),
      files.examples ? readCSVFile(files.examples) : Promise.resolve([])
    ]);

    console.log(`Processing ${queries.length} queries with ${labels.length} labels and ${examples.length} examples`);

    const results = await processInBatches(queries, labels, examples, apiKey, setProgress);

    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error('Error processing queries:', error);
    throw new Error(
      error.response?.data?.error?.message || 
      error.message || 
      'An error occurred while processing queries'
    );
  }
};