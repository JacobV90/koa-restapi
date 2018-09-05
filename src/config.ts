import * as fs from 'fs';
export const config = JSON.parse(fs.readFileSync('./.restapi.json', 'utf-8'));
