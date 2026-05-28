import { PrismaClient, CollegeType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required to run the seed script.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CollegeSeed {
  name: string;
  slug: string;
  location: string;
  state: string;
  type: CollegeType;
  description: string;
  overview: string;
  fees: number;
  rating: number;
  acceptanceRate: number;
  avgAid: number;
  gpa: number;
  sat: number;
  matchScore: number;
  research: number;
  campus: number;
  social: number;
  financial: number;
  innovation: number;
  diversity: number;
  courses: any;
  placements: any;
  majors: string[];
  tags: string[];
  imageUrl: string;
}

const colleges: CollegeSeed[] = [
  {
    name: 'Massachusetts Institute of Technology',
    slug: 'mit',
    location: 'Cambridge, MA',
    state: 'Massachusetts',
    type: 'REACH',
    description: 'World-leading research university renowned for science, engineering, and technology.',
    overview: 'MIT is a private research university founded in 1861. Known for its rigorous academics and groundbreaking research, MIT consistently ranks among the top universities worldwide. The campus spans 168 acres along the Charles River with iconic brutalist and modernist architecture.',
    fees: 57986,
    rating: 4.9,
    acceptanceRate: 3.96,
    avgAid: 53000,
    gpa: 3.96,
    sat: 1545,
    matchScore: 95,
    research: 98,
    campus: 85,
    social: 75,
    financial: 90,
    innovation: 99,
    diversity: 88,
    courses: [
      { name: 'Computer Science & Engineering', fee: 57986, duration: '4 years' },
      { name: 'Electrical Engineering', fee: 57986, duration: '4 years' },
      { name: 'Mechanical Engineering', fee: 57986, duration: '4 years' },
      { name: 'Physics', fee: 57986, duration: '4 years' },
      { name: 'Mathematics', fee: 57986, duration: '4 years' },
      { name: 'Biology', fee: 57986, duration: '4 years' },
    ],
    placements: { avgSalary: 108000, placementRate: 95, topRecruiters: ['Google', 'Apple', 'Microsoft', 'SpaceX', 'Goldman Sachs'] },
    majors: ['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Biology', 'AI/ML', 'Robotics'],
    tags: ['STEM', 'Ivy-Adjacent', 'Research', 'Innovation'],
    imageUrl: '/colleges/mit.jpg',
  },
  {
    name: 'Stanford University',
    slug: 'stanford',
    location: 'Stanford, CA',
    state: 'California',
    type: 'REACH',
    description: 'Silicon Valley powerhouse known for entrepreneurship and innovation.',
    overview: 'Stanford University is a private research university known for its entrepreneurial spirit and proximity to Silicon Valley. Founded in 1885, Stanford offers a uniquely collaborative academic environment across its 8,180-acre campus, making it one of the largest in the US.',
    fees: 56169,
    rating: 4.9,
    acceptanceRate: 3.68,
    avgAid: 56000,
    gpa: 3.95,
    sat: 1540,
    matchScore: 94,
    research: 97,
    campus: 95,
    social: 88,
    financial: 92,
    innovation: 98,
    diversity: 85,
    courses: [
      { name: 'Computer Science', fee: 56169, duration: '4 years' },
      { name: 'Engineering', fee: 56169, duration: '4 years' },
      { name: 'Business', fee: 56169, duration: '4 years' },
      { name: 'Human Biology', fee: 56169, duration: '4 years' },
      { name: 'Economics', fee: 56169, duration: '4 years' },
    ],
    placements: { avgSalary: 105000, placementRate: 94, topRecruiters: ['Google', 'Meta', 'Apple', 'Tesla', 'McKinsey'] },
    majors: ['Computer Science', 'Engineering', 'Business', 'Biology', 'Economics', 'AI/ML'],
    tags: ['STEM', 'Entrepreneurship', 'Research', 'Innovation'],
    imageUrl: '/colleges/stanford.jpg',
  },
  {
    name: 'Harvard University',
    slug: 'harvard',
    location: 'Cambridge, MA',
    state: 'Massachusetts',
    type: 'REACH',
    description: 'The oldest and most prestigious university in the United States.',
    overview: 'Harvard University, established in 1636, is the oldest institution of higher education in the US. Its rigorous academic programs, world-class faculty, and extensive alumni network make it a pinnacle of academic excellence. Harvard\'s endowment exceeds $50 billion, the largest of any academic institution.',
    fees: 55587,
    rating: 4.9,
    acceptanceRate: 3.19,
    avgAid: 55000,
    gpa: 3.94,
    sat: 1535,
    matchScore: 93,
    research: 96,
    campus: 90,
    social: 85,
    financial: 95,
    innovation: 90,
    diversity: 87,
    courses: [
      { name: 'Economics', fee: 55587, duration: '4 years' },
      { name: 'Computer Science', fee: 55587, duration: '4 years' },
      { name: 'Government', fee: 55587, duration: '4 years' },
      { name: 'Biology', fee: 55587, duration: '4 years' },
      { name: 'English', fee: 55587, duration: '4 years' },
    ],
    placements: { avgSalary: 98000, placementRate: 93, topRecruiters: ['Goldman Sachs', 'McKinsey', 'Google', 'BCG', 'JP Morgan'] },
    majors: ['Economics', 'Computer Science', 'Government', 'Biology', 'English', 'Law'],
    tags: ['Ivy League', 'Research', 'Liberal Arts', 'Prestige'],
    imageUrl: '/colleges/harvard.jpg',
  },
  {
    name: 'California Institute of Technology',
    slug: 'caltech',
    location: 'Pasadena, CA',
    state: 'California',
    type: 'REACH',
    description: 'Elite STEM research institute with the highest per-capita research spending.',
    overview: 'Caltech is a private research university with just ~980 undergrads. Despite its small size, it manages NASA\'s JPL and is a leader in physics, engineering, and planetary science. Caltech boasts the highest per-capita Nobel Prize count of any university.',
    fees: 58680,
    rating: 4.8,
    acceptanceRate: 3.6,
    avgAid: 48000,
    gpa: 3.97,
    sat: 1555,
    matchScore: 92,
    research: 99,
    campus: 70,
    social: 60,
    financial: 85,
    innovation: 97,
    diversity: 72,
    courses: [
      { name: 'Physics', fee: 58680, duration: '4 years' },
      { name: 'Computer Science', fee: 58680, duration: '4 years' },
      { name: 'Chemical Engineering', fee: 58680, duration: '4 years' },
      { name: 'Biology', fee: 58680, duration: '4 years' },
    ],
    placements: { avgSalary: 102000, placementRate: 92, topRecruiters: ['SpaceX', 'Google', 'NASA/JPL', 'Apple', 'Boeing'] },
    majors: ['Physics', 'Computer Science', 'Engineering', 'Biology', 'Chemistry', 'Astrophysics'],
    tags: ['STEM', 'Research', 'Small Class Size'],
    imageUrl: '/colleges/caltech.jpg',
  },
  {
    name: 'Carnegie Mellon University',
    slug: 'cmu',
    location: 'Pittsburgh, PA',
    state: 'Pennsylvania',
    type: 'REACH',
    description: 'Top-ranked for CS, robotics, and AI with strong arts programs.',
    overview: 'Carnegie Mellon University is renowned for its programs in computer science, robotics, and artificial intelligence. The School of Computer Science is consistently ranked #1 globally. CMU also excels in fine arts, business, and public policy.',
    fees: 58924,
    rating: 4.7,
    acceptanceRate: 11.5,
    avgAid: 42000,
    gpa: 3.88,
    sat: 1520,
    matchScore: 90,
    research: 95,
    campus: 78,
    social: 72,
    financial: 75,
    innovation: 96,
    diversity: 82,
    courses: [
      { name: 'Computer Science', fee: 58924, duration: '4 years' },
      { name: 'Robotics', fee: 58924, duration: '4 years' },
      { name: 'AI & Machine Learning', fee: 58924, duration: '4 years' },
      { name: 'Business Administration', fee: 58924, duration: '4 years' },
      { name: 'Information Systems', fee: 58924, duration: '4 years' },
    ],
    placements: { avgSalary: 105000, placementRate: 93, topRecruiters: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'] },
    majors: ['Computer Science', 'Robotics', 'AI/ML', 'Business', 'Design', 'Engineering'],
    tags: ['STEM', 'CS', 'AI', 'Research'],
    imageUrl: '/colleges/cmu.jpg',
  },
  {
    name: 'University of California, Berkeley',
    slug: 'uc-berkeley',
    location: 'Berkeley, CA',
    state: 'California',
    type: 'TARGET',
    description: 'Top public university with strong EECS and business programs.',
    overview: 'UC Berkeley is the flagship campus of the University of California system. Known for its top-ranked EECS, business, and chemistry programs, Berkeley combines research excellence with public university accessibility. The campus overlooks the San Francisco Bay.',
    fees: 44066,
    rating: 4.7,
    acceptanceRate: 11.6,
    avgAid: 22000,
    gpa: 3.89,
    sat: 1440,
    matchScore: 88,
    research: 94,
    campus: 82,
    social: 85,
    financial: 65,
    innovation: 92,
    diversity: 90,
    courses: [
      { name: 'EECS', fee: 44066, duration: '4 years' },
      { name: 'Business Administration', fee: 44066, duration: '4 years' },
      { name: 'Data Science', fee: 44066, duration: '4 years' },
      { name: 'Chemistry', fee: 44066, duration: '4 years' },
    ],
    placements: { avgSalary: 95000, placementRate: 90, topRecruiters: ['Google', 'Apple', 'Meta', 'Amazon', 'Deloitte'] },
    majors: ['Computer Science', 'EECS', 'Business', 'Data Science', 'Chemistry'],
    tags: ['STEM', 'Public', 'Research', 'Innovation'],
    imageUrl: '/colleges/berkeley.jpg',
  },
  {
    name: 'Georgia Institute of Technology',
    slug: 'georgia-tech',
    location: 'Atlanta, GA',
    state: 'Georgia',
    type: 'TARGET',
    description: 'Premier public tech university with outstanding engineering and CS.',
    overview: 'Georgia Tech is one of the nation\'s top public research universities, excelling in engineering, computing, sciences, business, and design. Located in Atlanta\'s tech corridor, GT offers exceptional value with strong industry connections.',
    fees: 33794,
    rating: 4.6,
    acceptanceRate: 17.0,
    avgAid: 15000,
    gpa: 3.82,
    sat: 1440,
    matchScore: 85,
    research: 90,
    campus: 80,
    social: 78,
    financial: 80,
    innovation: 91,
    diversity: 75,
    courses: [
      { name: 'Computer Science', fee: 33794, duration: '4 years' },
      { name: 'Mechanical Engineering', fee: 33794, duration: '4 years' },
      { name: 'Industrial Engineering', fee: 33794, duration: '4 years' },
      { name: 'Biomedical Engineering', fee: 33794, duration: '4 years' },
    ],
    placements: { avgSalary: 85000, placementRate: 91, topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Lockheed Martin', 'Delta'] },
    majors: ['Computer Science', 'Engineering', 'Business', 'Design', 'Biology'],
    tags: ['STEM', 'Public', 'Engineering', 'Value'],
    imageUrl: '/colleges/gatech.jpg',
  },
  {
    name: 'Cornell University',
    slug: 'cornell',
    location: 'Ithaca, NY',
    state: 'New York',
    type: 'REACH',
    description: 'Ivy League university with unique mix of public and private colleges.',
    overview: 'Cornell is the largest Ivy League university with seven undergraduate colleges. Known for its beautiful Finger Lakes campus, diverse academic offerings from hotel administration to engineering, and commitment to public engagement as a land-grant institution.',
    fees: 62456,
    rating: 4.7,
    acceptanceRate: 7.3,
    avgAid: 50000,
    gpa: 3.90,
    sat: 1510,
    matchScore: 89,
    research: 92,
    campus: 92,
    social: 80,
    financial: 82,
    innovation: 88,
    diversity: 83,
    courses: [
      { name: 'Computer Science', fee: 62456, duration: '4 years' },
      { name: 'Engineering', fee: 62456, duration: '4 years' },
      { name: 'Hotel Administration', fee: 62456, duration: '4 years' },
      { name: 'Agriculture', fee: 62456, duration: '4 years' },
      { name: 'Architecture', fee: 62456, duration: '4 years' },
    ],
    placements: { avgSalary: 88000, placementRate: 90, topRecruiters: ['Google', 'Goldman Sachs', 'JP Morgan', 'Deloitte', 'McKinsey'] },
    majors: ['Computer Science', 'Engineering', 'Hotel Admin', 'Agriculture', 'Architecture', 'Biology'],
    tags: ['Ivy League', 'Research', 'Engineering'],
    imageUrl: '/colleges/cornell.jpg',
  },
  {
    name: 'Princeton University',
    slug: 'princeton',
    location: 'Princeton, NJ',
    state: 'New Jersey',
    type: 'REACH',
    description: 'Ivy League gem with unmatched undergraduate teaching and generous aid.',
    overview: 'Princeton University, founded in 1746, is known for its focus on undergraduate education and generous financial aid program. With a student-to-faculty ratio of 5:1, Princeton offers an intimate academic experience at one of the most beautiful collegiate campuses in America.',
    fees: 57410,
    rating: 4.9,
    acceptanceRate: 3.73,
    avgAid: 59000,
    gpa: 3.93,
    sat: 1540,
    matchScore: 93,
    research: 95,
    campus: 96,
    social: 82,
    financial: 97,
    innovation: 89,
    diversity: 80,
    courses: [
      { name: 'Computer Science', fee: 57410, duration: '4 years' },
      { name: 'Economics', fee: 57410, duration: '4 years' },
      { name: 'Public Policy', fee: 57410, duration: '4 years' },
      { name: 'Engineering', fee: 57410, duration: '4 years' },
      { name: 'Mathematics', fee: 57410, duration: '4 years' },
    ],
    placements: { avgSalary: 95000, placementRate: 92, topRecruiters: ['Google', 'Goldman Sachs', 'McKinsey', 'Jane Street', 'Citadel'] },
    majors: ['Computer Science', 'Economics', 'Public Policy', 'Engineering', 'Mathematics', 'Physics'],
    tags: ['Ivy League', 'Liberal Arts', 'Generous Aid', 'Research'],
    imageUrl: '/colleges/princeton.jpg',
  },
  {
    name: 'University of California, Los Angeles',
    slug: 'ucla',
    location: 'Los Angeles, CA',
    state: 'California',
    type: 'TARGET',
    description: 'Prestigious public university with vibrant campus life in LA.',
    overview: 'UCLA is one of the most applied-to universities in the US. Located in Westwood, Los Angeles, it combines academic excellence with a vibrant campus culture, strong athletics, and proximity to entertainment and tech industries.',
    fees: 43022,
    rating: 4.6,
    acceptanceRate: 8.6,
    avgAid: 21000,
    gpa: 3.90,
    sat: 1420,
    matchScore: 86,
    research: 90,
    campus: 92,
    social: 95,
    financial: 60,
    innovation: 85,
    diversity: 92,
    courses: [
      { name: 'Computer Science', fee: 43022, duration: '4 years' },
      { name: 'Biology', fee: 43022, duration: '4 years' },
      { name: 'Psychology', fee: 43022, duration: '4 years' },
      { name: 'Economics', fee: 43022, duration: '4 years' },
      { name: 'Film & Television', fee: 43022, duration: '4 years' },
    ],
    placements: { avgSalary: 78000, placementRate: 88, topRecruiters: ['Google', 'Disney', 'Amazon', 'Netflix', 'Deloitte'] },
    majors: ['Computer Science', 'Biology', 'Psychology', 'Film', 'Economics', 'Pre-Med'],
    tags: ['Public', 'Research', 'Campus Life', 'Arts'],
    imageUrl: '/colleges/ucla.jpg',
  },
  {
    name: 'University of Texas at Austin',
    slug: 'ut-austin',
    location: 'Austin, TX',
    state: 'Texas',
    type: 'TARGET',
    description: 'Flagship Texas public university with top CS and engineering programs.',
    overview: 'UT Austin is a leading public research university located in the vibrant tech hub of Austin. With strong programs in CS, engineering, and business, it offers exceptional value and has a massive alumni network across technology and energy sectors.',
    fees: 40032,
    rating: 4.5,
    acceptanceRate: 29.0,
    avgAid: 14000,
    gpa: 3.75,
    sat: 1380,
    matchScore: 80,
    research: 88,
    campus: 85,
    social: 90,
    financial: 75,
    innovation: 86,
    diversity: 78,
    courses: [
      { name: 'Computer Science', fee: 40032, duration: '4 years' },
      { name: 'Engineering', fee: 40032, duration: '4 years' },
      { name: 'Business', fee: 40032, duration: '4 years' },
      { name: 'Communication', fee: 40032, duration: '4 years' },
    ],
    placements: { avgSalary: 78000, placementRate: 87, topRecruiters: ['Google', 'Dell', 'Amazon', 'Facebook', 'ExxonMobil'] },
    majors: ['Computer Science', 'Engineering', 'Business', 'Communication', 'Biology'],
    tags: ['Public', 'STEM', 'Value', 'Big Campus'],
    imageUrl: '/colleges/utaustin.jpg',
  },
  {
    name: 'Purdue University',
    slug: 'purdue',
    location: 'West Lafayette, IN',
    state: 'Indiana',
    type: 'SAFETY',
    description: 'Strong engineering and CS programs with excellent value.',
    overview: 'Purdue University is a premier public research institution known for engineering, CS, and aeronautics. Famous as the "Cradle of Astronauts," Purdue has produced 27 astronauts including Neil Armstrong. The university has frozen tuition for over a decade.',
    fees: 28794,
    rating: 4.4,
    acceptanceRate: 53.0,
    avgAid: 12000,
    gpa: 3.65,
    sat: 1330,
    matchScore: 76,
    research: 85,
    campus: 78,
    social: 80,
    financial: 88,
    innovation: 82,
    diversity: 70,
    courses: [
      { name: 'Computer Science', fee: 28794, duration: '4 years' },
      { name: 'Mechanical Engineering', fee: 28794, duration: '4 years' },
      { name: 'Aerospace Engineering', fee: 28794, duration: '4 years' },
      { name: 'Pharmacy', fee: 28794, duration: '4 years' },
    ],
    placements: { avgSalary: 72000, placementRate: 88, topRecruiters: ['Amazon', 'Google', 'Microsoft', 'Caterpillar', 'Rolls Royce'] },
    majors: ['Computer Science', 'Engineering', 'Aerospace', 'Pharmacy', 'Agriculture'],
    tags: ['STEM', 'Public', 'Value', 'Engineering'],
    imageUrl: '/colleges/purdue.jpg',
  },
  {
    name: 'University of Michigan',
    slug: 'umich',
    location: 'Ann Arbor, MI',
    state: 'Michigan',
    type: 'TARGET',
    description: 'Top public university with strong engineering and business programs.',
    overview: 'The University of Michigan is among the most prestigious public universities in the US, with top-ranked programs in engineering, business, medicine, and law. Ann Arbor is consistently rated one of the best college towns in America.',
    fees: 52266,
    rating: 4.6,
    acceptanceRate: 17.7,
    avgAid: 20000,
    gpa: 3.88,
    sat: 1460,
    matchScore: 84,
    research: 93,
    campus: 90,
    social: 92,
    financial: 65,
    innovation: 88,
    diversity: 78,
    courses: [
      { name: 'Computer Science', fee: 52266, duration: '4 years' },
      { name: 'Engineering', fee: 52266, duration: '4 years' },
      { name: 'Ross Business', fee: 52266, duration: '4 years' },
      { name: 'Pre-Med', fee: 52266, duration: '4 years' },
    ],
    placements: { avgSalary: 82000, placementRate: 90, topRecruiters: ['Google', 'Ford', 'Amazon', 'McKinsey', 'JP Morgan'] },
    majors: ['Computer Science', 'Engineering', 'Business', 'Pre-Med', 'Psychology'],
    tags: ['Public', 'Research', 'Big Ten', 'Campus Life'],
    imageUrl: '/colleges/umich.jpg',
  },
  {
    name: 'University of Illinois Urbana-Champaign',
    slug: 'uiuc',
    location: 'Champaign, IL',
    state: 'Illinois',
    type: 'TARGET',
    description: 'Top-5 CS program and strong engineering at great value.',
    overview: 'UIUC\'s Grainger College of Engineering is among the best in the nation, and the CS department is consistently ranked top 5. UIUC is a leading research institution with a beautiful Midwest campus and excellent career placement.',
    fees: 34312,
    rating: 4.5,
    acceptanceRate: 43.7,
    avgAid: 16000,
    gpa: 3.72,
    sat: 1410,
    matchScore: 82,
    research: 91,
    campus: 80,
    social: 82,
    financial: 78,
    innovation: 90,
    diversity: 72,
    courses: [
      { name: 'Computer Science', fee: 34312, duration: '4 years' },
      { name: 'Electrical Engineering', fee: 34312, duration: '4 years' },
      { name: 'Business', fee: 34312, duration: '4 years' },
      { name: 'Accounting', fee: 34312, duration: '4 years' },
    ],
    placements: { avgSalary: 85000, placementRate: 90, topRecruiters: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Qualcomm'] },
    majors: ['Computer Science', 'Engineering', 'Business', 'Accounting', 'Physics'],
    tags: ['STEM', 'Public', 'CS', 'Value'],
    imageUrl: '/colleges/uiuc.jpg',
  },
  {
    name: 'University of Washington',
    slug: 'uw-seattle',
    location: 'Seattle, WA',
    state: 'Washington',
    type: 'TARGET',
    description: 'Pacific Northwest powerhouse in CS, medicine, and research.',
    overview: 'The University of Washington is a public research university in Seattle with one of the strongest CS programs in the world. Its proximity to Amazon, Microsoft, and Boeing provides outstanding industry connections and internship pipelines.',
    fees: 39906,
    rating: 4.5,
    acceptanceRate: 43.0,
    avgAid: 18000,
    gpa: 3.78,
    sat: 1390,
    matchScore: 81,
    research: 92,
    campus: 88,
    social: 80,
    financial: 70,
    innovation: 89,
    diversity: 82,
    courses: [
      { name: 'Computer Science', fee: 39906, duration: '4 years' },
      { name: 'Information Science', fee: 39906, duration: '4 years' },
      { name: 'Engineering', fee: 39906, duration: '4 years' },
      { name: 'Pre-Med', fee: 39906, duration: '4 years' },
    ],
    placements: { avgSalary: 90000, placementRate: 89, topRecruiters: ['Amazon', 'Microsoft', 'Boeing', 'Google', 'Meta'] },
    majors: ['Computer Science', 'Information Science', 'Engineering', 'Biology', 'Pre-Med'],
    tags: ['STEM', 'Public', 'Tech Hub', 'Research'],
    imageUrl: '/colleges/uw.jpg',
  },
  {
    name: 'New York University',
    slug: 'nyu',
    location: 'New York, NY',
    state: 'New York',
    type: 'TARGET',
    description: 'Urban university with global campus network and strong business/arts.',
    overview: 'NYU is a private research university with campuses in New York City, Abu Dhabi, and Shanghai. Known for Stern Business, Tisch Arts, and Tandon Engineering, NYU offers an unmatched urban education experience in the heart of Manhattan.',
    fees: 58168,
    rating: 4.5,
    acceptanceRate: 12.2,
    avgAid: 38000,
    gpa: 3.70,
    sat: 1470,
    matchScore: 83,
    research: 85,
    campus: 70,
    social: 95,
    financial: 55,
    innovation: 84,
    diversity: 95,
    courses: [
      { name: 'Computer Science', fee: 58168, duration: '4 years' },
      { name: 'Business (Stern)', fee: 58168, duration: '4 years' },
      { name: 'Film & TV (Tisch)', fee: 58168, duration: '4 years' },
      { name: 'Data Science', fee: 58168, duration: '4 years' },
    ],
    placements: { avgSalary: 82000, placementRate: 87, topRecruiters: ['Goldman Sachs', 'JP Morgan', 'Google', 'Deloitte', 'NBC'] },
    majors: ['Computer Science', 'Business', 'Film', 'Data Science', 'Economics', 'Art'],
    tags: ['Urban', 'Business', 'Arts', 'Global'],
    imageUrl: '/colleges/nyu.jpg',
  },
  {
    name: 'Columbia University',
    slug: 'columbia',
    location: 'New York, NY',
    state: 'New York',
    type: 'REACH',
    description: 'Ivy League university in the heart of New York City.',
    overview: 'Columbia University, founded in 1754, is an Ivy League university located in Manhattan\'s Morningside Heights. Known for its Core Curriculum, Columbia offers a rigorous liberal arts education alongside world-class professional schools in law, business, and journalism.',
    fees: 63530,
    rating: 4.7,
    acceptanceRate: 3.9,
    avgAid: 56000,
    gpa: 3.92,
    sat: 1530,
    matchScore: 91,
    research: 94,
    campus: 75,
    social: 88,
    financial: 88,
    innovation: 87,
    diversity: 90,
    courses: [
      { name: 'Computer Science', fee: 63530, duration: '4 years' },
      { name: 'Economics', fee: 63530, duration: '4 years' },
      { name: 'Political Science', fee: 63530, duration: '4 years' },
      { name: 'Engineering', fee: 63530, duration: '4 years' },
    ],
    placements: { avgSalary: 90000, placementRate: 91, topRecruiters: ['Goldman Sachs', 'McKinsey', 'Google', 'JP Morgan', 'Morgan Stanley'] },
    majors: ['Computer Science', 'Economics', 'Political Science', 'Engineering', 'English'],
    tags: ['Ivy League', 'Urban', 'Research', 'Liberal Arts'],
    imageUrl: '/colleges/columbia.jpg',
  },
  {
    name: 'Yale University',
    slug: 'yale',
    location: 'New Haven, CT',
    state: 'Connecticut',
    type: 'REACH',
    description: 'Ivy League leader in arts, humanities, and law.',
    overview: 'Yale University is a private Ivy League research university founded in 1701. Known for its exceptional programs in law, drama, and art, Yale offers a residential college system that fosters tight-knit community and intellectual engagement.',
    fees: 62250,
    rating: 4.8,
    acceptanceRate: 4.35,
    avgAid: 57000,
    gpa: 3.93,
    sat: 1530,
    matchScore: 92,
    research: 93,
    campus: 93,
    social: 85,
    financial: 93,
    innovation: 85,
    diversity: 82,
    courses: [
      { name: 'Economics', fee: 62250, duration: '4 years' },
      { name: 'Political Science', fee: 62250, duration: '4 years' },
      { name: 'History', fee: 62250, duration: '4 years' },
      { name: 'Computer Science', fee: 62250, duration: '4 years' },
      { name: 'English', fee: 62250, duration: '4 years' },
    ],
    placements: { avgSalary: 88000, placementRate: 90, topRecruiters: ['McKinsey', 'Goldman Sachs', 'Google', 'BCG', 'Teach For America'] },
    majors: ['Economics', 'Political Science', 'History', 'Computer Science', 'English', 'Law'],
    tags: ['Ivy League', 'Liberal Arts', 'Law', 'Arts'],
    imageUrl: '/colleges/yale.jpg',
  },
  {
    name: 'University of Pennsylvania',
    slug: 'upenn',
    location: 'Philadelphia, PA',
    state: 'Pennsylvania',
    type: 'REACH',
    description: 'Ivy League with the top business school (Wharton) in the world.',
    overview: 'UPenn is home to the Wharton School, the world\'s premier business school. Founded by Benjamin Franklin, Penn integrates business, engineering, nursing, and liberal arts in a uniquely interdisciplinary environment in Philadelphia.',
    fees: 61710,
    rating: 4.7,
    acceptanceRate: 5.9,
    avgAid: 54000,
    gpa: 3.91,
    sat: 1520,
    matchScore: 90,
    research: 92,
    campus: 85,
    social: 88,
    financial: 85,
    innovation: 90,
    diversity: 83,
    courses: [
      { name: 'Business (Wharton)', fee: 61710, duration: '4 years' },
      { name: 'Engineering', fee: 61710, duration: '4 years' },
      { name: 'Computer Science', fee: 61710, duration: '4 years' },
      { name: 'Nursing', fee: 61710, duration: '4 years' },
    ],
    placements: { avgSalary: 95000, placementRate: 92, topRecruiters: ['Goldman Sachs', 'McKinsey', 'Google', 'JP Morgan', 'BCG'] },
    majors: ['Business', 'Engineering', 'Computer Science', 'Nursing', 'Economics'],
    tags: ['Ivy League', 'Business', 'Wharton', 'Research'],
    imageUrl: '/colleges/upenn.jpg',
  },
  {
    name: 'Duke University',
    slug: 'duke',
    location: 'Durham, NC',
    state: 'North Carolina',
    type: 'REACH',
    description: 'Elite private university with top programs in medicine and public policy.',
    overview: 'Duke University combines rigorous academics with vibrant campus life. Known for its medical center, Fuqua School of Business, and powerhouse basketball program, Duke sits on 8,600 acres of stunning Gothic campus and Duke Forest.',
    fees: 60489,
    rating: 4.7,
    acceptanceRate: 5.0,
    avgAid: 52000,
    gpa: 3.92,
    sat: 1520,
    matchScore: 89,
    research: 93,
    campus: 94,
    social: 90,
    financial: 84,
    innovation: 88,
    diversity: 80,
    courses: [
      { name: 'Computer Science', fee: 60489, duration: '4 years' },
      { name: 'Public Policy', fee: 60489, duration: '4 years' },
      { name: 'Biology', fee: 60489, duration: '4 years' },
      { name: 'Economics', fee: 60489, duration: '4 years' },
    ],
    placements: { avgSalary: 85000, placementRate: 91, topRecruiters: ['McKinsey', 'Goldman Sachs', 'Google', 'Deloitte', 'Duke Health'] },
    majors: ['Computer Science', 'Public Policy', 'Biology', 'Economics', 'Pre-Med'],
    tags: ['Research', 'Pre-Med', 'Athletics', 'Prestige'],
    imageUrl: '/colleges/duke.jpg',
  },
  {
    name: 'Northwestern University',
    slug: 'northwestern',
    location: 'Evanston, IL',
    state: 'Illinois',
    type: 'REACH',
    description: 'Elite private university on Lake Michigan with top journalism and engineering.',
    overview: 'Northwestern University combines a strong liberal arts foundation with professional programs in journalism (Medill), engineering (McCormick), and performing arts. Its lakefront campus north of Chicago offers stunning views and Big Ten athletics.',
    fees: 60768,
    rating: 4.6,
    acceptanceRate: 7.0,
    avgAid: 48000,
    gpa: 3.90,
    sat: 1510,
    matchScore: 87,
    research: 91,
    campus: 90,
    social: 85,
    financial: 80,
    innovation: 86,
    diversity: 78,
    courses: [
      { name: 'Journalism (Medill)', fee: 60768, duration: '4 years' },
      { name: 'Engineering', fee: 60768, duration: '4 years' },
      { name: 'Economics', fee: 60768, duration: '4 years' },
      { name: 'Computer Science', fee: 60768, duration: '4 years' },
    ],
    placements: { avgSalary: 82000, placementRate: 89, topRecruiters: ['Google', 'McKinsey', 'NBC', 'Goldman Sachs', 'Microsoft'] },
    majors: ['Journalism', 'Engineering', 'Economics', 'Computer Science', 'Theatre'],
    tags: ['Research', 'Journalism', 'Big Ten', 'Liberal Arts'],
    imageUrl: '/colleges/northwestern.jpg',
  },
  {
    name: 'Brown University',
    slug: 'brown',
    location: 'Providence, RI',
    state: 'Rhode Island',
    type: 'REACH',
    description: 'Ivy League with unique open curriculum and creative academic freedom.',
    overview: 'Brown is known for its distinctive Open Curriculum, which allows students to design their own course of study without distribution requirements. This fosters intellectual curiosity and creative exploration in a supportive, collaborative environment.',
    fees: 62680,
    rating: 4.6,
    acceptanceRate: 5.0,
    avgAid: 52000,
    gpa: 3.91,
    sat: 1510,
    matchScore: 88,
    research: 88,
    campus: 88,
    social: 82,
    financial: 86,
    innovation: 85,
    diversity: 82,
    courses: [
      { name: 'Computer Science', fee: 62680, duration: '4 years' },
      { name: 'Applied Mathematics', fee: 62680, duration: '4 years' },
      { name: 'Economics', fee: 62680, duration: '4 years' },
      { name: 'Biology', fee: 62680, duration: '4 years' },
    ],
    placements: { avgSalary: 78000, placementRate: 88, topRecruiters: ['Google', 'Goldman Sachs', 'McKinsey', 'BCG', 'Epic Systems'] },
    majors: ['Computer Science', 'Applied Math', 'Economics', 'Biology', 'Cognitive Science'],
    tags: ['Ivy League', 'Open Curriculum', 'Liberal Arts', 'Creative'],
    imageUrl: '/colleges/brown.jpg',
  },
  {
    name: 'Rice University',
    slug: 'rice',
    location: 'Houston, TX',
    state: 'Texas',
    type: 'TARGET',
    description: 'Highly-ranked private university with exceptional value and residential college system.',
    overview: 'Rice University offers a top-tier education at significantly lower cost than peers. Its residential college system fosters community, and its location in Houston provides access to the energy, medical, and space industries.',
    fees: 54100,
    rating: 4.6,
    acceptanceRate: 7.7,
    avgAid: 46000,
    gpa: 3.88,
    sat: 1520,
    matchScore: 87,
    research: 89,
    campus: 88,
    social: 85,
    financial: 90,
    innovation: 87,
    diversity: 78,
    courses: [
      { name: 'Computer Science', fee: 54100, duration: '4 years' },
      { name: 'Engineering', fee: 54100, duration: '4 years' },
      { name: 'Architecture', fee: 54100, duration: '4 years' },
      { name: 'Business', fee: 54100, duration: '4 years' },
    ],
    placements: { avgSalary: 80000, placementRate: 89, topRecruiters: ['ExxonMobil', 'Google', 'Shell', 'NASA', 'Deloitte'] },
    majors: ['Computer Science', 'Engineering', 'Architecture', 'Business', 'Biology'],
    tags: ['STEM', 'Value', 'Research', 'Residential'],
    imageUrl: '/colleges/rice.jpg',
  },
  {
    name: 'Vanderbilt University',
    slug: 'vanderbilt',
    location: 'Nashville, TN',
    state: 'Tennessee',
    type: 'TARGET',
    description: 'Top private university in the South with strong medicine and education programs.',
    overview: 'Vanderbilt is a private research university in Nashville known for its beautiful campus, strong pre-med pipeline, and vibrant student life. The university is consistently ranked among the top 15 national universities.',
    fees: 58130,
    rating: 4.5,
    acceptanceRate: 5.6,
    avgAid: 50000,
    gpa: 3.87,
    sat: 1510,
    matchScore: 85,
    research: 88,
    campus: 92,
    social: 90,
    financial: 82,
    innovation: 80,
    diversity: 75,
    courses: [
      { name: 'Engineering', fee: 58130, duration: '4 years' },
      { name: 'Education', fee: 58130, duration: '4 years' },
      { name: 'Economics', fee: 58130, duration: '4 years' },
      { name: 'Computer Science', fee: 58130, duration: '4 years' },
    ],
    placements: { avgSalary: 75000, placementRate: 87, topRecruiters: ['Deloitte', 'EY', 'Goldman Sachs', 'HCA Healthcare', 'Google'] },
    majors: ['Engineering', 'Education', 'Economics', 'Computer Science', 'Pre-Med'],
    tags: ['Research', 'Pre-Med', 'Southern', 'Campus Life'],
    imageUrl: '/colleges/vanderbilt.jpg',
  },
  {
    name: 'Washington University in St. Louis',
    slug: 'washu',
    location: 'St. Louis, MO',
    state: 'Missouri',
    type: 'TARGET',
    description: 'Leading research university with top medical and business schools.',
    overview: 'WashU is a highly selective private university known for its medical school, Olin Business School, and collaborative academic culture. The campus is one of the most beautiful in the country with stunning collegiate Gothic architecture.',
    fees: 59420,
    rating: 4.5,
    acceptanceRate: 11.0,
    avgAid: 49000,
    gpa: 3.86,
    sat: 1510,
    matchScore: 84,
    research: 90,
    campus: 93,
    social: 82,
    financial: 83,
    innovation: 82,
    diversity: 76,
    courses: [
      { name: 'Pre-Med', fee: 59420, duration: '4 years' },
      { name: 'Business', fee: 59420, duration: '4 years' },
      { name: 'Computer Science', fee: 59420, duration: '4 years' },
      { name: 'Political Science', fee: 59420, duration: '4 years' },
    ],
    placements: { avgSalary: 78000, placementRate: 88, topRecruiters: ['BJC Healthcare', 'Deloitte', 'Google', 'BCG', 'JP Morgan'] },
    majors: ['Pre-Med', 'Business', 'Computer Science', 'Political Science', 'Biology'],
    tags: ['Research', 'Pre-Med', 'Business', 'Beautiful Campus'],
    imageUrl: '/colleges/washu.jpg',
  },
  {
    name: 'Emory University',
    slug: 'emory',
    location: 'Atlanta, GA',
    state: 'Georgia',
    type: 'TARGET',
    description: 'Top private university with one of the nation\'s best medical programs.',
    overview: 'Emory University is a leading private research university in Atlanta known for its close ties to the CDC and strong programs in medicine, public health, and business. The Oxford campus offers a unique two-year liberal arts experience.',
    fees: 57948,
    rating: 4.4,
    acceptanceRate: 11.4,
    avgAid: 44000,
    gpa: 3.80,
    sat: 1460,
    matchScore: 80,
    research: 88,
    campus: 85,
    social: 78,
    financial: 78,
    innovation: 82,
    diversity: 80,
    courses: [
      { name: 'Biology', fee: 57948, duration: '4 years' },
      { name: 'Business', fee: 57948, duration: '4 years' },
      { name: 'Nursing', fee: 57948, duration: '4 years' },
      { name: 'Computer Science', fee: 57948, duration: '4 years' },
    ],
    placements: { avgSalary: 72000, placementRate: 86, topRecruiters: ['CDC', 'Deloitte', 'EY', 'Delta', 'Google'] },
    majors: ['Biology', 'Business', 'Nursing', 'Computer Science', 'Public Health'],
    tags: ['Research', 'Pre-Med', 'CDC', 'Southern'],
    imageUrl: '/colleges/emory.jpg',
  },
  {
    name: 'University of Southern California',
    slug: 'usc',
    location: 'Los Angeles, CA',
    state: 'California',
    type: 'TARGET',
    description: 'Leading private university in LA with top film and engineering programs.',
    overview: 'USC is a leading private research university in the heart of Los Angeles. Known for its film school (top in the world), strong engineering, and massive alumni network (the Trojan Family), USC offers unmatched industry connections.',
    fees: 62352,
    rating: 4.5,
    acceptanceRate: 9.9,
    avgAid: 40000,
    gpa: 3.80,
    sat: 1470,
    matchScore: 82,
    research: 86,
    campus: 82,
    social: 92,
    financial: 60,
    innovation: 85,
    diversity: 88,
    courses: [
      { name: 'Film & TV', fee: 62352, duration: '4 years' },
      { name: 'Computer Science', fee: 62352, duration: '4 years' },
      { name: 'Business', fee: 62352, duration: '4 years' },
      { name: 'Engineering', fee: 62352, duration: '4 years' },
    ],
    placements: { avgSalary: 80000, placementRate: 88, topRecruiters: ['Disney', 'Google', 'Amazon', 'Warner Bros', 'SpaceX'] },
    majors: ['Film', 'Computer Science', 'Business', 'Engineering', 'Communication'],
    tags: ['Film', 'STEM', 'Urban', 'Alumni Network'],
    imageUrl: '/colleges/usc.jpg',
  },
  {
    name: 'Johns Hopkins University',
    slug: 'jhu',
    location: 'Baltimore, MD',
    state: 'Maryland',
    type: 'REACH',
    description: 'World-leading research university and medical institution.',
    overview: 'Johns Hopkins pioneered the modern research university model in America. It leads the nation in federal R&D funding and is world-renowned for its medical school and Bloomberg School of Public Health. JHU also has strong programs in international studies and engineering.',
    fees: 59950,
    rating: 4.6,
    acceptanceRate: 6.5,
    avgAid: 50000,
    gpa: 3.90,
    sat: 1520,
    matchScore: 88,
    research: 97,
    campus: 78,
    social: 72,
    financial: 82,
    innovation: 90,
    diversity: 80,
    courses: [
      { name: 'Biomedical Engineering', fee: 59950, duration: '4 years' },
      { name: 'Public Health', fee: 59950, duration: '4 years' },
      { name: 'Computer Science', fee: 59950, duration: '4 years' },
      { name: 'International Studies', fee: 59950, duration: '4 years' },
    ],
    placements: { avgSalary: 82000, placementRate: 89, topRecruiters: ['Johns Hopkins Hospital', 'Google', 'NIH', 'McKinsey', 'Amazon'] },
    majors: ['Biomedical Engineering', 'Public Health', 'Computer Science', 'International Studies', 'Biology'],
    tags: ['Research', 'Pre-Med', 'Public Health', 'Engineering'],
    imageUrl: '/colleges/jhu.jpg',
  },
  {
    name: 'University of Notre Dame',
    slug: 'notre-dame',
    location: 'Notre Dame, IN',
    state: 'Indiana',
    type: 'TARGET',
    description: 'Prestigious Catholic university with exceptional alumni loyalty.',
    overview: 'Notre Dame is a prestigious private Catholic university known for its strong sense of community, exceptional undergraduate teaching, and legendary athletics program. The campus features the iconic Golden Dome and Touchdown Jesus.',
    fees: 58843,
    rating: 4.5,
    acceptanceRate: 12.9,
    avgAid: 46000,
    gpa: 3.82,
    sat: 1480,
    matchScore: 82,
    research: 82,
    campus: 95,
    social: 92,
    financial: 78,
    innovation: 78,
    diversity: 68,
    courses: [
      { name: 'Business', fee: 58843, duration: '4 years' },
      { name: 'Engineering', fee: 58843, duration: '4 years' },
      { name: 'Political Science', fee: 58843, duration: '4 years' },
      { name: 'Computer Science', fee: 58843, duration: '4 years' },
    ],
    placements: { avgSalary: 76000, placementRate: 88, topRecruiters: ['Deloitte', 'EY', 'Goldman Sachs', 'Google', 'PwC'] },
    majors: ['Business', 'Engineering', 'Political Science', 'Computer Science', 'Theology'],
    tags: ['Catholic', 'Athletics', 'Community', 'Business'],
    imageUrl: '/colleges/notredame.jpg',
  },
  {
    name: 'University of Virginia',
    slug: 'uva',
    location: 'Charlottesville, VA',
    state: 'Virginia',
    type: 'TARGET',
    description: 'Thomas Jefferson\'s university with outstanding public education.',
    overview: 'Founded by Thomas Jefferson, UVA is a flagship public university known for its historic Grounds, Honor Code, and strong programs in business (McIntire), law, and medicine. The Lawn is a UNESCO World Heritage Site.',
    fees: 53666,
    rating: 4.5,
    acceptanceRate: 16.3,
    avgAid: 20000,
    gpa: 3.82,
    sat: 1430,
    matchScore: 80,
    research: 85,
    campus: 94,
    social: 88,
    financial: 72,
    innovation: 78,
    diversity: 72,
    courses: [
      { name: 'Business (McIntire)', fee: 53666, duration: '4 years' },
      { name: 'Computer Science', fee: 53666, duration: '4 years' },
      { name: 'Economics', fee: 53666, duration: '4 years' },
      { name: 'Government', fee: 53666, duration: '4 years' },
    ],
    placements: { avgSalary: 75000, placementRate: 87, topRecruiters: ['Deloitte', 'Capital One', 'Google', 'EY', 'Booz Allen'] },
    majors: ['Business', 'Computer Science', 'Economics', 'Government', 'Biology'],
    tags: ['Public', 'Historic', 'Business', 'Liberal Arts'],
    imageUrl: '/colleges/uva.jpg',
  },
  {
    name: 'University of North Carolina at Chapel Hill',
    slug: 'unc',
    location: 'Chapel Hill, NC',
    state: 'North Carolina',
    type: 'SAFETY',
    description: 'Oldest public university in the US with strong all-around programs.',
    overview: 'UNC Chapel Hill is the nation\'s first public university, offering excellent academics at outstanding value. Known for its Kenan-Flagler Business School, journalism, and biomedical research, UNC combines academic rigor with a warm Southern campus culture.',
    fees: 36776,
    rating: 4.4,
    acceptanceRate: 17.0,
    avgAid: 18000,
    gpa: 3.75,
    sat: 1380,
    matchScore: 78,
    research: 87,
    campus: 90,
    social: 90,
    financial: 80,
    innovation: 78,
    diversity: 75,
    courses: [
      { name: 'Business', fee: 36776, duration: '4 years' },
      { name: 'Biology', fee: 36776, duration: '4 years' },
      { name: 'Computer Science', fee: 36776, duration: '4 years' },
      { name: 'Journalism', fee: 36776, duration: '4 years' },
    ],
    placements: { avgSalary: 68000, placementRate: 86, topRecruiters: ['Deloitte', 'Google', 'Wells Fargo', 'Duke Health', 'EY'] },
    majors: ['Business', 'Biology', 'Computer Science', 'Journalism', 'Pre-Med'],
    tags: ['Public', 'Historic', 'Value', 'Athletics'],
    imageUrl: '/colleges/unc.jpg',
  },
  {
    name: 'University of Wisconsin-Madison',
    slug: 'uw-madison',
    location: 'Madison, WI',
    state: 'Wisconsin',
    type: 'SAFETY',
    description: 'Major public research university with strong STEM and social sciences.',
    overview: 'UW-Madison is one of the largest and most productive research universities in the US. Located on the shores of Lake Mendota, it offers a vibrant campus experience with top programs in engineering, business, and life sciences.',
    fees: 39427,
    rating: 4.3,
    acceptanceRate: 49.0,
    avgAid: 14000,
    gpa: 3.65,
    sat: 1370,
    matchScore: 75,
    research: 90,
    campus: 88,
    social: 90,
    financial: 78,
    innovation: 82,
    diversity: 70,
    courses: [
      { name: 'Computer Science', fee: 39427, duration: '4 years' },
      { name: 'Engineering', fee: 39427, duration: '4 years' },
      { name: 'Business', fee: 39427, duration: '4 years' },
      { name: 'Biology', fee: 39427, duration: '4 years' },
    ],
    placements: { avgSalary: 68000, placementRate: 85, topRecruiters: ['Epic Systems', 'Google', 'Amazon', 'Microsoft', 'Deloitte'] },
    majors: ['Computer Science', 'Engineering', 'Business', 'Biology', 'Political Science'],
    tags: ['Public', 'Big Ten', 'Research', 'Value'],
    imageUrl: '/colleges/uwmadison.jpg',
  },
];


async function main() {
  console.log('🌱 Seeding database with', colleges.length, 'colleges...');

  for (const college of colleges) {
    await prisma.college.upsert({
      where: { slug: college.slug },
      update: college,
      create: college,
    });
    console.log('  ✓', college.name);
  }

  // ─── Seed the Demo Scholar Account ───────────────────────────────────────
  console.log('👤 Seeding demo scholar account...');
  const demoEmail = 'demo@example.com';
  const demoHashed = await bcrypt.hash('demo123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: 'Demo Scholar',
      passwordHash: demoHashed,
      gpa: 3.8,
      sat: 1450,
      major: 'Computer Science',
      role: 'SUB_ADMIN',
    },
    create: {
      name: 'Demo Scholar',
      email: demoEmail,
      passwordHash: demoHashed,
      gpa: 3.8,
      sat: 1450,
      major: 'Computer Science',
      role: 'SUB_ADMIN',
    },
  });

  // ─── Seed the Evaluator Admin Account ────────────────────────────────────
  console.log('👤 Seeding evaluator admin account...');
  const adminEmail = 'peelapuneeth@gmail.com';
  const adminHashed = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Evaluator Admin',
      passwordHash: adminHashed,
      gpa: 4.0,
      sat: 1600,
      major: 'Computer Science',
      role: 'ADMIN',
    },
    create: {
      name: 'Evaluator Admin',
      email: adminEmail,
      passwordHash: adminHashed,
      gpa: 4.0,
      sat: 1600,
      major: 'Computer Science',
      role: 'ADMIN',
    },
  });

  // ─── Seed 5 Extra Realistic Candidate Users ──────────────────────────────
  console.log('👥 Seeding candidate users...');

  const candidateProfiles = [
    { name: 'Aisha Patel',    email: 'aisha.patel@example.com',    gpa: 3.92, sat: 1520, major: 'Biomedical Engineering' },
    { name: 'Marcus Chen',    email: 'marcus.chen@example.com',    gpa: 3.75, sat: 1480, major: 'AI/ML' },
    { name: 'Sofia Rosario',  email: 'sofia.rosario@example.com',  gpa: 3.60, sat: 1380, major: 'Economics' },
    { name: 'Ethan Williams', email: 'ethan.williams@example.com', gpa: 4.00, sat: 1590, major: 'Physics' },
    { name: 'Priya Nair',     email: 'priya.nair@example.com',     gpa: 3.45, sat: 1310, major: 'Environmental Science' },
  ];

  const candidateUsers = await Promise.all(
    candidateProfiles.map((p) =>
      prisma.user.upsert({
        where: { email: p.email },
        update: { name: p.name, gpa: p.gpa, sat: p.sat, major: p.major, role: 'USER' },
        create: {
          name: p.name,
          email: p.email,
          passwordHash: demoHashed, // same hash for easy testing
          gpa: p.gpa,
          sat: p.sat,
          major: p.major,
          role: 'USER',
        },
      })
    )
  );
  console.log('  ✓ Seeded', candidateUsers.length, 'candidate users');

  // ─── Fetch Colleges for Seeding Relations ─────────────────────────────────
  const [mit, stanford, caltech, cmu, harvard, ucBerkeley, cornell, princeton] =
    await Promise.all([
      prisma.college.findUnique({ where: { slug: 'mit' } }),
      prisma.college.findUnique({ where: { slug: 'stanford' } }),
      prisma.college.findUnique({ where: { slug: 'caltech' } }),
      prisma.college.findUnique({ where: { slug: 'cmu' } }),
      prisma.college.findUnique({ where: { slug: 'harvard' } }),
      prisma.college.findUnique({ where: { slug: 'uc-berkeley' } }),
      prisma.college.findUnique({ where: { slug: 'cornell' } }),
      prisma.college.findUnique({ where: { slug: 'princeton' } }),
    ]);

  // ─── Demo User Application Tracker (Varied Statuses) ─────────────────────
  if (mit && stanford && caltech && cmu && harvard && ucBerkeley) {
    const trackedApps = [
      { college: mit,         status: 'SUBMITTED'   as const },
      { college: stanford,    status: 'ACCEPTED'    as const },
      { college: caltech,     status: 'REJECTED'    as const },
      { college: cmu,         status: 'IN_PROGRESS' as const },
      { college: harvard,     status: 'RESEARCHING' as const },
      { college: ucBerkeley,  status: 'ACCEPTED'    as const },
    ];

    for (const { college, status } of trackedApps) {
      await prisma.savedCollege.upsert({
        where: { userId_collegeId: { userId: demoUser.id, collegeId: college.id } },
        update: { status },
        create: { userId: demoUser.id, collegeId: college.id, status },
      });
    }
    console.log('  ✓ Demo user applications: ACCEPTED (Stanford, Berkeley), REJECTED (Caltech), SUBMITTED (MIT)');
  }

  // Candidate user tracker entries
  if (mit && stanford && caltech && cornell && princeton) {
    const [aisha, marcus, sofia] = candidateUsers;
    const allCandidateApps = [
      { userId: aisha.id,  collegeId: mit.id,           status: 'IN_PROGRESS' as const },
      { userId: aisha.id,  collegeId: harvard?.id ?? '', status: 'RESEARCHING' as const },
      { userId: marcus.id, collegeId: stanford.id,       status: 'SUBMITTED'   as const },
      { userId: marcus.id, collegeId: cmu?.id ?? '',     status: 'IN_PROGRESS' as const },
      { userId: sofia.id,  collegeId: cornell.id,        status: 'RESEARCHING' as const },
      { userId: sofia.id,  collegeId: princeton.id,      status: 'RESEARCHING' as const },
    ];
    const candidateApps = allCandidateApps.filter((a) => a.collegeId !== '');

    for (const app of candidateApps) {
      if (!app.collegeId) continue;
      await prisma.savedCollege.upsert({
        where: { userId_collegeId: { userId: app.userId, collegeId: app.collegeId } },
        update: { status: app.status },
        create: app,
      });
    }
    console.log('  ✓ Candidate user application entries seeded');
  }

  // ─── Saved Comparisons for Demo User ─────────────────────────────────────
  if (mit && stanford && caltech && cmu) {
    const comparisons = [
      { name: 'Top STEM Schools',        collegeIds: [mit.id, caltech.id, stanford.id] },
      { name: 'CS Powerhouses',          collegeIds: [cmu.id, stanford.id, mit.id] },
      { name: 'MIT vs Stanford',         collegeIds: [mit.id, stanford.id] },
    ];

    for (const comp of comparisons) {
      const existing = await prisma.savedComparison.findFirst({
        where: { userId: demoUser.id, name: comp.name },
      });
      if (!existing) {
        await prisma.savedComparison.create({
          data: { userId: demoUser.id, ...comp },
        });
      }
    }
    console.log('  ✓ 3 saved comparisons seeded for demo user');
  }

  // ─── Rich Reviews Across 6 Colleges ──────────────────────────────────────
  console.log('⭐ Seeding reviews...');

  const reviewSeeds = [
    // MIT
    { slug: 'mit', user: candidateUsers[3], rating: 5, title: 'The best STEM education on Earth', body: 'MIT completely transformed my understanding of what research means. The UROP program let me work in a nanotechnology lab as a sophomore. Psets are brutal but the community gets you through. Career services placed me at a top AI lab. Worth every penny.' },
    { slug: 'mit', user: candidateUsers[0], rating: 5, title: 'Incredible research opportunities', body: 'The research facilities here are unmatched. I had access to electron microscopes and quantum computing labs that most PhDs never see. Professors are genuinely accessible — I co-authored a paper with my advisor in junior year.' },
    { slug: 'mit', user: demoUser,          rating: 4, title: 'World-class but intense', body: 'MIT is unlike anything else. The "firehose" metaphor is real — you will be overwhelmed. But the people around you are so brilliant that you rise to meet them. The collaborative culture actually surprised me; it\'s not cutthroat at all.' },
    // Stanford
    { slug: 'stanford', user: candidateUsers[1], rating: 5, title: 'Best CS program for builders', body: 'Stanford\'s connection to Silicon Valley is not just proximity — it\'s cultural. VCs come to office hours. Founders drop by dorms. I had my startup funded before I graduated. The CS curriculum is rigorous but leaves room for entrepreneurship.' },
    { slug: 'stanford', user: candidateUsers[4], rating: 4, title: 'Amazing campus, competitive vibe', body: 'Stanford is gorgeous and the weather is perfect year-round. The interdisciplinary programs like CS+Biology or CS+Music are genuinely creative. Financial aid was generous — my package covered most costs.' },
    // Harvard
    { slug: 'harvard', user: candidateUsers[2], rating: 5, title: 'Opens every door', body: 'The Harvard name genuinely opens doors in ways I couldn\'t have imagined. The alumni network is absurdly strong — I got my investment banking role through a cold LinkedIn message to a Harvard alum. Academically challenging but manageable with the right study groups.' },
    { slug: 'harvard', user: candidateUsers[3], rating: 4, title: 'Prestige + substance', body: 'The Gen Ed requirements force you to think across disciplines. I came in as a CS person and ended up taking political philosophy and cognitive science — both of which shaped my product thinking more than any CS class.' },
    // Caltech
    { slug: 'caltech', user: candidateUsers[3], rating: 5, title: 'Density of genius is unreal', body: 'Caltech has 980 undergrads and 9 Nobel laureates on faculty. The Honor Code means you can reschedule your own exams. JPL access for aerospace students is a huge privilege. The campus is intimate and everyone knows everyone.' },
    { slug: 'caltech', user: candidateUsers[1], rating: 4, title: 'Pure STEM excellence', body: 'If you love problem-solving for its own sake, Caltech is nirvana. The curriculum is harder than MIT in some ways. Social life is quieter but Hovse culture creates real community. Research output per student is insane.' },
    // CMU
    { slug: 'cmu', user: candidateUsers[1], rating: 5, title: '#1 CS program, no contest', body: 'The School of Computer Science at CMU is relentless. You will work harder than you ever have, but the technical foundation it gives you is unbeatable. I had 5 return offers from top tech companies after my junior-year internship — all CMU interviews.' },
    { slug: 'cmu', user: demoUser,          rating: 4, title: 'Great for tech, okay for everything else', body: 'CMU is a tech school first. The arts programs are surprisingly strong (drama, music) which balances the vibe. Pittsburgh is underrated as a city — affordable, great food, and the Rust Belt revival is real. Winters are tough though.' },
    // UC Berkeley
    { slug: 'uc-berkeley', user: candidateUsers[2], rating: 5, title: 'World-class at a fraction of the price', body: 'Berkeley\'s CS program is Ivy-tier for a state-school price tag (if you\'re in-state). The EECS program is brutal to get into but the alumni network in the Bay is second only to Stanford. The activism culture makes you a more aware person.' },
    { slug: 'uc-berkeley', user: candidateUsers[4], rating: 4, title: 'Scale is both weakness and strength', body: 'Berkeley is massive. You have to be proactive — go to office hours, join clubs, seek out professors. But the upside is you get industry speakers, startup resources, and student orgs that rival full companies. QSE program is excellent.' },
    // Cornell
    { slug: 'cornell', user: candidateUsers[0], rating: 4, title: 'Breadth + Depth done right', body: 'Cornell\'s Engineering is top-10 and the campus in Ithaca is stunning. The interdisciplinary options — I took courses in ILR, Hotel, and Engineering — are genuinely unique among Ivy League schools. Gorges walks are the best stress relief.' },
    // Princeton
    { slug: 'princeton', user: candidateUsers[3], rating: 5, title: 'The undergraduate focus matters', body: 'Princeton\'s undergraduate-first philosophy is real. There is no law school or business school competing for faculty attention. Every grad student wants to TA. The thesis requirement is terrifying and then the most rewarding thing you\'ll do.' },
  ];

  let reviewCount = 0;
  for (const r of reviewSeeds) {
    const college = await prisma.college.findUnique({ where: { slug: r.slug } });
    if (!college) continue;
    const exists = await prisma.review.findFirst({
      where: { userId: r.user.id, collegeId: college.id },
    });
    if (!exists) {
      await prisma.review.create({
        data: {
          userId: r.user.id,
          collegeId: college.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
        },
      });
      reviewCount++;
    }
  }
  console.log('  ✓', reviewCount, 'reviews seeded');

  // ─── Rich Discussions with Upvotes ────────────────────────────────────────
  console.log('💬 Seeding discussions...');

  const [aisha, marcus, sofia, ethan, priya] = candidateUsers;

  const discussionData = [
    {
      userId: demoUser.id,
      title: 'MIT vs Stanford for AI/ML — which campus culture fits a builder?',
      body: 'I\'m deciding between MIT and Stanford for CS with a focus on AI/ML. Both have incredible programs but the cultures seem very different. MIT feels more research-pure while Stanford feels more startup-oriented. Would love to hear from people who considered both. Which recruiting networks are stronger for ML roles at top labs?',
      tags: ['admissions', 'CS', 'AI/ML', 'MIT', 'Stanford'],
      upvotes: 42,
      collegeSlug: 'mit',
    },
    {
      userId: aisha.id,
      title: 'How competitive is CMU MSCS vs direct BS admission for international students?',
      body: 'As an international student from India with a 1520 SAT and 3.92 GPA, I\'m trying to understand whether CMU\'s undergrad CS is realistic or if I should target a strong MS program later. The acceptance rate for international students seems even lower. Anyone have data or experience with this?',
      tags: ['international', 'CMU', 'CS', 'admissions'],
      upvotes: 28,
      collegeSlug: 'cmu',
    },
    {
      userId: marcus.id,
      title: 'Financial aid comparison: MIT vs Harvard vs Princeton for middle-income families?',
      body: 'My family income is around $120k/year. I\'ve heard MIT and Princeton meet 100% of demonstrated need. How does Harvard compare in practice? Are there families in this income bracket who ended up paying more at Harvard than MIT? Trying to model actual out-of-pocket costs for a realistic comparison.',
      tags: ['financial-aid', 'MIT', 'Harvard', 'Princeton', 'scholarships'],
      upvotes: 67,
      collegeSlug: null,
    },
    {
      userId: ethan.id,
      title: 'Caltech vs MIT for physics research — which has better undergrad access to faculty labs?',
      body: 'I want to do theoretical physics research with the goal of a PhD at Princeton or Cambridge. Caltech has a smaller student body which might mean more faculty access, but MIT has more research funding. Anyone done UROP at MIT or SURF at Caltech? How easy was it to get into top labs as a freshman?',
      tags: ['physics', 'research', 'Caltech', 'MIT', 'PhD'],
      upvotes: 35,
      collegeSlug: null,
    },
    {
      userId: sofia.id,
      title: 'Is UC Berkeley worth it for Economics over UPenn Wharton at 3x the price?',
      body: 'Berkeley Economics vs Wharton — this is my dilemma. Berkeley is in-state for me ($30k/yr) vs Wharton ($82k/yr). Both are top economics programs but Wharton has the finance brand. I want to go into consulting or economic policy, not necessarily Wall Street. Is Wharton\'s premium justified?',
      tags: ['economics', 'Berkeley', 'UPenn', 'cost', 'Wharton'],
      upvotes: 54,
      collegeSlug: null,
    },
    {
      userId: priya.id,
      title: 'Best Environmental Science programs at top universities — rankings vs actual output?',
      body: 'The standard rankings don\'t capture environmental programs well. Looking for programs with strong field research components, good faculty doing actual conservation work, and connections to NGOs and policy orgs. Have heard good things about Yale SEAS, Duke Nicholas School, and Michigan. Anyone have insights?',
      tags: ['environmental-science', 'sustainability', 'rankings'],
      upvotes: 19,
      collegeSlug: null,
    },
    {
      userId: demoUser.id,
      title: 'Cornell Engineering vs UIUC CS — which has better industry recruiting for SWE?',
      body: 'Cornell Engineering (Ivy prestige, smaller class) vs UIUC CS (big tech recruiting machine, CS@Illinois brand). Both have strong alumni networks in different ways. I care most about getting into FAANG straight out of undergrad. Is the Ivy name at Cornell worth it vs UIUC\'s sheer placement numbers for SWE?',
      tags: ['Cornell', 'UIUC', 'SWE', 'FAANG', 'recruiting'],
      upvotes: 31,
      collegeSlug: null,
    },
    {
      userId: marcus.id,
      title: 'How important is the senior thesis for grad school applications?',
      body: 'Princeton famously requires a senior thesis. Harvard and MIT have optional thesis programs. For PhD applications in CS or Econ, how much does a strong thesis (vs no thesis) matter? Does a published paper from UROP at MIT beat a thesis? Trying to optimize my strategy for PhD applications 4 years from now.',
      tags: ['grad-school', 'PhD', 'thesis', 'research', 'Princeton'],
      upvotes: 23,
      collegeSlug: null,
    },
    {
      userId: aisha.id,
      title: 'Biomedical Engineering at Johns Hopkins vs MIT — lab access and clinical exposure?',
      body: 'JHU BME is legendarily close to the hospital system. MIT BME has the engineering depth. I want to go into medical devices or biotech. Where do undergrads actually get hands-on time with clinical settings? Does MIT\'s hospital affiliation (MGH/Brigham) give similar exposure as JHU\'s physical adjacency?',
      tags: ['biomedical', 'JHU', 'MIT', 'healthcare', 'research'],
      upvotes: 16,
      collegeSlug: null,
    },
    {
      userId: ethan.id,
      title: 'Is a 1590 SAT with 4.0 GPA competitive for Caltech or MIT without research?',
      body: 'I have near-perfect stats but no formal research experience (small rural high school with no university access). I have independent projects — built a spectrometer, wrote a small quantum simulation in Python. How much does the absence of official research hurt at Caltech and MIT? Any other ways to demonstrate scientific curiosity?',
      tags: ['stats', 'Caltech', 'MIT', 'research', 'admissions'],
      upvotes: 48,
      collegeSlug: null,
    },
  ];

  const seededDiscussions: Record<string, string> = {};
  let discussionCount = 0;

  for (const d of discussionData) {
    const exists = await prisma.discussion.findFirst({
      where: { userId: d.userId, title: d.title },
    });
    if (exists) {
      seededDiscussions[d.title] = exists.id;
      continue;
    }
    let collegeId: string | null = null;
    if (d.collegeSlug) {
      const col = await prisma.college.findUnique({ where: { slug: d.collegeSlug } });
      collegeId = col?.id ?? null;
    }
    const created = await prisma.discussion.create({
      data: {
        userId: d.userId,
        title: d.title,
        body: d.body,
        tags: d.tags,
        upvotes: d.upvotes,
        collegeId,
      },
    });
    seededDiscussions[d.title] = created.id;
    discussionCount++;
  }
  console.log('  ✓', discussionCount, 'discussions seeded');

  // ─── Answers (22) with Upvotes + Accepted Flags ───────────────────────────
  console.log('💡 Seeding answers...');

  const answerData: Array<{
    discussionTitle: string;
    userId: string;
    body: string;
    upvotes: number;
    isAccepted: boolean;
  }> = [
    // MIT vs Stanford thread
    {
      discussionTitle: 'MIT vs Stanford for AI/ML — which campus culture fits a builder?',
      userId: ethan.id,
      body: 'Spent a summer at MIT CSAIL and interned at a Stanford lab the following year. MIT culture is "show me the math" — everything is proven from first principles. Stanford culture is "ship it and iterate." For ML research, MIT gives you better theoretical grounding. For building ML products, Stanford connects you to the people funding them. Choose based on your 5-year goal, not prestige.',
      upvotes: 38,
      isAccepted: true,
    },
    {
      discussionTitle: 'MIT vs Stanford for AI/ML — which campus culture fits a builder?',
      userId: marcus.id,
      body: 'The recruiting networks are different in kind, not just strength. MIT\'s network is strong in research labs (DeepMind, OpenAI, Google Brain) while Stanford\'s alumni are more concentrated in startups and Series A companies. Both will get you FAANG offers — the differentiation is at the frontier.',
      upvotes: 24,
      isAccepted: false,
    },
    // Financial aid thread
    {
      discussionTitle: 'Financial aid comparison: MIT vs Harvard vs Princeton for middle-income families?',
      userId: demoUser.id,
      body: 'At $120k family income: MIT typically expects around $15-20k/year contribution, Harvard around $18-25k, Princeton around $12-18k. Princeton historically has the most generous aid for middle-income families because they eliminated loans entirely from their packages — you\'ll never borrow to attend Princeton if you get in. MIT comes close. Harvard is generous but slightly less so at exactly your income level.',
      upvotes: 52,
      isAccepted: true,
    },
    {
      discussionTitle: 'Financial aid comparison: MIT vs Harvard vs Princeton for middle-income families?',
      userId: priya.id,
      body: 'One thing to verify: Harvard counts home equity in their financial aid formula, which MIT doesn\'t (as of the last policy update I saw). If your parents have significant home equity from a paid-down mortgage, Harvard\'s actual ask may be meaningfully higher than the calculator shows. Always call the financial aid office directly with your specific numbers.',
      upvotes: 41,
      isAccepted: false,
    },
    {
      discussionTitle: 'Financial aid comparison: MIT vs Harvard vs Princeton for middle-income families?',
      userId: aisha.id,
      body: 'Don\'t forget to factor in actual cost of living differences. Cambridge and Ithaca have very different rent markets. Also Princeton\'s meal plan is mandatory and expensive — subtract from their aid generosity when comparing final numbers.',
      upvotes: 17,
      isAccepted: false,
    },
    // Caltech vs MIT physics thread
    {
      discussionTitle: 'Caltech vs MIT for physics research — which has better undergrad access to faculty labs?',
      userId: demoUser.id,
      body: 'The SURF program at Caltech is genuinely exceptional — it\'s one of the most competitive summer research programs in the country and gives you 10 weeks fully funded in a Caltech lab. UROP at MIT is more accessible (you can start freshman fall) but less curated. If you want to do LIGO gravitational wave research, Caltech is the obvious answer. If you want condensed matter or quantum information, MIT is stronger.',
      upvotes: 29,
      isAccepted: true,
    },
    {
      discussionTitle: 'Caltech vs MIT for physics research — which has better undergrad access to faculty labs?',
      userId: marcus.id,
      body: 'Class size matters a lot here. Caltech physics cohort is ~30 students. MIT is ~100+. That means at Caltech every professor knows your name by end of sophomore year. At MIT you have to be more proactive to stand out. For PhD placement, both feed into the top 5 physics programs equally well.',
      upvotes: 22,
      isAccepted: false,
    },
    // Berkeley vs Wharton thread
    {
      discussionTitle: 'Is UC Berkeley worth it for Economics over UPenn Wharton at 3x the price?',
      userId: ethan.id,
      body: 'For consulting (McKinsey/BCG/Bain), both recruit heavily. For policy work and academic economics, Berkeley PhD pipeline is actually stronger because the research culture is more academic than Wharton\'s. For Wall Street IBD, Wharton wins by a mile. If you\'re genuinely policy-oriented, Berkeley at $30k/yr vs Wharton at $82k/yr is a no-brainer financially and academically.',
      upvotes: 47,
      isAccepted: true,
    },
    {
      discussionTitle: 'Is UC Berkeley worth it for Economics over UPenn Wharton at 3x the price?',
      userId: aisha.id,
      body: 'The $52k/year difference compounds over 4 years to ~$200k+ in loans vs no loans. That\'s a massive life decision, not just a school decision. The finance premium Wharton charges is real but only pays off if you\'re going into high-compensation finance roles. Be honest with yourself about what you actually want to do.',
      upvotes: 35,
      isAccepted: false,
    },
    // Environmental Science thread
    {
      discussionTitle: 'Best Environmental Science programs at top universities — rankings vs actual output?',
      userId: sofia.id,
      body: 'Yale SEAS (School of the Environment) is the gold standard for policy-oriented environmental work. The faculty include some of the authors of the IPCC reports. Duke Nicholas School is better for field work and conservation biology. If you care about climate finance and carbon markets, Columbia SIPA and Fletcher at Tufts are worth looking at alongside the science programs.',
      upvotes: 21,
      isAccepted: true,
    },
    // Cornell vs UIUC thread
    {
      discussionTitle: 'Cornell Engineering vs UIUC CS — which has better industry recruiting for SWE?',
      userId: marcus.id,
      body: 'UIUC CS at Illinois sends more students to FAANG than almost any other school in raw numbers — the Career Fair is genuinely legendary, with 400+ companies. Cornell is smaller with more selective recruiting pathways. If your goal is an offer from Google/Meta by junior year, UIUC\'s sheer volume works in your favor. Cornell is better if you want trading firms or hedge fund quant roles (Ivy brand matters more there).',
      upvotes: 33,
      isAccepted: true,
    },
    {
      discussionTitle: 'Cornell Engineering vs UIUC CS — which has better industry recruiting for SWE?',
      userId: demoUser.id,
      body: 'I\'d also consider the transfer risk. Cornell Engineering is hard to stay in if you struggle first semester. UIUC CS is slightly more flexible in course planning. If you\'re confident in your technical ability, Cornell. If you want a more supported ramp-up, UIUC.',
      upvotes: 18,
      isAccepted: false,
    },
    // CMU international thread
    {
      discussionTitle: 'How competitive is CMU MSCS vs direct BS admission for international students?',
      userId: ethan.id,
      body: 'CMU CS undergrad is one of the hardest admissions in the US for any applicant — international acceptance is likely under 3%. The MSCS is more accessible but still competitive. A strong path: attend a top public school for undergrad (Berkeley, Michigan, UIUC), build research/internship credentials, then apply to CMU MSCS. The career outcomes are nearly identical and the debt is manageable.',
      upvotes: 26,
      isAccepted: true,
    },
    // Thesis thread
    {
      discussionTitle: 'How important is the senior thesis for grad school applications?',
      userId: aisha.id,
      body: 'A strong thesis with faculty advisor endorsement is excellent for PhD applications. But a published paper from UROP beats a thesis in almost every case because publication = peer-reviewed external validation. If you can get a paper submitted (even to arXiv) by senior year, that matters more to grad admissions than any thesis.',
      upvotes: 19,
      isAccepted: true,
    },
    {
      discussionTitle: 'How important is the senior thesis for grad school applications?',
      userId: priya.id,
      body: 'For programs like Princeton or Harvard that require/strongly encourage a thesis, it\'s table stakes. For MIT or Stanford PhD apps, the LoR from your thesis advisor carries more weight than the thesis itself. A mediocre thesis with a lukewarm LoR is worse than no thesis with an enthusiastic LoR from a professor you worked closely with.',
      upvotes: 14,
      isAccepted: false,
    },
    // JHU vs MIT BME thread
    {
      discussionTitle: 'Biomedical Engineering at Johns Hopkins vs MIT — lab access and clinical exposure?',
      userId: demoUser.id,
      body: 'JHU\'s advantage is geographical and structural — the hospital is literally across the street and undergrads can shadow and assist in clinical research. MIT\'s MGH and Brigham affiliation is real but requires more initiative to access. For medical devices: MIT\'s engineering depth wins. For clinical research and translational medicine: JHU wins. What type of BME career do you want?',
      upvotes: 14,
      isAccepted: true,
    },
    // Stats/research thread
    {
      discussionTitle: 'Is a 1590 SAT with 4.0 GPA without research competitive for Caltech or MIT?',
      userId: sofia.id,
      body: 'The spectrometer and quantum simulation projects are actually stronger than most "official" research if you can demonstrate depth and your own intellectual curiosity. Admissions officers at MIT and Caltech are looking for people who do science because they can\'t not do it — not people who found a professor to stamp their resume. Write compellingly about the WHY behind your projects.',
      upvotes: 44,
      isAccepted: true,
    },
    {
      discussionTitle: 'Is a 1590 SAT with 4.0 GPA without research competitive for Caltech or MIT?',
      userId: marcus.id,
      body: 'For context: MIT\'s acceptance rate is under 4%. Even perfect stats don\'t guarantee admission. Apply to a range. Your stats put you solidly in range for Caltech and MIT but you need something that makes an admissions officer remember you — and your independent projects sound like that thing.',
      upvotes: 29,
      isAccepted: false,
    },
    {
      discussionTitle: 'Is a 1590 SAT with 4.0 GPA without research competitive for Caltech or MIT?',
      userId: ethan.id,
      body: 'I was in a similar boat — rural high school, no formal research, lots of independent projects. Got into Caltech. The essays are your entire application at these schools. Stats just get you read. The narrative you build around your curiosity and independent learning is what gets you in.',
      upvotes: 51,
      isAccepted: false,
    },
  ];

  let answerCount = 0;
  for (const a of answerData) {
    const discussionId = seededDiscussions[a.discussionTitle];
    if (!discussionId) continue;
    const exists = await prisma.answer.findFirst({
      where: { userId: a.userId, discussionId },
    });
    if (!exists) {
      await prisma.answer.create({
        data: {
          userId: a.userId,
          discussionId,
          body: a.body,
          upvotes: a.upvotes,
          isAccepted: a.isAccepted,
        },
      });
      answerCount++;
    }
  }
  console.log('  ✓', answerCount, 'answers seeded');

  console.log('\n✅ Seed complete!');
  console.log('   📊 Colleges:     ', colleges.length);
  console.log('   👥 Users:        ', 2 + candidateUsers.length, '(demo + admin + 5 candidates)');
  console.log('   ⭐ Reviews:      ', reviewSeeds.length);
  console.log('   💬 Discussions:  ', discussionData.length);
  console.log('   💡 Answers:      ', answerData.length);
  console.log('   📑 Comparisons:  3');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
