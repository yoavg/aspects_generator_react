import { get_title } from '@/app/apis';
import Results from '@/components/Results';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
 
export default function Page() {
  const router = useRouter()
  const [title, setTitle] = useState<string>("");

  const corpusId = parseInt(router.query.corpusId as string);

  useEffect(() => {
    console.log(corpusId);
    get_title(corpusId).then(setTitle);
  }, [corpusId])

  return (
    <div>
      <Results corpusId={corpusId} title={title} />
      <div style={{ padding: "5px" }}/>
      <Button variant="outlined" onClick={() => router.push("/")}>New Query</Button>
    </div>
  )
}