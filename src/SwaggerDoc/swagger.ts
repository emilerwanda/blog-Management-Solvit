import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog Management API',
      version: '1.0.0',
      description: 'A blog management system with Google OAuth2 authentication',
      contact: {
        name: 'Emile',
        url: 'https://github.com/fab-ryan/blog-managements',
      },
    },
    servers: [
      {
        url: 'http://localhost:5500',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        googleOAuth: {
          type: 'oauth2',
          flows: {
            implicit: {
              authorizationUrl: 'http://localhost:5500/auth/google',
              scopes: {
                profile: 'User profile information',
                email: 'User email address',
              },
            },
          },
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            photo: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Blog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            content: { type: 'string' },
            blog_image_url: { type: 'string' },
            author: { type: 'string', format: 'uuid' },
            isPublished: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            author: { type: 'string', format: 'uuid' },
            blogId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Like: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user: { type: 'string', format: 'uuid' },
            blogId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Subscriber: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Blogs', description: 'Blog management endpoints' },
      { name: 'Comments', description: 'Comment management endpoints' },
      { name: 'Likes', description: 'Like management endpoints' },
      { name: 'Newsletter', description: 'Newsletter subscription endpoints' },
    ],
    paths: {
      // --- AUTH ---
      '/': {
        get: {
          tags: ['Auth'],
          summary: 'Welcome page',
          responses: {
            '200': {
              description: 'Welcome message',
              content: {
                'text/plain': {
                  schema: {
                    type: 'string',
                    example: 'Welcome, First login with google',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/google': {
        get: {
          tags: ['Auth'],
          summary: 'Google OAuth2 login',
          description: 'Redirects to Google for authentication',
          responses: {
            '302': { description: 'Redirect to Google login' },
          },
        },
      },
      '/auth/google/callback': {
        get: {
          tags: ['Auth'],
          summary: 'Google OAuth2 callback',
          responses: {
            '302': { description: 'Redirect to dashboard on success' },
            '401': { description: 'Authentication failed' },
          },
        },
      },
      '/dashboard': {
        get: {
          tags: ['Auth'],
          summary: 'User dashboard',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': {
              description: 'User info',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
          },
        },
      },
      '/logout': {
        get: {
          tags: ['Auth'],
          summary: 'Logout user',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': { description: 'Logged out successfully' },
          },
        },
      },

      // --- USERS ---
      '/users': {
        post: {
          tags: ['Users'],
          summary: 'Create new user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          responses: {
            '201': { description: 'User created' },
          },
        },
      },

      // --- BLOGS ---
      '/blogs': {
        post: {
          tags: ['Blogs'],
          summary: 'Create a blog post',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Blog' } } },
          },
          responses: {
            '201': { description: 'Blog created' },
          },
        },
      },

      // --- COMMENTS ---
      '/comments': {
        post: {
          tags: ['Comments'],
          summary: 'Create a comment',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Comment' } } },
          },
          responses: {
            '201': { description: 'Comment created' },
          },
        },
      },

      // --- LIKES ---
      '/likes': {
        post: {
          tags: ['Likes'],
          summary: 'Like a blog post',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Like' } } },
          },
          responses: {
            '201': { description: 'Like added' },
          },
        },
      },

      // --- NEWSLETTER ---
      '/newsletter/subscribe': {
        post: {
          tags: ['Newsletter'],
          summary: 'Subscribe to newsletter',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscriber' } } },
          },
          responses: {
            '201': { description: 'Subscribed successfully' },
          },
        },
      },
      '/newsletter/unsubscribe': {
        post: {
          tags: ['Newsletter'],
          summary: 'Unsubscribe from newsletter',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } } } },
          },
          responses: {
            '200': { description: 'Unsubscribed successfully' },
          },
        },
      },
      '/newsletter/subscribers': {
        get: {
          tags: ['Newsletter'],
          summary: 'Get all subscribers',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': { description: 'List of subscribers' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
