import type { NextApiRequest, NextApiResponse } from 'next'

const s2_api_key = process.env.ASPECTS_S2_API_KEY as string;

async function get_title_by_id(corpusId: number): Promise<string> {
  const paper_details = `https://api.semanticscholar.org/graph/v1/paper/corpusId:${corpusId}`;
  const response = await fetch(paper_details, { method: "GET", headers: { "x-api-key": s2_api_key } });
  const json = await response.json();
  return json.title;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ title: string }>
) {
  const { corpusId } = req.body;
  get_title_by_id(corpusId).then(title => res.status(200).json({ title}));
}
