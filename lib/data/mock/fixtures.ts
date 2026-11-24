// Synthetic demo content. Every page reads this through `lib/data`, never directly.

import type {
  ConceptLink,
  RecallAnswer,
  Concept,
  LearningBlock,
  LearningSession,
  MemoryItem,
  RecallItem,
  ReviewRecord,
  Settings,
} from "../types";

const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?w=${w}&q=75&auto=format&fit=crop`;

export const blocks: LearningBlock[] = [
  {
    id: "octopus-arms",
    topic: "Biology",
    question: "How can an octopus think with its arms?",
    teaser:
      "Most of an octopus's neurons live in its arms, so each arm can taste, touch, and decide a little on its own.",
    body: [
      "Imagine running a kitchen where every chef has a mind of their own. You call out “dinner for eight”, and each one goes off to chop, stir, and taste without you checking every move. That is roughly how an octopus runs its body.",
      "An octopus has about 500 million neurons, close to a dog's count. But only around a third of them sit in its central brain. The other two-thirds are spread through its eight arms, in a chain of nerve clusters that runs past every single sucker.",
      "So when an arm slips into a crack in the reef, it does not wait for instructions. Its suckers taste the rock, feel for texture, and decide whether something there is worth grabbing. The arm is part hand, part tongue, and part tiny brain.",
      "Researchers have seen just how independent the arms are. When an arm's link to the central brain is cut, it can still reach toward food, grip it, and pass it along as if heading for a mouth that is no longer listening.",
      "It is not quite nine brains. Think of it as a head chef who sets the menu and eight capable sous-chefs who handle the details. That split lets an octopus explore eight places at once without overloading the boss.",
    ],
    minutes: 6,
    sources: [
      { title: "Octopus", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Octopus" },
      { title: "Cephalopod intelligence", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Cephalopod_intelligence" },
    ],
    image: {
      src: img("photo-1545671913-b89ac1b4ac10"),
      alt: "A red octopus spreading its arms over coral in an aquarium",
    },
    activity: {
      kind: "predict",
      title: "Predict the arm",
      prompt:
        "An arm's connection to the central brain is cut. A shrimp brushes against its suckers. What does the arm most likely do?",
      options: [
        { id: "a", label: "Nothing. Without the brain, the arm is limp." },
        { id: "b", label: "It grabs the shrimp and passes it inward." },
        { id: "c", label: "It changes colour but cannot move." },
      ],
      answerId: "b",
      reveal:
        "The arm's own nerve cords can sense the food and run the grab-and-pass reflex locally. The central brain usually coordinates, but it is not needed for every movement.",
    },
  },
  {
    id: "aurora-green",
    topic: "Physics",
    question: "Why do auroras glow mostly green?",
    teaser:
      "Oxygen high in the atmosphere releases a very specific green light when solar particles excite it.",
    body: [
      "Imagine the Sun as a stove that never switches off, constantly spitting a hiss of charged particles into space. That stream, the solar wind, crosses about 150 million kilometres and arrives at Earth a few days later.",
      "Most of it never reaches us. Earth's magnetic field acts like an invisible umbrella and deflects the wind around the planet. But near the poles, the field lines dip down into the atmosphere like funnels, and some particles slide in.",
      "Up there, between about 100 and 250 kilometres high, they crash into oxygen atoms. Each collision is like a push on a swing: the atom gets a burst of extra energy, holds it for a moment, and then lets it go as a flash of light.",
      "Oxygen at that height releases its energy at one very specific wavelength, 557.7 nanometres. Our eyes see that as a pale, glowing green, and because there is so much oxygen at that altitude, green dominates the show.",
      "Higher up, where the air is thinner, oxygen has time to give off a slower red glow before bumping into anything. Lower down, nitrogen adds blue and violet fringes. So an aurora is really a painted map of altitude and gas.",
    ],
    minutes: 4,
    sources: [
      { title: "Aurora", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Aurora" },
      { title: "Solar wind", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Solar_wind" },
      { title: "Airglow", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Airglow" },
    ],
    image: {
      src: img("photo-1531366936337-7c912a4589a7"),
      alt: "Green and violet aurora over a snowy landscape at night",
    },
    activity: {
      kind: "simulate",
      title: "Tune the altitude",
      prompt:
        "Move the altitude of the collision and watch which colour the atmosphere gives off.",
      param: { label: "Altitude", unit: "km", min: 80, max: 320, step: 10, initial: 150 },
      bands: [
        {
          upTo: 100,
          label: "Blue and violet fringe",
          detail: "Dense air: excited nitrogen molecules dominate and glow blue-violet.",
          swatch: "oklch(0.62 0.17 285)",
        },
        {
          upTo: 240,
          label: "Classic green",
          detail: "Atomic oxygen releases 557.7 nm green light before collisions steal its energy.",
          swatch: "oklch(0.8 0.2 150)",
        },
        {
          upTo: 320,
          label: "Faint red crown",
          detail: "Thin air lets oxygen wait long enough to emit its slower 630 nm red line.",
          swatch: "oklch(0.62 0.2 25)",
        },
      ],
    },
  },
  {
    id: "wood-wide-web",
    topic: "Biology",
    question: "Do trees really talk through fungi?",
    teaser:
      "Fungal networks link roots underground, but how much trees “share” is more debated than the headlines say.",
    body: [
      "Imagine walking through a forest and learning that the trees are holding hands underground. That is the picture behind the phrase “wood wide web”, and it is part true, part wishful thinking.",
      "Most plants team up with mycorrhizal fungi. The fungi wrap around roots or grow into them, then send out threads far finer than a hair that reach much more soil than roots can. They trade water and minerals for sugar the plant makes from sunlight. It is a market, not a gift.",
      "Because a single fungus can touch several trees at once, the network can link them. Some experiments found carbon moving from one seedling to another through those threads, and the idea of trees feeding their young and sending warnings took off.",
      "Recent reviews urge caution. In real forests, evidence that trees deliberately share food or raise alarms through fungi is thin. Much of what moves can be explained by the fungi acting in their own interest, like a courier choosing its own routes.",
      "So the connections are real, and the forest floor is busier than it looks. But it is less a friendly group chat and more a bustling economy where everyone, fungus included, is looking after itself.",
    ],
    minutes: 6,
    sources: [
      { title: "Mycorrhizal network", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mycorrhizal_network" },
      { title: "Mycorrhiza", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mycorrhiza" },
    ],
    image: {
      src: img("photo-1448375240586-882707db888b"),
      alt: "Sunlight filtering through a dense green forest",
    },
    activity: {
      kind: "predict",
      title: "Weigh the claim",
      prompt: "Which statement best matches current evidence about fungal networks?",
      options: [
        { id: "a", label: "Trees use fungi to send deliberate warnings." },
        { id: "b", label: "Fungi connect roots, but intent and scale are debated." },
        { id: "c", label: "Fungi never move nutrients between plants." },
      ],
      answerId: "b",
      reveal:
        "Connections are real and some transfer happens, but claims of cooperative messaging go further than field data supports.",
    },
  },
  {
    id: "parthenon-curves",
    topic: "History",
    question: "Why does the Parthenon have almost no straight lines?",
    teaser:
      "Its builders curved floors and swelled columns so the temple would look perfectly straight from below.",
    body: [
      "Imagine standing at the foot of the Acropolis in 432 BCE, looking up at a temple that seems perfectly straight. Every line looks ruled, every column looks true. Now imagine learning that almost none of it is.",
      "The Parthenon's platform rises gently toward the middle of each side, by about 11 centimetres along the long edges. Lay a marble on it and it would roll toward the corners. The columns lean slightly inward, and each one swells a little partway up, a trick called entasis.",
      "Why build it crooked? One long-standing explanation is that our eyes play tricks. A long, perfectly flat line seen from below can look like it sags in the middle, the way a long shelf seems to droop. Perfectly straight columns can look pinched at the waist.",
      "So the builders may have bent the building to cancel the illusions, the way a tailor cuts a suit slightly off so it looks straight on a real body. The curves are small enough to go unnoticed and large enough to change what you see.",
      "Other scholars add practical reasons, such as helping rainwater drain off the platform and giving the temple a lively, almost muscular stance. The builders likely had all of these goals at once.",
    ],
    minutes: 5,
    sources: [
      { title: "Parthenon", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Parthenon" },
      { title: "Entasis", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Entasis" },
    ],
    image: {
      src: img("photo-1503152394-c571994fd383"),
      alt: "The Parthenon on the Acropolis under a blue sky",
    },
    activity: {
      kind: "predict",
      title: "Spot the illusion",
      prompt: "If the Parthenon's long platform were perfectly flat, how might it look from the ground?",
      options: [
        { id: "a", label: "Perfectly flat" },
        { id: "b", label: "Sagging slightly in the middle" },
        { id: "c", label: "Bulging upward in the middle" },
      ],
      answerId: "b",
      reveal:
        "Long horizontal lines viewed from below can appear to dip. A slight upward curve is one way to make them read as straight.",
    },
  },
  {
    id: "bubble-nebula",
    topic: "Space",
    question: "What blows a bubble seven light-years wide?",
    teaser:
      "A massive young star pushes out a wind so fierce it inflates a shell in the surrounding gas.",
    body: [
      "Imagine blowing into a soapy wand, but your breath is a wind moving millions of kilometres per hour and the bubble ends up seven light-years across. That is, roughly, what is happening in the Bubble Nebula.",
      "It sits about 7,000 light-years away in the constellation Cassiopeia. At its heart is a young, hot star many times heavier than the Sun, the kind that burns fast and lives short.",
      "Stars like that do not just shine; they blow. Their light is so intense that it pushes gas off their surface, creating a stellar wind far fiercer than anything the Sun produces.",
      "Where that wind slams into the cooler gas floating around the star, it acts like a snowplough. Material piles up into a thin, expanding shell, and the bubble grows outward as the wind keeps pushing.",
      "We can only see the bubble because the star's ultraviolet light makes that shell's gas glow. It is the same physics as the solar wind that paints our auroras, just turned up to a cosmic, far more violent scale.",
    ],
    minutes: 5,
    sources: [
      { title: "Bubble Nebula", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Bubble_Nebula" },
      { title: "Stellar wind", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Stellar_wind" },
    ],
    image: {
      src: img("photo-1462331940025-496dfbfc7564"),
      alt: "The Bubble Nebula, a glowing blue shell of gas among stars",
    },
    activity: {
      kind: "order",
      title: "Build the bubble",
      prompt: "Put the steps that form the nebula in order, from first to last.",
      items: [
        { id: "star", label: "A massive star ignites" },
        { id: "wind", label: "It drives a fierce stellar wind" },
        { id: "sweep", label: "The wind sweeps gas into a shell" },
        { id: "glow", label: "Starlight makes the shell glow" },
      ],
      reveal:
        "The star comes first, its wind does the sweeping, and its ultraviolet light makes the swept-up shell visible.",
    },
  },
  {
    id: "honest-placebo",
    topic: "Psychology",
    question: "Can a placebo work even when you know it's fake?",
    teaser:
      "In some trials, people told they were taking sugar pills still reported feeling better.",
    body: [
      "Imagine your doctor handing you a bottle and saying, “These are sugar pills. There is nothing in them. Take two a day anyway.” It sounds like a joke. In some trials, it actually helped.",
      "A placebo is a treatment with no active ingredient. For decades, researchers assumed it only worked through a kind of trick: you had to believe it was real medicine.",
      "Open-label placebo studies tested that by being completely honest. Participants were told plainly that their pills were inert. In several small trials, people with conditions like irritable bowel syndrome still reported feeling better.",
      "One explanation is ritual and expectation. Think of how a cup of tea can feel calming before the warmth has done anything. Taking a pill, being cared for, and expecting relief can change how closely we notice our symptoms.",
      "The effects are mostly on how people feel rather than on the underlying disease, and the studies are still small. But they suggest that part of healing is the story our brain tells about what is happening.",
    ],
    minutes: 5,
    sources: [
      { title: "Placebo", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Placebo" },
    ],
    image: {
      src: img("photo-1584308666744-24d5c474f2ae"),
      alt: "Blister packs of white tablets on a pale blue surface",
    },
  },
  {
    id: "tardigrade-survival",
    topic: "Biology",
    question: "How does a tardigrade survive being dried out?",
    teaser:
      "It curls into a lifeless-looking husk, swaps water for protective molecules, and waits.",
    body: [
      "Imagine being able to pause your life. When things get bad, you curl up, switch everything off, and wait, for days, years, or longer, until the world is kind again. Tardigrades can do something very close to that.",
      "These animals are under a millimetre long, with eight stubby legs and a slow, bumbling walk that earned them the nickname water bears. They live almost everywhere: in moss, soil, and the deep ocean.",
      "When their home dries out, they pull in their legs and shrivel into a dry little barrel called a tun. Their metabolism drops to almost nothing. To a microscope, they look dead.",
      "Inside, special proteins step in where water used to be. They form a kind of glassy scaffold, like packing foam around fragile glassware, so cell membranes and DNA are held in place instead of tearing apart.",
      "Add water and many wake up within hours, unpack their legs, and wander off. Dried tardigrades have survived extreme cold, heavy radiation, and even a trip to open space.",
    ],
    minutes: 4,
    sources: [
      { title: "Tardigrade", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Tardigrade" },
      { title: "Cryptobiosis", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Cryptobiosis" },
    ],
    image: {
      src: img("photo-1576086213369-97a306d36557"),
      alt: "Glowing magenta and blue cells seen under a fluorescence microscope",
    },
  },
  {
    id: "deja-vu",
    topic: "Psychology",
    question: "What is your brain doing during déjà vu?",
    teaser:
      "That eerie “I've been here before” feeling may be your memory system checking its own work.",
    body: [
      "Imagine walking into a café you have never visited, and a voice in your head insists, “I have been here before.” You know it is new. It feels familiar anyway. That strange tug is déjà vu, and most people feel it at least once.",
      "Your memory has two quiet jobs. One recalls details: the name of the street, what you ordered last time. Another just whispers “this feels familiar” or “this is new”. Usually they agree.",
      "One leading idea is that déjà vu happens when the familiarity signal fires by mistake. Maybe the layout of the room echoes somewhere you have been, or the signal simply misfires for a moment.",
      "Then another part of your brain, the part that checks memory for errors, notices the mismatch. That is the eerie bit: you feel familiar and know you should not. Like a smoke alarm catching burnt toast, it may be a sign the system is working.",
      "Researchers can trigger similar feelings in the lab with word lists and virtual rooms, but there is still no single agreed explanation for déjà vu.",
    ],
    minutes: 4,
    sources: [{ title: "Déjà vu", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/D%C3%A9j%C3%A0_vu" }],
    image: {
      src: img("photo-1559757148-5c350d0d3c56"),
      alt: "An anatomical model of the human brain cut in half",
    },
  },
];

export const sessions: LearningSession[] = [
  {
    id: "octopus-arms",
    blockId: "octopus-arms",
    title: "How can an octopus think with its arms?",
    topics: ["Biology", "Neuroscience"],
    status: "active",
    whenLabel: "Paused 2 hours ago",
    period: "this-week",
    minutes: 12,
    messageCount: 14,
    image: { src: img("photo-1545671913-b89ac1b4ac10", 640), alt: "A red octopus over coral" },
    concepts: [
      { conceptId: "neurons", name: "Neuron counts", state: "discussed" },
      { conceptId: "distributed", name: "Distributed nervous system", state: "practiced" },
      { conceptId: "chromatophores", name: "Chromatophores", state: "next" },
    ],
    recapStatus: "none",
    transcript: [
      { id: "m1", role: "learner", via: "voice", text: "Is it true an octopus has nine brains?" },
      { id: "m2", role: "mira", via: "voice", text: "It's a fun way to put it, but not quite. There's one central brain, plus clusters of neurons along each arm. About two-thirds of all its neurons are in those arms." },
      { id: "m3", role: "learner", via: "voice", text: "So the arms can decide things?" },
      { id: "m4", role: "mira", via: "voice", text: "Small things, yes. An arm can taste and grab food without waiting for instructions. Want to try predicting what a disconnected arm does?" },
      { id: "m5", role: "learner", via: "text", text: "Yes, let's try it." },
    ],
    attempts: [
      { title: "Predict the arm", outcome: "solved", note: "Chose the grab-and-pass reflex on the first try." },
    ],
  },
  {
    id: "aurora",
    blockId: "aurora-green",
    title: "Why auroras glow green",
    topics: ["Physics", "Space"],
    status: "finished",
    whenLabel: "Yesterday",
    period: "this-week",
    minutes: 18,
    messageCount: 22,
    image: { src: img("photo-1531366936337-7c912a4589a7", 640), alt: "Green aurora over snow" },
    concepts: [
      { conceptId: "solar-wind", name: "Solar wind", state: "demonstrated" },
      { conceptId: "magnetosphere", name: "Magnetosphere", state: "practiced" },
      { conceptId: "auroral-emission", name: "Auroral emission", state: "demonstrated" },
    ],
    recapStatus: "ready",
    recap: {
      summary:
        "You traced an aurora from the Sun to the sky: charged particles in the solar wind, steered by Earth's magnetic field, excite oxygen and nitrogen high above the poles.",
      keyIdeas: [
        { title: "Colour follows altitude", text: "Green comes from oxygen at roughly 100–250 km; red from thinner oxygen higher up; blue-violet from nitrogen lower down." },
        { title: "The field is a funnel", text: "The magnetosphere guides particles toward the polar regions, which is why auroras form ovals around the poles." },
        { title: "Not reflected sunlight", text: "You started with this idea and replaced it: the light is emitted by excited atoms, not reflected." },
      ],
      openQuestions: [
        "Why are some auroras pulsing instead of steady?",
        "Do other planets have auroras with different colours?",
      ],
      nextSteps: [
        "Compare the solar wind with the stellar wind behind the Bubble Nebula.",
        "Review auroral emission in two days.",
      ],
      generatedLabel: "Written yesterday from 22 messages and 1 activity",
      version: 2,
    },
    transcript: [
      { id: "a1", role: "learner", via: "voice", text: "Are auroras just sunlight bouncing off ice?" },
      { id: "a2", role: "mira", via: "voice", text: "That's a common guess. They're actually atoms giving off their own light after being hit by particles from the Sun." },
      { id: "a3", role: "learner", via: "voice", text: "So why green and not white?" },
      { id: "a4", role: "mira", via: "voice", text: "Each gas emits specific colours. Oxygen at the right height produces a very precise green." },
    ],
    attempts: [
      { title: "Tune the altitude", outcome: "solved", note: "Matched all three colour bands to their heights." },
    ],
  },
  {
    id: "bubble",
    blockId: "bubble-nebula",
    title: "The Bubble Nebula",
    topics: ["Space"],
    status: "finished",
    whenLabel: "Thursday",
    period: "this-week",
    minutes: 9,
    messageCount: 11,
    image: { src: img("photo-1462331940025-496dfbfc7564", 640), alt: "The Bubble Nebula" },
    concepts: [
      { conceptId: "stellar-wind", name: "Stellar wind", state: "discussed" },
      { conceptId: "emission-nebula", name: "Emission nebula", state: "practiced" },
    ],
    recapStatus: "generating",
    transcript: [
      { id: "b1", role: "learner", via: "text", text: "How is a bubble that big possible?" },
      { id: "b2", role: "mira", via: "text", text: "The star at its centre blows a wind fast enough to push gas outward for light-years." },
    ],
    attempts: [
      { title: "Build the bubble", outcome: "retried", note: "Swapped the wind and glow steps, then corrected it." },
    ],
  },
  {
    id: "parthenon",
    blockId: "parthenon-curves",
    title: "The Parthenon's hidden curves",
    topics: ["History", "Architecture"],
    status: "finished",
    whenLabel: "Monday",
    period: "this-week",
    minutes: 14,
    messageCount: 16,
    image: { src: img("photo-1503152394-c571994fd383", 640), alt: "The Parthenon" },
    concepts: [
      { conceptId: "entasis", name: "Entasis", state: "demonstrated" },
      { conceptId: "optical-correction", name: "Optical correction", state: "discussed" },
    ],
    recapStatus: "ready",
    recap: {
      summary:
        "You explored why the Parthenon's builders curved almost every line, and weighed optical, practical, and aesthetic explanations.",
      keyIdeas: [
        { title: "Entasis", text: "Columns swell slightly partway up so they don't appear pinched." },
        { title: "Several goals at once", text: "Optical correction, drainage, and a livelier look are all proposed reasons." },
      ],
      openQuestions: ["Did other Greek temples use the same corrections?"],
      nextSteps: ["Review entasis on Friday."],
      generatedLabel: "Written Monday from 16 messages and 1 activity",
      version: 1,
    },
    transcript: [
      { id: "p1", role: "learner", via: "text", text: "Why would anyone build a crooked temple on purpose?" },
      { id: "p2", role: "mira", via: "text", text: "Because perfectly straight can look crooked from below. The curves may be there to fool your eye into seeing straight lines." },
    ],
    attempts: [
      { title: "Spot the illusion", outcome: "solved", note: "Predicted the sagging illusion correctly." },
    ],
  },
  {
    id: "fungi",
    blockId: "wood-wide-web",
    title: "Underground fungal networks",
    topics: ["Biology", "Ecology"],
    status: "finished",
    whenLabel: "Sunday",
    period: "this-week",
    minutes: 11,
    messageCount: 13,
    image: { src: img("photo-1448375240586-882707db888b", 640), alt: "A sunlit forest" },
    concepts: [
      { conceptId: "mycorrhiza", name: "Mycorrhizal networks", state: "practiced" },
    ],
    recapStatus: "failed",
    transcript: [
      { id: "f1", role: "learner", via: "voice", text: "Do trees actually feed their babies through fungi?" },
      { id: "f2", role: "mira", via: "voice", text: "Some studies suggest carbon can move between connected trees, but the idea of deliberate feeding is still debated." },
    ],
    attempts: [
      { title: "Weigh the claim", outcome: "solved", note: "Picked the evidence-based statement." },
    ],
  },
  {
    id: "placebo",
    blockId: "honest-placebo",
    title: "Placebos that don't hide",
    topics: ["Psychology", "Medicine"],
    status: "finished",
    whenLabel: "8 Nov",
    period: "earlier",
    minutes: 10,
    messageCount: 12,
    image: { src: img("photo-1584308666744-24d5c474f2ae", 640), alt: "Blister packs of tablets" },
    concepts: [
      { conceptId: "placebo", name: "Placebo effect", state: "demonstrated" },
      { conceptId: "expectation", name: "Expectation and perception", state: "discussed" },
    ],
    recapStatus: "ready",
    recap: {
      summary:
        "You looked at open-label placebo trials and how expectation can shape what we notice, without changing the underlying condition.",
      keyIdeas: [
        { title: "Open-label placebos", text: "Participants knew their pills were inert and some still reported feeling better." },
        { title: "Experience, not cure", text: "Effects mostly appear in self-reported symptoms." },
      ],
      openQuestions: ["How large were these trials?"],
      nextSteps: ["Connect expectation to how the brain predicts what it sees."],
      generatedLabel: "Written 8 Nov from 12 messages",
      version: 1,
    },
    transcript: [
      { id: "pl1", role: "learner", via: "text", text: "How can a fake pill work if you know it's fake?" },
      { id: "pl2", role: "mira", via: "text", text: "Researchers think the ritual of treatment and your expectations shape how you notice symptoms." },
    ],
    attempts: [],
  },
];

export const concepts: Concept[] = [
  { id: "neurons", label: "Neuron counts", topic: "Biology", state: "discussed", sessionIds: ["octopus-arms"], x: 120, y: 150, summary: "An octopus has about 500 million neurons, most of them outside its central brain." },
  { id: "distributed", label: "Distributed nervous system", topic: "Biology", state: "practiced", sessionIds: ["octopus-arms"], x: 260, y: 260, recent: true, summary: "Control spread across local nerve clusters, so parts of the body can act semi-independently." },
  { id: "mycorrhiza", label: "Mycorrhizal networks", topic: "Biology", state: "practiced", sessionIds: ["fungi"], x: 170, y: 440, summary: "Fungi that link plant roots, trading minerals and water for sugars." },
  { id: "solar-wind", label: "Solar wind", topic: "Space", state: "demonstrated", sessionIds: ["aurora"], x: 560, y: 150, summary: "A stream of charged particles flowing outward from the Sun." },
  { id: "magnetosphere", label: "Magnetosphere", topic: "Space", state: "practiced", sessionIds: ["aurora"], x: 720, y: 80, summary: "Earth's magnetic field, which deflects and funnels the solar wind." },
  { id: "auroral-emission", label: "Auroral emission", topic: "Physics", state: "demonstrated", sessionIds: ["aurora"], x: 800, y: 230, summary: "Light given off by excited oxygen and nitrogen in the upper atmosphere." },
  { id: "stellar-wind", label: "Stellar wind", topic: "Space", state: "discussed", sessionIds: ["bubble"], x: 560, y: 340, recent: true, summary: "Outflowing particles from any star; the Sun's version is the solar wind." },
  { id: "emission-nebula", label: "Emission nebula", topic: "Space", state: "practiced", sessionIds: ["bubble"], x: 760, y: 410, summary: "A cloud of gas that glows because a nearby hot star excites it." },
  { id: "entasis", label: "Entasis", topic: "History", state: "demonstrated", sessionIds: ["parthenon"], x: 880, y: 540, summary: "The slight swelling of a column partway up its height." },
  { id: "optical-correction", label: "Optical correction", topic: "History", state: "discussed", sessionIds: ["parthenon"], x: 640, y: 540, summary: "Shaping a building so it looks straight to the eye, even if it isn't." },
  { id: "expectation", label: "Expectation and perception", topic: "Psychology", state: "discussed", sessionIds: ["placebo"], x: 400, y: 500, summary: "What we expect to experience shapes what we notice and report." },
  { id: "placebo", label: "Placebo effect", topic: "Psychology", state: "demonstrated", sessionIds: ["placebo"], x: 330, y: 380, summary: "Improvement after an inert treatment, driven by context and expectation." },
];

export const conceptLinks: ConceptLink[] = [
  { from: "neurons", to: "distributed", kind: "session", rationale: "Discussed together in the octopus session." },
  { from: "solar-wind", to: "magnetosphere", kind: "session", rationale: "Discussed together in the aurora session." },
  { from: "magnetosphere", to: "auroral-emission", kind: "session", rationale: "Discussed together in the aurora session." },
  { from: "stellar-wind", to: "emission-nebula", kind: "session", rationale: "Discussed together in the Bubble Nebula session." },
  { from: "entasis", to: "optical-correction", kind: "session", rationale: "Discussed together in the Parthenon session." },
  { from: "placebo", to: "expectation", kind: "session", rationale: "Discussed together in the placebo session." },
  { from: "solar-wind", to: "stellar-wind", kind: "semantic", similarity: 0.91, rationale: "Both describe particles streaming away from a star; the solar wind is the Sun's stellar wind." },
  { from: "auroral-emission", to: "emission-nebula", kind: "semantic", similarity: 0.84, rationale: "In both, energised gas releases light at characteristic colours." },
  { from: "distributed", to: "mycorrhiza", kind: "semantic", similarity: 0.71, rationale: "Both are decentralised networks that spread signals without a single controller." },
  { from: "optical-correction", to: "expectation", kind: "semantic", similarity: 0.74, rationale: "Both concern how the brain's assumptions shape what we perceive." },
];

/** Fixtures keep the answer inline; the mock source moves it under `answer`. */
export const recallQueue: (Omit<RecallItem, "answer"> & RecallAnswer)[] = [
  {
    id: "r1",
    conceptId: "distributed",
    concept: "Distributed nervous system",
    sessionId: "octopus-arms",
    sessionTitle: "How can an octopus think with its arms?",
    question: "Roughly what share of an octopus's neurons sit in its arms rather than its central brain?",
    options: [
      { id: "a", label: "About a tenth" },
      { id: "b", label: "About a third" },
      { id: "c", label: "About two-thirds" },
      { id: "d", label: "Nearly all of them" },
    ],
    correctId: "c",
    explanation:
      "Around two-thirds of an octopus's roughly 500 million neurons are in its arms, which is why each arm can sense and react with surprising independence.",
  },
  {
    id: "r2",
    conceptId: "auroral-emission",
    concept: "Auroral emission",
    sessionId: "aurora",
    sessionTitle: "Why auroras glow green",
    question: "Which gas produces the common green light of an aurora?",
    options: [
      { id: "a", label: "Nitrogen" },
      { id: "b", label: "Oxygen" },
      { id: "c", label: "Hydrogen" },
      { id: "d", label: "Neon" },
    ],
    correctId: "b",
    explanation:
      "Excited atomic oxygen at roughly 100–250 km emits green light at 557.7 nm. Nitrogen adds the blue and violet edges lower down.",
  },
  {
    id: "r3",
    conceptId: "entasis",
    concept: "Entasis",
    sessionId: "parthenon",
    sessionTitle: "The Parthenon's hidden curves",
    question: "What is entasis?",
    options: [
      { id: "a", label: "A column's slight swelling partway up" },
      { id: "b", label: "The triangular gable above the columns" },
      { id: "c", label: "Painting marble to look older" },
      { id: "d", label: "Spacing columns unevenly" },
    ],
    correctId: "a",
    explanation:
      "Entasis is a gentle convex curve in a column's profile, often explained as a correction so the column doesn't look pinched.",
  },
];

export const reviewHistory: ReviewRecord[] = [
  { id: "h1", concept: "Solar wind", outcome: "recalled", whenLabel: "Yesterday", nextLabel: "In 6 days" },
  { id: "h2", concept: "Placebo effect", outcome: "recalled", whenLabel: "Tuesday", nextLabel: "In 9 days" },
  { id: "h3", concept: "Mycorrhizal networks", outcome: "missed", whenLabel: "Monday", nextLabel: "Tomorrow" },
  { id: "h4", concept: "Magnetosphere", outcome: "recalled", whenLabel: "Monday", nextLabel: "In 4 days" },
];

export const memory: MemoryItem[] = [
  { id: "mem1", kind: "interest", text: "Space and the physics of light", evidence: "Chosen at sign-up and explored in 2 sessions" },
  { id: "mem2", kind: "interest", text: "How animal minds work", evidence: "Explored in the octopus session" },
  { id: "mem3", kind: "misconception", text: "Thought auroras were reflected sunlight", evidence: "Corrected during “Why auroras glow green”" },
  { id: "mem4", kind: "preference", text: "Likes an analogy before the numbers", evidence: "You asked for this in 3 sessions" },
];

export const savedBlockIds: { blockId: string; savedLabel: string }[] = [
  { blockId: "tardigrade-survival", savedLabel: "Saved today" },
  { blockId: "deja-vu", savedLabel: "Saved yesterday" },
  { blockId: "bubble-nebula", savedLabel: "Saved Thursday" },
  { blockId: "honest-placebo", savedLabel: "Saved 8 Nov" },
];

export const settings: Settings = {
  interests: [
    { topic: "Space", selected: true },
    { topic: "Biology", selected: true },
    { topic: "History", selected: true },
    { topic: "Physics", selected: false },
    { topic: "Psychology", selected: true },
  ],
  voice: {
    voiceId: "warm",
    voices: [
      { id: "warm", label: "Warm", detail: "Gentle and unhurried" },
      { id: "bright", label: "Bright", detail: "Lively and upbeat" },
      { id: "calm", label: "Calm", detail: "Low and steady" },
    ],
    pace: "natural",
    interruptible: true,
  },
  privacy: {
    keepTranscripts: true,
    rememberMisconceptions: true,
    personalizeDiscover: true,
  },
};
