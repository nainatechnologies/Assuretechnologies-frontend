export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  industry: string;
  postedDaysAgo: number;
  overview: string;
  responsibilities: string[];
}

export const CAREERS_DATA: JobListing[] = [
  {
    id: "marketing-1",
    title: "Digital Marketing Intern",
    department: "Marketing",
    location: "Hyderabad",
    type: "Full Time",
    experience: "Fresher",
    industry: "Market Research",
    postedDaysAgo: 81,
    overview: "We are looking for a motivated Digital Marketing Intern to assist our team in executing online marketing campaigns. You will help with content creation, social media management, and SEO tasks to support the planning and execution of digital marketing activities for market research reports, consulting services, and business intelligence solutions.",
    responsibilities: [
      "Assist in the creation of marketing content",
      "Manage and schedule social media posts",
      "Help analyze marketing data and campaign performance",
      "Execute on-page and off-page SEO activities to improve website rankings and organic traffic."
    ]
  },
  {
    id: "marketing-2",
    title: "Digital Marketing Executive",
    department: "Marketing",
    location: "Hyderabad",
    type: "Full Time",
    experience: "1-3 Years",
    industry: "Market Research",
    postedDaysAgo: 7,
    overview: "We are looking for a motivated and detail-oriented Digital Marketing Executive to support the planning and execution of digital marketing activities for market research reports, consulting services, and business intelligence solutions. The ideal candidate should have hands-on experience in SEO, content marketing, social media marketing, and lead generation. This role is execution-focused and offers an excellent opportunity to grow in B2B digital marketing within the market research industry.",
    responsibilities: [
      "Execute on-page and off-page SEO activities to improve website rankings and organic traffic.",
      "Conduct keyword research and optimize website content, blogs, landing pages, and report pages.",
      "Plan and execute digital marketing campaigns",
      "Monitor and analyze performance metrics",
      "Optimize SEO strategies and manage ad budgets"
    ]
  },
  {
    id: "marketing-3",
    title: "Lead- Digital Marketing",
    department: "Marketing",
    location: "Hyderabad",
    type: "Full Time",
    experience: "4+ Years",
    industry: "Market Research",
    postedDaysAgo: 21,
    overview: "We are seeking an experienced Digital Marketing Lead to oversee our entire online marketing strategy. You will manage a team and drive growth through innovative digital initiatives in the B2B market research space.",
    responsibilities: [
      "Develop and implement the overall digital marketing strategy",
      "Manage and mentor the digital marketing team",
      "Oversee all digital campaigns and report on ROI"
    ]
  },
  {
    id: "research-1",
    title: "Market Research Associate",
    department: "Research",
    location: "Hyderabad",
    type: "Full Time",
    experience: "1-2 Years",
    industry: "Market Research",
    postedDaysAgo: 74,
    overview: "As a Market Research Associate, you will collect and analyze data to help us understand market trends, consumer behavior, and competitive landscapes.",
    responsibilities: [
      "Conduct primary and secondary research",
      "Analyze data and prepare detailed reports",
      "Identify market trends and opportunities"
    ]
  },
  {
    id: "research-2",
    title: "Market Research Analyst",
    department: "Research",
    location: "Hyderabad",
    type: "Full Time",
    experience: "3+ Years",
    industry: "Market Research",
    postedDaysAgo: 131,
    overview: "We are looking for a Market Research Analyst to provide deep insights into our industry. Your findings will directly influence our product development and business strategies.",
    responsibilities: [
      "Design and execute comprehensive research studies",
      "Present actionable insights to stakeholders",
      "Monitor industry trends and competitor activities"
    ]
  },
  {
    id: "sales-1",
    title: "Business Development Manager",
    department: "Sales & Marketing",
    location: "Hyderabad",
    type: "Full Time",
    experience: "1-5 Years",
    industry: "Market Research",
    postedDaysAgo: 248,
    overview: "Drive growth and expand our client base as a Business Development Manager. You will identify new opportunities, build relationships, and close deals.",
    responsibilities: [
      "Identify and pursue new business opportunities",
      "Develop and pitch proposals to potential clients",
      "Meet and exceed sales targets"
    ]
  },
  {
    id: "sales-2",
    title: "Client Partner - Inbound and Outbound",
    department: "Sales & Marketing",
    location: "Hyderabad",
    type: "Full Time",
    experience: "1 To 5 Years",
    industry: "Market Research",
    postedDaysAgo: 98,
    overview: "Join us as a Client Partner to manage inbound leads and convert them into long-term clients. You will be the first point of contact for potential customers.",
    responsibilities: [
      "Respond to inbound leads and inquiries promptly",
      "Understand client needs and propose suitable solutions",
      "Maintain accurate records of interactions in the CRM"
    ]
  }
];
