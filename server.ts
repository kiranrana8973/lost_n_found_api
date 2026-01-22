import path from 'path';
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import 'colors';
import connectDB from './config/db';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';

// Import routes
import batchRoutes from './routes/batch_route';
import categoryRoutes from './routes/category_route';
import studentRoutes from './routes/student_route';
import itemRoutes from './routes/item_route';
import commentRoutes from './routes/comment_route';

const app: Application = express();

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to the database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Logging middleware
app.use(cookieParser()); // Cookie parser middleware

// Custom security middleware (compatible with Express v5)
app.use((req: Request, res: Response, next: NextFunction): void => {
  // Fields that should not be sanitized (emails, URLs, etc.)
  const skipFields = [
    'email',
    'username',
    'password',
    'mediaUrl',
    'profilePicture',
  ];

  const sanitize = (
    obj: Record<string, unknown>,
    parentKey = ''
  ): Record<string, unknown> => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        // Skip sanitization for specific fields
        if (skipFields.includes(key)) {
          continue;
        }

        if (typeof obj[key] === 'string') {
          // Prevent NoSQL injection - Remove $ from strings (but keep .)
          obj[key] = (obj[key] as string).replace(/\$/g, '');

          // Prevent XSS attacks - Only escape HTML in text fields, not emails/URLs
          const value = obj[key] as string;
          if (!value.includes('@') && !value.startsWith('http')) {
            obj[key] = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key] as Record<string, unknown>, key);
        }
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.params) sanitize(req.params as unknown as Record<string, unknown>);
  // Note: req.query is read-only in Express v5, so we skip it

  next();
});

app.use(helmet()); // Security middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure CORS
interface CorsCallback {
  (err: Error | null, allow?: boolean): void;
}

const corsOptions: cors.CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: CorsCallback
  ): void {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [];
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Enable CORS with options

app.use(limiter); // Apply rate limiting to all requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Routes
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/categories', categoryRoutes);

// Apply stricter rate limiting to login endpoint
app.use('/api/v1/students/login', authLimiter);
app.use('/api/v1/students', studentRoutes);

app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/comments', commentRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green.bold
  );
});

export default app;
