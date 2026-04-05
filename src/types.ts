export type ElectionStatus = 'draft' | 'active' | 'closed';

export interface District {
  id: string;
  name: string;
  voterCount: number;
}

export interface LocalList {
  id: string;
  name: string;
  districtId: string;
  candidates: Candidate[];
}

export interface Party {
  id: string;
  name: string;
  logo: string;
}

export interface Candidate {
  id: string;
  name: string;
  partyId?: string;
  image: string;
  votes: number;
  program: string;
  districtId: string;
  listId?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  startDate: string;
  endDate: string;
  candidates: Candidate[];
  districts: District[];
  totalVotes: number;
  registeredVoters: number;
}

export interface Voter {
  id: string;
  nationalId: string;
  name: string;
  isVerified: boolean;
  hasVoted: boolean;
  districtId: string;
}

export interface BlockchainTransaction {
  hash: string;
  timestamp: string;
  blockNumber: number;
  encryptedVote: string;
  zkpProof: string;
  districtId: string;
}
