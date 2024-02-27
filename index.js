import Express from "express";
import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import axios from "axios";
import * as os from "os";
import dotenv from "dotenv";

export class OpenPoolNodeService {
  constructor() {
    this._server = process.env.OPEN_POOL_SERVER;
    this.initTranscoderState = { Region: process.env.REGION };
    this.initPoolStatsState = {
      Commission: "0.00",
      Version: "0.0.0",
      BasePrice: "000",
      TotalPayouts: "000",
    };
  }
  transcoders() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this._server}/transcoders`)
        .catch((err) =>
          reject(
            JSON.stringify({
              error:
                "failed to fetch pool transcoders. contact the system administrator",
              ...this.initTranscoderState,
            })
          )
        )
        .then((res) => {
          if (res == undefined || res.data == undefined) {
            resolve(JSON.stringify(this.initTranscoderState));
            return;
          }
          for (let t in res.data) {
            if (res.data[t] != undefined) {
              res.data[t]["Region"] = process.env.REGION;
            }
          }
          resolve(res.data);
        });
    });
  }

  status() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this._server}/poolStats`)
        .catch((err) =>
          reject(
            JSON.stringify({
              error:
                "failed to fetch pool status. contact the system administrator",
              ...this.initPoolStatsState,
            })
          )
        )
        .then((res) => {
          if (res == undefined || res.data == undefined) {
            resolve({});
            return;
          }

          resolve(res.data);
        });
    });
  }
}

export class OpenPoolNodeController {
  constructor() {
    this._service = new OpenPoolNodeService();
  }

  transcoders(req, res, next) {
    this._service
      .transcoders()
      .then((r) => res.json(r))
      .catch((err) => next(err));
  }

  status(req, res, next) {
    this._service
      .status()
      .then((r) => res.json(r))
      .catch((err) => next(err));
  }
}

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const port = process.env.PORT;

let controller = new OpenPoolNodeController();

const errorHandler = (err, req, res, next) => {
  const errors = err.errors || [{ message: err.message }];
  res.status(err.status || 500).json({ errors });
};

const app = new Express();
app.use(
  bodyParser.default.json({ limit: process.env.REQUEST_LIMIT || "100kb" })
);
app.use(
  bodyParser.default.urlencoded({
    extended: true,
    limit: process.env.REQUEST_LIMIT || "100kb",
  })
);
app.use(
  cors({
    origin: "*",
  })
);
app.use(
  bodyParser.default.text({ limit: process.env.REQUEST_LIMIT || "100kb" })
);
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(errorHandler);

app.get("/api/v1/status", (req, res, next) =>
  controller.status(req, res, next)
);
app.get("/api/v1/transcoders", (req, res, next) =>
  controller.transcoders(req, res, next)
);

app.listen(port, () => {
  console.log(
    `up and running in ${
      process.env.NODE_ENV || "development"
    } @: ${os.hostname()} on port: ${port}}`
  );
});
