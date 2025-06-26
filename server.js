/**
 * Quotes API Server
 * 
 * RESTful API for managing multilingual quotes with SQLite storage.
 * Supports both French and English quotes with features including:
 * - Random quote retrieval
 * - Language-specific filtering
 * - Bulk import capabilities
 * - Built-in API documentation
 * 
 * @module server
 * @requires express
 * @requires dotenv
 * @requires better-sqlite3
 */

require('dotenv').config();

const express = require('express');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Middleware Configuration
// ============================================================================

/**
 * Global middleware setup for parsing and CORS
 */
app.use(express.json());
app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// ============================================================================
// Middleware Functions
// ============================================================================

/**
 * Validates the language parameter in requests
 * Ensures only supported languages (fr, en) are processed
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateLanguage = (req, res, next) => {
  if (!['fr', 'en'].includes(req.params.language)) {
    return res.status(400).json({ error: 'Langue non supportée / Unsupported language' });
  }
  next();
};

/**
 * Validates quote objects for bulk import
 * Ensures all required fields are present and valid
 * 
 * @param {Array} quotes - Array of quote objects to validate
 * @returns {boolean} Validation result
 */
const validateQuotes = (quotes) => {
  if (!Array.isArray(quotes)) return false;
  return quotes.every(quote => 
    quote.quote && 
    quote.author && 
    quote.language && 
    ['fr', 'en'].includes(quote.language)
  );
};

// ============================================================================
// Health Check Endpoint
// ============================================================================

/**
 * Health check endpoint for monitoring
 * @route GET /health
 * @returns {Object} Status indication
 */
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================================================
// API Documentation Endpoint
// ============================================================================

/**
 * Interactive API documentation
 * @route GET /documentation
 * @returns {Object} Complete API documentation
 */
app.get('/documentation', (_, res) => {
  res.json({
    name: "Quotes API",
    version: "1.0.0",
    description: "API RESTful multilingue pour la gestion de citations",
    baseUrl: process.env.NODE_ENV === 'production' 
      ? process.env.API_URL 
      : `http://localhost:${PORT}`,
    endpoints: {
      health: {
        path: "/health",
        method: "GET",
        description: "Vérifie l'état de l'API",
      },
      quotes: {
        getAllQuotes: {
          path: "/quotes",
          method: "GET",
          description: "Récupère toutes les citations",
          response: { type: "QuotesResponse" }
        },
        bulkImport: {
          path: "/quotes",
          method: "POST",
          description: "Import en masse de citations",
          requestBody: { type: "Array<Quote>" }
        },
        getByLanguage: {
          path: "/:language/quotes",
          method: "GET",
          description: "Récupère toutes les citations dans une langue spécifique",
          parameters: { language: "fr|en" }
        },
        getRandom: {
          path: "/:language/quote",
          method: "GET",
          description: "Récupère une citation aléatoire",
          parameters: { language: "fr|en" }
        },
        addNew: {
          path: "/:language/quote",
          method: "POST",
          description: "Ajoute une nouvelle citation",
          parameters: { language: "fr|en" },
          requestBody: { type: "NewQuote" }
        }
      }
    },
    schemas: {
      Quote: {
        type: "object",
        required: ["quote", "author", "language"],
        properties: {
          quote: { type: "string" },
          author: { type: "string" },
          language: { type: "string", enum: ["fr", "en"] }
        }
      },
      QuotesResponse: {
        type: "object",
        properties: {
          total: { type: "number" },
          quotes: { type: "Array<Quote>" }
        }
      }
    }
  });
});

// ============================================================================
// Quote Management Routes
// ============================================================================

/**
 * Retrieve all quotes
 * @route GET /quotes
 * @returns {Object} All quotes with count
 */
app.get('/quotes', (_, res) => {
  const quotes = db.getAllQuotes();
  if (!quotes.length) {
    return res.status(404).json({ message: 'Aucune citation disponible / No quotes available' });
  }
  res.json({ total: quotes.length, quotes });
});

/**
 * Bulk import quotes
 * @route POST /quotes
 * @body {Array<Quote>} quotes - Array of quote objects
 */
app.post('/quotes', (req, res) => {
  const quotes = req.body;
  
  if (!validateQuotes(quotes)) {
    return res.status(400).json({ 
      error: 'Format invalide / Invalid format',
      expected: {
        type: "array",
        items: {
          quote: "string",
          author: "string",
          language: "fr|en"
        }
      }
    });
  }

  const result = db.addManyQuotes(quotes);
  res.status(result.success ? 200 : 500).json({
    success: result.success,
    message: result.success 
      ? `${result.count} citations importées / quotes imported` 
      : 'Échec de l\'import / Import failed',
    ...(result.error && { error: result.error })
  });
});

/**
 * Get all quotes for specific language
 * @route GET /:language/quotes
 * @param {string} language - Language code (fr|en)
 */
app.get('/:language/quotes', validateLanguage, (req, res) => {
  const quotes = db.getQuotesByLanguage(req.params.language);
  if (!quotes.length) {
    return res.status(404).json({ 
      message: `Aucune citation disponible en ${req.params.language} / No quotes available in ${req.params.language}` 
    });
  }
  res.json({
    language: req.params.language,
    total: quotes.length,
    quotes
  });
});

/**
 * Get random quote in specified language
 * @route GET /:language/quote
 * @param {string} language - Language code (fr|en)
 */
app.get('/:language/quote', validateLanguage, (req, res) => {
  const quote = db.getRandomQuote(req.params.language);
  if (!quote) {
    return res.status(404).json({ 
      message: `Aucune citation disponible en ${req.params.language} / No quotes available in ${req.params.language}` 
    });
  }
  res.json(quote);
});

/**
 * Add new quote in specified language
 * @route POST /:language/quote
 * @param {string} language - Language code (fr|en)
 * @body {Object} quote - Quote object with text and author
 */
app.post('/:language/quote', validateLanguage, (req, res) => {
  const { quote, author } = req.body;
  
  if (!quote || !author) {
    return res.status(400).json({ 
      error: 'Champs requis manquants / Missing required fields',
      required: ['quote', 'author']
    });
  }

  try {
    db.addQuote(quote, author, req.params.language);
    res.status(201).json({ 
      message: 'Citation ajoutée avec succès / Quote added successfully',
      quote: { quote, author, language: req.params.language }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// Error Handling
// ============================================================================

/**
 * 404 Not Found handler
 */
app.use((_, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée / Route not found' 
  });
});

/**
 * Global error handler
 */
app.use((err, _, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur / Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// ============================================================================
// Server Startup
// ============================================================================

/**
 * Start the server and listen for connections
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Server starting...`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Port: ${PORT}`);
  console.log(`Documentation: http://localhost:${PORT}/documentation`);
});

module.exports = app;