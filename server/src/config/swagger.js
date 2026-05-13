const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hikin Trento API',
      version: '1.0.0',
      description: 'API documentation for the Hikin Trento project'
    },
    servers: [
      {
        url: 'http://localhost:3000',   // port 5000 creates some problems with macOS's Control Center
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // ← Swagger will read comments from all route files
};

module.exports = swaggerJsdoc(options);