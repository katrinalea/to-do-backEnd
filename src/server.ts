import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "pg"; //need to install

// read in contents of key value pairs in the env file store as aenvironment variables (process.env)
dotenv.config();
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect();
const app = express();
/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    data: "hello",
  });
});
// GET /items
app.get("/items", async (req, res) => {
  const text = "select * from toDo where completed = 'false'";
  const dbResponse = await client.query(text);
  res.status(200).json({
    status: "success",
    data: dbResponse.rows,
  });
});

// POST /items
app.post("/items", async (req, res) => {
  const { message, completed } = req.body;
  console.log("whole req.bdoy", req.body);
  if (typeof message === "string") {
    const text =
      "insert into toDo (message, completed) values ($1, $2) returning *";
    const values = [message, completed];
    const dbResult = await client.query(text, values);
    res.status(201).json({
      status: "success",
      data: dbResult.rows,
    });
  } else {
    res.status(400).json({
      status: "fail",
      data: {
        message: " A string value is required",
      },
    });
  }
});

app.get("/completed", async (req, res) => {
  const text = "select * from toDo where completed = 'true'";
  const dbResponse = await client.query(text);
  res.status(200).json({
    status: "success",
    data: dbResponse.rows,
  });
});

app.patch("/items/:id", async (req, res) => {
  const { id } = req.body;
  const text = "update todo set completed = 'true' where id = $1";
  const values = [id];
  const dbResponse = await client.query(text, values);
  res.status(200).json({
    status: "success",
    data: dbResponse.rows,
  });
});

app.patch("/items/update/:id", async (req, res) => {
  const { id, message } = req.body;
  const text = "update todo set message = $2 where id = $1";
  const values = [id, message];
  const dbResponse = await client.query(text, values);
  res.status(200).json({
    status: "success",
    data: dbResponse.rows,
  });
});

// DELETE /items/:id
app.delete("/items/:id", async (req, res) => {
  const id = req.body.id;
  const text = "delete from toDo where id = $1";
  const value = [id];
  await client.query(text, value);
  res.status(200).json({
    status: "success",
  });
});

app.delete("/completed", async (req, res) => {
  const text = "delete from toDo where completed = 'true'";
  await client.query(text);
  res.status(200).json({
    status: "success",
  });
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
