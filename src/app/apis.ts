
export type PaperDetails = {
  corpusId: number;
  title: string;
}

export type AspectsDetails = {
  bullets: Array<string>;
  texts: Array<string>;
}

const s2_api_key = process.env.ASPECTS_S2_API_KEY as string;
const ASPECTS_ENDPOINT = "https://aspect-generator.allen.ai/api/1/nora/use-tool";


export async function get_corpus_id_old(title: string): Promise<PaperDetails | null> {
  console.log(s2_api_key)
  const title_search = `https://api.semanticscholar.org/graph/v1/paper/search/match?query=${title}&fields=corpusId,title`;
  const relevance_search = `https://api.semanticscholar.org/graph/v1/paper/search?query=${title}&fields=corpusId,title`;
  let response = await fetch(title_search, { method: "GET", headers: { "x-api-key": s2_api_key } });
  let json = await response.json();
  if ("error" in json) {
    response = await fetch(relevance_search, { method: "GET", headers: { "x-api-key": s2_api_key } });
    json = await response.json();
    if ("error" in json) return null;
  }
  return {
    corpusId: json.data[0].corpusId,
    title: json.data[0].title,
  }
}

async function poll(url: string, params: RequestInit): Promise<Response> {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const response = await fetch(url, params);
      if (response.status === 200) {
        resolve(response);
        clearInterval(interval);
      }
    }, 1000);
  })
}

export async function get_corpus_id(title: string): Promise<PaperDetails> {
  let response = await fetch("https://mabool.allen.ai/api/2/rounds", {
    method: "POST", headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "paper_description": title.split(" ").length < 4 ? `the ${title} paper` : title, "caller_actor_id": "aspect_generator_demo" }),
  });
  const location = response.headers.get("location")
  response = await poll(`https://mabool.allen.ai${location}`, { method: "GET" });
  const doc = (await response.json()).document_results[0];
  return { corpusId: doc.corpus_id, title: doc.title }
}

/*
export async function get_corpus_id(title: string): Promise<PaperDetails | null> {
  const response = fetch("api/paper", { method: "POST", body: JSON.stringify({ title}) });
  return (await response).json();
}
*/

export async function get_aspects_data(corpusId: number): Promise<AspectsDetails> {
  const response = await fetch(ASPECTS_ENDPOINT, {
    method: "POST", headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "corpus_id": corpusId }),
  });
  const tid = (await response.json()).task_id;
  return new Promise<AspectsDetails>((resolve) => {
    const interval = setInterval(() => {
      fetch(ASPECTS_ENDPOINT, {
        method: "POST", headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "corpus_id": corpusId, "task_id": tid }),
      }).then((r) => {
        r.json().then((json) => {
          if ("task_result" in json && json.task_result) {
            const results: Array<{ aspect_title: string, aspect_description: string }> = json.task_result.results;
            resolve({
              bullets: results.map(({ aspect_title }) => aspect_title as string),
              texts: results.map(({ aspect_description }) => aspect_description as string),
            });
            clearInterval(interval);
          }
        })
      })
    }, 500)
  },
  );
};
