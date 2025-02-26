import { AspectsDetails } from "@/pages/api/aspects_summary";
import { PaperDetails } from "@/pages/api/paper";


export async function get_corpus_id(title: string): Promise<PaperDetails | null> {
  const response = fetch("api/paper", { method: "POST", body: JSON.stringify({ title}), headers: { "Content-Type": "application/json" } });
  return (await response).json();
}

export async function get_aspects_data(corpusId: number): Promise<AspectsDetails | null> {
  const response = fetch("api/aspects_summary", { method: "POST", body: JSON.stringify({ corpusId }), headers: { "Content-Type": "application/json" } });
  return (await response).json();
}
