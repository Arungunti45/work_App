"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
exports.healthCheck = (0, https_1.onRequest)((request, response) => {
    logger.info("Health check called!", { structuredData: true });
    response.send("GET YOUR JOB - Functions are healthy!");
});
//# sourceMappingURL=index.js.map