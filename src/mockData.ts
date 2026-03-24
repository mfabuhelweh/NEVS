import { Election, Voter, BlockchainTransaction, District } from './types';

export const MOCK_DISTRICTS: District[] = [
  { id: 'd1', name: 'العاصمة - المنطقة الأولى', voterCount: 50000 },
  { id: 'd2', name: 'المنطقة الشمالية', voterCount: 45000 },
  { id: 'd3', name: 'المنطقة الساحلية', voterCount: 35000 },
  { id: 'd4', name: 'المنطقة الجنوبية', voterCount: 20000 }
];

export const MOCK_CANDIDATES = [
  {
    id: 'c1',
    name: 'د. أحمد المنصور',
    party: 'حزب العدالة والتنمية',
    image: 'https://picsum.photos/seed/p1/200/200',
    votes: 45230,
    program: 'تطوير البنية التحتية الرقمية وتعزيز التعليم التقني.',
    districtId: 'd1'
  },
  {
    id: 'c2',
    name: 'أ. سارة الراشد',
    party: 'كتلة المستقبل الوطني',
    image: 'https://picsum.photos/seed/p2/200/200',
    votes: 38120,
    program: 'تمكين الشباب والمرأة في سوق العمل ودعم المشاريع الصغيرة.',
    districtId: 'd1'
  },
  {
    id: 'c3',
    name: 'م. خالد العتيبي',
    party: 'تحالف النهضة الاقتصادية',
    image: 'https://picsum.photos/seed/p3/200/200',
    votes: 12450,
    program: 'تحقيق الاكتفاء الذاتي الغذائي وتطوير الصناعات المحلية.',
    districtId: 'd2'
  }
];

export const MOCK_ELECTION: Election = {
  id: 'e1',
  title: 'الانتخابات البرلمانية الوطنية 2025',
  description: 'انتخاب أعضاء مجلس الشعب للدورة التشريعية القادمة.',
  status: 'active',
  startDate: '2025-03-01T08:00:00Z',
  endDate: '2025-03-25T20:00:00Z',
  candidates: MOCK_CANDIDATES,
  districts: MOCK_DISTRICTS,
  totalVotes: 95800,
  registeredVoters: 150000
};

export const MOCK_TRANSACTIONS: BlockchainTransaction[] = Array.from({ length: 15 }).map((_, i) => ({
  hash: Math.random().toString(16).substring(2, 15) + Math.random().toString(16).substring(2, 15),
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
  blockNumber: 1245000 - i,
  encryptedVote: '0x' + Math.random().toString(16).substring(2, 64),
  zkpProof: 'zkp_' + Math.random().toString(36).substring(2, 32),
  districtId: MOCK_DISTRICTS[i % MOCK_DISTRICTS.length].id
}));
