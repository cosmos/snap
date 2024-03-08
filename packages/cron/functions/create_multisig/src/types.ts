import { SinglePubkey } from "npm:@cosmjs/amino";

export interface RequestBody {
  pubKeys: SinglePubkey[];
  threshold: number;
  name: string;
}