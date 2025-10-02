const express = require("express");
const dotenv = require("dotenv");
const { connectDb } = require("./config/database");
const cors = require("cors");

dotenv.config();
connectDb();

const app = express();
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
  });
});

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Server running on port ${PORT}`,
  });
});

app.use("/api/auth", require("./routes/auth.routes"));

app.listen(PORT, () => {
  console.log(`🚀 App started on port ${PORT}. Listening for connections...`);
});
