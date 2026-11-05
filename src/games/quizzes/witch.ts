import type { Answer, Quiz } from "./quiz";

/**
 * What type of witch are you? Sixteen kinds of witch and thirty-two questions of
 * six answers. Each answer gives 2 points to the witch it describes best, and
 * most give 1 to another it leans towards. Every witch is worth 35 points over
 * all the answers and never twice in one question, so each has the same
 * chance and can come out on top.
 */
const answer = (
  en: string,
  fr: string,
  points: Record<string, number>
): Answer => ({ points, text: { en, fr } });

export const WITCH_QUIZ: Quiz = {
  blurb: {
    en: "Thirty-two questions, sixteen kinds of witch. Find out which one you are, and how much of the others.",
    fr: "Trente-deux questions, seize types de sorcière. Découvrez lequel est le vôtre, et ce que vous avez des autres.",
  },
  legend: "which-witch.txt",
  questions: [
    {
      answers: [
        answer(
          "Planting seasonal flowers in the garden",
          "Planter des fleurs de saison au jardin",
          { fairy: 1, green: 2 }
        ),
        answer(
          "Baking a scrumptious fruit bread in the house",
          "Faire un délicieux pain aux fruits à la maison",
          { cottage: 1, kitchen: 2 }
        ),
        answer(
          "Collecting pearly shells by the beach",
          "Ramasser de jolis coquillages sur la plage",
          { sea: 2, storm: 1 }
        ),
        answer(
          "Fixing an old radio in the shed",
          "Réparer une vieille radio dans l’atelier",
          { eclectic: 1, tech: 2 }
        ),
        answer("Reading a dreamy novel in bed", "Lire un roman rêveur au lit", {
          moon: 2,
        }),
        answer(
          "Walking a happy dog in the park",
          "Promener un chien joyeux au parc",
          { hedge: 1, love: 2 }
        ),
      ],
      prompt: {
        en: "Your ideal Saturday morning?",
        fr: "Votre samedi matin idéal ?",
      },
    },
    {
      answers: [
        answer(
          "A thunderstorm: beautiful and dangerous at once",
          "Un orage : beau et dangereux à la fois",
          { grey: 1, storm: 2 }
        ),
        answer(
          "A misty morning in the woods",
          "Un matin de brume dans les bois",
          { fairy: 1, hedge: 2 }
        ),
        answer(
          "A cold, clear night under a full moon",
          "Une nuit claire et froide sous la pleine lune",
          { cosmic: 1, moon: 2 }
        ),
        answer(
          "A rainy afternoon under a warm blanket",
          "Un après-midi pluvieux sous un plaid bien chaud",
          { cottage: 2, love: 1 }
        ),
        answer(
          "Fresh snow glittering in the sun",
          "De la neige fraîche qui scintille au soleil",
          { crystal: 2, sea: 1 }
        ),
        answer(
          "A warm, sunny day in the meadow",
          "Une chaude journée de soleil dans les prés",
          { eclectic: 1, fire: 2 }
        ),
      ],
      prompt: {
        en: "Your favourite weather?",
        fr: "Votre temps préféré ?",
      },
    },
    {
      answers: [
        answer(
          "A steaming mug of chamomile from the garden",
          "Une tasse fumante de camomille du jardin",
          { green: 2 }
        ),
        answer(
          "A salty sea-breeze cocktail on the beach",
          "Un cocktail salé à la brise marine sur la plage",
          { sea: 2, storm: 1 }
        ),
        answer(
          "A cold glass of moon water from the windowsill",
          "Un verre frais d’eau de lune du rebord de la fenêtre",
          { crystal: 1, moon: 2 }
        ),
        answer(
          "A fizzy lemonade that sparkles like stardust",
          "Une limonade pétillante qui scintille comme de la poussière d’étoiles",
          { cosmic: 2, fairy: 1 }
        ),
        answer(
          "A strong black coffee with no sugar",
          "Un café noir bien serré, sans sucre",
          { grey: 2 }
        ),
        answer(
          "A strange potion nobody can name",
          "Une potion étrange que personne ne sait nommer",
          { chaos: 1, eclectic: 2 }
        ),
      ],
      prompt: {
        en: "Pick a drink.",
        fr: "Choisissez une boisson.",
      },
    },
    {
      answers: [
        answer(
          "A wild, windy autumn with storms rolling in",
          "Un automne sauvage et venteux, plein d’orages",
          { hedge: 1, storm: 2 }
        ),
        answer(
          "A fresh, blooming spring in the garden",
          "Un printemps frais et fleuri au jardin",
          { green: 2, kitchen: 1 }
        ),
        answer(
          "A hot, golden summer under a blazing sun",
          "Un été chaud et doré sous un soleil de plomb",
          { eclectic: 1, fire: 2 }
        ),
        answer(
          "A snowy winter by a warm stove",
          "Un hiver enneigé près d’un poêle bien chaud",
          { cottage: 2, crystal: 1 }
        ),
        answer(
          "The quiet days between two seasons",
          "Les jours calmes entre deux saisons",
          { grey: 2, moon: 1 }
        ),
        answer(
          "Long summer evenings by a warm sea",
          "De longues soirées d’été au bord d’une mer tiède",
          { fairy: 1, sea: 2 }
        ),
      ],
      prompt: {
        en: "Your favourite season?",
        fr: "Votre saison préférée ?",
      },
    },
    {
      answers: [
        answer(
          "A warm cinnamon bun fresh from the oven",
          "Une brioche à la cannelle tout juste sortie du four",
          { fire: 1, kitchen: 2 }
        ),
        answer(
          "Sweet wild berries from the bushes",
          "Des baies sauvages et sucrées cueillies dans les buissons",
          { fairy: 2, hedge: 1 }
        ),
        answer(
          "Chocolate-dipped strawberries for two",
          "Des fraises enrobées de chocolat pour deux",
          { crystal: 1, love: 2 }
        ),
        answer("Salty chips by the harbour", "Des frites salées sur le port", {
          eclectic: 1,
          sea: 2,
        }),
        answer(
          "A strange mix of whatever’s in the fridge",
          "Un drôle de mélange de ce qu’il y a dans le frigo",
          { chaos: 2, tech: 1 }
        ),
        answer(
          "Crunchy carrots straight from the garden",
          "Des carottes croquantes tout droit du potager",
          { green: 2, grey: 1 }
        ),
      ],
      prompt: {
        en: "Your favourite snack?",
        fr: "Votre en-cas préféré ?",
      },
    },
    {
      answers: [
        answer(
          "A soft silver grey, like morning mist",
          "Un gris argenté et doux, comme la brume du matin",
          { grey: 2, storm: 1 }
        ),
        answer(
          "A rosy pink, like a first blush",
          "Un rose tendre, comme une première rougeur",
          { cottage: 1, love: 2 }
        ),
        answer(
          "A deep midnight blue, scattered with stars",
          "Un bleu nuit profond, semé d’étoiles",
          { cosmic: 2, tech: 1 }
        ),
        answer(
          "A pale sea-glass green, like the shallows",
          "Un vert d’eau pâle, comme les hauts-fonds",
          { fairy: 1, sea: 2 }
        ),
        answer(
          "Every colour at once, splashed everywhere",
          "Toutes les couleurs à la fois, éclaboussées partout",
          { chaos: 2, fire: 1 }
        ),
        answer(
          "A shimmering violet, like amethyst",
          "Un violet chatoyant, comme l’améthyste",
          { crystal: 2, moon: 1 }
        ),
      ],
      prompt: {
        en: "Pick a colour.",
        fr: "Choisissez une couleur.",
      },
    },
    {
      answers: [
        answer(
          "A wild daisy from the meadow",
          "Une marguerite sauvage des prés",
          { cottage: 1, green: 2 }
        ),
        answer(
          "A deep red rose in a glass vase",
          "Une rose rouge foncé dans un vase en verre",
          { crystal: 1, love: 2 }
        ),
        answer(
          "A white moonflower that opens at night",
          "Une fleur de lune blanche qui s’ouvre la nuit",
          { moon: 2, sea: 1 }
        ),
        answer(
          "A sprig of hawthorn from the hedgerow",
          "Un brin d’aubépine cueilli dans la haie",
          { hedge: 2, kitchen: 1 }
        ),
        answer(
          "A bluebell from an enchanted wood",
          "Une jacinthe d’une forêt enchantée",
          { cosmic: 1, fairy: 2 }
        ),
        answer(
          "A bright sunflower turning to the sun",
          "Un tournesol éclatant tourné vers le soleil",
          { eclectic: 1, fire: 2 }
        ),
      ],
      prompt: {
        en: "Pick a flower.",
        fr: "Choisissez une fleur.",
      },
    },
    {
      answers: [
        answer(
          "Brewing an old herbal remedy on the stove",
          "Préparer un vieux remède aux herbes sur le feu",
          { hedge: 2, kitchen: 1 }
        ),
        answer(
          "Running outside to dance in the downpour",
          "Courir dehors danser sous l’averse",
          { chaos: 1, storm: 2 }
        ),
        answer(
          "Looking for fairy rings in the wet grass",
          "Chercher des ronds de fées dans l’herbe mouillée",
          { fairy: 2, moon: 1 }
        ),
        answer(
          "Mending a leaky umbrella in the porch",
          "Réparer un parapluie qui fuit sous le porche",
          { cottage: 1, tech: 2 }
        ),
        answer(
          "Lighting the wood stove for someone you love",
          "Allumer le poêle pour quelqu’un que vous aimez",
          { fire: 2, love: 1 }
        ),
        answer(
          "Starting three new hobbies at once",
          "Commencer trois nouveaux passe-temps à la fois",
          { cosmic: 1, eclectic: 2 }
        ),
      ],
      prompt: {
        en: "What do you do on a rainy day?",
        fr: "Que faites-vous un jour de pluie ?",
      },
    },
    {
      answers: [
        answer(
          "Writing last night’s dreams in a journal",
          "Noter les rêves de la nuit dans un carnet",
          { fairy: 1, moon: 2 }
        ),
        answer(
          "Lighting a little candle on the kitchen table",
          "Allumer une petite bougie sur la table de la cuisine",
          { fire: 2, love: 1 }
        ),
        answer(
          "Watering thirsty plants on the windowsill",
          "Arroser les plantes assoiffées sur le rebord de la fenêtre",
          { cottage: 1, green: 2 }
        ),
        answer(
          "Reading your daily horoscope over breakfast",
          "Lire votre horoscope du jour au petit-déjeuner",
          { cosmic: 2, kitchen: 1 }
        ),
        answer(
          "Fixing the squeaky coffee machine in the kitchen",
          "Réparer la machine à café qui grince dans la cuisine",
          { eclectic: 1, tech: 2 }
        ),
        answer(
          "Hitting snooze five times in a warm bed",
          "Repousser le réveil cinq fois dans un lit bien chaud",
          { chaos: 2, storm: 1 }
        ),
      ],
      prompt: {
        en: "How do you start your day?",
        fr: "Comment commencez-vous la journée ?",
      },
    },
    {
      answers: [
        answer(
          "A homemade biscuit wrapped for later",
          "Un biscuit maison emballé pour plus tard",
          { kitchen: 2 }
        ),
        answer(
          "A lucky acorn from the woods",
          "Un gland porte-bonheur ramassé dans les bois",
          { hedge: 2 }
        ),
        answer(
          "A battered box of matches and a candle stub",
          "Une vieille boîte d’allumettes et un bout de bougie",
          { fire: 2, grey: 1 }
        ),
        answer(
          "A tiny screwdriver set for emergencies",
          "Un petit jeu de tournevis pour les urgences",
          { chaos: 1, tech: 2 }
        ),
        answer(
          "A white feather caught in the wind",
          "Une plume blanche emportée par le vent",
          { fairy: 1, storm: 2 }
        ),
        answer(
          "A messy jumble of everything and nothing",
          "Un fouillis de tout et de rien",
          { eclectic: 2 }
        ),
      ],
      prompt: {
        en: "What’s in your bag?",
        fr: "Qu’y a-t-il dans votre sac ?",
      },
    },
    {
      answers: [
        answer(
          "A battered book of old folk tales",
          "Un vieux livre de contes populaires tout abîmé",
          { hedge: 2, moon: 1 }
        ),
        answer(
          "A stained cookbook full of handwritten notes",
          "Un livre de cuisine taché, plein de notes manuscrites",
          { green: 1, kitchen: 2 }
        ),
        answer(
          "A thick atlas of the night sky",
          "Un épais atlas du ciel nocturne",
          { cosmic: 2, storm: 1 }
        ),
        answer(
          "A dog-eared romance novel",
          "Un roman d’amour aux pages cornées",
          { fire: 1, love: 2 }
        ),
        answer(
          "A dusty grimoire of light and dark magic",
          "Un grimoire poussiéreux de magie blanche et noire",
          { crystal: 1, grey: 2 }
        ),
        answer(
          "A greasy repair manual for old machines",
          "Un manuel de réparation graisseux pour vieilles machines",
          { chaos: 1, tech: 2 }
        ),
      ],
      prompt: {
        en: "Pick a book.",
        fr: "Choisissez un livre.",
      },
    },
    {
      answers: [
        answer(
          "A chunky quartz ring on your thumb",
          "Une grosse bague en quartz au pouce",
          { crystal: 2, grey: 1 }
        ),
        answer(
          "A silver crescent pendant on a fine chain",
          "Un pendentif croissant de lune en argent sur une fine chaîne",
          { moon: 2, sea: 1 }
        ),
        answer(
          "A heart-shaped locket with a photo inside",
          "Un médaillon en forme de cœur avec une photo à l’intérieur",
          { cottage: 1, love: 2 }
        ),
        answer(
          "A tiny watch you rebuilt yourself",
          "Une petite montre que vous avez remontée vous-même",
          { cosmic: 1, tech: 2 }
        ),
        answer(
          "A stack of mismatched bracelets from everywhere",
          "Une pile de bracelets dépareillés venus de partout",
          { eclectic: 2, storm: 1 }
        ),
        answer(
          "A dainty crown of fresh flowers",
          "Une délicate couronne de fleurs fraîches",
          { fairy: 2, green: 1 }
        ),
      ],
      prompt: {
        en: "Pick a piece of jewellery.",
        fr: "Choisissez un bijou.",
      },
    },
    {
      answers: [
        answer(
          "A thatched cottage with roses round the door",
          "Une chaumière avec des roses autour de la porte",
          { cottage: 2, green: 1 }
        ),
        answer(
          "A wooden cabin on stilts above the sea",
          "Une cabane en bois sur pilotis au-dessus de la mer",
          { cosmic: 1, sea: 2 }
        ),
        answer(
          "A secret treehouse high in the branches",
          "Une cabane secrète perchée dans les branches",
          { fairy: 2, tech: 1 }
        ),
        answer(
          "A tall stone tower on a windswept cliff",
          "Une haute tour de pierre sur une falaise battue par les vents",
          { grey: 1, storm: 2 }
        ),
        answer(
          "A colourful houseboat full of odd finds",
          "Une péniche colorée pleine de trouvailles insolites",
          { chaos: 1, eclectic: 2 }
        ),
        answer(
          "A little hut at the edge of the woods",
          "Une petite hutte à l’orée des bois",
          { hedge: 2, kitchen: 1 }
        ),
      ],
      prompt: {
        en: "Your dream house?",
        fr: "La maison de vos rêves ?",
      },
    },
    {
      answers: [
        answer(
          "By a crackling fire in the living room",
          "Près d’un feu qui crépite dans le salon",
          { cottage: 2, fire: 1 }
        ),
        answer(
          "In a lonely lighthouse above the waves",
          "Dans un phare solitaire au-dessus des vagues",
          { moon: 1, sea: 2 }
        ),
        answer(
          "In a quiet observatory under the stars",
          "Dans un observatoire paisible sous les étoiles",
          { cosmic: 2, tech: 1 }
        ),
        answer(
          "In a mossy clearing where fairies dance",
          "Dans une clairière moussue où dansent les fées",
          { fairy: 2, green: 1 }
        ),
        answer(
          "In a glittering cave full of crystals",
          "Dans une grotte scintillante pleine de cristaux",
          { crystal: 2, grey: 1 }
        ),
        answer(
          "In a crooked house where nothing matches",
          "Dans une maison biscornue où rien n’est assorti",
          { chaos: 2, eclectic: 1 }
        ),
      ],
      prompt: {
        en: "Where do you feel most at home?",
        fr: "Où vous sentez-vous le plus chez vous ?",
      },
    },
    {
      answers: [
        answer(
          "Renting a cosy cottage in the countryside",
          "Louer un cottage douillet à la campagne",
          { cottage: 2, green: 1 }
        ),
        answer(
          "Sailing a little boat around the islands",
          "Naviguer sur un petit bateau autour des îles",
          { sea: 2, storm: 1 }
        ),
        answer(
          "Chasing the northern lights in Iceland",
          "Chasser les aurores boréales en Islande",
          { cosmic: 2, crystal: 1 }
        ),
        answer(
          "Cooking fresh pasta with your love in Italy",
          "Cuisiner des pâtes fraîches avec votre amour en Italie",
          { kitchen: 1, love: 2 }
        ),
        answer(
          "Watching glowing volcanoes in Hawaii",
          "Admirer des volcans incandescents à Hawaï",
          { chaos: 1, fire: 2 }
        ),
        answer(
          "Camping by a moonlit lake in Finland",
          "Camper au bord d’un lac au clair de lune en Finlande",
          { grey: 1, moon: 2 }
        ),
      ],
      prompt: {
        en: "Your dream holiday?",
        fr: "Vos vacances de rêve ?",
      },
    },
    {
      answers: [
        answer(
          "Knitting a warm scarf by the fire",
          "Tricoter une écharpe bien chaude au coin du feu",
          { cottage: 2 }
        ),
        answer(
          "Telling spooky stories around a campfire",
          "Raconter des histoires qui font peur autour d’un feu de camp",
          { hedge: 2 }
        ),
        answer(
          "Hosting a cosy dinner for your friends",
          "Organiser un dîner douillet pour vos amis",
          { kitchen: 1, love: 2 }
        ),
        answer(
          "Arranging shiny crystals on the windowsill",
          "Disposer de jolis cristaux sur le rebord de la fenêtre",
          { crystal: 2 }
        ),
        answer(
          "Leaving sweet honey out for the fairies",
          "Laisser du miel doux pour les fées",
          { fairy: 2, green: 1 }
        ),
        answer(
          "Building a clockwork toy at the kitchen table",
          "Construire un jouet mécanique sur la table de la cuisine",
          { chaos: 1, tech: 2 }
        ),
      ],
      prompt: {
        en: "Your ideal evening?",
        fr: "Votre soirée idéale ?",
      },
    },
    {
      answers: [
        answer(
          "Rolling thunder in the distance",
          "Le tonnerre qui gronde au loin",
          { chaos: 1, storm: 2 }
        ),
        answer(
          "Big waves crashing on the rocks",
          "De grosses vagues qui se brisent sur les rochers",
          { crystal: 1, sea: 2 }
        ),
        answer(
          "A crackling fire on a cold night",
          "Un feu qui crépite par une nuit froide",
          { fire: 2, love: 1 }
        ),
        answer(
          "A kettle whistling in the kitchen",
          "Une bouilloire qui siffle dans la cuisine",
          { cottage: 2, tech: 1 }
        ),
        answer(
          "Sweet birdsong in the garden at dawn",
          "Un doux chant d’oiseaux au jardin à l’aube",
          { green: 2, hedge: 1 }
        ),
        answer(
          "Deep silence in a sleeping house",
          "Un silence profond dans une maison endormie",
          { cosmic: 1, grey: 2 }
        ),
      ],
      prompt: {
        en: "Your favourite sound?",
        fr: "Votre son préféré ?",
      },
    },
    {
      answers: [
        answer(
          "Smoky cedarwood that crackles as it burns",
          "Du cèdre fumé qui crépite en brûlant",
          { fire: 2, storm: 1 }
        ),
        answer(
          "Sweet vanilla with a hint of rose",
          "Une douce vanille avec une touche de rose",
          { crystal: 1, love: 2 }
        ),
        answer(
          "Fresh pine from a snowy forest",
          "Du pin frais d’une forêt enneigée",
          { fairy: 1, green: 2 }
        ),
        answer(
          "Warm apple pie with cinnamon",
          "Une tarte aux pommes tiède à la cannelle",
          { eclectic: 1, kitchen: 2 }
        ),
        answer(
          "Soft jasmine that blooms at night",
          "Un jasmin doux qui fleurit la nuit",
          { moon: 2, sea: 1 }
        ),
        answer(
          "Ancient frankincense from faraway lands",
          "Un encens ancien venu de terres lointaines",
          { cosmic: 2, grey: 1 }
        ),
      ],
      prompt: {
        en: "Pick a candle scent.",
        fr: "Choisissez un parfum de bougie.",
      },
    },
    {
      answers: [
        answer(
          "A sparkling amethyst that glows by moonlight",
          "Une améthyste étincelante qui brille au clair de lune",
          { crystal: 2, moon: 1 }
        ),
        answer(
          "A beeswax candle carved with runes",
          "Une bougie en cire d’abeille gravée de runes",
          { fire: 2, hedge: 1 }
        ),
        answer(
          "A hand-drawn birth chart in a golden frame",
          "Un thème astral dessiné à la main, dans un cadre doré",
          { cosmic: 2, love: 1 }
        ),
        answer(
          "A dusty jar of odds and ends from your travels",
          "Un vieux bocal de bric-à-brac rapporté de vos voyages",
          { chaos: 1, eclectic: 2 }
        ),
        answer(
          "A glass jar of rainwater from the last storm",
          "Un bocal en verre d’eau de pluie du dernier orage",
          { grey: 1, storm: 2 }
        ),
        answer(
          "A fresh bundle of thyme from the garden",
          "Un bouquet de thym frais du jardin",
          { green: 1, kitchen: 2 }
        ),
      ],
      prompt: {
        en: "What would you keep on your altar?",
        fr: "Que garderiez-vous sur votre autel ?",
      },
    },
    {
      answers: [
        answer(
          "A stone mortar and pestle for crushing herbs",
          "Un mortier en pierre pour piler les herbes",
          { green: 1, kitchen: 2 }
        ),
        answer(
          "A quartz pendulum on a silver chain",
          "Un pendule de quartz sur une chaîne d’argent",
          { crystal: 2, grey: 1 }
        ),
        answer(
          "A rusty toolbox full of odd screws",
          "Une vieille boîte à outils pleine de vis dépareillées",
          { chaos: 1, tech: 2 }
        ),
        answer(
          "A silver bowl of water for scrying",
          "Un bol d’argent rempli d’eau pour la divination",
          { moon: 2, sea: 1 }
        ),
        answer(
          "An old broom to sweep out bad luck",
          "Un vieux balai pour chasser la malchance",
          { cottage: 2, hedge: 1 }
        ),
        answer(
          "A brass telescope on the windowsill",
          "Un télescope en laiton sur le rebord de la fenêtre",
          { cosmic: 2 }
        ),
      ],
      prompt: {
        en: "Pick a tool.",
        fr: "Choisissez un outil.",
      },
    },
    {
      answers: [
        answer(
          "A blooming charm for the garden",
          "Un charme fleuri pour le jardin",
          { green: 2, kitchen: 1 }
        ),
        answer(
          "A sweet love spell sealed with red wax",
          "Un doux sort d’amour scellé à la cire rouge",
          { fire: 1, love: 2 }
        ),
        answer(
          "A brand-new spell of your own invention",
          "Un tout nouveau sort de votre invention",
          { chaos: 2, eclectic: 1 }
        ),
        answer(
          "A gentle mending charm for broken things",
          "Un doux charme de réparation pour les choses cassées",
          { grey: 1, tech: 2 }
        ),
        answer(
          "A wild weather spell to call up a storm",
          "Un sort sauvage pour déclencher une tempête",
          { storm: 2 }
        ),
        answer(
          "A secret spell to talk to the animals",
          "Un sort secret pour parler aux animaux",
          { hedge: 2 }
        ),
      ],
      prompt: {
        en: "The first spell you’d learn?",
        fr: "Le premier sort que vous apprendriez ?",
      },
    },
    {
      answers: [
        answer(
          "Under a loose floorboard in the hallway",
          "Sous une latte disjointe du couloir",
          { cottage: 2, grey: 1 }
        ),
        answer(
          "In a different messy pile every week",
          "Dans une pile en désordre, différente chaque semaine",
          { chaos: 2, storm: 1 }
        ),
        answer(
          "In a waterproof chest buried on the beach",
          "Dans un coffre étanche enterré sur la plage",
          { moon: 1, sea: 2 }
        ),
        answer(
          "In the hollow of an old oak tree",
          "Dans le creux d’un vieux chêne",
          { fairy: 2, hedge: 1 }
        ),
        answer(
          "Behind a secret panel you built yourself",
          "Derrière un panneau secret que vous avez construit",
          { cosmic: 1, tech: 2 }
        ),
        answer(
          "Tucked between the recipe books in the kitchen",
          "Glissé entre les livres de recettes dans la cuisine",
          { green: 1, kitchen: 2 }
        ),
      ],
      prompt: {
        en: "Where do you hide your spellbook?",
        fr: "Où cachez-vous votre grimoire ?",
      },
    },
    {
      answers: [
        answer(
          "A warty toad from the garden pond",
          "Un crapaud verruqueux de la mare du jardin",
          { green: 2, hedge: 1 }
        ),
        answer(
          "A black cat who judges everyone",
          "Un chat noir qui juge tout le monde",
          { fire: 1, grey: 2 }
        ),
        answer(
          "A clever raven who steals shiny things",
          "Un corbeau malin qui vole tout ce qui brille",
          { chaos: 1, storm: 2 }
        ),
        answer(
          "A pale moth drawn to the moonlight",
          "Un papillon de nuit pâle attiré par la lune",
          { fairy: 2, moon: 1 }
        ),
        answer(
          "A clockwork owl you built yourself",
          "Une chouette mécanique de votre fabrication",
          { cosmic: 1, tech: 2 }
        ),
        answer(
          "A grey seal who visits at high tide",
          "Un phoque gris qui vient à marée haute",
          { sea: 2 }
        ),
      ],
      prompt: {
        en: "Your familiar is…",
        fr: "Votre familier, c’est…",
      },
    },
    {
      answers: [
        answer(
          "Smooth sea glass from the shore",
          "Du verre de mer poli ramassé sur le rivage",
          { fairy: 1, sea: 2 }
        ),
        answer(
          "Old remedies in faded ink",
          "De vieux remèdes à l’encre pâlie",
          { cottage: 1, hedge: 2 }
        ),
        answer(
          "Curious bits and bobs from everywhere",
          "De curieux bibelots venus de partout",
          { eclectic: 2, tech: 1 }
        ),
        answer(
          "Little rose quartz hearts in every size",
          "De petits cœurs en quartz rose de toutes les tailles",
          { crystal: 2, love: 1 }
        ),
        answer(
          "Homemade jam in the pantry",
          "De la confiture maison dans le garde-manger",
          { green: 1, kitchen: 2 }
        ),
        answer(
          "Coloured candles for every zodiac sign",
          "Des bougies colorées pour chaque signe du zodiaque",
          { cosmic: 1, fire: 2 }
        ),
      ],
      prompt: {
        en: "What do you collect?",
        fr: "Que collectionnez-vous ?",
      },
    },
    {
      answers: [
        answer("Under a bright full moon", "Sous une pleine lune éclatante", {
          crystal: 1,
          moon: 2,
        }),
        answer(
          "In the eye of a wild storm at sea",
          "Dans l’œil d’une tempête en pleine mer",
          { sea: 1, storm: 2 }
        ),
        answer(
          "When the candles are lit in a quiet house",
          "Quand les bougies sont allumées dans une maison calme",
          { cottage: 1, fire: 2 }
        ),
        answer(
          "On a rare night when the planets align",
          "Par une nuit rare où les planètes s’alignent",
          { cosmic: 2, eclectic: 1 }
        ),
        answer(
          "In the early dawn, with dew on the flowers",
          "Au petit matin, quand la rosée couvre les fleurs",
          { fairy: 2, green: 1 }
        ),
        answer(
          "When nothing goes to plan",
          "Quand rien ne se passe comme prévu",
          { chaos: 2 }
        ),
      ],
      prompt: {
        en: "When is your magic strongest?",
        fr: "Quand votre magie est-elle la plus forte ?",
      },
    },
    {
      answers: [
        answer(
          "A calm voice that settles any argument",
          "Une voix calme qui apaise toutes les disputes",
          { cottage: 1, grey: 2 }
        ),
        answer(
          "A wild temper that changes the weather",
          "Un tempérament sauvage qui change la météo",
          { fire: 1, storm: 2 }
        ),
        answer(
          "Healing hands that soothe any ache",
          "Des mains guérisseuses qui apaisent toutes les douleurs",
          { crystal: 2, kitchen: 1 }
        ),
        answer(
          "A sixth sense for ghosts and spirits",
          "Un sixième sens pour les fantômes et les esprits",
          { hedge: 2, sea: 1 }
        ),
        answer(
          "Vivid dreams that come true",
          "Des rêves si vifs qu’ils se réalisent",
          { fairy: 1, moon: 2 }
        ),
        answer(
          "A quick mind that learns anything",
          "Un esprit vif qui apprend tout",
          { chaos: 1, eclectic: 2 }
        ),
      ],
      prompt: {
        en: "Pick a superpower.",
        fr: "Choisissez un super-pouvoir.",
      },
    },
    {
      answers: [
        answer(
          "A warm loaf of homemade bread wrapped in cloth",
          "Une miche de pain maison encore chaude, enveloppée dans un torchon",
          { green: 1, kitchen: 2 }
        ),
        answer(
          "A polished moonstone on a silk ribbon",
          "Une pierre de lune polie sur un ruban de soie",
          { crystal: 2, love: 1 }
        ),
        answer(
          "A handmade lamp built from old parts",
          "Une lampe faite main avec de vieilles pièces",
          { fire: 1, tech: 2 }
        ),
        answer(
          "A knitted blanket for cold nights",
          "Une couverture tricotée pour les nuits froides",
          { cottage: 2, hedge: 1 }
        ),
        answer(
          "A framed star map of their birthday",
          "Une carte du ciel encadrée du jour de sa naissance",
          { cosmic: 2, moon: 1 }
        ),
        answer(
          "A mystery box of little treasures",
          "Une boîte mystère pleine de petits trésors",
          { chaos: 1, eclectic: 2 }
        ),
      ],
      prompt: {
        en: "Pick a gift to give.",
        fr: "Choisissez un cadeau à offrir.",
      },
    },
    {
      answers: [
        answer(
          "Run them a bath with rose petals and sea salt",
          "Vous lui faites couler un bain aux pétales de rose et au sel de mer",
          { love: 2, sea: 1 }
        ),
        answer(
          "Make them your gran’s soup",
          "Vous lui faites la soupe de votre grand-mère",
          { hedge: 1, kitchen: 2 }
        ),
        answer(
          "Help them burn the old letters",
          "Vous l’aidez à brûler les vieilles lettres",
          { fire: 2, storm: 1 }
        ),
        answer(
          "Give them a smoky quartz and the honest truth",
          "Vous lui offrez un quartz fumé et la vérité",
          { crystal: 1, grey: 2 }
        ),
        answer(
          "Take them for a walk in the woods",
          "Vous l’emmenez marcher dans les bois",
          { fairy: 2, green: 1 }
        ),
        answer(
          "Make them something by hand",
          "Vous lui fabriquez quelque chose de vos mains",
          { cottage: 2, tech: 1 }
        ),
      ],
      prompt: {
        en: "Someone you love is heartbroken. You…",
        fr: "Quelqu’un que vous aimez a le cœur brisé…",
      },
    },
    {
      answers: [
        answer(
          "Shouting into the wind on a hilltop",
          "Crier dans le vent au sommet d’une colline",
          { sea: 1, storm: 2 }
        ),
        answer(
          "Tidying the whole house from top to bottom",
          "Ranger toute la maison de fond en comble",
          { cottage: 2, tech: 1 }
        ),
        answer(
          "Holding a cool stone in your palm",
          "Serrer une pierre fraîche dans votre paume",
          { crystal: 2, green: 1 }
        ),
        answer(
          "Crying it out under the night sky",
          "Pleurer un bon coup sous le ciel nocturne",
          { love: 1, moon: 2 }
        ),
        answer(
          "Dyeing your hair a wild new colour",
          "Teindre vos cheveux d’une nouvelle couleur folle",
          { chaos: 2, eclectic: 1 }
        ),
        answer(
          "Sitting quietly with the feeling until it passes",
          "Rester tranquillement avec ce que vous ressentez, jusqu’à ce que ça passe",
          { grey: 2, hedge: 1 }
        ),
      ],
      prompt: {
        en: "How do you get through a bad day?",
        fr: "Comment traversez-vous une mauvaise journée ?",
      },
    },
    {
      answers: [
        answer("Old wisdom, passed down", "Une sagesse ancienne, transmise", {
          hedge: 2,
          kitchen: 1,
        }),
        answer("Made to be broken", "Faites pour être enfreintes", {
          chaos: 2,
          storm: 1,
        }),
        answer(
          "A bit from here, a bit from there",
          "Un peu d’ici, un peu de là",
          { eclectic: 2, tech: 1 }
        ),
        answer(
          "A balance of light and dark",
          "Un équilibre entre l’ombre et la lumière",
          { cosmic: 1, grey: 2 }
        ),
        answer(
          "Like the tides, always changing",
          "Comme les marées, toujours changeantes",
          { moon: 2, sea: 1 }
        ),
        answer(
          "Less important than kindness",
          "Moins importantes que la gentillesse",
          { love: 2 }
        ),
      ],
      prompt: {
        en: "Rules are…",
        fr: "Les règles, c’est…",
      },
    },
    {
      answers: [
        answer(
          "Teaching everyone to love themselves",
          "En apprenant à chacun à s’aimer",
          { crystal: 1, love: 2 }
        ),
        answer("Keeping wild places wild", "En protégeant les lieux sauvages", {
          fairy: 2,
          green: 1,
        }),
        answer(
          "Rearranging the stars, just for fun",
          "En réarrangeant les étoiles, pour le plaisir",
          { chaos: 2, cosmic: 1 }
        ),
        answer(
          "Keeping every home warm and every table full",
          "En gardant chaque foyer au chaud et chaque table bien garnie",
          { cottage: 2, kitchen: 1 }
        ),
        answer("Fixing what’s broken", "En réparant ce qui est cassé", {
          eclectic: 2,
          tech: 1,
        }),
        answer(
          "Keeping light and dark in balance",
          "En gardant l’ombre et la lumière en équilibre",
          { grey: 2 }
        ),
      ],
      prompt: {
        en: "With one spell, you’d change the world by…",
        fr: "D’un seul sort, vous changeriez le monde…",
      },
    },
    {
      answers: [
        answer(
          "A long trip to the stars and back",
          "Un long voyage jusqu’aux étoiles, aller et retour",
          { cosmic: 2, tech: 1 }
        ),
        answer(
          "A whole world with no rules at all",
          "Un monde entier sans aucune règle",
          { chaos: 2, sea: 1 }
        ),
        answer(
          "A secret cave of crystals all your own",
          "Une grotte secrète de cristaux rien qu’à vous",
          { crystal: 2, fairy: 1 }
        ),
        answer(
          "A big table full of the people you love",
          "Une grande table remplie des gens que vous aimez",
          { kitchen: 2, love: 1 }
        ),
        answer(
          "A little bit of everything, please",
          "Un peu de tout, s’il vous plaît",
          { eclectic: 2, fire: 1 }
        ),
        answer(
          "A quiet talk with your ancestors",
          "Une conversation tranquille avec vos ancêtres",
          { grey: 1, hedge: 2 }
        ),
      ],
      prompt: {
        en: "Make a wish.",
        fr: "Faites un vœu.",
      },
    },
  ],
  results: {
    chaos: {
      about: {
        en: "Breaking the rules and experimenting. Your best spells are the ones nobody has tried: you mix, improvise and see what happens, and the mess is where the magic is.",
        fr: "Enfreindre les règles et expérimenter. Vos meilleurs sorts sont ceux que personne n’a tentés : vous mélangez, improvisez et voyez ce qui se passe, et la magie est dans le désordre.",
      },
      name: { en: "Chaos witch", fr: "Sorcière du chaos" },
    },
    cosmic: {
      about: {
        en: "Stars, planets and astrology. You read the sky like a book and time your spells by it, and your magic is as big as the night.",
        fr: "Les étoiles, les planètes et l’astrologie. Vous lisez le ciel comme un livre et réglez vos sorts sur lui, et votre magie est aussi vaste que la nuit.",
      },
      name: { en: "Cosmic witch", fr: "Sorcière cosmique" },
    },
    cottage: {
      about: {
        en: "Home and hearth. A swept doorstep, a warm kettle, a charm over the door: you make a house feel safe, and that is a spell in itself.",
        fr: "La maison et le foyer. Un seuil balayé, une bouilloire chaude, un charme au-dessus de la porte : vous rendez une maison rassurante, et c’est déjà un sort.",
      },
      name: { en: "Cottage witch", fr: "Sorcière du cottage" },
    },
    crystal: {
      about: {
        en: "Stones and gems. Amethyst for sleep, rose quartz for love, a pocketful of something for every mood: you know what each one holds.",
        fr: "Les pierres et les gemmes. L’améthyste pour le sommeil, le quartz rose pour l’amour, une poche pleine de quelque chose pour chaque humeur : vous savez ce que chacune renferme.",
      },
      name: { en: "Crystal witch", fr: "Sorcière des cristaux" },
    },
    eclectic: {
      about: {
        en: "A mix of everything: a bit of moon, a bit of kitchen, a bit of tarot. You take what works from every path and make a practice all your own.",
        fr: "Un mélange de tout : un peu de lune, un peu de cuisine, un peu de tarot. Vous prenez ce qui marche sur chaque chemin et en faites une pratique bien à vous.",
      },
      name: { en: "Eclectic witch", fr: "Sorcière éclectique" },
    },
    fairy: {
      about: {
        en: "The fae and nature spirits. You leave honey out for the fair folk and thank the spirits of the place, and you notice the small, bright, hidden things.",
        fr: "Les fées et les esprits de la nature. Vous laissez du miel pour le petit peuple et remerciez les esprits des lieux, et vous remarquez les petites choses vives et cachées.",
      },
      name: { en: "Fairy witch", fr: "Sorcière des fées" },
    },
    fire: {
      about: {
        en: "Candles, flame and transformation. You burn away what is done and light the way for what comes next, and you change everything you touch.",
        fr: "Les bougies, la flamme et la transformation. Vous brûlez ce qui est fini et éclairez ce qui vient, et vous changez tout ce que vous touchez.",
      },
      name: { en: "Fire witch", fr: "Sorcière du feu" },
    },
    green: {
      about: {
        en: "Plants, herbs and nature. Your magic grows, in the garden, on the windowsill, in a pouch of dried lavender, and the earth is your oldest teacher.",
        fr: "Les plantes, les herbes et la nature. Votre magie pousse, au jardin, sur le rebord de la fenêtre, dans un sachet de lavande séchée, et la terre est votre plus vieille maîtresse.",
      },
      name: { en: "Green witch", fr: "Sorcière verte" },
    },
    grey: {
      about: {
        en: "A balance of light and dark. Neither white nor black, you see both sides, cast with care, and know when a little shadow is needed.",
        fr: "Un équilibre entre l’ombre et la lumière. Ni blanche ni noire, vous voyez les deux côtés, lancez vos sorts avec soin, et savez quand il faut un peu d’ombre.",
      },
      name: { en: "Grey witch", fr: "Sorcière grise" },
    },
    hedge: {
      about: {
        en: "Folk magic and spirit work. You walk the hedge between this world and the next, with old remedies, charms handed down and a quiet word with the spirits.",
        fr: "La magie populaire et le travail avec les esprits. Vous longez la haie entre ce monde et l’autre, avec de vieux remèdes, des charmes transmis et un mot discret aux esprits.",
      },
      name: { en: "Hedge witch", fr: "Sorcière des haies" },
    },
    kitchen: {
      about: {
        en: "Cooking and recipes. Every soup is a spell and every loaf a blessing: you stir your intentions in and feed the people you love.",
        fr: "La cuisine et les recettes. Chaque soupe est un sort et chaque pain une bénédiction : vous y mêlez vos intentions et nourrissez ceux que vous aimez.",
      },
      name: { en: "Kitchen witch", fr: "Sorcière de cuisine" },
    },
    love: {
      about: {
        en: "Romance and self-love. Rose petals, honey jars and a mirror you smile into: your magic starts with loving yourself and spills over onto everyone else.",
        fr: "La romance et l’amour de soi. Pétales de rose, pots de miel et un miroir où vous vous souriez : votre magie commence par l’amour de soi et déborde sur tous les autres.",
      },
      name: { en: "Love witch", fr: "Sorcière de l’amour" },
    },
    moon: {
      about: {
        en: "Lunar cycles. You plant at the new moon, charge at the full and let go as it wanes, and you know where the moon is tonight without looking.",
        fr: "Les cycles lunaires. Vous semez à la nouvelle lune, rechargez à la pleine et lâchez prise quand elle décroît, et vous savez où est la lune ce soir sans regarder.",
      },
      name: { en: "Moon witch", fr: "Sorcière de la lune" },
    },
    sea: {
      about: {
        en: "The ocean, water and tides. Salt, shells and sea glass: your magic ebbs and flows, and you feel the pull of the tide like an old friend.",
        fr: "L’océan, l’eau et les marées. Sel, coquillages et verre de mer : votre magie va et vient, et vous sentez l’appel de la marée comme celui d’une vieille amie.",
      },
      name: { en: "Sea witch", fr: "Sorcière des mers" },
    },
    storm: {
      about: {
        en: "Weather and wild energy. Thunder charges you up, rain washes things clean and the wind carries your words. You are at your best when the sky is wild.",
        fr: "La météo et l’énergie sauvage. Le tonnerre vous recharge, la pluie lave tout et le vent porte vos mots. Vous êtes au meilleur de vous-même quand le ciel se déchaîne.",
      },
      name: { en: "Storm witch", fr: "Sorcière des tempêtes" },
    },
    tech: {
      about: {
        en: "Magic with a digital twist, made by hand. You tinker, take things apart and build them better: fairy lights wired into a spell, a charm soldered into a circuit, a clockwork familiar. If it’s broken, you can mend it.",
        fr: "La magie version numérique, faite main. Vous bricolez, démontez et reconstruisez en mieux : des guirlandes lumineuses câblées dans un sort, un charme soudé sur un circuit, un familier mécanique. Si c’est cassé, vous savez le réparer.",
      },
      name: { en: "Tech witch", fr: "Sorcière techno" },
    },
  },
  slug: "what-type-of-witch",
  title: {
    en: "What type of witch are you?",
    fr: "Quel type de sorcière êtes-vous ?",
  },
};
