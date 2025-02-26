import type { NextApiRequest, NextApiResponse } from 'next'

const s2_api_key = process.env.ASPECTS_S2_API_KEY as string;
 
export type PaperDetails = {
  corpusId: number;
  title: string;
}

async function poll(url: string, params: RequestInit): Promise<Response> {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const response = await fetch(url, params);
      if (response.status === 200) {
        resolve(response);
        clearInterval(interval);
      }
    }, 500);
  })
}

async function paper_finder_specific_paper(title: string): Promise<PaperDetails | null> {
  let response = await fetch("https://mabool.allen.ai/api/2/rounds", {
    method: "POST", headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "paper_description": title.split(" ").length < 4 ? `the ${title} paper` : title, "caller_actor_id": "aspect_generator_demo" }),
  });
  const location = response.headers.get("location")
  response = await poll(`https://mabool.allen.ai${location}`, { method: "GET" });
  const json = await response.json();
  if ("document_results" in json && json.document_results.length > 0) {
    const doc = json.document_results[0];
    return { corpusId: doc.corpus_id, title: doc.title }
  }
  return null;
}

async function get_corpus_id(title: string): Promise<PaperDetails | null> {
  const title_search = `https://api.semanticscholar.org/graph/v1/paper/search/match?query=${title}&fields=corpusId,title`;
  // const relevance_search = `https://api.semanticscholar.org/graph/v1/paper/search?query=${title}&fields=corpusId,title`;
  // response = await fetch(relevance_search, { method: "GET", headers: { "x-api-key": s2_api_key } });
  const response = await fetch(title_search, { method: "GET", headers: { "x-api-key": s2_api_key } });
  const json = await response.json();
  if ("data" in json) {
    return {
      corpusId: json.data[0].corpusId,
      title: json.data[0].title,
    }
  }
  // not matching a title, fallback to paper-finder specific paper
  const pfResult = await paper_finder_specific_paper(title);
  return pfResult;
}
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaperDetails>
) {
  get_corpus_id(req.body.title).then((details) => {
    res.status(200).json(details ?? { corpusId: 0, title: "Error" })
  });
}