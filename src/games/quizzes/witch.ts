import type { Answer, Quiz, QuizResult } from "./quiz";

/**
 * What type of witch are you? Ten kinds of witch, as they show in everyday
 * life, and thirty-two questions of six answers. Each answer gives 2 points
 * to the witch it describes best, and half of them 1 to another it also fits.
 * Every witch is worth 48 points over all the answers and never twice in one
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
        en: "A bit of everything. No one path is enough for you: a little kitchen, a little chaos, a little of all of it, and you make it your own.",
        fr: "Un peu de tout. Aucune voie ne vous suffit : un peu cuisine, un peu chaos, un peu de tout, et vous en faites quelque chose de bien à vous.",
      }
    ),
    top: 3,
    within: 1,
  },
  blurb: {
    en: "Thirty-two questions, ten kinds of witch. Find out which one you are, and how much of the others.",
    fr: "Trente-deux questions, dix types de sorcière. Découvrez lequel est le vôtre, et ce que vous avez des autres.",
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
          { hedge: 1, sea: 2 }
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
          { fire: 1, love: 2 }
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
          { storm: 2 }
        ),
        answer(
          "A misty morning in the woods",
          "Un matin de brume dans les bois",
          { green: 1, hedge: 2 }
        ),
        answer(
          "A cold, clear night under a full moon",
          "Une nuit claire et froide sous la pleine lune",
          { love: 1, sea: 2 }
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
          { fire: 2 }
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
          { fire: 2, sea: 1 }
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
          { storm: 1, tinkering: 2 }
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
          { storm: 2 }
        ),
        answer(
          "A fresh, blooming spring in the garden",
          "Un printemps frais et fleuri au jardin",
          { green: 2 }
        ),
        answer(
          "A hot, golden summer under a blazing sun",
          "Un été chaud et doré sous un soleil de plomb",
          { chaos: 1, fire: 2 }
        ),
        answer(
          "A snowy winter by a warm stove",
          "Un hiver enneigé près d’un poêle bien chaud",
          { hearth: 2, kitchen: 1 }
        ),
        answer(
          "The quiet days between two seasons",
          "Les jours calmes entre deux saisons",
          { hedge: 2, tinkering: 1 }
        ),
        answer(
          "Long summer evenings by a warm sea",
          "De longues soirées d’été au bord d’une mer tiède",
          { love: 1, sea: 2 }
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
          { fire: 1, love: 2 }
        ),
        answer("Salty chips by the harbour", "Des frites salées sur le port", {
          sea: 2,
          storm: 1,
        }),
        answer(
          "A strange mix of whatever’s in the fridge",
          "Un drôle de mélange de ce qu’il y a dans le frigo",
          { chaos: 2, tinkering: 1 }
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
          { hedge: 2 }
        ),
        answer(
          "A rosy pink, like a first blush",
          "Un rose tendre, comme une première rougeur",
          { hearth: 1, love: 2 }
        ),
        answer("A deep midnight blue", "Un bleu nuit profond", {
          sea: 2,
          tinkering: 1,
        }),
        answer(
          "A fresh leaf green",
          "Un vert tendre, comme une jeune feuille",
          { green: 2 }
        ),
        answer(
          "Every colour at once, splashed everywhere",
          "Toutes les couleurs à la fois, éclaboussées partout",
          { chaos: 1, fire: 2 }
        ),
        answer(
          "A stormy purple, like the sky before rain",
          "Un violet d’orage, comme le ciel avant la pluie",
          { storm: 2 }
        ),
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
          "A water lily floating on a pond",
          "Un nénuphar qui flotte sur l’étang",
          { sea: 2 }
        ),
        answer(
          "A sprig of hawthorn from the hedgerow",
          "Un brin d’aubépine cueilli dans la haie",
          { hedge: 2, kitchen: 1 }
        ),
        answer(
          "A sprig of lavender for the linen cupboard",
          "Un brin de lavande pour l’armoire à linge",
          { hearth: 2 }
        ),
        answer(
          "A bright sunflower turning to the sun",
          "Un tournesol éclatant tourné vers le soleil",
          { chaos: 1, fire: 2 }
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
          { storm: 2 }
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
          { hedge: 2, sea: 1 }
        ),
        answer(
          "Lighting a little candle on the kitchen table",
          "Allumer une petite bougie sur la table de la cuisine",
          { fire: 2 }
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
          { kitchen: 1, tinkering: 2 }
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
          { kitchen: 2, love: 1 }
        ),
        answer(
          "A lucky acorn from the woods",
          "Un gland porte-bonheur ramassé dans les bois",
          { green: 1, hedge: 2 }
        ),
        answer(
          "A battered box of matches and a candle stub",
          "Une vieille boîte d’allumettes et un bout de bougie",
          { fire: 2 }
        ),
        answer(
          "A tiny screwdriver set for emergencies",
          "Un petit jeu de tournevis pour les urgences",
          { tinkering: 2 }
        ),
        answer(
          "A white feather caught in the wind",
          "Une plume blanche emportée par le vent",
          { sea: 1, storm: 2 }
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
          { hearth: 2, hedge: 1 }
        ),
        answer(
          "A stained cookbook full of handwritten notes",
          "Un livre de cuisine taché, plein de notes manuscrites",
          { kitchen: 2 }
        ),
        answer(
          "A thick atlas full of places to go",
          "Un gros atlas plein d’endroits où aller",
          { sea: 1, storm: 2 }
        ),
        answer(
          "A dog-eared romance novel",
          "Un roman d’amour aux pages cornées",
          { fire: 1, love: 2 }
        ),
        answer(
          "A field guide to wild plants",
          "Un guide des plantes sauvages",
          { green: 2 }
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
          { fire: 2 }
        ),
        answer(
          "A silver crescent pendant on a fine chain",
          "Un pendentif croissant de lune en argent sur une fine chaîne",
          { hedge: 1, sea: 2 }
        ),
        answer(
          "A heart-shaped locket with a photo inside",
          "Un médaillon en forme de cœur avec une photo à l’intérieur",
          { love: 2 }
        ),
        answer(
          "A tiny watch you rebuilt yourself",
          "Une petite montre que vous avez remontée vous-même",
          { storm: 1, tinkering: 2 }
        ),
        answer(
          "A stack of mismatched bracelets from everywhere",
          "Une pile de bracelets dépareillés venus de partout",
          { chaos: 2 }
        ),
        answer(
          "A dainty crown of fresh flowers",
          "Une délicate couronne de fleurs fraîches",
          { green: 2, hearth: 1 }
        ),
      ],
      prompt: { en: "Pick a piece of jewellery.", fr: "Choisissez un bijou." },
    },
    {
      answers: [
        answer(
          "A thatched cottage with roses round the door",
          "Une chaumière avec des roses autour de la porte",
          { hearth: 2 }
        ),
        answer(
          "A wooden cabin on stilts above the sea",
          "Une cabane en bois sur pilotis au-dessus de la mer",
          { sea: 2 }
        ),
        answer(
          "A secret treehouse high in the branches",
          "Une cabane secrète perchée dans les branches",
          { green: 2, tinkering: 1 }
        ),
        answer(
          "A tall stone tower on a windswept cliff",
          "Une haute tour de pierre sur une falaise battue par les vents",
          { fire: 1, storm: 2 }
        ),
        answer(
          "A colourful houseboat full of odd finds",
          "Une péniche colorée pleine de trouvailles insolites",
          { chaos: 2 }
        ),
        answer(
          "A little hut at the edge of the woods",
          "Une petite hutte à l’orée des bois",
          { hedge: 2, kitchen: 1 }
        ),
      ],
      prompt: { en: "Your dream house?", fr: "La maison de vos rêves ?" },
    },
    {
      answers: [
        answer(
          "By a crackling fire in the living room",
          "Près d’un feu qui crépite dans le salon",
          { fire: 1, hearth: 2 }
        ),
        answer(
          "In a lonely lighthouse above the waves",
          "Dans un phare solitaire au-dessus des vagues",
          { storm: 2 }
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
          { chaos: 2, hedge: 1 }
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
          { sea: 2 }
        ),
        answer("Chasing the northern lights", "Chasser les aurores boréales", {
          hedge: 1,
          storm: 2,
        }),
        answer(
          "Taking a cooking class with your love",
          "Prendre un cours de cuisine avec votre amour",
          { kitchen: 2, love: 1 }
        ),
        answer("Hiking up a smoking volcano", "Gravir un volcan qui fume", {
          fire: 2,
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
          { fire: 2, hedge: 1 }
        ),
        answer(
          "Hosting a cosy dinner for your friends",
          "Organiser un dîner douillet pour vos amis",
          { kitchen: 2, love: 1 }
        ),
        answer(
          "Moving all the furniture around on a whim",
          "Changer tous les meubles de place sur un coup de tête",
          { chaos: 2 }
        ),
        answer(
          "A long walk by the water at sunset",
          "Une longue promenade au bord de l’eau au coucher du soleil",
          { sea: 2, storm: 1 }
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
          { chaos: 1, storm: 2 }
        ),
        answer(
          "Big waves crashing on the rocks",
          "De grosses vagues qui se brisent sur les rochers",
          { sea: 2 }
        ),
        answer(
          "A crackling fire on a cold night",
          "Un feu qui crépite par une nuit froide",
          { fire: 2 }
        ),
        answer(
          "A kettle whistling in the kitchen",
          "Une bouilloire qui siffle dans la cuisine",
          { kitchen: 2, tinkering: 1 }
        ),
        answer(
          "Sweet birdsong in the garden at dawn",
          "Un doux chant d’oiseaux au jardin à l’aube",
          { green: 2 }
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
          { fire: 2 }
        ),
        answer(
          "Sweet vanilla with a hint of rose",
          "Une douce vanille avec une touche de rose",
          { hearth: 1, love: 2 }
        ),
        answer(
          "Fresh pine from a snowy forest",
          "Du pin frais d’une forêt enneigée",
          { green: 2, storm: 1 }
        ),
        answer(
          "Warm apple pie with cinnamon",
          "Une tarte aux pommes tiède à la cannelle",
          { kitchen: 2 }
        ),
        answer(
          "Soft jasmine that blooms at night",
          "Un jasmin doux qui fleurit la nuit",
          { sea: 2 }
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
          { sea: 2 }
        ),
        answer(
          "A beeswax candle carved with runes",
          "Une bougie en cire d’abeille gravée de runes",
          { fire: 1, hedge: 2 }
        ),
        answer(
          "Framed photos of the people you love",
          "Des photos encadrées de ceux que vous aimez",
          { hearth: 1, love: 2 }
        ),
        answer(
          "A dusty jar of odds and ends from your travels",
          "Un vieux bocal de bric-à-brac rapporté de vos voyages",
          { chaos: 2 }
        ),
        answer(
          "A glass jar of rainwater from the last storm",
          "Un bocal en verre d’eau de pluie du dernier orage",
          { storm: 2 }
        ),
        answer(
          "A fresh bundle of thyme from the garden",
          "Un bouquet de thym frais du jardin",
          { green: 1, kitchen: 2 }
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
          { tinkering: 2 }
        ),
        answer(
          "A rusty toolbox full of odd screws",
          "Une vieille boîte à outils pleine de vis dépareillées",
          { chaos: 2 }
        ),
        answer(
          "A silver bowl of water for scrying",
          "Un bol d’argent rempli d’eau pour la divination",
          { hedge: 2, sea: 1 }
        ),
        answer(
          "An old broom to sweep out bad luck",
          "Un vieux balai pour chasser la malchance",
          { hearth: 2, love: 1 }
        ),
        answer(
          "A sturdy pair of binoculars for birdwatching",
          "Une bonne paire de jumelles pour observer les oiseaux",
          { green: 2, storm: 1 }
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
          { love: 2 }
        ),
        answer(
          "A brand-new spell of your own invention",
          "Un tout nouveau sort de votre invention",
          { chaos: 2, fire: 1 }
        ),
        answer(
          "A gentle mending charm for broken things",
          "Un doux charme de réparation pour les choses cassées",
          { hearth: 1, tinkering: 2 }
        ),
        answer(
          "A wild weather spell to call up a storm",
          "Un sort sauvage pour déclencher une tempête",
          { sea: 1, storm: 2 }
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
          { chaos: 1, storm: 2 }
        ),
        answer(
          "In a waterproof chest buried on the beach",
          "Dans un coffre étanche enterré sur la plage",
          { fire: 1, sea: 2 }
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
          { kitchen: 2, love: 1 }
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
          { fire: 2 }
        ),
        answer(
          "A clever raven who steals shiny things",
          "Un corbeau malin qui vole tout ce qui brille",
          { chaos: 1, storm: 2 }
        ),
        answer(
          "A pale moth drawn to the moonlight",
          "Un papillon de nuit pâle attiré par la lune",
          { hedge: 2, love: 1 }
        ),
        answer(
          "A clockwork owl you built yourself",
          "Une chouette mécanique de votre fabrication",
          { tinkering: 2 }
        ),
        answer(
          "A grey seal who visits at high tide",
          "Un phoque gris qui vient à marée haute",
          { sea: 2 }
        ),
      ],
      prompt: { en: "Your familiar is…", fr: "Votre familier, c’est…" },
    },
    {
      answers: [
        answer(
          "Smooth sea glass from the shore",
          "Du verre de mer poli ramassé sur le rivage",
          { green: 1, sea: 2 }
        ),
        answer(
          "Old remedies in faded ink",
          "De vieux remèdes à l’encre pâlie",
          { hearth: 1, hedge: 2 }
        ),
        answer(
          "Curious bits and bobs from everywhere",
          "De curieux bibelots venus de partout",
          { chaos: 2, tinkering: 1 }
        ),
        answer(
          "Birthday cards from everyone you love",
          "Les cartes d’anniversaire de tous ceux que vous aimez",
          { love: 2 }
        ),
        answer(
          "Homemade jam in the pantry",
          "De la confiture maison dans le garde-manger",
          { kitchen: 2 }
        ),
        answer(
          "Candles in every colour",
          "Des bougies de toutes les couleurs",
          { fire: 2 }
        ),
      ],
      prompt: { en: "What do you collect?", fr: "Que collectionnez-vous ?" },
    },
    {
      answers: [
        answer("Under a bright full moon", "Sous une pleine lune éclatante", {
          love: 2,
        }),
        answer(
          "In the eye of a wild storm at sea",
          "Dans l’œil d’une tempête en pleine mer",
          { sea: 1, storm: 2 }
        ),
        answer(
          "When the candles are lit in a quiet house",
          "Quand les bougies sont allumées dans une maison calme",
          { hearth: 2 }
        ),
        answer(
          "When you’ve just fixed something nobody else could",
          "Quand vous venez de réparer ce que personne d’autre n’arrivait à réparer",
          { tinkering: 2 }
        ),
        answer(
          "In the early dawn, with dew on the flowers",
          "Au petit matin, quand la rosée couvre les fleurs",
          { green: 2, kitchen: 1 }
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
          { hearth: 1, sea: 2 }
        ),
        answer(
          "A wild temper that changes the weather",
          "Un tempérament sauvage qui change la météo",
          { storm: 2 }
        ),
        answer(
          "Healing hands that soothe any ache",
          "Des mains guérisseuses qui apaisent toutes les douleurs",
          { kitchen: 1, love: 2 }
        ),
        answer(
          "A sixth sense for ghosts and spirits",
          "Un sixième sens pour les fantômes et les esprits",
          { hedge: 2 }
        ),
        answer(
          "Energy that never runs out",
          "Une énergie qui ne s’épuise jamais",
          { chaos: 1, fire: 2 }
        ),
        answer(
          "A quick mind that learns anything",
          "Un esprit vif qui apprend tout",
          { green: 1, tinkering: 2 }
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
          { hedge: 1, love: 2 }
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
          { fire: 2, storm: 1 }
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
          { storm: 2 }
        ),
        answer(
          "Tidying the whole house from top to bottom",
          "Ranger toute la maison de fond en comble",
          { hearth: 2, tinkering: 1 }
        ),
        answer(
          "Going for a swim to clear your head",
          "Aller nager pour se vider la tête",
          { green: 1, sea: 2 }
        ),
        answer(
          "Crying it out under the night sky",
          "Pleurer un bon coup sous le ciel nocturne",
          { love: 2 }
        ),
        answer(
          "Dyeing your hair a wild new colour",
          "Teindre vos cheveux d’une nouvelle couleur folle",
          { chaos: 1, fire: 2 }
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
        }),
        answer("Made to be broken", "Faites pour être enfreintes", {
          chaos: 2,
          fire: 1,
        }),
        answer(
          "There for a reason: they keep things working",
          "Là pour une raison : ils font que tout fonctionne",
          { kitchen: 1, tinkering: 2 }
        ),
        answer(
          "Best when everyone at home agrees on them",
          "Meilleures quand toute la maison est d’accord",
          { hearth: 2 }
        ),
        answer(
          "Like the tides, always changing",
          "Comme les marées, toujours changeantes",
          { sea: 1, storm: 2 }
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
          { fire: 1, love: 2 }
        ),
        answer("Keeping wild places wild", "En protégeant les lieux sauvages", {
          green: 2,
        }),
        answer(
          "Rearranging the stars, just for fun",
          "En réarrangeant les étoiles, pour le plaisir",
          { chaos: 2, storm: 1 }
        ),
        answer(
          "Keeping every home warm and every table full",
          "En gardant chaque foyer au chaud et chaque table bien garnie",
          { hearth: 1, kitchen: 2 }
        ),
        answer("Fixing what’s broken", "En réparant ce qui est cassé", {
          tinkering: 2,
        }),
        answer(
          "Cleaning up every beach and ocean",
          "Nettoyer toutes les plages et tous les océans",
          { sea: 2 }
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
          { sea: 1, storm: 2 }
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
          { fire: 2, love: 1 }
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
    chaos: result(
      { en: "Chaos witch", fr: "Sorcière du chaos" },
      {
        en: "Spontaneous and full of surprises. You improvise, change plans at the last minute and make something good out of the mess: rules are more of a suggestion.",
        fr: "Spontanée et pleine de surprises. Vous improvisez, changez de plan au dernier moment et tirez quelque chose de bon du désordre : les règles, pour vous, sont des suggestions.",
      }
    ),
    fire: result(
      { en: "Fire witch", fr: "Sorcière du feu" },
      {
        en: "Outgoing and full of energy. You light up a room, say what you think and throw yourself into things, and people warm up just being around you.",
        fr: "Extravertie et pleine d’énergie. Vous illuminez une pièce, dites ce que vous pensez et vous lancez à fond, et on se réchauffe rien qu’à être près de vous.",
      }
    ),
    green: result(
      { en: "Green witch", fr: "Sorcière verte" },
      {
        en: "Plants and nature. Your windowsill is a jungle, you know the trees on your street by name, and an hour outside fixes almost anything.",
        fr: "Les plantes et la nature. Votre rebord de fenêtre est une jungle, vous connaissez les arbres de votre rue par leur nom, et une heure dehors règle presque tout.",
      }
    ),
    hearth: result(
      { en: "Hearth witch", fr: "Sorcière du foyer" },
      {
        en: "Home and the people in it. Your home is a cosy little haven, you treasure your quiet time, and you look after your family, your friends and the people you love.",
        fr: "La maison et ceux qui l’habitent. Votre foyer est un petit refuge douillet, vous chérissez vos moments au calme, et vous prenez soin de votre famille, de vos amis et de ceux que vous aimez.",
      }
    ),
    hedge: result(
      { en: "Hedge witch", fr: "Sorcière des haies" },
      {
        en: "Ancestors, spirits and old ways. You keep family stories and old remedies alive, trust your gut, and feel close to those who came before you.",
        fr: "Les ancêtres, les esprits et les traditions. Vous faites vivre les histoires de famille et les vieux remèdes, écoutez votre intuition et vous sentez proche de ceux qui étaient là avant vous.",
      }
    ),
    kitchen: result(
      { en: "Kitchen witch", fr: "Sorcière de cuisine" },
      {
        en: "Healing with food. A soup for a cold, a cake for a bad day: you show your love by feeding people, and your kitchen is where the magic happens.",
        fr: "Soigner par la cuisine. Une soupe pour un rhume, un gâteau pour un mauvais jour : vous montrez votre amour en nourrissant les gens, et c’est dans votre cuisine que la magie opère.",
      }
    ),
    love: result(
      { en: "Love witch", fr: "Sorcière de l’amour" },
      {
        en: "In tune with how people feel. You notice someone is sad before they say a word, give the best hugs and the best advice, and love with your whole heart.",
        fr: "À l’écoute de ce que ressentent les autres. Vous voyez qu’on est triste avant qu’on dise un mot, faites les meilleurs câlins et donnez les meilleurs conseils, et vous aimez de tout votre cœur.",
      }
    ),
    sea: result(
      { en: "Sea witch", fr: "Sorcière des mers" },
      {
        en: "Calm, like water. You take things as they come and go with the flow, and the sound of waves (or a long bath) puts everything back in its place.",
        fr: "Calme comme l’eau. Vous prenez les choses comme elles viennent et suivez le courant, et le bruit des vagues (ou un long bain) remet tout à sa place.",
      }
    ),
    storm: result(
      { en: "Storm witch", fr: "Sorcière des tempêtes" },
      {
        en: "Restless and intense. You’re always on the move, change your mind like the weather, and feel most alive when things get wild.",
        fr: "Intense et jamais en place. Vous êtes toujours en mouvement, changez d’avis comme le temps change, et ne vous sentez jamais aussi vivante que quand tout s’agite.",
      }
    ),
    tinkering: result(
      { en: "Tinkering witch", fr: "Sorcière bricoleuse" },
      {
        en: "Practical and logical. You fix what’s broken, take things apart to see how they work and always have the right tool: your magic is making things work.",
        fr: "Pratique et logique. Vous réparez ce qui est cassé, démontez les choses pour voir comment elles marchent et avez toujours le bon outil : votre magie, c’est de faire fonctionner les choses.",
      }
    ),
  },
  slug: "what-type-of-witch",
  title: {
    en: "What type of witch are you?",
    fr: "Quel type de sorcière êtes-vous ?",
  },
};
