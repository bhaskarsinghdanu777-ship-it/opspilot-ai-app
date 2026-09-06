import serverless from 'serverless-http';
import { app } from '../../server';

// Serverless handler for Netlify Functions to run the Express API endpoints
export const handler = serverless(app);
