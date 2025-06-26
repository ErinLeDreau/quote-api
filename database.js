const Database = require('better-sqlite3');

class QuotesDB {
  constructor() {
    this.db = new Database('quotes.db');
    this.init();
  }

  init() {
    // Enable foreign keys and create tables if they don't exist
    this.db.pragma('foreign_keys = ON');
    
    const schema = `
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote TEXT NOT NULL,
        author TEXT NOT NULL,
        language TEXT NOT NULL CHECK (language IN ('fr', 'en'))
      )
    `;
    
    this.db.exec(schema);

    // Prepare statements
    this.statements = {
      getAllQuotes: this.db.prepare(
        'SELECT quote, author, language FROM quotes ORDER BY language, author'
      ),
      
      getQuotesByLanguage: this.db.prepare(
        'SELECT quote, author, language FROM quotes WHERE language = ? ORDER BY author'
      ),
      
      getRandomQuote: this.db.prepare(
        'SELECT quote, author, language FROM quotes WHERE language = ? ORDER BY RANDOM() LIMIT 1'
      ),
      
      insertQuote: this.db.prepare(
        'INSERT INTO quotes (quote, author, language) VALUES (?, ?, ?)'
      ),
      
      insertManyQuotes: this.db.prepare(
        'INSERT INTO quotes (quote, author, language) VALUES (@quote, @author, @language)'
      )
    };
  }

  getAllQuotes() {
    return this.statements.getAllQuotes.all();
  }

  getQuotesByLanguage(language) {
    return this.statements.getQuotesByLanguage.all(language);
  }

  getRandomQuote(language) {
    return this.statements.getRandomQuote.get(language);
  }

  addQuote(quote, author, language) {
    return this.statements.insertQuote.run(quote, author, language);
  }

  addManyQuotes(quotes) {
    const insert = this.db.transaction((quotes) => {
      for (const quote of quotes) {
        this.statements.insertManyQuotes.run(quote);
      }
    });

    try {
      insert(quotes);
      return { success: true, count: quotes.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new QuotesDB();