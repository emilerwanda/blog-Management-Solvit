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
      { url: 'http://localhost:5500', description: 'Development server' },
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
      // AUTH
      '/': { get: { tags: ['Auth'], summary: 'Welcome page', responses: { 200: { description: 'Welcome message' } } } },
      '/auth/google': { get: { tags: ['Auth'], summary: 'Google OAuth2 login', responses: { 302: { description: 'Redirect to Google' } } } },
      '/auth/google/callback': { get: { tags: ['Auth'], summary: 'Google OAuth2 callback', responses: { 302: { description: 'Redirect success' }, 401: { description: 'Auth failed' } } } },
      '/dashboard': { get: { tags: ['Auth'], summary: 'User dashboard', security: [{ sessionAuth: [] }], responses: { 200: { description: 'User info', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } } } },
      '/auth/logout': { get: { tags: ['Auth'], summary: 'Logout user', security: [{ sessionAuth: [] }], responses: { 200: { description: 'Logged out' } } } },
      '/auth/login': { post: { tags: ['Auth'], summary: 'Login user', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } }, responses: { 200: { description: 'Login success' }, 401: { description: 'Invalid credentials' } } } },

      // USERS
      '/users': { post: { tags: ['Users'], summary: 'Create new user', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string' }, gender: { type: 'string' } }, required: ['name', 'email', 'password'] } } } }, responses: { 201: { description: 'User created' } } } },

      // BLOGS
      '/blogs': {
        get: { tags: ['Blogs'], summary: 'Get all blogs', responses: { 200: { description: 'List of blogs' } } },
        post: { tags: ['Blogs'], summary: 'Create blog', security: [{ sessionAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Blog' } } } }, responses: { 201: { description: 'Blog created' } } }
      },
      '/blogs/{id}': { get: { tags: ['Blogs'], summary: 'Get blog by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Blog found' }, 404: { description: 'Not found' } } } },

      // COMMENTS
      '/blogs/{blogId}/comments': {
        get: { tags: ['Comments'], summary: 'Get comments for a blog', parameters: [{ name: 'blogId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'List of comments' } } }
      },
      '/comments': { post: { tags: ['Comments'], summary: 'Create a comment', security: [{ sessionAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Comment' } } } }, responses: { 201: { description: 'Comment created' } } } },
      '/comments/{id}': { get: { tags: ['Comments'], summary: 'Get comment by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'Comment found' }, 404: { description: 'Not found' } } } },

      // LIKES
      '/blogs/{blogId}/likes': { get: { tags: ['Likes'], summary: 'Get likes for a blog', parameters: [{ name: 'blogId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 200: { description: 'List of likes' } } } },
      '/likes': { post: { tags: ['Likes'], summary: 'Like a blog post', security: [{ sessionAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Like' } } } }, responses: { 201: { description: 'Like added' } } } },

      // NEWSLETTER
      '/newsletter/subscribe': { post: { tags: ['Newsletter'], summary: 'Subscribe to newsletter', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscriber' } } } }, responses: { 201: { description: 'Subscribed successfully' } } } },
      '/newsletter/unsubscribe': {
        get: { tags: ['Newsletter'], summary: 'Unsubscribe (via link)', parameters: [{ name: 'email', in: 'query', required: true, schema: { type: 'string', format: 'email' } }], responses: { 200: { description: 'Unsubscribed successfully' } } },
        post: { tags: ['Newsletter'], summary: 'Unsubscribe from newsletter', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } } } }, responses: { 200: { description: 'Unsubscribed successfully' } } }
      },
      '/newsletter/subscribers': { get: { tags: ['Newsletter'], summary: 'Get all subscribers', security: [{ sessionAuth: [] }], responses: { 200: { description: 'List of subscribers' } } } }
    }
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
