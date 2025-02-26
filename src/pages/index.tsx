'use client'
import React, { useState } from "react";
import { PaperDetails } from "./api/paper";
import Search from "@/components/Search";
import { useRouter } from "next/router";

export default function Main() {
  const [paperDetails, setPaperDetails] = useState<PaperDetails | null>(null);
  const router = useRouter();

  if (paperDetails === null) {
    return (
      <Search setPaperDetails={setPaperDetails} />
    )
  }
  router.push(`paper/${paperDetails.corpusId}`);
}
