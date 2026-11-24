import type { Answer, Quiz, QuizResult } from "./quiz";

/**
 * What type of witch are you? Eight kinds of witch, as they show in everyday
 * life, and thirty-two questions of six answers. Each answer gives 2 points
 * to the witch it describes best, and some give 1 to another it also fits.
 * Every witch is worth 55 points over all the answers and never twice in one
 * question, so each has the same chance and can come out on top. With no
 * witch clearly ahead, you are the Eclectic witch: a bit of everything.
 */
const answer = (
  en: string,
  fr: string,
  points: Record<string, number>
): Answer => ({ points, text: { en, fr } });

const result = (
  name: QuizResult["name"],
  about: QuizResult["about"]
): QuizResult => ({ about, name });

export const WITCH_QUIZ: Quiz = {
  blend: {
    id: "eclectic",
    result: result(
      { en: "Eclectic witch", fr: "Sorcière éclectique" },
      {
        en: "You’re a bit of everything, and that’s your strength. One weekend you’re baking, the next you’re hiking, and you’re always picking up something new from everyone you meet.",
        fr: "Vous êtes un peu de tout, et c’est votre force. Un week-end vous pâtissez, le suivant vous partez en randonnée, et vous apprenez toujours quelque chose de chaque personne que vous rencontrez.",
      }
    ),
    top: 3,
    within: 1,
  },
  blurb: {
    en: "Thirty-two questions, eight kinds of witch. Find out which one you are, and how much of the others.",
    fr: "Trente-deux questions, huit types de sorcière. Découvrez lequel est le vôtre, et ce que vous avez des autres.",
  },
  legend: "which-witch.txt",
  profile: {
    name: {
      en: "your Book of Shadows on Realms",
      fr: "votre Livre des ombres sur Realms",
    },
    url: "https://realms.irmahs.dev/book-of-shadows",
  },
  questions: [
    {
      answers: [
        answer(
          "Planting seasonal flowers in the garden",
          "Planter des fleurs de saison au jardin",
          { chaos: 1, green: 2 }
        ),
        answer(
          "Baking a scrumptious fruit bread in the house",
          "Faire un délicieux pain aux fruits à la maison",
          { kitchen: 2 }
        ),
        answer(
          "Collecting pearly shells by the beach",
          "Ramasser de jolis coquillages sur la plage",
          { adventure: 2, hedge: 1 }
        ),
        answer(
          "Fixing an old radio in the shed",
          "Réparer une vieille radio dans l’atelier",
          { tinkering: 2 }
        ),
        answer("Reading a good book in bed", "Lire un bon livre au lit", {
          hearth: 2,
        }),
        answer(
          "Walking a happy dog in the park",
          "Promener un chien joyeux au parc",
          { love: 2 }
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
          { adventure: 2 }
        ),
        answer(
          "A misty morning in the woods",
          "Un matin de brume dans les bois",
          { hedge: 2 }
        ),
        answer(
          "A cold, clear night under a full moon",
          "Une nuit claire et froide sous la pleine lune",
          { love: 2, tinkering: 1 }
        ),
        answer(
          "A rainy afternoon under a warm blanket",
          "Un après-midi pluvieux sous un plaid bien chaud",
          { hearth: 2, kitchen: 1 }
        ),
        answer(
          "A snow day where every plan is off",
          "Un jour de neige où tous les plans tombent à l’eau",
          { chaos: 2 }
        ),
        answer(
          "A warm, sunny day in the meadow",
          "Une chaude journée de soleil dans les prés",
          { green: 2 }
        ),
      ],
      prompt: { en: "Your favourite weather?", fr: "Votre temps préféré ?" },
    },
    {
      answers: [
        answer(
          "A steaming mug of chamomile from the garden",
          "Une tasse fumante de camomille du jardin",
          { green: 1, kitchen: 2 }
        ),
        answer(
          "A salty sea-breeze cocktail on the beach",
          "Un cocktail salé à la brise marine sur la plage",
          { adventure: 2, hearth: 1 }
        ),
        answer(
          "A cold glass of moon water from the windowsill",
          "Un verre frais d’eau de lune du rebord de la fenêtre",
          { hedge: 2 }
        ),
        answer(
          "A fizzy pink lemonade to share",
          "Une limonade rose pétillante à partager",
          { love: 2 }
        ),
        answer(
          "A strong black coffee with no sugar",
          "Un café noir bien serré, sans sucre",
          { tinkering: 2 }
        ),
        answer(
          "A strange potion nobody can name",
          "Une potion étrange que personne ne sait nommer",
          { chaos: 2 }
        ),
      ],
      prompt: { en: "Pick a drink.", fr: "Choisissez une boisson." },
    },
    {
      answers: [
        answer(
          "A wild, windy autumn with storms rolling in",
          "Un automne sauvage et venteux, plein d’orages",
          { chaos: 2 }
        ),
        answer(
          "A fresh, blooming spring in the garden",
          "Un printemps frais et fleuri au jardin",
          { green: 2 }
        ),
        answer(
          "A hot, golden summer under a blazing sun",
          "Un été chaud et doré sous un soleil de plomb",
          { adventure: 2, love: 1 }
        ),
        answer(
          "A snowy winter by a warm stove",
          "Un hiver enneigé près d’un poêle bien chaud",
          { hearth: 2 }
        ),
        answer(
          "The quiet days between two seasons",
          "Les jours calmes entre deux saisons",
          { hedge: 2, tinkering: 1 }
        ),
        answer(
          "Long summer evenings at a barbecue with friends",
          "Les longues soirées d’été autour d’un barbecue entre amis",
          { kitchen: 2 }
        ),
      ],
      prompt: { en: "Your favourite season?", fr: "Votre saison préférée ?" },
    },
    {
      answers: [
        answer(
          "A warm cinnamon bun fresh from the oven",
          "Une brioche à la cannelle tout juste sortie du four",
          { hearth: 1, kitchen: 2 }
        ),
        answer(
          "Sweet wild berries from the bushes",
          "Des baies sauvages et sucrées cueillies dans les buissons",
          { hedge: 2 }
        ),
        answer(
          "Chocolate-dipped strawberries for two",
          "Des fraises enrobées de chocolat pour deux",
          { love: 2 }
        ),
        answer("Salty chips by the harbour", "Des frites salées sur le port", {
          adventure: 2,
          chaos: 1,
        }),
        answer(
          "A strange mix of whatever’s in the fridge",
          "Un drôle de mélange de ce qu’il y a dans le frigo",
          { tinkering: 2 }
        ),
        answer(
          "Crunchy carrots straight from the garden",
          "Des carottes croquantes tout droit du potager",
          { green: 2 }
        ),
      ],
      prompt: { en: "Your favourite snack?", fr: "Votre en-cas préféré ?" },
    },
    {
      answers: [
        answer(
          "A soft silver grey, like morning mist",
          "Un gris argenté et doux, comme la brume du matin",
          { adventure: 1, hedge: 2 }
        ),
        answer(
          "A rosy pink, like a first blush",
          "Un rose tendre, comme une première rougeur",
          { hearth: 1, love: 2 }
        ),
        answer("A deep midnight blue", "Un bleu nuit profond", {
          tinkering: 2,
        }),
        answer(
          "A fresh leaf green",
          "Un vert tendre, comme une jeune feuille",
          { green: 2 }
        ),
        answer(
          "Every colour at once, splashed everywhere",
          "Toutes les couleurs à la fois, éclaboussées partout",
          { chaos: 2 }
        ),
        answer("A warm cinnamon brown", "Un brun cannelle bien chaud", {
          kitchen: 2,
        }),
      ],
      prompt: { en: "Pick a colour.", fr: "Choisissez une couleur." },
    },
    {
      answers: [
        answer(
          "A wild daisy from the meadow",
          "Une marguerite sauvage des prés",
          { green: 2 }
        ),
        answer(
          "A deep red rose in a glass vase",
          "Une rose rouge foncé dans un vase en verre",
          { love: 2 }
        ),
        answer(
          "A sprig of fresh mint for your tea",
          "Un brin de menthe fraîche pour votre thé",
          { kitchen: 2 }
        ),
        answer(
          "A sprig of hawthorn from the hedgerow",
          "Un brin d’aubépine cueilli dans la haie",
          { hedge: 2 }
        ),
        answer(
          "A sprig of lavender for the linen cupboard",
          "Un brin de lavande pour l’armoire à linge",
          { hearth: 2 }
        ),
        answer(
          "A bright sunflower turning to the sun",
          "Un tournesol éclatant tourné vers le soleil",
          { adventure: 2, chaos: 1 }
        ),
      ],
      prompt: { en: "Pick a flower.", fr: "Choisissez une fleur." },
    },
    {
      answers: [
        answer(
          "Brewing an old herbal remedy on the stove",
          "Préparer un vieux remède aux herbes sur le feu",
          { hedge: 1, kitchen: 2 }
        ),
        answer(
          "Running outside to dance in the downpour",
          "Courir dehors danser sous l’averse",
          { adventure: 2, love: 1 }
        ),
        answer(
          "Splashing through puddles in your wellies",
          "Sauter dans les flaques en bottes de pluie",
          { green: 2 }
        ),
        answer(
          "Mending a leaky umbrella in the porch",
          "Réparer un parapluie qui fuit sous le porche",
          { tinkering: 2 }
        ),
        answer(
          "Lighting the wood stove for someone you love",
          "Allumer le poêle pour quelqu’un que vous aimez",
          { hearth: 2 }
        ),
        answer(
          "Starting three new hobbies at once",
          "Commencer trois nouveaux passe-temps à la fois",
          { chaos: 2 }
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
          { hedge: 2 }
        ),
        answer(
          "Lighting a little candle on the kitchen table",
          "Allumer une petite bougie sur la table de la cuisine",
          { adventure: 1, kitchen: 2 }
        ),
        answer(
          "Watering thirsty plants on the windowsill",
          "Arroser les plantes assoiffées sur le rebord de la fenêtre",
          { green: 1, hearth: 2 }
        ),
        answer(
          "Texting good morning to everyone you love",
          "Envoyer un bonjour à tous ceux que vous aimez",
          { love: 2 }
        ),
        answer(
          "Fixing the squeaky coffee machine in the kitchen",
          "Réparer la machine à café qui grince dans la cuisine",
          { tinkering: 2 }
        ),
        answer(
          "Hitting snooze five times in a warm bed",
          "Repousser le réveil cinq fois dans un lit bien chaud",
          { chaos: 2 }
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
          { kitchen: 2, love: 1 }
        ),
        answer(
          "A lucky acorn from the woods",
          "Un gland porte-bonheur ramassé dans les bois",
          { hedge: 2 }
        ),
        answer(
          "A battered box of matches and a candle stub",
          "Une vieille boîte d’allumettes et un bout de bougie",
          { hearth: 2 }
        ),
        answer(
          "A tiny screwdriver set for emergencies",
          "Un petit jeu de tournevis pour les urgences",
          { adventure: 1, tinkering: 2 }
        ),
        answer(
          "A white feather caught in the wind",
          "Une plume blanche emportée par le vent",
          { green: 2 }
        ),
        answer(
          "A messy jumble of everything and nothing",
          "Un fouillis de tout et de rien",
          { chaos: 2 }
        ),
      ],
      prompt: { en: "What’s in your bag?", fr: "Qu’y a-t-il dans votre sac ?" },
    },
    {
      answers: [
        answer(
          "A battered book of old folk tales",
          "Un vieux livre de contes populaires tout abîmé",
          { hearth: 2 }
        ),
        answer(
          "A stained cookbook full of handwritten notes",
          "Un livre de cuisine taché, plein de notes manuscrites",
          { kitchen: 2 }
        ),
        answer(
          "A thick atlas full of places to go",
          "Un gros atlas plein d’endroits où aller",
          { adventure: 2 }
        ),
        answer(
          "A dog-eared romance novel",
          "Un roman d’amour aux pages cornées",
          { love: 2 }
        ),
        answer(
          "A field guide to wild plants",
          "Un guide des plantes sauvages",
          { green: 2, hedge: 1 }
        ),
        answer(
          "A greasy repair manual for old machines",
          "Un manuel de réparation graisseux pour vieilles machines",
          { chaos: 1, tinkering: 2 }
        ),
      ],
      prompt: { en: "Pick a book.", fr: "Choisissez un livre." },
    },
    {
      answers: [
        answer(
          "A chunky silver ring on your thumb",
          "Une grosse bague en argent au pouce",
          { adventure: 2, hearth: 1 }
        ),
        answer(
          "A silver crescent pendant on a fine chain",
          "Un pendentif croissant de lune en argent sur une fine chaîne",
          { hedge: 2 }
        ),
        answer(
          "A heart-shaped locket with a photo inside",
          "Un médaillon en forme de cœur avec une photo à l’intérieur",
          { love: 2 }
        ),
        answer(
          "A tiny watch you rebuilt yourself",
          "Une petite montre que vous avez remontée vous-même",
          { tinkering: 2 }
        ),
        answer(
          "A stack of mismatched bracelets from everywhere",
          "Une pile de bracelets dépareillés venus de partout",
          { chaos: 2 }
        ),
        answer(
          "A dainty crown of fresh flowers",
          "Une délicate couronne de fleurs fraîches",
          { green: 2 }
        ),
      ],
      prompt: { en: "Pick a piece of jewellery.", fr: "Choisissez un bijou." },
    },
    {
      answers: [
        answer(
          "A thatched cottage with roses round the door",
          "Une chaumière avec des roses autour de la porte",
          { hearth: 2, love: 1 }
        ),
        answer(
          "A wooden cabin on stilts above the sea",
          "Une cabane en bois sur pilotis au-dessus de la mer",
          { adventure: 2 }
        ),
        answer(
          "A secret treehouse high in the branches",
          "Une cabane secrète perchée dans les branches",
          { green: 2, tinkering: 1 }
        ),
        answer(
          "A little flat above a bakery",
          "Un petit appartement au-dessus d’une boulangerie",
          { kitchen: 2 }
        ),
        answer(
          "A colourful houseboat full of odd finds",
          "Une péniche colorée pleine de trouvailles insolites",
          { chaos: 2 }
        ),
        answer(
          "A little hut at the edge of the woods",
          "Une petite hutte à l’orée des bois",
          { hedge: 2 }
        ),
      ],
      prompt: { en: "Your dream house?", fr: "La maison de vos rêves ?" },
    },
    {
      answers: [
        answer(
          "By a crackling fire in the living room",
          "Près d’un feu qui crépite dans le salon",
          { hearth: 2 }
        ),
        answer(
          "In a lonely lighthouse above the waves",
          "Dans un phare solitaire au-dessus des vagues",
          { adventure: 1, hedge: 2 }
        ),
        answer(
          "In a garage full of half-finished projects",
          "Dans un garage plein de projets à moitié finis",
          { tinkering: 2 }
        ),
        answer(
          "In a mossy clearing deep in the woods",
          "Dans une clairière moussue au fond des bois",
          { green: 2 }
        ),
        answer(
          "In a busy kitchen with everyone talking at once",
          "Dans une cuisine animée où tout le monde parle en même temps",
          { kitchen: 2, love: 1 }
        ),
        answer(
          "In a crooked house where nothing matches",
          "Dans une maison biscornue où rien n’est assorti",
          { chaos: 2 }
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
          { hearth: 2 }
        ),
        answer(
          "Sailing a little boat around the islands",
          "Naviguer sur un petit bateau autour des îles",
          { adventure: 2 }
        ),
        answer(
          "Visiting an old castle full of stories",
          "Visiter un vieux château plein d’histoires",
          { hedge: 2, love: 1 }
        ),
        answer(
          "Taking a cooking class with your love",
          "Prendre un cours de cuisine avec votre amour",
          { kitchen: 2 }
        ),
        answer("Hiking up a smoking volcano", "Gravir un volcan qui fume", {
          chaos: 2,
          tinkering: 1,
        }),
        answer(
          "Camping by a quiet lake",
          "Camper au bord d’un lac tranquille",
          { green: 2 }
        ),
      ],
      prompt: { en: "Your dream holiday?", fr: "Vos vacances de rêve ?" },
    },
    {
      answers: [
        answer(
          "Knitting a warm scarf by the fire",
          "Tricoter une écharpe bien chaude au coin du feu",
          { hearth: 2 }
        ),
        answer(
          "Telling spooky stories around a campfire",
          "Raconter des histoires qui font peur autour d’un feu de camp",
          { adventure: 1, hedge: 2 }
        ),
        answer(
          "Hosting a cosy dinner for your friends",
          "Organiser un dîner douillet pour vos amis",
          { kitchen: 2 }
        ),
        answer(
          "Moving all the furniture around on a whim",
          "Changer tous les meubles de place sur un coup de tête",
          { chaos: 2 }
        ),
        answer(
          "A long walk by the water at sunset",
          "Une longue promenade au bord de l’eau au coucher du soleil",
          { green: 1, love: 2 }
        ),
        answer(
          "Building a clockwork toy at the kitchen table",
          "Construire un jouet mécanique sur la table de la cuisine",
          { tinkering: 2 }
        ),
      ],
      prompt: { en: "Your ideal evening?", fr: "Votre soirée idéale ?" },
    },
    {
      answers: [
        answer(
          "Rolling thunder in the distance",
          "Le tonnerre qui gronde au loin",
          { chaos: 2 }
        ),
        answer(
          "Big waves crashing on the rocks",
          "De grosses vagues qui se brisent sur les rochers",
          { adventure: 2 }
        ),
        answer(
          "A crackling fire on a cold night",
          "Un feu qui crépite par une nuit froide",
          { love: 2 }
        ),
        answer(
          "A kettle whistling in the kitchen",
          "Une bouilloire qui siffle dans la cuisine",
          { kitchen: 2, tinkering: 1 }
        ),
        answer(
          "Sweet birdsong in the garden at dawn",
          "Un doux chant d’oiseaux au jardin à l’aube",
          { green: 2, hedge: 1 }
        ),
        answer(
          "Deep silence in a sleeping house",
          "Un silence profond dans une maison endormie",
          { hearth: 2 }
        ),
      ],
      prompt: { en: "Your favourite sound?", fr: "Votre son préféré ?" },
    },
    {
      answers: [
        answer(
          "Smoky cedarwood that crackles as it burns",
          "Du cèdre fumé qui crépite en brûlant",
          { adventure: 2 }
        ),
        answer(
          "Sweet vanilla with a hint of rose",
          "Une douce vanille avec une touche de rose",
          { love: 2 }
        ),
        answer(
          "Fresh pine from a snowy forest",
          "Du pin frais d’une forêt enneigée",
          { green: 2 }
        ),
        answer(
          "Warm apple pie with cinnamon",
          "Une tarte aux pommes tiède à la cannelle",
          { kitchen: 2 }
        ),
        answer(
          "Soft jasmine that blooms at night",
          "Un jasmin doux qui fleurit la nuit",
          { hearth: 2 }
        ),
        answer(
          "Ancient frankincense from faraway lands",
          "Un encens ancien venu de terres lointaines",
          { hedge: 2, tinkering: 1 }
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
          "A smooth pebble from a special day",
          "Un galet bien lisse d’un jour spécial",
          { adventure: 2 }
        ),
        answer(
          "A beeswax candle carved with runes",
          "Une bougie en cire d’abeille gravée de runes",
          { hedge: 2 }
        ),
        answer(
          "Framed photos of the people you love",
          "Des photos encadrées de ceux que vous aimez",
          { hearth: 1, love: 2 }
        ),
        answer(
          "A dusty jar of odds and ends from your travels",
          "Un vieux bocal de bric-à-brac rapporté de vos voyages",
          { tinkering: 2 }
        ),
        answer(
          "A glass jar of rainwater from the last storm",
          "Un bocal en verre d’eau de pluie du dernier orage",
          { chaos: 1, green: 2 }
        ),
        answer(
          "A fresh bundle of thyme from the garden",
          "Un bouquet de thym frais du jardin",
          { kitchen: 2 }
        ),
      ],
      prompt: {
        en: "What would you keep on your shelf?",
        fr: "Que garderiez-vous sur votre étagère ?",
      },
    },
    {
      answers: [
        answer(
          "A stone mortar and pestle for crushing herbs",
          "Un mortier en pierre pour piler les herbes",
          { kitchen: 2 }
        ),
        answer(
          "A spirit level to hang everything straight",
          "Un niveau à bulle pour tout accrocher bien droit",
          { adventure: 1, tinkering: 2 }
        ),
        answer(
          "A rusty toolbox full of odd screws",
          "Une vieille boîte à outils pleine de vis dépareillées",
          { chaos: 2 }
        ),
        answer(
          "A silver bowl of water for scrying",
          "Un bol d’argent rempli d’eau pour la divination",
          { hedge: 2 }
        ),
        answer(
          "An old broom to sweep out bad luck",
          "Un vieux balai pour chasser la malchance",
          { hearth: 2 }
        ),
        answer(
          "A sturdy pair of binoculars for birdwatching",
          "Une bonne paire de jumelles pour observer les oiseaux",
          { green: 2 }
        ),
      ],
      prompt: { en: "Pick a tool.", fr: "Choisissez un outil." },
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
          { hearth: 1, love: 2 }
        ),
        answer(
          "A brand-new spell of your own invention",
          "Un tout nouveau sort de votre invention",
          { chaos: 2 }
        ),
        answer(
          "A gentle mending charm for broken things",
          "Un doux charme de réparation pour les choses cassées",
          { tinkering: 2 }
        ),
        answer(
          "A spell to find your way anywhere",
          "Un sort pour retrouver votre chemin partout",
          { adventure: 2 }
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
          { hearth: 2, hedge: 1 }
        ),
        answer(
          "In a different messy pile every week",
          "Dans une pile en désordre, différente chaque semaine",
          { chaos: 2, love: 1 }
        ),
        answer(
          "In a waterproof chest buried on the beach",
          "Dans un coffre étanche enterré sur la plage",
          { adventure: 2 }
        ),
        answer(
          "In the hollow of an old oak tree",
          "Dans le creux d’un vieux chêne",
          { green: 2 }
        ),
        answer(
          "Behind a secret panel you built yourself",
          "Derrière un panneau secret que vous avez construit",
          { tinkering: 2 }
        ),
        answer(
          "Tucked between the recipe books in the kitchen",
          "Glissé entre les livres de recettes dans la cuisine",
          { kitchen: 2 }
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
          { green: 2, kitchen: 1 }
        ),
        answer(
          "A black cat who judges everyone",
          "Un chat noir qui juge tout le monde",
          { hearth: 2 }
        ),
        answer(
          "A clever raven who steals shiny things",
          "Un corbeau malin qui vole tout ce qui brille",
          { adventure: 1, chaos: 2 }
        ),
        answer(
          "A pale moth drawn to the moonlight",
          "Un papillon de nuit pâle attiré par la lune",
          { hedge: 2 }
        ),
        answer(
          "A clockwork owl you built yourself",
          "Une chouette mécanique de votre fabrication",
          { tinkering: 2 }
        ),
        answer(
          "A loyal dog who’d follow you anywhere",
          "Un chien fidèle qui vous suivrait partout",
          { love: 2 }
        ),
      ],
      prompt: { en: "Your familiar is…", fr: "Votre familier, c’est…" },
    },
    {
      answers: [
        answer(
          "Smooth sea glass from the shore",
          "Du verre de mer poli ramassé sur le rivage",
          { adventure: 2 }
        ),
        answer(
          "Old remedies in faded ink",
          "De vieux remèdes à l’encre pâlie",
          { hedge: 2 }
        ),
        answer(
          "Curious bits and bobs from everywhere",
          "De curieux bibelots venus de partout",
          { chaos: 1, tinkering: 2 }
        ),
        answer(
          "Birthday cards from everyone you love",
          "Les cartes d’anniversaire de tous ceux que vous aimez",
          { love: 2 }
        ),
        answer(
          "Homemade jam in the pantry",
          "De la confiture maison dans le garde-manger",
          { green: 1, kitchen: 2 }
        ),
        answer(
          "Candles in every colour",
          "Des bougies de toutes les couleurs",
          { hearth: 2 }
        ),
      ],
      prompt: { en: "What do you collect?", fr: "Que collectionnez-vous ?" },
    },
    {
      answers: [
        answer("Under a bright full moon", "Sous une pleine lune éclatante", {
          hedge: 1,
          love: 2,
        }),
        answer(
          "In the eye of a wild storm at sea",
          "Dans l’œil d’une tempête en pleine mer",
          { adventure: 2 }
        ),
        answer(
          "When the candles are lit in a quiet house",
          "Quand les bougies sont allumées dans une maison calme",
          { hearth: 2, kitchen: 1 }
        ),
        answer(
          "When you’ve just fixed something nobody else could",
          "Quand vous venez de réparer ce que personne d’autre n’arrivait à réparer",
          { tinkering: 2 }
        ),
        answer(
          "In the early dawn, with dew on the flowers",
          "Au petit matin, quand la rosée couvre les fleurs",
          { green: 2 }
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
          { hearth: 2, kitchen: 1 }
        ),
        answer(
          "A wild temper that changes the weather",
          "Un tempérament sauvage qui change la météo",
          { chaos: 2 }
        ),
        answer(
          "Healing hands that soothe any ache",
          "Des mains guérisseuses qui apaisent toutes les douleurs",
          { love: 2 }
        ),
        answer(
          "A sixth sense for ghosts and spirits",
          "Un sixième sens pour les fantômes et les esprits",
          { hedge: 2 }
        ),
        answer(
          "Energy that never runs out",
          "Une énergie qui ne s’épuise jamais",
          { adventure: 2, green: 1 }
        ),
        answer(
          "A quick mind that learns anything",
          "Un esprit vif qui apprend tout",
          { tinkering: 2 }
        ),
      ],
      prompt: { en: "Pick a superpower.", fr: "Choisissez un super-pouvoir." },
    },
    {
      answers: [
        answer(
          "A warm loaf of homemade bread wrapped in cloth",
          "Une miche de pain maison encore chaude, enveloppée dans un torchon",
          { kitchen: 2 }
        ),
        answer(
          "A handwritten letter saying what they mean to you",
          "Une lettre écrite à la main pour leur dire ce qu’ils représentent pour vous",
          { love: 2 }
        ),
        answer(
          "A handmade lamp built from old parts",
          "Une lampe faite main avec de vieilles pièces",
          { tinkering: 2 }
        ),
        answer(
          "A knitted blanket for cold nights",
          "Une couverture tricotée pour les nuits froides",
          { hearth: 2 }
        ),
        answer(
          "Tickets to a surprise adventure",
          "Des billets pour une aventure surprise",
          { adventure: 2, green: 1 }
        ),
        answer(
          "A mystery box of little treasures",
          "Une boîte mystère pleine de petits trésors",
          { chaos: 2 }
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
          { love: 2 }
        ),
        answer(
          "Make them your gran’s soup",
          "Vous lui faites la soupe de votre grand-mère",
          { kitchen: 2 }
        ),
        answer(
          "Help them burn the old letters",
          "Vous l’aidez à brûler les vieilles lettres",
          { chaos: 1, hedge: 2 }
        ),
        answer(
          "Give them the honest truth, kindly",
          "Leur dire la vérité, avec douceur",
          { tinkering: 2 }
        ),
        answer(
          "Take them for a walk in the woods",
          "Vous l’emmenez marcher dans les bois",
          { green: 2 }
        ),
        answer(
          "Make them something by hand",
          "Vous lui fabriquez quelque chose de vos mains",
          { hearth: 2 }
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
          { adventure: 2 }
        ),
        answer(
          "Tidying the whole house from top to bottom",
          "Ranger toute la maison de fond en comble",
          { hearth: 2, tinkering: 1 }
        ),
        answer(
          "Going for a swim to clear your head",
          "Aller nager pour se vider la tête",
          { green: 2, kitchen: 1 }
        ),
        answer(
          "Crying it out under the night sky",
          "Pleurer un bon coup sous le ciel nocturne",
          { love: 2 }
        ),
        answer(
          "Dyeing your hair a wild new colour",
          "Teindre vos cheveux d’une nouvelle couleur folle",
          { chaos: 2 }
        ),
        answer(
          "Sitting quietly with the feeling until it passes",
          "Rester tranquillement avec ce que vous ressentez, jusqu’à ce que ça passe",
          { hedge: 2 }
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
        }),
        answer(
          "There for a reason: they keep things working",
          "Là pour une raison : ils font que tout fonctionne",
          { tinkering: 2 }
        ),
        answer(
          "Best when everyone at home agrees on them",
          "Meilleures quand toute la maison est d’accord",
          { hearth: 2 }
        ),
        answer(
          "Fine, until there’s somewhere new to explore",
          "Très bien, jusqu’à ce qu’il y ait un nouvel endroit à explorer",
          { adventure: 2, green: 1 }
        ),
        answer(
          "Less important than kindness",
          "Moins importantes que la gentillesse",
          { love: 2 }
        ),
      ],
      prompt: { en: "Rules are…", fr: "Les règles, c’est…" },
    },
    {
      answers: [
        answer(
          "Teaching everyone to love themselves",
          "En apprenant à chacun à s’aimer",
          { love: 2 }
        ),
        answer("Keeping wild places wild", "En protégeant les lieux sauvages", {
          green: 2,
          hedge: 1,
        }),
        answer(
          "Rearranging the stars, just for fun",
          "En réarrangeant les étoiles, pour le plaisir",
          { chaos: 2 }
        ),
        answer(
          "Keeping every home warm and every table full",
          "En gardant chaque foyer au chaud et chaque table bien garnie",
          { kitchen: 2 }
        ),
        answer("Fixing what’s broken", "En réparant ce qui est cassé", {
          tinkering: 2,
        }),
        answer(
          "Letting everyone see the world",
          "Permettre à chacun de voir le monde",
          { adventure: 2 }
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
          "A one-way ticket somewhere new",
          "Un aller simple pour un endroit inconnu",
          { adventure: 2 }
        ),
        answer(
          "A whole world with no rules at all",
          "Un monde entier sans aucune règle",
          { chaos: 2 }
        ),
        answer(
          "A workshop with every tool you could want",
          "Un atelier avec tous les outils dont vous rêvez",
          { hearth: 1, tinkering: 2 }
        ),
        answer(
          "A big table full of the people you love",
          "Une grande table remplie des gens que vous aimez",
          { kitchen: 2 }
        ),
        answer(
          "A front-row seat at every party",
          "Une place au premier rang de toutes les fêtes",
          { love: 2 }
        ),
        answer(
          "A quiet talk with your ancestors",
          "Une conversation tranquille avec vos ancêtres",
          { hedge: 2 }
        ),
      ],
      prompt: { en: "Make a wish.", fr: "Faites un vœu." },
    },
  ],
  results: {
    adventure: result(
      { en: "Adventure witch", fr: "Sorcière de l’aventure" },
      {
        en: "You’re always planning the next trip, even if it’s just a new café across town. You say yes to last-minute plans, order the dish you’ve never tried, and come home with a story every time.",
        fr: "Vous préparez toujours le prochain voyage, même si c’est juste un nouveau café à l’autre bout de la ville. Vous dites oui aux plans de dernière minute, commandez le plat que vous n’avez jamais goûté et rentrez chaque fois avec une histoire à raconter.",
      }
    ),
    chaos: result(
      { en: "Chaos witch", fr: "Sorcière du chaos" },
      {
        en: "Your plans change by the hour and somehow it always works out. Your bag is a mess but has everything in it, you start three hobbies a month, and your friends never know what you’ll suggest next.",
        fr: "Vos plans changent d’heure en heure, et pourtant tout finit toujours par s’arranger. Votre sac est en désordre mais contient tout, vous commencez trois loisirs par mois, et vos amis ne savent jamais ce que vous allez proposer.",
      }
    ),
    green: result(
      { en: "Green witch", fr: "Sorcière verte" },
      {
        en: "Your windowsill is full of plants you talk to, and you can’t walk past a garden centre. You take the long way through the park, know which herb goes in which tea, and feel better after an hour outside.",
        fr: "Votre rebord de fenêtre déborde de plantes à qui vous parlez, et vous ne passez jamais devant une jardinerie sans entrer. Vous faites le détour par le parc, savez quelle herbe mettre dans quelle tisane, et allez mieux après une heure dehors.",
      }
    ),
    hearth: result(
      { en: "Hearth witch", fr: "Sorcière du foyer" },
      {
        en: "Your home is your safe place: soft blankets, candles, everything where it belongs. You love a quiet night in, you remember everyone’s birthday, and the people close to you know your door is always open.",
        fr: "Votre maison est votre refuge : des plaids moelleux, des bougies, chaque chose à sa place. Vous adorez les soirées tranquilles chez vous, n’oubliez aucun anniversaire, et vos proches savent que votre porte est toujours ouverte.",
      }
    ),
    hedge: result(
      { en: "Hedge witch", fr: "Sorcière des haies" },
      {
        en: "You keep your family’s stories alive: your grandmother’s recipes, old photo albums, the remedies she swore by. You trust your gut, love anything with a bit of history, and feel close to the people who came before you.",
        fr: "Vous faites vivre l’histoire de votre famille : les recettes de votre grand-mère, les vieux albums photo, les remèdes auxquels elle croyait dur comme fer. Vous écoutez votre intuition, aimez tout ce qui a une histoire, et vous sentez proche de ceux qui étaient là avant vous.",
      }
    ),
    kitchen: result(
      { en: "Kitchen witch", fr: "Sorcière de cuisine" },
      {
        en: "Food is how you take care of people. Someone’s ill, you bring soup; someone’s sad, you bake. Your fridge is full of leftovers you’ll turn into something good, and everyone ends up in your kitchen at parties.",
        fr: "La cuisine, c’est votre façon de prendre soin des gens. Quelqu’un est malade, vous apportez de la soupe ; quelqu’un est triste, vous faites un gâteau. Votre frigo est plein de restes que vous transformerez en bon plat, et en soirée tout le monde finit dans votre cuisine.",
      }
    ),
    love: result(
      { en: "Love witch", fr: "Sorcière de l’amour" },
      {
        en: "You can tell how someone feels before they say a word. Friends call you first when something goes wrong, you send the message that makes their day, and you never forget the little things people tell you.",
        fr: "Vous savez ce que ressent quelqu’un avant qu’il dise un mot. Vos amis vous appellent en premier quand ça ne va pas, vous envoyez le message qui illumine leur journée, et vous n’oubliez jamais les petites choses qu’on vous confie.",
      }
    ),
    tinkering: result(
      { en: "Tinkering witch", fr: "Sorcière bricoleuse" },
      {
        en: "When something breaks, you’d rather fix it than buy a new one. You read the instructions (then improve on them), have a drawer full of useful bits, and you’re the one everyone calls when the Wi-Fi goes down.",
        fr: "Quand quelque chose casse, vous préférez le réparer plutôt que d’en racheter. Vous lisez le mode d’emploi (puis l’améliorez), avez un tiroir plein de petites pièces utiles, et c’est vous qu’on appelle quand le wifi ne marche plus.",
      }
    ),
  },
  slug: "what-type-of-witch",
  title: {
    en: "What type of witch are you?",
    fr: "Quel type de sorcière êtes-vous ?",
  },
};
