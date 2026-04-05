import { v4 as uuidv4 } from 'uuid';

export type Religion = 'Muslim' | 'Christian' | 'Circassian' | 'Chechen';
export type Gender = 'Male' | 'Female';

export interface Candidate {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  religion: Religion;
  districtId: string;
  listId: string;
  isYouth: boolean;
  rank?: number; // For national lists
}

export interface ElectoralList {
  id: string;
  name: string;
  districtId: string;
  candidates: Candidate[];
  votes: number;
  isNational: boolean;
  partyName?: string;
}

export interface District {
  id: string;
  name: string;
  seats: number;
  subDistricts?: string[];
  hasChristianQuota: boolean;
  hasCircassianQuota: boolean;
  totalVotes: number;
}

const ARABIC_NAMES = [
  "أحمد", "محمد", "محمود", "علي", "عمر", "زيد", "ليث", "حمزة", "ياسين", "خالد",
  "سارة", "ليلى", "ريم", "نور", "هبة", "منى", "أمل", "فرح", "سلمى", "دينا"
];

const SURNAMES = [
  "المجالي", "الطراونة", "العدوان", "الفايز", "الخصاونة", "العبادي", "النسور", "الروسان", "بني هاني", "الزعبي",
  "القضاة", "الحداد", "عزيزات", "قبعين", "شقم", "ميرزا", "هاكوز", "أباظة"
];

export class ElectionEngine {
  districts: District[] = [
    { id: 'amman-1', name: 'عمان الأولى', seats: 6, hasChristianQuota: false, hasCircassianQuota: true, totalVotes: 0 },
    { id: 'amman-2', name: 'عمان الثانية', seats: 8, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'amman-3', name: 'عمان الثالثة', seats: 6, hasChristianQuota: true, hasCircassianQuota: true, totalVotes: 0 },
    { id: 'irbid-1', name: 'إربد الأولى', seats: 8, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'irbid-2', name: 'إربد الثانية', seats: 7, hasChristianQuota: true, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'zarqa', name: 'الزرقاء', seats: 10, hasChristianQuota: true, hasCircassianQuota: true, totalVotes: 0 },
    { id: 'balqa', name: 'البلقاء', seats: 8, hasChristianQuota: true, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'karak', name: 'الكرك', seats: 8, hasChristianQuota: true, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'maan', name: 'معان', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'mafraq', name: 'المفرق', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'tafila', name: 'الطفيلة', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'madaba', name: 'مأدبا', seats: 3, hasChristianQuota: true, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'jerash', name: 'جرش', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'ajloun', name: 'عجلون', seats: 3, hasChristianQuota: true, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'aqaba', name: 'العقبة', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'badia-north', name: 'بادية الشمال', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'badia-center', name: 'بادية الوسط', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
    { id: 'badia-south', name: 'بادية الجنوب', seats: 3, hasChristianQuota: false, hasCircassianQuota: false, totalVotes: 0 },
  ];

  generateMockData() {
    const allLists: ElectoralList[] = [];
    const allCandidates: Candidate[] = [];

    // 1. Generate Local Lists & Candidates
    this.districts.forEach(district => {
      const listCount = Math.floor(Math.random() * 4) + 3; // 3-6 lists
      for (let i = 0; i < listCount; i++) {
        const listId = uuidv4();
        const listName = `قائمة ${district.name} - ${i + 1}`;
        const candidates: Candidate[] = [];
        
        // Ensure at least one woman per list (for safety)
        const candidateCount = Math.floor(Math.random() * 5) + 5; // 5-10 candidates
        for (let j = 0; j < candidateCount; j++) {
          const gender: Gender = (j === 0) ? 'Female' : (Math.random() > 0.7 ? 'Female' : 'Male');
          let religion: Religion = 'Muslim';
          
          // Apply Quota logic for candidates
          if (district.hasChristianQuota && j === 1) religion = 'Christian';
          if (district.hasCircassianQuota && j === 2) religion = Math.random() > 0.5 ? 'Circassian' : 'Chechen';

          const candidate: Candidate = {
            id: uuidv4(),
            name: `${ARABIC_NAMES[Math.floor(Math.random() * ARABIC_NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`,
            age: Math.floor(Math.random() * 45) + 25,
            gender,
            religion,
            districtId: district.id,
            listId,
            isYouth: false
          };
          candidates.push(candidate);
          allCandidates.push(candidate);
        }

        const list: ElectoralList = {
          id: listId,
          name: listName,
          districtId: district.id,
          candidates,
          votes: Math.floor(Math.random() * 15000) + 2000,
          isNational: false
        };
        allLists.push(list);
        district.totalVotes += list.votes;
      }
    });

    // 2. Generate National Parties (41 seats)
    const parties = ["حزب الميثاق", "جبهة العمل الإسلامي", "حزب إرادة", "الحزب الوطني الإسلامي", "حزب تقدم", "حزب العمال"];
    const nationalLists: ElectoralList[] = [];

    parties.forEach(partyName => {
      const listId = uuidv4();
      const candidates: Candidate[] = [];
      for (let i = 1; i <= 20; i++) {
        let gender: Gender = 'Male';
        let age = Math.floor(Math.random() * 40) + 30;

        // Constraints: Woman in top 3, Youth in top 5
        if (i === 3) gender = 'Female';
        if (i === 5) age = 30; // Under 35

        const candidate: Candidate = {
          id: uuidv4(),
          name: `${ARABIC_NAMES[Math.floor(Math.random() * ARABIC_NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`,
          age,
          gender,
          religion: 'Muslim',
          districtId: 'national',
          listId,
          isYouth: age < 35,
          rank: i
        };
        candidates.push(candidate);
        allCandidates.push(candidate);
      }

      nationalLists.push({
        id: listId,
        name: partyName,
        districtId: 'national',
        candidates,
        votes: Math.floor(Math.random() * 100000) + 10000,
        isNational: true,
        partyName
      });
    });

    return { districts: this.districts, lists: [...allLists, ...nationalLists], candidates: allCandidates };
  }

  calculateWinners(data: { districts: District[], lists: ElectoralList[], candidates: Candidate[] }) {
    const winners: Candidate[] = [];
    const totalNationalVotes = data.lists.filter(l => l.isNational).reduce((sum, l) => sum + l.votes, 0);

    // 1. Local Winners (97 seats)
    data.districts.forEach(district => {
      const districtLists = data.lists.filter(l => l.districtId === district.id);
      const threshold = district.totalVotes * 0.07;
      const passingLists = districtLists.filter(l => l.votes >= threshold);

      if (passingLists.length === 0) return;

      // Simple Proportional Allocation (Largest Remainder)
      let remainingSeats = district.seats;
      const totalPassingVotes = passingLists.reduce((sum, l) => sum + l.votes, 0);
      
      passingLists.forEach(list => {
        const share = (list.votes / totalPassingVotes) * district.seats;
        const allocated = Math.floor(share);
        
        // Pick top candidates from this list based on random "personal votes" simulation
        const sortedCandidates = [...list.candidates].sort(() => Math.random() - 0.5);
        for (let i = 0; i < allocated && remainingSeats > 0; i++) {
          winners.push(sortedCandidates[i]);
          remainingSeats--;
        }
      });

      // Fill remaining seats with highest remainder (simplified)
      if (remainingSeats > 0) {
        const sortedByVotes = [...passingLists].sort((a, b) => b.votes - a.votes);
        winners.push(sortedByVotes[0].candidates.find(c => !winners.includes(c))!);
      }

      // Apply Women Quota (1 per district)
      const districtWinners = winners.filter(w => w.districtId === district.id);
      if (!districtWinners.some(w => w.gender === 'Female')) {
        const allDistrictWomen = data.candidates.filter(c => c.districtId === district.id && c.gender === 'Female');
        if (allDistrictWomen.length > 0) {
          winners.push(allDistrictWomen[0]); // Simplified: pick first woman
        }
      }
    });

    // 2. National Winners (41 seats)
    const nationalThreshold = totalNationalVotes * 0.025;
    const passingParties = data.lists.filter(l => l.isNational && l.votes >= nationalThreshold);
    const totalPassingNationalVotes = passingParties.reduce((sum, l) => sum + l.votes, 0);

    let remainingNationalSeats = 41;
    passingParties.forEach(party => {
      const share = (party.votes / totalPassingNationalVotes) * 41;
      const allocated = Math.floor(share);
      
      for (let i = 0; i < allocated && remainingNationalSeats > 0; i++) {
        winners.push(party.candidates[i]); // Ranked list
        remainingNationalSeats--;
      }
    });

    return winners;
  }
}
