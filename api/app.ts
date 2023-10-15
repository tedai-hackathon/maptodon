import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database("maptodon.db");

app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Define your SQLite schema
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS maptodon (session_id TEXT UNIQUE, lat FLOAT NOT NULL, long FLOAT NOT NULL, ts TIMESTAMP NOT NULL, splat_blob BLOB NOT NULL)"
  );
});

// Define a route to get map entries
app.get("/api/entries", (req: Request, res: Response) => {
  const { northeast, southwest } = req.query;
  const [neLat, neLong] = (northeast as string)
    .split(",")
    .map((n) => Number(n));
  const [swLat, swLong] = (southwest as string)
    .split(",")
    .map((n) => Number(n));

  // Query the database for map entries within the specified coordinates
  db.all(
    "SELECT session_id, lat, long FROM maptodon WHERE lat BETWEEN ? AND ? AND long BETWEEN ? AND ?",
    [swLat, neLat, swLong, neLong],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json(rows);
      }
    }
  );
});

// Define a route to get the "splat" blob for a specific session ID
app.get("/api/splat/:session_id_ext", (req: Request, res: Response) => {
  const { session_id_ext } = req.params;
  const session_id = session_id_ext.split(".")[0]; // Remove the file extension

  // Query the database for the "splat" blob for the specified session ID
  db.get<{ splat_blob: any }>(
    "SELECT splat_blob FROM maptodon WHERE session_id = ?",
    [session_id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
      } else if (!row) {
        res.status(404).json({ error: "Session ID not found" });
      } else {
        // Set the content type to 'application/octet-stream' for binary data
        res.contentType("application/octet-stream");
        res.send(row.splat_blob);
      }
    }
  );
});

// Define a route to proxy OpenStreetMap tile requests
app.get("/api/tiles/:s/:z/:x/:y", async (req: Request, res: Response) => {
  const { s, z, x, y } = req.params;
  const url = `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`;

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.contentType("image/png");
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
