import { get_corpus_id } from "@/app/apis";
import { PaperDetails } from "@/pages/api/paper";
import { LinearProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState } from "react";

interface Props {
  setPaperDetails: (paperDetails: PaperDetails) => void;
}

export default function Search(props: Props) {
  const { setPaperDetails } = props;
  const [searching, setSearching] = useState<boolean>(false);
  const [localTitle, setLocalTitle] = useState<string>("");

  const handleSearch = (title: string): void => {
    setSearching(true)
    get_corpus_id(title).then((cid) => {
      if (cid === null) {
        setSearching(false);
        return;
      }
      setPaperDetails(cid)
    });
  }

  if (searching) {
    return (
      <div>
        <h2>What do papers say about a paper?</h2>
        <p>{`Searching for "${localTitle}"`}</p>
        <LinearProgress />
      </div>
    );
  }
  else {
    return (
      <div>
        <h2>What do papers say about a paper?</h2>
        <TextField
          style={{ width: "80ch" }}
          label="Which paper? (title)"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(localTitle);
              e.preventDefault();
            }
          }}
        />
      </div>
    )
  }
}
