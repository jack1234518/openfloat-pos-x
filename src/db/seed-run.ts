import { config } from 'dotenv';
config({ path: '.env.local' });

import { ensureSeedData } from './seed';

ensureSeedData().catch(console.error);