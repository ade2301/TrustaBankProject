export const blogPosts = [
  {
    id: 1,
    slug: 'smart-money-habits-for-nigerian-professionals',
    title: '5 Smart Money Habits for Nigerian Professionals',
    excerpt:
      'Practical routines for budgeting, saving, and spending in a way that creates steady financial progress.',
    category: 'Money Management',
    date: 'Mar 28, 2026',
    author: 'Olivia Chen',
    readTime: '6 min read',
    thumbnail: 'https://i.pinimg.com/1200x/52/ce/ab/52ceab112d95fa1e1f1519f8abc3b30c.jpg',
    coverLabel: 'Budgeting and savings',
    content: [
      'Building better money habits does not start with a huge salary. It starts with a repeatable routine. One of the most effective methods is separating your income as soon as it lands. Split funds into essentials, savings, and personal spending before any impulse purchase can happen.',
      'Another powerful habit is weekly money reviews. Spend 15 minutes every Sunday checking your transfers, bills, and subscriptions. This simple review helps you spot waste early and keeps your plans realistic.',
      'Finally, automate what you can. Recurring savings and bill reminders reduce mental stress and prevent missed deadlines. Over time, consistency matters more than intensity. Small disciplined actions usually outperform short bursts of motivation.'
    ]
  },
  {
    id: 2,
    slug: 'how-to-build-a-monthly-budget-that-actually-works',
    title: 'How to Build a Monthly Budget That Actually Works',
    excerpt:
      'A practical budgeting framework for salary earners, freelancers, and small business owners.',
    category: 'Guides',
    date: 'Mar 25, 2026',
    author: 'Dev Patel',
    readTime: '7 min read',
    thumbnail: 'https://i.pinimg.com/736x/29/47/3b/29473b11e60ae43cf2a71c55027407b5.jpg',
    coverLabel: 'Monthly planning',
    content: [
      'A useful budget is one you can follow in real life, not one that looks perfect on paper. Start by tracking your spending for one month. This gives you real numbers instead of assumptions.',
      'Group expenses into fixed and flexible categories. Fixed expenses are rent, transport, or school fees. Flexible expenses include food, entertainment, and impulse spending. Once categorized, set limits for each flexible group and adjust gradually over two or three months.',
      'Use a weekly check-in to stay on track. If one category goes over, reduce another category in the same month. Budgeting is not about being strict every day. It is about making informed trade-offs quickly.'
    ]
  },
  {
    id: 3,
    slug: 'freelancers-guide-to-cash-flow-and-tax-prep',
    title: 'Freelancer Guide to Cash Flow and Tax Prep',
    excerpt:
      'Simple systems to handle irregular income, project payments, and tax obligations with less stress.',
    category: 'Business',
    date: 'Mar 22, 2026',
    author: 'Tunde Adeyemi',
    readTime: '8 min read',
    thumbnail: 'https://i.pinimg.com/736x/87/88/d5/8788d54d20778e7d84dfa627b53d0ed4.jpg',
    coverLabel: 'Freelance finance',
    content: [
      'Freelance income can be unpredictable, so your financial structure should be predictable. Create separate wallets for operating expenses, taxes, and savings. When a payment arrives, split it immediately based on your chosen percentages.',
      'Keep a monthly cash flow sheet with three numbers: expected inflow, guaranteed expenses, and current buffer. This helps you decide whether to accept lower-rate jobs during slow periods or hold out for better opportunities.',
      'For taxes, save a fixed percentage from each invoice and store all business receipts in one place. Waiting until year-end usually creates panic and avoidable errors. Small monthly effort keeps you compliant and calm.'
    ]
  },
  {
    id: 4,
    slug: 'what-safe-digital-banking-looks-like-in-2026',
    title: 'What Safe Digital Banking Looks Like in 2026',
    excerpt:
      'Key account-protection habits and security controls every user should understand.',
    category: 'Security',
    date: 'Mar 20, 2026',
    author: 'Zainab Hassan',
    readTime: '6 min read',
    thumbnail: 'https://i.pinimg.com/736x/35/3f/49/353f4944093a80737222be1e4312db6e.jpg',
    coverLabel: 'Account protection',
    content: [
      'Security starts with user behavior. Strong unique passwords, biometric lock, and two-step verification remain your first line of defense. Most account incidents happen because these basics were skipped.',
      'Real-time alerts are equally important. Turn on notifications for transfers, login attempts, and card activity. Quick awareness gives you time to respond before an issue escalates.',
      'When using public networks, avoid sensitive transactions. If needed, use a secure connection and log out immediately after use. Good security is not a one-time setup. It is a daily habit.'
    ]
  },
  {
    id: 5,
    slug: 'how-to-set-achievable-savings-goals',
    title: 'How to Set Achievable Savings Goals',
    excerpt:
      'A step-by-step method for turning broad savings plans into realistic monthly targets.',
    category: 'Savings',
    date: 'Mar 18, 2026',
    author: 'Marcus Johnson',
    readTime: '5 min read',
    thumbnail: 'https://i.pinimg.com/1200x/7a/a4/fe/7aa4fea018cdab1a0391bad30f6cf9ea.jpg',
    coverLabel: 'Goal tracking',
    content: [
      'The biggest reason savings goals fail is that they are too vague. Instead of saying I want to save more, define one target with a clear amount and date. Example: save N300,000 in 10 months for a business setup.',
      'Next, break the goal into weekly or monthly chunks and automate transfers. Automation removes decision fatigue and keeps progress steady even during busy periods.',
      'Track momentum visually. Seeing progress percentages and milestone badges improves consistency. You are more likely to keep saving when results are visible and measurable.'
    ]
  },
  {
    id: 6,
    slug: 'trusta-product-updates-you-should-know',
    title: 'Trusta Product Updates You Should Know',
    excerpt:
      'An overview of recent feature improvements focused on speed, clarity, and reliability.',
    category: 'Product Updates',
    date: 'Mar 15, 2026',
    author: 'Trusta Team',
    readTime: '4 min read',
    thumbnail: 'https://i.pinimg.com/736x/c1/c3/76/c1c376c026ffd22bfa6452f9f9fe2812.jpg',
    coverLabel: 'Platform updates',
    content: [
      'This month, we improved transfer confirmation speed and redesigned transaction details for clearer status visibility. Users now see pending, processing, and completed states more transparently.',
      'We also introduced smarter bill reminders and cleaner spending summaries. The goal is to reduce friction in everyday money tasks and help users make faster decisions.',
      'Over the next few releases, we will continue improving reliability and controls. Our product direction remains focused on trust, speed, and straightforward user experience.'
    ]
  }
]

export function getBlogBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug)
}
