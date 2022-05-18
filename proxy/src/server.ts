// include dependencies
import express, { Request } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
const port = 3003;

const pathFilter = function (path: string, req: Request) {
  const acceptedMethods = ["GET", "HEAD", "POST", "OPTIONS"];
  return path.match("^/api") && acceptedMethods.includes(req.method);
};

const options = {
  target: "http://localhost:3002",
  pathFilter,
};

const exampleProxy = createProxyMiddleware(options);

const app = express();
app.use(cors({ methods: ["GET", "POST", "OPTIONS", "HEAD"] }));
app.use("/api", exampleProxy);
app.listen(port);
