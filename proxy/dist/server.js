"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// include dependencies
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const cors_1 = __importDefault(require("cors"));
const port = 3003;
const pathFilter = function (path, req) {
    const acceptedMethods = ["GET", "HEAD", "POST", "OPTIONS"];
    return path.match("^/api") && acceptedMethods.includes(req.method);
};
const options = {
    target: "http://localhost:3002",
    pathFilter,
};
const exampleProxy = (0, http_proxy_middleware_1.createProxyMiddleware)(options);
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ methods: ["GET", "POST", "OPTIONS", "HEAD"] }));
app.use("/api", exampleProxy);
app.listen(port);
