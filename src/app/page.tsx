'use client'
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { CardContent } from "@mui/material";
import { get_aspects_data, get_corpus_id } from "./apis";
import { PaperDetails } from "@/pages/api/paper";
import { AspectsDetails } from "@/pages/api/aspects_summary";
// import "./globals.css";

export default function Main() {
  const [cid, setCid] = useState<PaperDetails | null>(null);
  const [results, setResults] = useState<AspectsDetails | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState<string>("");

  useEffect(() => {
    if (title !== null) {
      get_corpus_id(title).then((v) => { setCid(v); });
    }
  }, [title]);

  useEffect(() => {
    let ignore = false;
    if (cid !== null) {
      get_aspects_data(cid.corpusId).then((res) => { if (!ignore) setResults(res) });
    }
    return () => { console.log("cancel"); ignore = true; }
  }, [cid]);

  const handleNew = () => {
    setTitle(null);
    setCid(null);
    setResults(null);
  };

  if (title === null) {
    return (
      <div>
        <h2>What do papers say about a paper?</h2>
        <TextField
          style={{ width: "80ch" }}
          label="Paper title"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setTitle(localTitle);
              e.preventDefault();
            }
          }}
        />
      </div>
    )
  }

  const waiting = (cid === null || results === null);

  return (
    <div>
      {(title && results) ? <h2>What do papers say about</h2>: <h2>What do papers say about a paper?</h2>}
      {title && cid === null && (<p>{`Searching for "${title}"`}</p>)}
      {cid && results === null && (<p>{`Fetching data for '${cid.title}'`}</p>)}
      {waiting && <LinearProgress />}
      {cid && results && (
        <div>
          <h1>{cid.title}</h1>
          <Stack direction="row" spacing={2}>
            <Paper style={{ width: "80ch", padding: "32px" }}>
              {results.texts.map((b) => (<p key={b}>{b}</p>))}
            </Paper>
            <Card>
              <CardContent>
                <h2>Summary</h2>
                <ul>
                  {results.bullets.map((b) => (<li key={b}>{b}</li>))}
                </ul>
              </CardContent>
            </Card>
          </Stack>
        </div>
      )}
      <div style={{ padding: "5px" }}/>
      {title && <Button variant="outlined" onClick={handleNew}>{waiting ? "cancel" : "New Query"}</Button>}
    </div>
  );
}
