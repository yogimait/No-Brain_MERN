// // server/src/services/nlp/textToWorkflow.service.js

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import  systemPrompt  from './promptTemplates.js';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';

// dotenv.config();

// // Initialize Gemini client
// // Log partial API key for debugging
// const apiKey = process.env.GEMINI_API_KEY;
// // console.log('API Key (last 4 chars):', apiKey ? `...${apiKey.slice(-4)}` : 'not found');

// const genAI = new GoogleGenerativeAI(apiKey);

// /**
//  * Parse AI response and extract JSON workflow
//  */
// function extractWorkflowJSON(response) {
//   let content = response.trim();
  
//   // Remove markdown code blocks if present
//   content = content.replace(/```\s*/g, '');
  
//   // Try to find JSON in the response
//   const jsonMatch = content.match(/\{[\s\S]*\}/);
  
//   if (!jsonMatch) {
//     throw new Error('No valid JSON found in AI response');
//   }
  
//   try {
//     const workflow = JSON.parse(jsonMatch[0]);
//     return workflow;
//   } catch (error) {
//     throw new Error('Failed to parse JSON from AI response: ' + error.message);
//   }
// }

// /**
//  * Validate workflow structure
//  */
// function validateWorkflowStructure(workflow) {
//   if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
//     throw new Error('Workflow must have a "nodes" array');
//   }
  
//   if (!workflow.edges || !Array.isArray(workflow.edges)) {
//     throw new Error('Workflow must have an "edges" array');
//   }
  
//   if (workflow.nodes.length === 0) {
//     throw new Error('Workflow must have at least one node');
//   }
  
//   // Validate each node
//   workflow.nodes.forEach((node, index) => {
//     if (!node.id) {
//       throw new Error(`Node at index ${index} is missing required field: id`);
//     }
//     if (!node.type) {
//       throw new Error(`Node ${node.id} is missing required field: type`);
//     }
//   });
  
//   // Validate each edge
//   workflow.edges.forEach((edge, index) => {
//     if (!edge.source) {
//       throw new Error(`Edge at index ${index} is missing required field: source`);
//     }
//     if (!edge.target) {
//       throw new Error(`Edge at index ${index} is missing required field: target`);
//     }
    
//     // Check if source and target nodes exist
//     const sourceExists = workflow.nodes.some(n => n.id === edge.source);
//     const targetExists = workflow.nodes.some(n => n.id === edge.target);
    
//     if (!sourceExists) {
//       throw new Error(`Edge references non-existent source node: ${edge.source}`);
//     }
//     if (!targetExists) {
//       throw new Error(`Edge references non-existent target node: ${edge.target}`);
//     }
//   });
  
//   return true;
// }

// /**
//  * Enhance workflow with additional metadata
//  */
// function enhanceWorkflow(workflow, userPrompt) {
//   return {
//     ...workflow,
//     metadata: {
//       generatedFrom: userPrompt,
//       generatedAt: new Date().toISOString(),
//       version: '1.0',
//       aiProvider: 'gemini'
//     }
//   };
// }

// /**
//  * Main function: Generate workflow from text using Gemini
//  * @param {string} userPrompt - Natural language description
//  * @param {object} options - Generation options
//  * @returns {Promise<object>} - Generated workflow
//  */
// async function generateWorkflowFromText(userPrompt, options = {}) {
//   const startTime = Date.now();
  
//   try {
//     console.log(`\n🤖 Generating workflow from prompt: "${userPrompt}"`);
    
//     // Validate input
//     if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
//       throw new Error('Prompt must be a non-empty string');
//     }
    
//     if (userPrompt.length > 500) {
//       throw new Error('Prompt is too long (max 500 characters)');
//     }
    
//     // Check if API key is configured
//     if (!process.env.GEMINI_API_KEY) {
//       throw new Error('GEMINI_API_KEY not configured in environment variables');
//     }
    
//     // Initialize Gemini model
//     console.log('📡 Calling Gemini API...');

//     const requestedModel = options.model || 'gemini-2.5-pro';
//     console.log(`Using Gemini model: ${requestedModel}`);
    
//     const model = genAI.getGenerativeModel({ 
//       model: requestedModel, // Try using gemini-pro instead of gemini-1.5-flash
//       generationConfig: {
//         temperature: 0.3, // Lower temperature for more consistent results
//         topK: 40,
//         topP: 0.95,
//         maxOutputTokens: 1024,
//       }
//     });
    
//     // Combine system prompt with user prompt
//     const fullPrompt = `${systemPrompt}\n\nNow, convert this user request into a workflow JSON:\n\nUser Request: "${userPrompt}"\n\nYour JSON Response:`;
    
//     // Generate content
//     try {
//       console.log('Making API request with configuration:', {
//         model: 'gemini-pro',
//         apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
//       });
//       const result = await model.generateContent(fullPrompt);
//       const response = await result.response;
//       const aiResponse = response.text();
//     } catch (error) {
//       console.error('Detailed API Error:', {
//         message: error.message,
//         status: error.status,
//         details: error.details
//       });
//       throw error;
//     }
    
//     console.log('✅ Gemini response received');
//     console.log('Raw response:', aiResponse);
    
//     // Extract and parse JSON
//     console.log('🔍 Extracting workflow JSON...');
//     const workflow = extractWorkflowJSON(aiResponse);
    
//     // Validate structure
//     console.log('✅ Validating workflow structure...');
//     validateWorkflowStructure(workflow);
    
//     // Enhance with metadata
//     const enhancedWorkflow = enhanceWorkflow(workflow, userPrompt);
    
//     const executionTime = Date.now() - startTime;
//     console.log(`✅ Workflow generated successfully in ${executionTime}ms\n`);
    
//     return {
//       success: true,
//       workflow: enhancedWorkflow,
//       prompt: userPrompt,
//       executionTime: `${executionTime}ms`,
//       aiProvider: 'gemini',
//       model: requestedModel,
//       cost: '0.000000' // Gemini is FREE!
//     };
    
//   } catch (error) {
//     console.error('❌ Workflow generation failed:', error.message);
    
//     return {
//       success: false,
//       error: error.message,
//       prompt: userPrompt,
//       executionTime: `${Date.now() - startTime}ms`,
//       aiProvider: 'gemini'
//     };
//   }
// }

// /**
//  * Get example prompts for testing
//  */
// function getExamplePrompts() {
//   return [
//     "Fetch data from an API and send it to Slack",
//     "Get tweets about AI, summarize them, and email me the summary",
//     "Scrape a website, transform the data, and send to Slack",
//     "Fetch data, summarize it, and send notifications",
//     "Get customer feedback, analyze it with AI, and email results",
//     "Monitor social media, extract trends, and notify team",
//     "Collect survey responses, summarize insights, and share via email",
//     "Fetch news articles, filter by topic, and post to Slack"
//   ];
// }

 
// export { generateWorkflowFromText, getExamplePrompts };


// server/src/services/nlp/textToWorkflow.service.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import  systemPrompt  from './promptTemplates.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv'; 
dotenv.config(); 

// Initialize Gemini client
// Log partial API key for debugging
const apiKey = process.env.GEMINI_API_KEY;
// console.log('API Key (last 4 chars):', apiKey ? `...${apiKey.slice(-4)}` : 'not found');

// Check for API key at startup, but only if genAI is initialized here.
if (!apiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined in environment variables.");
  // process.exit(1); // Or handle this more gracefully depending on your app structure
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Parse AI response and extract JSON workflow
 */
function extractWorkflowJSON(response) {
  let content = response.trim();
  
  // Remove markdown code blocks if present
  content = content.replace(/```json|```/g, ''); // Improved regex
  content = content.trim();
  
  // Try to find JSON in the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }
  
  try {
    const workflow = JSON.parse(jsonMatch[0]);
    return workflow;
  } catch (error) {
    throw new Error('Failed to parse JSON from AI response: ' + error.message);
  }
}

/**
 * Validate workflow structure
 */
function validateWorkflowStructure(workflow) {
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Workflow must have a "nodes" array');
  }
  
  if (!workflow.edges || !Array.isArray(workflow.edges)) {
    throw new Error('Workflow must have an "edges" array');
  }
  
  if (workflow.nodes.length === 0) {
    throw new Error('Workflow must have at least one node');
  }
  
  // Validate each node
  workflow.nodes.forEach((node, index) => {
    if (!node.id) {
      throw new Error(`Node at index ${index} is missing required field: id`);
    }
    if (!node.type) {
      throw new Error(`Node ${node.id} is missing required field: type`);
    }
  });
  
  // Validate each edge
  workflow.edges.forEach((edge, index) => {
    if (!edge.source) {
      throw new Error(`Edge at index ${index} is missing required field: source`);
    }
    if (!edge.target) {
      throw new Error(`Edge at index ${index} is missing required field: target`);
    }
    
    // Check if source and target nodes exist
    const sourceExists = workflow.nodes.some(n => n.id === edge.source);
    const targetExists = workflow.nodes.some(n => n.id === edge.target);
    
    if (!sourceExists) {
      throw new Error(`Edge references non-existent source node: ${edge.source}`);
    }
    if (!targetExists) {
      throw new Error(`Edge references non-existent target node: ${edge.target}`);
    }
  });
  
  return true;
}

/**
 * Enhance workflow with additional metadata
 */
function enhanceWorkflow(workflow, userPrompt) {
  return {
    ...workflow,
    metadata: {
      generatedFrom: userPrompt,
      generatedAt: new Date().toISOString(),
      version: '1.0',
      aiProvider: 'gemini'
    }
  };
}

/**
 * Main function: Generate workflow from text using Gemini
 * @param {string} userPrompt - Natural language description
 * @param {object} options - Generation options
 * @returns {Promise<object>} - Generated workflow
 */
async function generateWorkflowFromText(userPrompt, options = {}) {
  const startTime = Date.now();
  
  // ***FIX 1:*** Declare aiResponse here, in the outer scope
  let aiResponse = ''; 

  try {
    console.log(`\n🤖 Generating workflow from prompt: "${userPrompt}"`);
    
    // Validate input
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      throw new Error('Prompt must be a non-empty string');
    }
    
    if (userPrompt.length > 500) {
      throw new Error('Prompt is too long (max 500 characters)');
    }
    
    // Check if API key is configured (this check is slightly redundant if done at startup, but good for safety)
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in environment variables');
    }
    
    // Initialize Gemini model
    console.log('📡 Calling Gemini API...');

    const requestedModel = options.model || 'gemini-2.5-pro'; // You set this
    console.log(`Using Gemini model: ${requestedModel}`);
    
    const model = genAI.getGenerativeModel({ 
      model: requestedModel,
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent results
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    // Combine system prompt with user prompt
    const fullPrompt = `${systemPrompt}\n\nNow, convert this user request into a workflow JSON:\n\nUser Request: "${userPrompt}"\n\nYour JSON Response:`;
    
    // Generate content
    try {
      console.log('Making API request with configuration:', {
        // ***FIX 2:*** Use the correct model variable in the log
        model: requestedModel,
        apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
      });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;

      // ***FIX 3:*** Assign the value, don't re-declare with 'const'
      aiResponse = response.text();

    } catch (error) {
      console.error('Detailed API Error:', {
        message: error.message,
        status: error.status,
        details: error.details
      });
      throw error; // Re-throw to be caught by the outer catch block
    }
    
    console.log('✅ Gemini response received');
    // console.log('Raw response:', aiResponse); // This line will now work. Uncomment for debugging.
    
    // Extract and parse JSON
    console.log('🔍 Extracting workflow JSON...');
    const workflow = extractWorkflowJSON(aiResponse);
    
    // Validate structure
    console.log('✅ Validating workflow structure...');
    validateWorkflowStructure(workflow);
    
    // Enhance with metadata
    const enhancedWorkflow = enhanceWorkflow(workflow, userPrompt);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Workflow generated successfully in ${executionTime}ms\n`);
    
    return {
      success: true,
      workflow: enhancedWorkflow,
      prompt: userPrompt,
      executionTime: `${executionTime}ms`,
      aiProvider: 'gemini',
      model: requestedModel,
      cost: '0.000000' // Gemini is FREE!
    };
    
  } catch (error) {
    console.error('❌ Workflow generation failed:', error.message);
    
    // ***FIX 4:*** Log the raw response on failure to help debug bad JSON
    if (aiResponse) {
      console.error('Raw AI response on failure:', aiResponse);
    }
    
    return {
      success: false,
      error: error.message,
      prompt: userPrompt,
      executionTime: `${Date.now() - startTime}ms`,
      aiProvider: 'gemini'
    };
  }
}

/**
 * Get example prompts for testing
 */
function getExamplePrompts() {
  return [
    "Fetch data from an API and send it to Slack",
    "Get tweets about AI, summarize them, and email me the summary",
    "Scrape a website, transform the data, and send to Slack",
    "Fetch data, summarize it, and send notifications",
    "Get customer feedback, analyze it with AI, and email results",
    "Monitor social media, extract trends, and notify team",
    "Collect survey responses, summarize insights, and share via email",
    "Fetch news articles, filter by topic, and post to Slack"
  ];
}

 
export { generateWorkflowFromText, getExamplePrompts };