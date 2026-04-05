
import { v4 as uuidv4 } from 'uuid';

// --- Types ---
export interface Candidate {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  religion: 'Muslim' | 'Christian' | 'Circassian' | 'Chechen';
  districtId: string;
  listId: string;
  isQuota: boolean;
  votes: number;
}

export interface ElectoralList {
  id: string;
  name: string;
  districtId: string;
  candidates: Candidate[];
  totalVotes: number;
  isParty: boolean;
}

export interface District {
  id: string;
  name: string;
  seats: number;
  subDistricts?: string[];
  quotaSeats: {
    female: number;
    christian: number;
    circassianChechen: number;
  };
}

export interface ElectionData {
  districts: District[];
  lists: ElectoralList[];
  candidates: Candidate[];
  votes: { [listId: string]: number };
  winners: Candidate[];
}

// --- Mock Data Helpers ---
const firstNames = ["أحمد", "محمد", "محمود", "علي", "عمر", "زيد", "ليث", "خالد", "ياسين", "حمزة", "سارة", "ليلى", "ريم", "هبة", "نور", "منى", "أمل", "فرح", "سلمى", "دينا"];
const lastNames = ["المجالي", "الطراونة", "الفايز", "العدوان", "النسور", "الخصاونة", "العبادي", "الحداد", "عزيزات", "قاقيش", "شقم", "أباظة", "الروسان", "بني هاني"];

const getRandomName = (gender: 'Male' | 'Female') => {
  const first = gender === 'Male' ? firstNames.slice(0, 10)[Math.floor(Math.random() * 10)] : firstNames.slice(10)[Math.floor(Math.random() * 10)];
  const middle = firstNames.slice(0, 10)[Math.floor(Math.random() * 10)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${middle} ${last}`;
};

// --- Configuration ---
const DISTRICT_CONFIG: District[] = [
  { id: 'amman-1', name: 'عمان الأولى', seats: 7, quotaSeats: { female: 1, christian: 0, circassianChechen: 1 } },
  { id: 'amman-2', name: 'عمان الثانية', seats: 7, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'amman-3', name: 'عمان الثالثة', seats: 6, quotaSeats: { female: 1, christian: 1, circassianChechen: 1 } },
  { id: 'irbid-1', name: 'إربد الأولى', seats: 8, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'irbid-2', name: 'إربد الثانية', seats: 7, quotaSeats: { female: 1, christian: 1, circassianChechen: 0 } },
  { id: 'zarqa', name: 'الزرقاء', seats: 10, quotaSeats: { female: 1, christian: 1, circassianChechen: 1 } },
  { id: 'balqa', name: 'البلقاء', seats: 8, quotaSeats: { female: 1, christian: 1, circassianChechen: 0 } },
  { id: 'karak', name: 'الكرك', seats: 8, quotaSeats: { female: 1, christian: 1, circassianChechen: 0 } },
  { id: 'jerash', name: 'جرش', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'madaba', name: 'مأدبا', seats: 3, quotaSeats: { female: 1, christian: 1, circassianChechen: 0 } },
  { id: 'mafraq', name: 'المفرق', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'tafila', name: 'الطفيلة', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'ajloun', name: 'عجلون', seats: 3, quotaSeats: { female: 1, christian: 1, circassianChechen: 0 } },
  { id: 'maan', name: 'معان', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'aqaba', name: 'العقبة', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'bedouin-north', name: 'بدو الشمال', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'bedouin-central', name: 'بدو الوسط', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'bedouin-south', name: 'بدو الجنوب', seats: 3, quotaSeats: { female: 1, christian: 0, circassianChechen: 0 } },
  { id: 'national', name: 'القائمة العامة (الأحزاب)', seats: 41, quotaSeats: { female: 0, christian: 0, circassianChechen: 0 } },
];

export const generateJordanianElectionData = (): ElectionData => {
  const districts = DISTRICT_CONFIG;
  const lists: ElectoralList[] = [];
  const candidates: Candidate[] = [];
  const winners: Candidate[] = [];

  // 1. Generate Local Lists and Candidates
  districts.forEach(district => {
    if (district.id === 'national') return;

    const numLists = 3 + Math.floor(Math.random() * 4); // 3-6 lists
    for (let i = 0; i < numLists; i++) {
      const listId = uuidv4();
      const listName = `قائمة ${district.name} - ${i + 1}`;
      const listCandidates: Candidate[] = [];

      // Ensure at least one female for quota
      const numCandidates = 5 + Math.floor(Math.random() * 6);
      for (let j = 0; j < numCandidates; j++) {
        const gender = j === 0 ? 'Female' : (Math.random() > 0.5 ? 'Male' : 'Female');
        let religion: Candidate['religion'] = 'Muslim';
        
        // Apply religious quotas
        if (district.quotaSeats.christian > 0 && j === 1) religion = 'Christian';
        if (district.quotaSeats.circassianChechen > 0 && j === 2) religion = 'Circassian';

        const candidate: Candidate = {
          id: uuidv4(),
          name: getRandomName(gender),
          age: 25 + Math.floor(Math.random() * 50),
          gender,
          religion,
          districtId: district.id,
          listId: listId,
          isQuota: false,
          votes: 0
        };
        listCandidates.push(candidate);
        candidates.push(candidate);
      }

      lists.push({
        id: listId,
        name: listName,
        districtId: district.id,
        candidates: listCandidates,
        totalVotes: 0,
        isParty: false
      });
    }
  });

  // 2. Generate National Party Lists
  const partyNames = ["حزب الميثاق", "جبهة العمل الإسلامي", "حزب إرادة", "الحزب المدني الديمقراطي", "حزب العمال", "حزب تقدم"];
  partyNames.forEach(name => {
    const listId = uuidv4();
    const listCandidates: Candidate[] = [];
    for (let j = 0; j < 20; j++) {
      const gender = (j === 2) ? 'Female' : (Math.random() > 0.5 ? 'Male' : 'Female'); // Woman in top 3
      const age = (j === 4) ? 30 : (25 + Math.floor(Math.random() * 50)); // Under 35 in top 5
      const candidate: Candidate = {
        id: uuidv4(),
        name: getRandomName(gender),
        age,
        gender,
        religion: 'Muslim',
        districtId: 'national',
        listId: listId,
        isQuota: false,
        votes: 0
      };
      listCandidates.push(candidate);
      candidates.push(candidate);
    }
    lists.push({
      id: listId,
      name,
      districtId: 'national',
      candidates: listCandidates,
      totalVotes: 0,
      isParty: true
    });
  });

  // 3. Simulate Voting
  const votes: { [listId: string]: number } = {};
  lists.forEach(list => {
    const baseVotes = list.districtId === 'national' ? 50000 + Math.random() * 100000 : 5000 + Math.random() * 20000;
    votes[list.id] = Math.floor(baseVotes);
    list.totalVotes = votes[list.id];
    
    // Distribute votes to candidates
    list.candidates.forEach(c => {
      c.votes = Math.floor(Math.random() * (list.totalVotes / 2));
    });
  });

  // 4. Seat Allocation Logic
  districts.forEach(district => {
    const districtLists = lists.filter(l => l.districtId === district.id);
    const totalDistrictVotes = districtLists.reduce((sum, l) => sum + l.totalVotes, 0);
    const threshold = district.id === 'national' ? 0.025 : 0.07;
    
    const passingLists = districtLists.filter(l => l.totalVotes >= totalDistrictVotes * threshold);
    if (passingLists.length === 0) return;

    const passingVotes = passingLists.reduce((sum, l) => sum + l.totalVotes, 0);
    
    // Proportional distribution (Simple)
    let remainingSeats = district.seats;
    passingLists.forEach(list => {
      const listSeats = Math.floor((list.totalVotes / passingVotes) * district.seats);
      const winnersFromList = [...list.candidates].sort((a, b) => b.votes - a.votes).slice(0, listSeats);
      winners.push(...winnersFromList);
      remainingSeats -= listSeats;
    });

    // Quota Allocation (Simplified)
    if (district.id !== 'national') {
      // Female Quota
      const topFemale = candidates
        .filter(c => c.districtId === district.id && c.gender === 'Female' && !winners.find(w => w.id === c.id))
        .sort((a, b) => b.votes - a.votes)[0];
      if (topFemale) winners.push(topFemale);

      // Christian Quota
      if (district.quotaSeats.christian > 0) {
        const topChristian = candidates
          .filter(c => c.districtId === district.id && c.religion === 'Christian' && !winners.find(w => w.id === c.id))
          .sort((a, b) => b.votes - a.votes)[0];
        if (topChristian) winners.push(topChristian);
      }
    }
  });

  return { districts, lists, candidates, votes, winners };
};
