// Short public introductions. Longer working notes live in the original case components.
export const projectOverviews = {
  '/fx': {
    context: 'Barclays · 2025 to now',
    card: 'One chart for traders to track and reprice a live FX order.',
    lead: 'Traders were managing a single FX order across five spreadsheets, a static chart and an execution tool.',
    contribution: 'As lead designer, I brought market context, order progress and repricing into one view. The trader decides when to act.',
    outcome: 'In beta with internal users. My public rebuild uses sample data.',
    links: [{ label: 'Try the public rebuild', href: 'https://shannonhecker.github.io/fx-execution-analytics/' }],
  },
  '/fusion': {
    context: 'J.P. Morgan · 2023 to 2025',
    card: 'Portfolio performance, attribution and risk in one dashboard.',
    lead: 'Portfolio managers needed performance, attribution and risk figures they could take into a board meeting.',
    contribution: 'As Digital Product Designer VP, I led the dashboard design and built widgets and filters on top of Salt.',
    outcome: 'Fusion shipped first to internal users, then to clients. Other Fusion teams reused the widgets and filters.',
    links: [{ label: 'Try the public rebuild', href: 'https://jpm-analytics-dashboard-shannon-h.vercel.app/' }],
  },
  '/deal-model': {
    context: 'J.P. Morgan · Securities Services · 2022 to 2023',
    card: 'Four teams price and approve a deal from one shared record.',
    lead: 'Sales, legal, product and custody operations each worked from their own copy of the same deal spreadsheet.',
    contribution: 'As UI lead, I designed four views of one deal record so each team could price, compare or approve a deal.',
    outcome: 'In use internally. Teams could bring their existing spreadsheets into the platform.',
    links: [],
  },
  '/winking-star': {
    context: 'Independent project · 2026',
    card: 'A shared routine board where children earn stars and grow a pet.',
    lead: 'Bedtime in our house meant two adults keeping track of which routines two children had finished.',
    contribution: 'I designed and built a shared family board. Each routine earns a star and helps a weekly pet grow.',
    outcome: 'Live on the web and iOS, in five languages.',
    links: [{ label: 'Open Winking Star', href: 'https://winkingstar.com/' }, { label: 'View on the App Store', href: 'https://apps.apple.com/app/id6765767262' }],
  },
  '/uoaui': {
    context: 'Independent project · 2026',
    card: 'A design canvas for comparing the same screen across component libraries.',
    lead: 'I wanted to see how the same screen would work across different design systems before committing to one.',
    contribution: 'I designed and built a canvas that maps elements to real components. Designers can compare systems, adjust the result and export React.',
    outcome: 'The builder is in private alpha. The comparison and Salt UI Kit are public.',
    links: [{ label: 'Explore uoaui.ai', href: 'https://uoaui.ai/' }, { label: 'View the Salt UI Kit', href: 'https://uoaui.ai/ui-kit?ds=salt' }],
  },
} as const;
