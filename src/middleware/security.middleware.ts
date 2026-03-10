import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Router } from 'express';

export const securityMiddleware = (router: Router) => {
  router.use(helmet());
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
  });

  router.use(limiter);
};
