import { SinglePubkey } from "@cosmjs/amino";

export interface RequestBody {
  pubKeys: SinglePubkey[];
  threshold: number;
  name: string;
}