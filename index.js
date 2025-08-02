import 'dotenv/config'
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import i18next from 'i18next';
import middleware from 'i18next-http-middleware';
import path from 'path';
import http from 'http';
import Debug from 'debug';
import helmet from "helmet";
import './i18n.js';
import './app/subscribers/notificationService.js';

const debugLog = Debug('app:server');

const app = express();
const PORT = process.env.PORT || 3000;

global.baseDirectory = path.resolve('./');

app.use('/upload', express.static('upload'));

app.use(cors({ origin: "*" }));

app.use(middleware.handle(i18next));

app.use(express.json());

app.use(helmet());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("storage"));

app.get("/", async (req, res) => {
  try {
    res.json({ message: req.t("welcome") }, 200);
  } catch (error) {
    res.json({ error: error }, 500);
  }
});

app.use(routes);

// eslint-disable-next-line no-unused-vars
const server = http.createServer(app).listen(PORT, () =>
  debugLog(`Server is running on port ${PORT}.`)
);
