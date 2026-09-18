import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const healthCheck = onRequest((request, response) => {
  logger.info("Health check called!", {structuredData: true});
  response.send("GET YOUR JOB - Functions are healthy!");
});
