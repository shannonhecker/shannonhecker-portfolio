// Public project stories drawn from the project notes and design decisions.
export const projectOverviews = {
  '/fx': {
    organisation: 'Barclays',
    period: '2025 to now',
    card: 'FX trading platform · Under NDA.',
    nda: true,
  },
  '/fusion': {
    organisation: 'J.P. Morgan',
    period: '2023 to 2025',
    role: 'Digital Product Designer VP',
    card: 'Portfolio performance, attribution and risk in one dashboard.',
    lead: 'Portfolio managers needed performance, attribution and risk figures they could take into a board meeting.',
    contribution: "I led the dashboard design as Digital Product Designer VP. The product owner set requirements, and a UX designer shared time between projects. I made most of the day-to-day design decisions, from the arrangement of a report to the behaviour of a filter. Our analytics partner supplied the calculation engine. Each widget had to work with the data that engine could return.",
    decisions: [
      {
        title: "One report, several audiences",
        paragraphs: [
          "An analyst might have time to explore a portfolio in detail. A portfolio manager presenting the same figures in a board meeting needed to explain them while everyone was looking at the screen. I started with paper sketches to work out which number the audience needed first, then tested the hierarchy in wireframes and built it with Salt, the firm’s design system.",
          "We reviewed configurations weekly with internal users working on their own portfolios. I watched which filters they changed and what they kept from the starting view. That helped me set defaults for a useful first report. It also exposed a middle tier of customisation that added another decision without changing what people built. I removed it.",
        ],
      },
      {
        title: "Widgets that could travel",
        paragraphs: [
          "Performance, attribution and risk each drew on different data cubes. A fixed layout for every report would have meant designing another page for each combination. I designed widgets that could share the same selection and filtering patterns. When the dashboard opened to clients, the page structure stayed familiar and entitlements determined which data they could see.",
          "Some teams had already built their own versions of Salt components. I grouped those variations and reviewed them with developers as we worked through the differences. An accessibility specialist joined our design reviews, and I checked a specific flow with developer tools before handover.",
        ],
      },
    ],
    outcome: "The dashboard shipped to internal users first and then to external clients. Other Fusion teams adopted the widgets and filtering patterns. The public rebuild shows how the dashboard works with example data.",
    links: [{ label: 'Try the public rebuild', href: 'https://jpm-analytics-dashboard-shannon-h.vercel.app/' }],
  },
  '/deal-model': {
    organisation: 'J.P. Morgan · Securities Services',
    period: '2022 to 2023',
    role: 'UI lead',
    card: 'Four teams price and approve a deal from one shared record.',
    lead: 'Sales, legal, product and custody operations each worked from their own copy of the same deal spreadsheet.',
    contribution: "I was UI lead for a year, working with two UX designers, a junior designer, a business analyst, a researcher, a data analyst and engineers. I owned the screen design across pricing, comparison and approval. We needed to preserve the source of each price and the person behind each change, so an approver could reconstruct a decision long after the meeting.",
    decisions: [
      {
        title: "Following a deal through four teams",
        paragraphs: [
          "I met each team weekly and brought them together every fortnight. In the individual sessions, people priced their own deals while I watched. Sales wanted to compare offers side by side. Legal needed to establish which iteration they were reviewing. Custody operations and product had their own responsibilities for the same record. Email held much of the history, which made it hard to tell whose spreadsheet was current.",
          "I usually brought three versions of a screen to the joint review. People could point to a missing step or an awkward assumption much more easily once they could compare alternatives. Sales kept the comparison table and legal kept the iteration list. Both read from the same deal. Engineers joined those reviews so we could resolve questions about data and validation while the people doing the work were there.",
        ],
      },
      {
        title: "Keeping the spreadsheet route",
        paragraphs: [
          "A user helped me understand why the spreadsheet survived our early designs. People knew where the fields were and trusted the calculations they had worked with for years. We added a template they could download, complete and upload. The platform mapped it into the same record as a deal entered on screen, so the next team could review it through its usual view.",
          "Warnings about rate sources appeared alongside pricing, where the person preparing the deal could act on them. Creating a new iteration produced an explicit success or failure message. Approvers could follow the versions and sign off against a particular one.",
        ],
      },
    ],
    outcome: "The platform went into internal use in Securities Services. Four teams could work from one record, with a sign-off trail in the tool. As template uploads fell away, we saw people moving to direct entry. I left the project for Fusion in 2023. The smart-pricing work I explored with the data analyst was still a proposal at that point.",
    links: [],
  },
  '/winking-star': {
    organisation: 'Independent project',
    period: '2026',
    role: 'Designer and developer',
    card: 'A shared routine board where children earn stars and grow a pet.',
    lead: 'Bedtime in our house meant two adults keeping track of which routines two children had finished.',
    contribution: "I designed and built Winking Star in the evenings and at weekends, with my own two children as its first users. Teeth, bath, reading and Mandarin practice each had a place in the evening. Once one parent handed over to the other, the next question was usually what had already been done. Our children had stopped looking at the chore charts we tried.",
    decisions: [
      {
        title: "Starting with the child’s tap",
        paragraphs: [
          "I watched what happened just after a child finished a routine. I tried large icons, stickers and little celebrations to see what gave them a reason to come back to the board themselves. The daily action became one tap to earn a star. Across the week those stars grow a Mystery Pet, so a child can see what several small actions add up to. A missed evening leaves the progress they have already earned.",
          "Each child can choose a theme. Recognising their own picture helps them find the right board before they can read their name. The weekly pet gives them something to look forward to, while the adult can still see which individual routines are complete.",
        ],
      },
      {
        title: "One family, two ways in",
        paragraphs: [
          "On the web I kept the whole week together. On iPhone I split Home, Activity, Treasure and Progress into tabs, so marking a routine does not require moving through a week of detail on a small screen. The same family data carries across both experiences. A second adult can join the existing board and see where the first left off.",
          "During setup, a parent can try the Sample Family on iPhone to see what a week looks like before creating their own board. The example has its own space. I also kept purchases behind the parental gate and chose a one-off lifetime purchase. There are no adverts or subscriptions.",
        ],
      },
      {
        title: "Handing a child the phone",
        paragraphs: [
          "There is a moment when the parent has set up the board and hands the phone over. I wanted a child to be able to mark reading as done and see the star appear without an adult authorising every tap. Kid Mode keeps those routine actions within reach. When an adult returns to edit the board, a short addition challenge puts a deliberate pause before an adult action.",
          "I made the gate depend on what the adult is about to do. A recent unlock can carry over for lighter actions. A destructive change in Kid Mode asks again, even if the adult recently passed the challenge. That keeps a quick handover practical while protecting the family’s setup if the child picks up the phone again.",
        ],
      },
    ],
    outcome: "Winking Star is live on the web and iOS in five languages. Since launch I have fixed the midnight rollover, improved VoiceOver support and refined weekly stars and treasures. My next check is to watch a second adult join without my help and see whether they can pick up that evening’s routine.",
    links: [{ label: 'Open Winking Star', href: 'https://winkingstar.com/' }, { label: 'View on the App Store', href: 'https://apps.apple.com/app/id6765767262' }],
  },
  '/uoaui': {
    organisation: 'Independent project',
    period: '2026',
    role: 'Designer and developer',
    card: 'A design canvas for comparing the same screen across component libraries.',
    lead: 'I wanted to see how the same screen would work across different design systems before committing to one.',
    contribution: "I designed and built uoaui.ai to test a question that kept coming up when I worked with generated interfaces. A screen could look convincing in a design review, yet leave a developer with little idea which components to use. I wanted to take one brief through to a working screen and inspect the choices along the way.",
    decisions: [
      {
        title: "Giving the model a set of parts",
        paragraphs: [
          "I explored letting the model generate a layout freely. The harder part came afterwards, when I tried to connect what it had drawn to the components a team already maintained. I changed the builder so Claude works with a catalogue of block types and actions it can take on the canvas. That gives me a structure I can inspect and edit after the first draft.",
          "The component registry connects supported blocks to Salt, Material UI, Fluent and Carbon. The house system has its own styles. Components differ between those libraries. Where a mapping is missing, the renderer and React export use an explicit fallback. I would rather see where a design still needs work during comparison than discover it during handover.",
        ],
      },
      {
        title: "Comparing the same screen",
        paragraphs: [
          "A designer can start with a template or a brief, edit one card and view the same layout across five systems. Keeping the underlying screen fixed helps me judge a particular change. If a table suddenly dominates the page, I can compare the spacing, density and controls before deciding whether to edit the layout or choose a different system.",
          "I use Figma to establish the foundations and names that need to match the implementation. Once the screen exists in code, I can try the components at their actual sizes, tune the result and inspect what the developer will receive. The React export is available directly. Comparing and tuning are choices the designer can make on the way.",
        ],
      },
      {
        title: "What a developer can inspect",
        paragraphs: [
          "In the public Salt UI Kit, a designer can look at a form that brings together a name, email address, department selector and submit and cancel actions. That gives us a specific screen to discuss. We can review how the fields are grouped, which control receives emphasis and how the choices translate into code. A component displayed alone in a library answers only part of that question.",
          "The export options reflect what each format needs. React export reads the current canvas and generates its files directly. The Figma SVG export measures the rendered canvas, so it needs a preview first. I kept that extra step with the format that requires it. A designer who wants to inspect the React output after the first edit can get straight to the files.",
        ],
      },
    ],
    outcome: "The builder is in private alpha. The public comparison and Salt UI Kit let visitors inspect the systems, foundations, forms and chart examples. The question for the alpha is whether another designer can produce an inspectable screen without me guiding them. I have yet to measure that with external users.",
    links: [{ label: 'Explore uoaui.ai', href: 'https://uoaui.ai/' }, { label: 'View the Salt UI Kit', href: 'https://uoaui.ai/ui-kit?ds=salt' }],
  },
} as const;
