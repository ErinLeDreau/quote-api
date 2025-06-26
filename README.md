  markdown
# Quotes API

A simple and efficient RESTful API for managing a collection of quotes in French and English.

## 🚀 Features

- ✨ French and English quotes management
- 🎲 Random quote retrieval
- 📝 Bulk import functionality
- 🔍 Language filtering
- 📚 Built-in documentation

## 🛠️ Tech Stack

- Node.js
- Express.js
- Better-SQLite3
- SQLite (database)

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (usually installed with Node.js)

## ⚙️ Installation

1. Clone the repository:
 
bash git clone <your-repo-url> cd quotes-api
  

2. Install dependencies:
 
bash npm install
  

3. Start the server:
 
bash npm start
  

The server starts by default on port 3000 (http://localhost:3000)

## 📌 Endpoints

### Get all quotes
 
http GET /quotes
  

### Get all quotes for a specific language
 
http GET /:language/quotes
  

### Get a random quote
 
http GET /:language/quote
  

### Add a new quote
 
http POST /:language/quote
  
Request body example:
 
json { "quote": "Life is beautiful", "author": "John Doe" }
  

### Bulk import
 
http POST /quotes
  
Request body example:
 
json [ {
latex_unknown_tag
  

### API Documentation
 
http GET /documentation
  

## 🔍 Response Formats

### Single Quote
 
json { "quote": "Life is beautiful", "author": "John Doe", "language": "en" }
  

### List of Quotes
 
json { "total": 2, "quotes": [ {  }
latex_unknown_tag
  

## 🔧 Configuration

The server uses the following environment variables:
- `PORT`: Server port (default: 3000)

## 📝 Testing

To run tests (to be implemented):
 
bash npm test
  

## 🛡️ CORS

The API is configured with CORS to allow cross-origin requests. All domains are allowed by default.

## 🚨 Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `201`: Resource created
- `400`: Bad request
- `404`: Resource not found
- `500`: Server error

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📦 Project Structure
 
. ├── server.js # Main application file ├── database.js # Database configuration and queries ├── package.json # Project dependencies and scripts └── README.md # This file
  

## 🔒 Security

- All SQL queries are prepared statements to prevent SQL injection
- Input validation for all endpoints
- No sensitive data exposed in responses

## 🚀 Deployment

1. Ensure all dependencies are installed:
 bash
npm install
 
 
1. Set environment variables if needed
2. Start the server:
  bash
npm start
 
## 📜 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
## 📞 Support
For questions or issues, please open a GitHub issue.
## ✨ Acknowledgments
- Thanks to all contributors
- Inspired by the need for easy multilingual quote management

Built with ❤️ for the developer community
  

This English version includes:
1. Clear project description
2. Complete installation instructions
3. Detailed endpoint documentation
4. Request and response examples
5. Configuration information
6. Contributing guidelines
7. Project structure
8. Security considerations
9. Deployment instructions
10. Professional formatting with emojis for better readability

The sections are logically organized from most to least important, allowing users to qu
 
