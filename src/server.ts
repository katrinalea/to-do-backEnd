import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import filePath from "./filePath";
import { Client } from "pg"; //need to install

const client = new Client(process.env.DATABASE_URL);

client.connect();
const app = express();
/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());
// read in contents of any environment variables in the .env file
dotenv.config();
// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;


app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    data: "hello"
  })
})
// GET /items
app.get("/items", async (req, res) => {
  const text = "select * from toDo where completed = 'false'";
  const dbResponse = await client.query(text);
    res.status(200).json({
      status: "success",
      data: dbResponse.rows
    })
  })
   

// POST /items
app.post("/items", async (req, res) => {
  const { message } = req.body;
  if (typeof message === "string") {
    const text = "insert into toDo (message) values ($1)";
    const values = [message];
    const createItem = await client.query(text, values);
    res.status(201).json({
      status: "success",
      data: {
        signature: createItem,
      },
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
  const allItems = await client.query(text);
  
    res.status(200).json({
      status: "success",
      data: {
        allItems,
      }
    })
  })


// DELETE /items/:id
app.delete("/items/:id", async (req, res) => {
  const id = req.body
  const text = "delete from toDo where id = $1";
  const value = [id]
  const dbResponse = await client.query(text, value);
    res.status(200).json({
      status: "success",
      data: dbResponse.rows
    })
  })

app.delete("/completed", async (req, res) => {
  const text = "delete from toDo where completed = 'true";
  const allItems = await client.query(text);
    res.status(200).json({
      status: "success",
      data: {
        allItems,
      }
    })
  })
  

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
