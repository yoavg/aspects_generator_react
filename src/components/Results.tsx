import { get_aspects_data } from "@/app/apis";
import { AspectsDetails } from "@/pages/api/aspects_summary";
import { Card, CardContent, LinearProgress, Paper, Stack } from "@mui/material";
import { JSX, useEffect, useState } from "react";

interface Props {
  corpusId: number;
  title: string;
}


export default function Results(props: Props): JSX.Element {
  const { corpusId , title } = props;
  const [results, setResults] = useState<AspectsDetails | null>(null);

  useEffect(() => {
    let ignore = false;
    get_aspects_data(corpusId).then((res) => { if (!ignore) setResults(res) });
    return () => { ignore = true; }
  }, [corpusId]);

  if (results === null) {
    return (
      <div>
        <h2>What do papers say about a paper?</h2>
        <p>{`Fetching data for '${title}'`}</p>
        <LinearProgress />
      </div>
    )
  }

  return (
    <div>
      <h2>What do papers say about:</h2>
      <h1>{title}</h1>
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
  );
}