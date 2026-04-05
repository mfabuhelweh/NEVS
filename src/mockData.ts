import { Election, Voter, BlockchainTransaction, District, Candidate, Party, LocalList } from './types';

export const MOCK_DISTRICTS: District[] = [
  { id: 'd1', name: 'العاصمة - المنطقة الأولى', voterCount: 50000 },
  { id: 'd2', name: 'المنطقة الشمالية', voterCount: 45000 },
  { id: 'd3', name: 'المنطقة الساحلية', voterCount: 35000 },
  { id: 'd4', name: 'المنطقة الجنوبية', voterCount: 20000 }
];

export const MOCK_PARTIES: Party[] = [
  { id: 'p1', name: 'حزب العدالة والتنمية', logo: 'https://picsum.photos/seed/logo1/100/100' },
  { id: 'p2', name: 'كتلة المستقبل الوطني', logo: 'https://picsum.photos/seed/logo2/100/100' },
  { id: 'p3', name: 'تحالف النهضة الاقتصادية', logo: 'https://picsum.photos/seed/logo3/100/100' },
  { id: 'p4', name: 'حزب الخضر الأردني', logo: 'https://picsum.photos/seed/logo4/100/100' }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'د. أحمد المنصور',
    partyId: 'p1',
    image: 'https://picsum.photos/seed/c1/200/200',
    votes: 0,
    program: 'تطوير البنية التحتية الرقمية وتعزيز التعليم التقني.',
    districtId: 'd1',
    listId: 'l1'
  },
  {
    id: 'c2',
    name: 'أ. سارة الراشد',
    partyId: 'p2',
    image: 'https://picsum.photos/seed/c2/200/200',
    votes: 0,
    program: 'تمكين الشباب والمرأة في سوق العمل ودعم المشاريع الصغيرة.',
    districtId: 'd1',
    listId: 'l1'
  },
  {
    id: 'c3',
    name: 'م. خالد العتيبي',
    partyId: 'p3',
    image: 'https://picsum.photos/seed/c3/200/200',
    votes: 0,
    program: 'تحقيق الاكتفاء الذاتي الغذائي وتطوير الصناعات المحلية.',
    districtId: 'd2',
    listId: 'l2'
  },
  {
    id: 'c4',
    name: 'د. ليلى القاسم',
    partyId: 'p1',
    image: 'https://picsum.photos/seed/c4/200/200',
    votes: 0,
    program: 'تحسين الخدمات الصحية وتطوير المستشفيات الحكومية.',
    districtId: 'd1',
    listId: 'l1'
  },
  {
    id: 'c5',
    name: 'أ. عمر الخطيب',
    partyId: 'p4',
    image: 'https://picsum.photos/seed/c5/200/200',
    votes: 0,
    program: 'حماية البيئة وتعزيز الطاقة المتجددة.',
    districtId: 'd2',
    listId: 'l2'
  },
  {
    id: 'c6',
    name: 'د. مريم الصالح',
    partyId: 'p2',
    image: 'https://picsum.photos/seed/c6/200/200',
    votes: 0,
    program: 'تطوير المناهج التعليمية ودعم البحث العلمي.',
    districtId: 'd3',
    listId: 'l3'
  },
  {
    id: 'c7',
    name: 'أ. يوسف العامري',
    partyId: 'p3',
    image: 'https://picsum.photos/seed/c7/200/200',
    votes: 0,
    program: 'دعم القطاع الزراعي وتطوير الري.',
    districtId: 'd4',
    listId: 'l4'
  },
  {
    id: 'c8',
    name: 'د. هدى التميمي',
    partyId: 'p1',
    image: 'https://picsum.photos/seed/c8/200/200',
    votes: 0,
    program: 'تعزيز حقوق الإنسان والحريات العامة.',
    districtId: 'd4',
    listId: 'l4'
  }
];

export const MOCK_LOCAL_LISTS: LocalList[] = [
  {
    id: 'l1',
    name: 'قائمة الوفاء',
    districtId: 'd1',
    candidates: [MOCK_CANDIDATES[0], MOCK_CANDIDATES[1], MOCK_CANDIDATES[3]]
  },
  {
    id: 'l2',
    name: 'قائمة الأمل',
    districtId: 'd2',
    candidates: [MOCK_CANDIDATES[2], MOCK_CANDIDATES[4]]
  },
  {
    id: 'l3',
    name: 'قائمة التغيير',
    districtId: 'd3',
    candidates: [MOCK_CANDIDATES[5]]
  },
  {
    id: 'l4',
    name: 'قائمة المستقبل',
    districtId: 'd4',
    candidates: [MOCK_CANDIDATES[6], MOCK_CANDIDATES[7]]
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
