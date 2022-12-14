import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  //addDummyDbItems,
  addDbItem,
  getAllDbItems,
  getDbItemById,
  DbItem,
  updateDbItemById,
  deleteDbItemById,
  addDbCompletedItem,
  getAllCompletedDbItems,
  clearCompleted,
} from "./db";
import filePath from "./filePath";
import { Client } from "pg"; //need to install

const client = new Client(process.env.DATABASE_URL);

//TODO: this request for a connection will not necessarily complete before the first HTTP request is made!
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

// // API info page
// app.get("/", (req, res) => {
//   const pathToFile = filePath("../public/index.html");
//   res.sendFile(pathToFile);
// });

// GET /items
app.get("/items", async (req, res) => {
  const text = "select * from toDo";
  const allItems = await client.query(text);
  //const allSignatures = getAllDbItems();
  
    res.status(200).json({
      status: "success",
      data: {
        allItems,
      }
    })
  })
   

// POST /items
app.post<{}, {}, DbItem>("/items", async (req, res) => {
  // to be rigorous, ought to handle non-conforming request bodies
  // ... but omitting this as a simplification
  //const postData = req.body;
  //const createdSignature = addDbItem(postData);
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

app.get("/completed", (req, res) => {
  const allSignatures = getAllCompletedDbItems();
  res.status(200).json(allSignatures);
});

// POST /completed
app.post<{}, {}, DbItem>("/completed", (req, res) => {
  // to be rigorous, ought to handle non-conforming request bodies
  // ... but omitting this as a simplification
  const postData = req.body;
  const createdSignature = addDbCompletedItem(postData);
  res.status(201).json(createdSignature);
});

// GET /items/:id
app.get<{ id: string }>("/items/:id", (req, res) => {
  const matchingSignature = getDbItemById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// DELETE /items/:id
app.delete<{ id: string }>("/items/:id", (req, res) => {
  const matchingSignature = getDbItemById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    const deletedItem = deleteDbItemById(matchingSignature.id);
    res.status(200).json(deletedItem);
  }
});

app.delete<{}>("/completed", (req, res) => {
  clearCompleted();
  res.status(200).json();
});

// PATCH /items/:id
app.patch<{ id: string }, {}, Partial<DbItem>>("/items/:id", (req, res) => {
  const matchingSignature = updateDbItemById(parseInt(req.params.id), req.body);
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
