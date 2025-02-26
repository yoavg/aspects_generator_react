
export type AspectsDetails = {
  bullets: Array<string>;
  texts: Array<string>;
}

const ASPECTS_ENDPOINT = "https://aspect-generator.allen.ai/api/1/nora/use-tool";

export async function get_aspect_data(corpusId: number): Promise<AspectsDetails> {
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AspectsDetails>
) {
  get_aspect_data(req.body.corpusId).then((data) => {
    res.status(200).json(data);
  });
}