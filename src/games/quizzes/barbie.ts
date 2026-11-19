import type { Answer, Quiz, QuizResult, Words } from "./quiz";

/**
 * Which Barbie character are you? Three eras of the animated Barbie films, and
 * the visitor picks any of them before the questions:
 *
 * - Heroines: the named characters Barbie plays, 2001 to 2015. One result per
 *   character however many films she is in, and only the blonde Barbie's role
 *   where a film has two leads.
 * - Barbie as herself: one result per film or series where she is Barbie
 *   Roberts, 2010 to 2020, each the Barbie of that film.
 * - Barbie and Brooklyn: Barbie "Malibu" Roberts and Barbie "Brooklyn" Roberts,
 *   from 2021.
 *
 * Twenty questions of six answers. Each answer gives one heroine 2 points and
 * most another 1, and many do the same for the Barbies of the other two eras.
 * No result is named twice in a question, so whatever the answers, each has
 * the same chance (one answer in however many are shown); a result's score is
 * its share of the most it could have scored (`eraScores`), so results of
 * different eras compare fairly. Every heroine and every Barbie of the second
 * era is worth 18 points, and each can come out on top with any eras chosen.
 */
const answer = (
  en: string,
  fr: string,
  points: Record<string, number>
): Answer => ({ points, text: { en, fr } });

/** A result, opening with the films it is from, their English titles and years. */
const result =
  (era: string) =>
  (name: Words, film: string, en: string, fr: string): QuizResult => ({
    about: {
      en: `From ${film}. ${en}`,
      fr: `Dans ${film}. ${fr}`,
    },
    era,
    name,
  });

const heroine = (name: string, film: string, en: string, fr: string) =>
  result("heroines")({ en: name, fr: name }, film, en, fr);

const herself = result("herself");
const twoBarbies = result("malibu-brooklyn");

export const BARBIE_QUIZ: Quiz = {
  blurb: {
    en: "Twenty questions and the Barbies of three eras of films: pick your eras, and find out which one you are.",
    fr: "Vingt questions et les Barbie de trois époques de films : choisissez vos époques, et découvrez laquelle vous êtes.",
  },
  eras: [
    {
      about: {
        en: "Barbie plays a heroine with her own name: Clara, Odette, Mariposa, Merliah… (2001–2015)",
        fr: "Barbie joue une héroïne qui a son propre nom : Clara, Odette, Mariposa, Merliah… (2001–2015)",
      },
      id: "heroines",
      name: { en: "Old school", fr: "À l’ancienne" },
    },
    {
      about: {
        en: "Barbie Roberts in her own adventures, from A Fashion Fairytale to Princess Adventure (2010–2020)",
        fr: "Barbie Roberts dans ses propres aventures, de A Fashion Fairytale à Princess Adventure (2010–2020)",
      },
      id: "herself",
      name: { en: "Barbie as herself", fr: "Barbie elle-même" },
    },
    {
      about: {
        en: "The two Barbies, Malibu and Brooklyn, from Big City, Big Dreams on (2021–). On its own, it’s twelve questions on their films and your Malibu–Brooklyn split.",
        fr: "Les deux Barbie, Malibu et Brooklyn, depuis Big City, Big Dreams (2021–). Seule, c’est douze questions sur leurs films et votre part de Malibu et de Brooklyn.",
      },
      even: {
        about: {
          en: "Half Malibu, half Brooklyn: as sunny and stage-ready as one, as creative and down to earth as the other. No wonder the two of them make such a good team.",
          fr: "Moitié Malibu, moitié Brooklyn : aussi solaire et prête pour la scène que l’une, aussi créative et les pieds sur terre que l’autre. Pas étonnant qu’elles forment une si bonne équipe.",
        },
        era: "malibu-brooklyn",
        name: {
          en: "Half Malibu, half Brooklyn",
          fr: "Moitié Malibu, moitié Brooklyn",
        },
      },
      id: "malibu-brooklyn",
      name: { en: "Barbie and Brooklyn", fr: "Barbie et Brooklyn" },
      // Played alone, the era asks about moments across all the films with the
      // two Barbies, each answer leaning to Malibu or to Brooklyn, and the
      // result is the split between them. Both are worth 36 points.
      questions: [
        {
          answers: [
            answer(
              "Already know the shortcut and the best bagels nearby",
              "Connaissez déjà le raccourci et les meilleurs bagels du coin",
              { brooklyn: 3 }
            ),
            answer(
              "Take in every room, a little starstruck",
              "Découvrez chaque salle, un peu éblouie",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Arrive early, smile at everyone and ask where the stage is",
              "Arrivez en avance, souriez à tout le monde et demandez où est la scène",
              { malibu: 3 }
            ),
            answer(
              "Find an empty practice room and start writing",
              "Trouvez une salle de répétition vide et commencez à écrire",
              { brooklyn: 2, malibu: 1 }
            ),
          ],
          prompt: {
            en: "First day at a performing arts summer school in New York. You…",
            fr: "Premier jour dans une école d’été des arts de la scène à New York. Vous…",
          },
        },
        {
          answers: [
            answer(
              "Suggest you sing it together",
              "Proposez de le chanter ensemble",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Rewrite the song so it fits two voices",
              "Réécrivez la chanson pour deux voix",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "Tell her straight: may the best voice win, no hard feelings",
              "Lui dites franchement : que la meilleure voix gagne, sans rancune",
              { brooklyn: 3 }
            ),
            answer(
              "Practise until it’s perfect, and cheer for her too",
              "Répétez jusqu’à la perfection, en l’encourageant aussi",
              { malibu: 3 }
            ),
          ],
          prompt: {
            en: "You and a new friend both want the solo in the showcase. You…",
            fr: "Une nouvelle amie et vous voulez toutes les deux le solo du spectacle. Vous…",
          },
        },
        {
          answers: [
            answer(
              "Keeps the calendar so you both make every audition",
              "Tenez l’agenda pour que vous alliez toutes les deux à chaque audition",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Decorates, plans the parties and makes the smoothies",
              "Décorez, organisez les fêtes et préparez les smoothies",
              { malibu: 3 }
            ),
            answer(
              "Fixes whatever breaks and finds the best food in town",
              "Réparez tout ce qui casse et trouvez où bien manger en ville",
              { brooklyn: 3 }
            ),
            answer(
              "Turns the spare room into a little studio",
              "Transformez la chambre d’amis en petit studio",
              { brooklyn: 2, malibu: 1 }
            ),
          ],
          prompt: {
            en: "Sharing a house with your new best friend, you’re the one who…",
            fr: "En colocation avec votre nouvelle meilleure amie, c’est vous qui…",
          },
        },
        {
          answers: [
            answer(
              "Swim off to explore the deepest trench on your own",
              "Partez seule explorer la fosse la plus profonde",
              { brooklyn: 3 }
            ),
            answer(
              "Find out what the old rules really mean before following them",
              "Cherchez ce que veulent vraiment dire les vieilles règles avant de les suivre",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "Lead a welcome parade for every new guardian",
              "Menez une parade d’accueil pour chaque nouvelle gardienne",
              { malibu: 3 }
            ),
            answer(
              "Make sure everyone gets a fair turn",
              "Veillez à ce que chacune ait sa chance",
              { brooklyn: 1, malibu: 2 }
            ),
          ],
          prompt: {
            en: "Chosen as a mer-guardian of an undersea kingdom, you’d…",
            fr: "Choisie comme gardienne d’un royaume sous-marin, vous…",
          },
        },
        {
          answers: [
            answer(
              "The map, with a few detours only you know",
              "De la carte, avec quelques détours que vous seule connaissez",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "The playlist, and the singing along",
              "De la playlist, et de chanter avec",
              { malibu: 3 }
            ),
            answer(
              "The photo stops at every pretty view",
              "Des arrêts photo à chaque joli paysage",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Finding tiny diners and local bands",
              "De dénicher les petits restos et les groupes du coin",
              { brooklyn: 3 }
            ),
          ],
          prompt: {
            en: "On a road trip across the country, you’re in charge of…",
            fr: "Pendant un road trip à travers le pays, vous vous occupez…",
          },
        },
        {
          answers: [
            answer(
              "Read everything you can about where it came from",
              "Lisez tout ce que vous pouvez sur son origine",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "Keep it secret and work out how to get it home",
              "Gardez le secret et cherchez comment le ramener chez lui",
              { brooklyn: 3 }
            ),
            answer(
              "Name it, hug it and plan its first flying lesson",
              "Lui donnez un nom, le câlinez et prévoyez sa première leçon de vol",
              { malibu: 3 }
            ),
            answer(
              "Call your friends over: this needs a team",
              "Appelez vos amis : il faut toute une équipe",
              { brooklyn: 1, malibu: 2 }
            ),
          ],
          prompt: {
            en: "A baby pegasus lands in your garden. You…",
            fr: "Un bébé pégase atterrit dans votre jardin. Vous…",
          },
        },
        {
          answers: [
            answer(
              "Taste every batch and cheer her on",
              "Goûtez chaque fournée en l’encourageant",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Write her a theme song for the night",
              "Lui écrivez une chanson pour la soirée",
              { brooklyn: 3 }
            ),
            answer(
              "Ask her family for stories: the secret is in the memories",
              "Demandez des souvenirs à sa famille : le secret est là",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "Throw a cooking party and invite everyone",
              "Organisez une fête en cuisine et invitez tout le monde",
              { malibu: 3 }
            ),
          ],
          prompt: {
            en: "A friend has to recreate her family’s recipe for a big opening night. You…",
            fr: "Une amie doit retrouver la recette de sa famille pour une grande inauguration. Vous…",
          },
        },
        {
          answers: [
            answer(
              "A tiny club where everyone hears every word",
              "Un petit club où chacun entend chaque mot",
              { brooklyn: 3 }
            ),
            answer(
              "Broadway, under the bright lights",
              "Broadway, sous les projecteurs",
              { malibu: 3 }
            ),
            answer(
              "A rooftop gig at sunset",
              "Un concert sur un toit au coucher du soleil",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "A stadium full of people singing along",
              "Un stade plein de gens qui chantent avec vous",
              { brooklyn: 1, malibu: 2 }
            ),
          ],
          prompt: {
            en: "Your dream stage?",
            fr: "Votre scène de rêve ?",
          },
        },
        {
          answers: [
            answer(
              "Bake something that tastes like home",
              "Préparez un gâteau qui a le goût de la maison",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Write a song about the place you miss",
              "Écrivez une chanson sur l’endroit qui vous manque",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "Video-call home and show everyone the view",
              "Appelez la famille en vidéo pour lui montrer la vue",
              { malibu: 3 }
            ),
            answer(
              "Walk the city until it starts to feel like home",
              "Marchez dans la ville jusqu’à vous y sentir chez vous",
              { brooklyn: 3 }
            ),
          ],
          prompt: {
            en: "Homesick, you…",
            fr: "Quand vous avez le mal du pays, vous…",
          },
        },
        {
          answers: [
            answer(
              "Sundresses and sandals, whatever the weather",
              "Robes d’été et sandales, quel que soit le temps",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Trainers, a hoodie and plenty of attitude",
              "Baskets, sweat à capuche et beaucoup d’aplomb",
              { brooklyn: 3 }
            ),
            answer(
              "A denim jacket over anything",
              "Une veste en jean sur n’importe quoi",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "Bright colours and something sparkly",
              "Des couleurs vives et un peu de paillettes",
              { malibu: 3 }
            ),
          ],
          prompt: {
            en: "Your style?",
            fr: "Votre style ?",
          },
        },
        {
          answers: [
            answer(
              "Say it straight away: honest beats polite",
              "Le dites tout de suite : mieux vaut franche que polie",
              { brooklyn: 3 }
            ),
            answer(
              "Hug it out as soon as you can",
              "Vous réconciliez dans ses bras dès que possible",
              { malibu: 3 }
            ),
            answer(
              "Talk it through over a smoothie",
              "En parlez autour d’un smoothie",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "Take a walk first, then say what you really think",
              "Faites d’abord un tour, puis dites ce que vous pensez vraiment",
              { brooklyn: 2, malibu: 1 }
            ),
          ],
          prompt: {
            en: "When you disagree with your best friend, you…",
            fr: "Quand vous n’êtes pas d’accord avec votre meilleure amie, vous…",
          },
        },
        {
          answers: [
            answer(
              "Exploring a neighbourhood I’ve never been to",
              "Explorer un quartier où je ne suis jamais allée",
              { brooklyn: 3 }
            ),
            answer(
              "Brunch with friends, then shopping",
              "Un brunch entre amis, puis du shopping",
              { brooklyn: 1, malibu: 2 }
            ),
            answer(
              "A record shop, then the park with my notebook",
              "Un disquaire, puis le parc avec mon carnet",
              { brooklyn: 2, malibu: 1 }
            ),
            answer(
              "The beach, the sun and a game of volleyball",
              "La plage, le soleil et une partie de volley",
              { malibu: 3 }
            ),
          ],
          prompt: {
            en: "Your perfect day off?",
            fr: "Votre jour de repos idéal ?",
          },
        },
      ],
    },
  ],
  legend: "barbie-heroine.txt",
  questions: [
    {
      answers: [
        answer(
          "Painting something huge and bold, just to see if I can",
          "Peindre quelque chose d’immense et d’audacieux, juste pour voir si j’en suis capable",
          { alexa: 1, brooklyn: 2, fashionFairytale: 2, rapunzel: 2 }
        ),
        answer(
          "A quiet walk by a lake, feeding the birds",
          "Une balade tranquille au bord d’un lac, en nourrissant les oiseaux",
          { elina: 1, odette: 2, princessAdventure: 2 }
        ),
        answer(
          "Curling up with an old storybook and wishing I could step inside",
          "Me blottir avec un vieux livre de contes en rêvant d’y entrer",
          { annika: 1, clara: 2, puppyAdventure: 2 }
        ),
        answer(
          "Reading in the garden, among the butterflies",
          "Lire au jardin, au milieu des papillons",
          { fairySecret: 2, liana: 1, mariposa: 2 }
        ),
        answer(
          "Catching the first waves at sunrise",
          "Attraper les premières vagues au lever du soleil",
          { eden: 1, malibu: 2, merliah: 2, puppyChase: 2 }
        ),
        answer(
          "Exploring a beach I’ve never seen, barefoot",
          "Explorer pieds nus une plage que je ne connais pas",
          { dolphinMagic: 1, lumina: 1, ponyTale: 2, rosella: 2 }
        ),
      ],
      prompt: {
        en: "Your perfect free morning?",
        fr: "Votre matinée libre idéale ?",
      },
    },
    {
      answers: [
        answer(
          "Find a clever way round the rules, then tell no one",
          "Trouver une astuce pour contourner les règles, sans le dire à personne",
          { alexa: 1, brooklyn: 2, fairySecret: 1, mariposa: 2 }
        ),
        answer(
          "Go anyway, and face whatever happens",
          "Y aller quand même, et affronter ce qui arrive",
          { clara: 2, kristyn: 1, puppyAdventure: 1 }
        ),
        answer(
          "Ask my sisters to come along: we’re stronger together",
          "Demander à mes sœurs de venir : ensemble, on est plus fortes",
          { anneliese: 1, genevieve: 2, perfectChristmas: 1, puppyChase: 2 }
        ),
        answer(
          "Slip out and help, even if no one believes in me yet",
          "M’éclipser pour aider, même si personne ne croit encore en moi",
          { elina: 2, odette: 1, starLight: 1 }
        ),
        answer(
          "Practise in secret until I’m good enough to prove them wrong",
          "M’entraîner en secret jusqu’à leur prouver qu’ils ont tort",
          { corinne: 2, kara: 1, spySquad: 2, videoGame: 1 }
        ),
        answer(
          "Paddle out to sea: the answer’s out there somewhere",
          "Pagayer vers le large : la réponse est quelque part là-bas",
          { dolphinMagic: 2, malibu: 2, merliah: 2, rosella: 1 }
        ),
      ],
      prompt: {
        en: "Someone tells you you’re not allowed to go. You…",
        fr: "On vous dit que vous n’avez pas le droit d’y aller. Vous…",
      },
    },
    {
      answers: [
        answer("A pair of ice skates", "Une paire de patins à glace", {
          annika: 2,
          odette: 1,
          starLight: 1,
        }),
        answer(
          "A surfboard, always waxed",
          "Une planche de surf, toujours fartée",
          { lumina: 1, malibu: 2, merliah: 2 }
        ),
        answer(
          "A box of rocks and crystals, each one labelled",
          "Une boîte de pierres et de cristaux, chacune étiquetée",
          { anneliese: 2, blair: 1, princessAdventure: 1 }
        ),
        answer(
          "Brushes and paints, a little worn",
          "Des pinceaux et des couleurs, un peu usés",
          { brooklyn: 2, rapunzel: 2, rosella: 1 }
        ),
        answer(
          "A pressed flower from a secret meadow",
          "Une fleur séchée d’une prairie secrète",
          { elina: 2, fairySecret: 2, mariposa: 1, ponyTale: 1 }
        ),
        answer("A sparkling microphone", "Un micro qui brille", {
          courtney: 1,
          eden: 2,
          fashionFairytale: 2,
        }),
      ],
      prompt: {
        en: "Which treasure would you never part with?",
        fr: "De quel trésor ne vous sépareriez-vous jamais ?",
      },
    },
    {
      answers: [
        answer(
          "The clever one who keeps the kingdom running",
          "Celle, maligne, qui fait tourner le royaume",
          { anneliese: 2, brooklyn: 2, genevieve: 1, princessAdventure: 2 }
        ),
        answer(
          "The one who befriends every creature in the forest",
          "Celle qui se lie d’amitié avec toutes les créatures de la forêt",
          { elina: 2, rosella: 1 }
        ),
        answer(
          "The ordinary princess with a secret superhero side",
          "La princesse ordinaire qui cache un côté super-héroïne",
          { corinne: 1, kara: 2, spySquad: 2, videoGame: 1 }
        ),
        answer(
          "The sporty one who’d rather be outdoors",
          "La sportive qui préfère être dehors",
          { lumina: 1, malibu: 2, merliah: 2, ponyTale: 1, puppyChase: 2 }
        ),
        answer(
          "The loyal friend who shares everything",
          "L’amie fidèle qui partage tout",
          { blair: 1, dreamhouse: 1, liana: 2, perfectChristmas: 2 }
        ),
        answer(
          "The curious one who wanders off into an adventure",
          "La curieuse qui s’égare dans une aventure",
          { annika: 1, clara: 2, puppyAdventure: 2 }
        ),
      ],
      prompt: {
        en: "In a fairy tale, you’d be…",
        fr: "Dans un conte, vous seriez…",
      },
    },
    {
      answers: [
        answer(
          "Jump in first and work out the plan on the way",
          "Foncer la première et trouver le plan en route",
          { corinne: 2, merliah: 1, spySquad: 1, videoGame: 2 }
        ),
        answer(
          "Keep going, even when I’m scared",
          "Continuer, même quand j’ai peur",
          { annika: 2, kara: 1, ponyTale: 1 }
        ),
        answer(
          "Read up on it, then solve it calmly",
          "Me documenter, puis régler ça calmement",
          { anneliese: 2, brooklyn: 2, dreamhouse: 2, mariposa: 1 }
        ),
        answer(
          "Stay light on my feet and look for the rhythm in it",
          "Rester légère et chercher le rythme de la chose",
          { genevieve: 2, kristyn: 1 }
        ),
        answer(
          "Make it into a song and sing it out loud",
          "En faire une chanson et la chanter à pleine voix",
          {
            courtney: 1,
            eden: 2,
            fairySecret: 1,
            malibu: 2,
            perfectChristmas: 2,
          }
        ),
        answer(
          "Ask the animals: they always know something",
          "Demander aux animaux : ils savent toujours quelque chose",
          { elina: 1, puppyAdventure: 2, rosella: 2 }
        ),
      ],
      prompt: {
        en: "Facing a real challenge, you…",
        fr: "Face à un vrai défi, vous…",
      },
    },
    {
      answers: [
        answer(
          "Waltzing in a grand hall, with my sisters close",
          "Valser dans une grande salle, avec mes sœurs tout près",
          { clara: 2, kristyn: 1, perfectChristmas: 2, puppyAdventure: 1 }
        ),
        answer(
          "Singing a duet with my best friend",
          "Chanter en duo avec ma meilleure amie",
          { courtney: 1, dreamhouse: 2, liana: 2 }
        ),
        answer(
          "Making my first grand entrance, with pearls glowing in my hair",
          "Faire ma toute première grande entrée, des perles lumineuses dans les cheveux",
          { lumina: 2, merliah: 1 }
        ),
        answer(
          "Stepping into the spotlight, with the whole team behind me",
          "Entrer dans la lumière, avec toute l’équipe derrière moi",
          { corinne: 1, eden: 2, malibu: 2, spySquad: 1 }
        ),
        answer(
          "Painting a backdrop full of hidden butterflies",
          "Peindre un décor rempli de papillons cachés",
          {
            brooklyn: 2,
            fairySecret: 1,
            fashionFairytale: 2,
            mariposa: 1,
            rapunzel: 2,
          }
        ),
        answer(
          "Twirling by the water, on tiptoe",
          "Tourbillonner au bord de l’eau, sur la pointe des pieds",
          { dolphinMagic: 1, elina: 2, odette: 1, starLight: 2 }
        ),
      ],
      prompt: {
        en: "At a ball, where are you?",
        fr: "Au bal, où êtes-vous ?",
      },
    },
    {
      answers: [
        answer(
          "Someone who stands by me, whatever happens",
          "Quelqu’un qui reste à mes côtés, quoi qu’il arrive",
          { blair: 1, liana: 2 }
        ),
        answer(
          "Someone who’s honest with me and helps me grow",
          "Quelqu’un d’honnête qui m’aide à grandir",
          { anneliese: 2, brooklyn: 2, dreamhouse: 1, rapunzel: 1 }
        ),
        answer(
          "A furry, feathered or finned best friend",
          "Un meilleur ami à poils, à plumes ou à nageoires",
          {
            dolphinMagic: 1,
            malibu: 2,
            merliah: 1,
            puppyAdventure: 2,
            rosella: 2,
          }
        ),
        answer(
          "Someone who gives me a second chance",
          "Quelqu’un qui me laisse une seconde chance",
          { eden: 2, fairySecret: 2, tori: 1 }
        ),
        answer(
          "A crew I can count on in a fight",
          "Une équipe sur qui compter dans la bataille",
          { corinne: 2, kara: 1, spySquad: 2, videoGame: 1 }
        ),
        answer(
          "Someone who believes I’m braver than I think",
          "Quelqu’un qui me croit plus courageuse que je ne pense",
          { annika: 1, odette: 2, ponyTale: 2, princessAdventure: 1 }
        ),
      ],
      prompt: {
        en: "What matters most to you in a friend?",
        fr: "Qu’est-ce qui compte le plus pour vous chez une amie ?",
      },
    },
    {
      answers: [
        answer(
          "A cosy reading nook full of maps and fairy tales",
          "Un coin lecture douillet rempli de cartes et de contes",
          { fairySecret: 2, liana: 1, mariposa: 2 }
        ),
        answer(
          "A ballroom with a floor that gleams",
          "Une salle de bal au parquet qui brille",
          { genevieve: 2, kristyn: 1 }
        ),
        answer(
          "A theatre stage with velvet curtains",
          "Une scène de théâtre aux rideaux de velours",
          { eden: 2, tori: 1 }
        ),
        answer(
          "A sunny studio with a view over the hills",
          "Un atelier ensoleillé avec vue sur les collines",
          { alexa: 1, fashionFairytale: 1, rapunzel: 2 }
        ),
        answer(
          "A quiet glade where swans come to rest",
          "Une clairière tranquille où les cygnes viennent se poser",
          {
            annika: 1,
            brooklyn: 2,
            odette: 2,
            ponyTale: 1,
            princessAdventure: 2,
          }
        ),
        answer(
          "A treehouse by the sea, open to every animal",
          "Une cabane dans les arbres face à la mer, ouverte à tous les animaux",
          {
            dolphinMagic: 1,
            lumina: 1,
            malibu: 2,
            puppyAdventure: 2,
            rosella: 2,
          }
        ),
      ],
      prompt: {
        en: "Your dream room in the castle?",
        fr: "Votre pièce de rêve au château ?",
      },
    },
    {
      answers: [
        answer(
          "Read to my younger sisters until they fall asleep",
          "Faire la lecture à mes petites sœurs jusqu’à ce qu’elles s’endorment",
          { anneliese: 1, genevieve: 2, perfectChristmas: 2, puppyChase: 1 }
        ),
        answer(
          "Write in my journal by candlelight",
          "Écrire dans mon journal à la lueur d’une bougie",
          { alexa: 1, brooklyn: 2, mariposa: 2 }
        ),
        answer(
          "Play music with my best friend",
          "Jouer de la musique avec ma meilleure amie",
          { courtney: 1, dreamhouse: 1, liana: 2, malibu: 2 }
        ),
        answer(
          "Wander through the woods, talking to the fireflies",
          "Me promener dans les bois en parlant aux lucioles",
          { elina: 2, fairySecret: 2, odette: 1, puppyAdventure: 1 }
        ),
        answer(
          "Studying late for tomorrow’s lessons, with a cup of tea",
          "Réviser tard pour les cours du lendemain, avec une tasse de thé",
          { blair: 2, princessAdventure: 1, tori: 1 }
        ),
        answer(
          "Skate on the frozen lake under the stars",
          "Patiner sur le lac gelé sous les étoiles",
          { annika: 2, clara: 1, ponyTale: 1, starLight: 2 }
        ),
      ],
      prompt: {
        en: "On a long winter evening, you…",
        fr: "Par une longue soirée d’hiver, vous…",
      },
    },
    {
      answers: [
        answer(
          "Decorating every corner, and inviting everyone",
          "Décorer chaque recoin, et inviter tout le monde",
          { eden: 2, fairySecret: 1, perfectChristmas: 2, tori: 1 }
        ),
        answer(
          "Making handmade gifts, each one a little painting",
          "Fabriquer des cadeaux faits main, chacun une petite peinture",
          { alexa: 1, brooklyn: 2, fashionFairytale: 2, rapunzel: 2 }
        ),
        answer(
          "A snowball fight, then a race to the hot chocolate",
          "Une bataille de boules de neige, puis une course jusqu’au chocolat chaud",
          { corinne: 2, merliah: 1, spySquad: 1, videoGame: 2 }
        ),
        answer(
          "Planning a dinner for the whole village",
          "Organiser un dîner pour tout le village",
          { anneliese: 2, blair: 1, dreamhouse: 2, princessAdventure: 1 }
        ),
        answer(
          "Sledging down the biggest hill there is",
          "Descendre en luge la plus grande colline qui soit",
          { annika: 2, clara: 1, ponyTale: 2 }
        ),
        answer(
          "Dancing round the tree with the people I love",
          "Danser autour du sapin avec ceux que j’aime",
          { genevieve: 2, kristyn: 1, malibu: 2, puppyChase: 1, starLight: 2 }
        ),
      ],
      prompt: {
        en: "Your favourite way to spend the holidays?",
        fr: "Votre façon préférée de passer les fêtes ?",
      },
    },
    {
      answers: [
        answer(
          "Waves, sand and a race to the water",
          "Des vagues, du sable et une course jusqu’à l’eau",
          { dolphinMagic: 1, eden: 1, malibu: 2, merliah: 2, puppyChase: 2 }
        ),
        answer(
          "Snowflakes and a sleigh ride",
          "Des flocons et une balade en traîneau",
          { clara: 2, kristyn: 1, perfectChristmas: 2 }
        ),
        answer(
          "A library, a lamp and a long afternoon",
          "Une bibliothèque, une lampe et un long après-midi",
          { anneliese: 2, princessAdventure: 1, rapunzel: 1 }
        ),
        answer(
          "Swords crossed in a palace courtyard",
          "Des épées croisées dans la cour d’un palais",
          { corinne: 2, fairySecret: 1, genevieve: 1, spySquad: 2 }
        ),
        answer(
          "A rock concert under the stars",
          "Un concert de rock sous les étoiles",
          { brooklyn: 2, courtney: 2, tori: 1, videoGame: 2 }
        ),
        answer("Moonlight on still water", "Le clair de lune sur l’eau calme", {
          elina: 1,
          odette: 2,
          ponyTale: 2,
          starLight: 1,
        }),
      ],
      prompt: {
        en: "Pick a scene for your own film.",
        fr: "Choisissez une scène pour votre propre film.",
      },
    },
    {
      answers: [
        answer(
          "Loyal: I’d never leave a friend behind",
          "Fidèle : je n’abandonnerais jamais une amie",
          { anneliese: 1, liana: 2, perfectChristmas: 1 }
        ),
        answer(
          "Expressive: I put my feelings into every move",
          "Expressive : je mets mes émotions dans chaque mouvement",
          {
            courtney: 1,
            fashionFairytale: 2,
            kristyn: 2,
            malibu: 2,
            starLight: 1,
          }
        ),
        answer(
          "Open-hearted: I see the magic in everyday things",
          "Au cœur ouvert : je vois la magie dans les choses du quotidien",
          { clara: 2, fairySecret: 1, genevieve: 1 }
        ),
        answer(
          "Thoughtful: I notice the little things",
          "Attentive : je remarque les petites choses",
          { brooklyn: 2, mariposa: 2, rapunzel: 1 }
        ),
        answer(
          "Gentle: I protect what’s small and growing",
          "Douce : je protège ce qui est petit et qui grandit",
          { dolphinMagic: 1, elina: 2, rosella: 1 }
        ),
        answer(
          "Fearless: give me a mountain to climb",
          "Intrépide : donnez-moi une montagne à gravir",
          { annika: 2, kara: 1, ponyTale: 2, spySquad: 1 }
        ),
      ],
      prompt: {
        en: "Which word fits you best?",
        fr: "Quel mot vous correspond le mieux ?",
      },
    },
    {
      answers: [
        answer(
          "Lose my best friend’s trust",
          "Perdre la confiance de ma meilleure amie",
          { dreamhouse: 1, liana: 2, mariposa: 1 }
        ),
        answer(
          "Waste my talent by playing it safe",
          "Gâcher mon talent en restant prudente",
          { eden: 1, merliah: 2, puppyChase: 1 }
        ),
        answer(
          "Never be free to choose my own life",
          "Ne jamais être libre de choisir ma vie",
          { anneliese: 1, brooklyn: 2, rapunzel: 2 }
        ),
        answer(
          "Never find out where I really come from",
          "Ne jamais découvrir d’où je viens vraiment",
          { lumina: 1, malibu: 2, puppyAdventure: 1, rosella: 2 }
        ),
        answer(
          "Be the one who could have helped, and didn’t",
          "Être celle qui aurait pu aider, et ne l’a pas fait",
          { alexa: 1, odette: 2, ponyTale: 2 }
        ),
        answer(
          "Let the team down when it counts",
          "Lâcher l’équipe au moment décisif",
          { corinne: 2, genevieve: 1, spySquad: 1 }
        ),
      ],
      prompt: {
        en: "What would you hate most?",
        fr: "Que détesteriez-vous le plus ?",
      },
    },
    {
      answers: [
        answer(
          "Dancing until the sun comes up",
          "Danser jusqu’au lever du soleil",
          {
            clara: 1,
            genevieve: 2,
            malibu: 2,
            perfectChristmas: 1,
            puppyChase: 2,
          }
        ),
        answer(
          "Swinging from vines over a hidden lagoon",
          "Me balancer de liane en liane au-dessus d’un lagon caché",
          { dolphinMagic: 2, lumina: 1, rosella: 2 }
        ),
        answer(
          "Swapping lives with someone for a day",
          "Échanger ma vie avec quelqu’un le temps d’une journée",
          { blair: 1, princessAdventure: 2, tori: 2 }
        ),
        answer(
          "Flying across the sky on a winged horse",
          "Traverser le ciel sur un cheval ailé",
          { annika: 2, kara: 1, ponyTale: 1, starLight: 2 }
        ),
        answer(
          "Turning into a swan for a night",
          "Me changer en cygne le temps d’une nuit",
          { elina: 1, odette: 2 }
        ),
        answer(
          "Opening a book that leads to another world",
          "Ouvrir un livre qui mène à un autre monde",
          { brooklyn: 2, fairySecret: 2, liana: 1, mariposa: 2 }
        ),
      ],
      prompt: {
        en: "If magic were real, you’d spend it on…",
        fr: "Si la magie existait, vous l’utiliseriez pour…",
      },
    },
    {
      answers: [
        answer(
          "Sport: I can’t sit still",
          "Le sport : je ne tiens pas en place",
          { merliah: 1, puppyChase: 1, tori: 2 }
        ),
        answer("Dance, every single day", "La danse, tous les jours", {
          clara: 1,
          kristyn: 2,
          malibu: 2,
          perfectChristmas: 1,
        }),
        answer("Marine biology", "La biologie marine", {
          dolphinMagic: 2,
          lumina: 2,
          mariposa: 1,
        }),
        answer(
          "Music, the louder the better",
          "La musique, le plus fort possible",
          { corinne: 1, courtney: 2, videoGame: 2 }
        ),
        answer(
          "Physics: how fast can I go?",
          "La physique : jusqu’à quelle vitesse puis-je aller ?",
          { blair: 1, kara: 2, spySquad: 1, starLight: 2 }
        ),
        answer("Art and storytelling", "Les arts plastiques et l’écriture", {
          alexa: 2,
          brooklyn: 2,
          fashionFairytale: 1,
          rapunzel: 1,
        }),
      ],
      prompt: {
        en: "Your favourite subject at school?",
        fr: "Votre matière préférée à l’école ?",
      },
    },
    {
      answers: [
        answer(
          "I make everyone feel welcome",
          "Je mets tout le monde à l’aise",
          { elina: 1, lumina: 2, puppyChase: 2 }
        ),
        answer(
          "I jump in to protect people",
          "Je fonce pour protéger les autres",
          { corinne: 1, kara: 2, videoGame: 1 }
        ),
        answer(
          "I never stop practising",
          "Je ne m’arrête jamais de m’entraîner",
          {
            genevieve: 1,
            kristyn: 2,
            malibu: 2,
            perfectChristmas: 1,
            spySquad: 2,
          }
        ),
        answer(
          "I’m braver than I look",
          "Je suis plus courageuse que j’en ai l’air",
          { alexa: 2, brooklyn: 2, puppyAdventure: 1, rapunzel: 1 }
        ),
        answer("I bring the energy", "J’apporte l’énergie", {
          courtney: 2,
          eden: 1,
          fashionFairytale: 1,
        }),
        answer(
          "I’m fair to everyone, whatever their rank",
          "Je suis juste avec tout le monde, quel que soit son rang",
          { blair: 2, dreamhouse: 1, princessAdventure: 2, tori: 1 }
        ),
      ],
      prompt: {
        en: "Your best quality, according to your friends?",
        fr: "Votre plus grande qualité, d’après vos amis ?",
      },
    },
    {
      answers: [
        answer(
          "Open it right away: adventure!",
          "L’ouvrez tout de suite : l’aventure !",
          { merliah: 1, puppyChase: 1, tori: 2, videoGame: 2 }
        ),
        answer(
          "Knock politely, in case someone needs help",
          "Frappez poliment, au cas où quelqu’un aurait besoin d’aide",
          { anneliese: 1, blair: 2, princessAdventure: 1 }
        ),
        answer(
          "Step through it like an entrance on stage",
          "La franchissez comme une entrée en scène",
          { clara: 1, kristyn: 2, malibu: 2 }
        ),
        answer(
          "Go first, so no one else gets hurt",
          "Passez la première, pour que personne d’autre ne soit en danger",
          { annika: 1, kara: 2, starLight: 1 }
        ),
        answer("Hesitate… then peek inside", "Hésitez… puis jetez un œil", {
          alexa: 2,
          odette: 1,
          puppyAdventure: 2,
        }),
        answer(
          "Grab my friends so we go together",
          "Allez chercher vos amis pour y aller ensemble",
          {
            brooklyn: 2,
            courtney: 2,
            dreamhouse: 2,
            fashionFairytale: 1,
            liana: 1,
          }
        ),
      ],
      prompt: {
        en: "You find a door that wasn’t there yesterday. You…",
        fr: "Vous trouvez une porte qui n’était pas là hier. Vous…",
      },
    },
    {
      answers: [
        answer(
          "Something shimmery, with seashells",
          "Quelque chose de nacré, avec des coquillages",
          { dolphinMagic: 2, lumina: 2, malibu: 2, rosella: 1 }
        ),
        answer(
          "Something I can move in, just in case",
          "Une tenue où je peux bouger, au cas où",
          { corinne: 1, kara: 2, spySquad: 2 }
        ),
        answer(
          "Sparkles, with trainers underneath",
          "Des paillettes, avec des baskets en dessous",
          { courtney: 1, tori: 2, videoGame: 1 }
        ),
        answer("A tutu, obviously", "Un tutu, évidemment", {
          clara: 1,
          fashionFairytale: 2,
          kristyn: 2,
          starLight: 1,
        }),
        answer(
          "Something soft and simple that’s really me",
          "Quelque chose de doux et simple, qui me ressemble",
          { alexa: 2, odette: 1 }
        ),
        answer(
          "A dress I borrowed from a friend",
          "Une robe empruntée à une amie",
          { blair: 2, brooklyn: 2, dreamhouse: 2, liana: 1 }
        ),
      ],
      prompt: {
        en: "What would you wear to a royal party?",
        fr: "Que porteriez-vous à une fête royale ?",
      },
    },
    {
      answers: [
        answer("Leading a kingdom fairly", "Diriger un royaume avec justice", {
          blair: 2,
          kara: 1,
          princessAdventure: 2,
        }),
        answer("Lead singer in a band", "Chanteuse dans un groupe", {
          brooklyn: 2,
          corinne: 1,
          courtney: 2,
          perfectChristmas: 1,
          videoGame: 2,
        }),
        answer(
          "Writing and illustrating children’s books",
          "Écrire et illustrer des livres pour enfants",
          { alexa: 2, rapunzel: 1 }
        ),
        answer("Looking after a coral reef", "Veiller sur un récif de corail", {
          dolphinMagic: 2,
          fashionFairytale: 1,
          lumina: 2,
          rosella: 1,
        }),
        answer(
          "Pop star, at least for a while",
          "Pop star, au moins pour un temps",
          { dreamhouse: 1, eden: 1, tori: 2 }
        ),
        answer("Principal dancer", "Danseuse étoile", {
          genevieve: 1,
          kristyn: 2,
          malibu: 2,
          puppyChase: 1,
        }),
      ],
      prompt: {
        en: "Your dream job?",
        fr: "Votre métier de rêve ?",
      },
    },
    {
      answers: [
        answer("Fly straight at the problem", "Foncez droit sur le problème", {
          annika: 1,
          kara: 2,
          starLight: 2,
        }),
        answer(
          "Find a quiet corner and think it through",
          "Trouvez un coin tranquille pour y réfléchir",
          { alexa: 2, brooklyn: 2, mariposa: 1, puppyAdventure: 1 }
        ),
        answer(
          "Call my friends: we’ll fix it together",
          "Appelez vos amis : vous allez arranger ça ensemble",
          { courtney: 2, liana: 1 }
        ),
        answer(
          "Stay calm and kind, even to whoever caused it",
          "Restez calme et gentille, même avec les responsables",
          { anneliese: 1, blair: 2, dreamhouse: 2 }
        ),
        answer(
          "Shake it off and put some music on",
          "Passez à autre chose en mettant de la musique",
          { eden: 1, tori: 2, videoGame: 1 }
        ),
        answer("Look for the bright side", "Cherchez le bon côté des choses", {
          dolphinMagic: 2,
          elina: 1,
          fashionFairytale: 1,
          lumina: 2,
          malibu: 2,
        }),
      ],
      prompt: {
        en: "When things go wrong, you…",
        fr: "Quand les choses tournent mal, vous…",
      },
    },
  ],
  results: {
    alexa: heroine(
      "Alexa",
      "Barbie and the Secret Door (2014)",
      "A shy princess who finds a hidden door into a magical land, and the courage to speak up there. You are gentle and imaginative, you sometimes doubt yourself, and you are far braver than you think when it counts.",
      "Une princesse timide qui trouve une porte cachée vers un pays magique, et là-bas le courage de prendre la parole. Vous êtes douce et imaginative, vous doutez parfois de vous, et vous êtes bien plus courageuse que vous ne le pensez quand il le faut."
    ),
    anneliese: heroine(
      "Anneliese",
      "Barbie as the Princess and the Pauper (2004)",
      "A princess with her head full of rocks, maps and science, who would rather study than sit for portraits. You take your duties seriously, you think before you act, and when the people you look after need you, you find the courage to put them first.",
      "Une princesse qui a la tête pleine de pierres, de cartes et de sciences, et qui préfère étudier que poser pour des portraits. Vous prenez vos devoirs au sérieux, vous réfléchissez avant d’agir, et quand ceux dont vous prenez soin ont besoin de vous, vous trouvez le courage de passer après eux."
    ),
    annika: heroine(
      "Annika",
      "Barbie and the Magic of Pegasus (2005)",
      "A princess who loves the ice and hates being told to stay indoors. You are adventurous and stubborn in the best way, and you would ride into a storm on a winged horse to bring your family home.",
      "Une princesse qui adore la glace et déteste qu’on lui dise de rester à l’intérieur. Vous êtes aventureuse et têtue dans le bon sens du terme, et vous chevaucheriez un cheval ailé en pleine tempête pour ramener votre famille."
    ),
    blair: heroine(
      "Blair",
      "Barbie: Princess Charm School (2011)",
      "A girl who works to support her family, wins a place at a school for princesses, and turns out to be a lost princess herself. You are humble, hard-working and fair, and you treat everyone the same, whatever their title.",
      "Une jeune fille qui travaille pour aider sa famille, décroche une place dans une école de princesses et se révèle être elle-même une princesse disparue. Vous êtes humble, travailleuse et juste, et vous traitez tout le monde de la même façon, quel que soit son titre."
    ),
    clara: heroine(
      "Clara",
      "Barbie in the Nutcracker (2001)",
      "A girl who follows a wooden toy into a world of sweets and snow. You are curious and open-hearted, you dream of the story behind every object, and when the moment comes you are braver than anyone expected.",
      "Une jeune fille qui suit un jouet de bois dans un monde de friandises et de neige. Vous êtes curieuse et généreuse, vous rêvez de l’histoire cachée derrière chaque objet, et le moment venu, vous êtes plus courageuse que quiconque ne l’aurait cru."
    ),
    corinne: heroine(
      "Corinne",
      "Barbie and the Three Musketeers (2009)",
      "A country girl who dreams of becoming a musketeer when everyone says girls can’t. You are bold, quick and fiercely loyal to your team, and you know that a good plan, a little grace and a lot of practice can beat anyone.",
      "Une fille de la campagne qui rêve de devenir mousquetaire alors que tout le monde dit que les filles ne le peuvent pas. Vous êtes audacieuse, vive et farouchement fidèle à votre équipe, et vous savez qu’un bon plan, un peu de grâce et beaucoup d’entraînement viennent à bout de tout."
    ),
    courtney: heroine(
      "Courtney",
      "Barbie in Rock ’n Royals (2015)",
      "A princess who ends up at a rock music camp by mistake and learns to love it. You are full of energy and open to anything new, you bring people together, and you can be both polished and loud.",
      "Une princesse qui atterrit par erreur dans un camp de rock et finit par l’adorer. Vous débordez d’énergie et êtes ouverte à la nouveauté, vous rassemblez les gens, et vous savez être à la fois élégante et bruyante."
    ),
    eden: heroine(
      "Eden Starling",
      "Barbie in a Christmas Carol (2008)",
      "A star of the London stage who has to learn what the holidays are really for. You shine in front of a crowd and you like things done your way, but you can own a mistake, and once you open your heart you give more than anyone.",
      "Une vedette des scènes de Londres qui doit apprendre à quoi servent vraiment les fêtes. Vous brillez devant la foule et vous aimez que les choses se fassent à votre façon, mais vous savez reconnaître une erreur, et une fois votre cœur ouvert, vous donnez plus que personne."
    ),
    elina: heroine(
      "Elina",
      "Barbie: Fairytopia, Mermaidia and Magic of the Rainbow (2005–2007)",
      "A flower fairy born without wings, who saves her world anyway, then dives under the sea and goes back to fairy school to do it again. You are kind to every living thing, you don’t need anyone’s permission to help, and what makes you different is your strength.",
      "Une fée des fleurs née sans ailes, qui sauve son monde malgré tout, puis plonge sous la mer et retourne à l’école des fées pour recommencer. Vous êtes bienveillante envers tout ce qui vit, vous n’attendez la permission de personne pour aider, et votre différence fait votre force."
    ),
    genevieve: heroine(
      "Genevieve",
      "Barbie in the 12 Dancing Princesses (2006)",
      "One of twelve sisters, who dances through every hall and every worry. You are graceful and warm, your family is your whole world, and when someone threatens the people you love, you step up and lead.",
      "Une des douze sœurs, celle qui danse dans chaque salle et à travers chaque souci. Vous êtes gracieuse et chaleureuse, votre famille est tout pour vous, et quand quelqu’un menace ceux que vous aimez, vous prenez les choses en main."
    ),
    kara: heroine(
      "Kara",
      "Barbie in Princess Power (2015)",
      "A princess who gains the power to fly and becomes a superhero to protect her kingdom. You are bold and caring at once, quick to act when someone is in trouble, and you know that real strength is in how you use it.",
      "Une princesse qui reçoit le pouvoir de voler et devient super-héroïne pour protéger son royaume. Vous êtes à la fois audacieuse et attentionnée, prompte à agir quand quelqu’un est en difficulté, et vous savez que la vraie force tient à la façon dont on s’en sert."
    ),
    kristyn: heroine(
      "Kristyn",
      "Barbie in the Pink Shoes (2013)",
      "A ballet student who wants to dance her own way, and finds herself inside the great ballets. You are passionate and expressive, you work hard at what you love, and you won’t let anyone tell you there’s only one right way to do it.",
      "Une élève de ballet qui veut danser à sa façon et se retrouve au cœur des grands ballets. Vous êtes passionnée et expressive, vous travaillez dur pour ce que vous aimez, et vous ne laissez personne vous dire qu’il n’y a qu’une seule bonne manière de faire."
    ),
    liana: heroine(
      "Liana",
      "Barbie and the Diamond Castle (2008)",
      "A girl who shares everything with her best friend, songs most of all. Friendship is your treasure and your magic: you would turn down anything, even a palace, before you would leave a friend behind.",
      "Une jeune fille qui partage tout avec sa meilleure amie, les chansons surtout. L’amitié est votre trésor et votre magie : vous refuseriez tout, même un palais, plutôt que d’abandonner une amie."
    ),
    lumina: heroine(
      "Lumina",
      "Barbie: The Pearl Princess (2014)",
      "A mermaid who can make pearls glow, raised among sea creatures, who discovers she is a princess. You are warm and creative, you make everyone around you feel at home, and you shine brightest when you stay true to where you came from.",
      "Une sirène capable de faire briller les perles, élevée parmi les créatures marines, qui découvre qu’elle est princesse. Vous êtes chaleureuse et créative, vous mettez tout le monde à l’aise, et vous brillez le plus quand vous restez fidèle à vos origines."
    ),
    mariposa: heroine(
      "Mariposa",
      "Barbie Mariposa and Mariposa and the Fairy Princess (2008–2013)",
      "A butterfly fairy who would rather read than flutter about. You are quiet, clever and full of ideas you found in books, and when an adventure finally comes, all that reading turns out to be exactly what saves the day.",
      "Une fée papillon qui préfère lire que voleter. Vous êtes discrète, maligne et pleine d’idées trouvées dans les livres, et quand l’aventure arrive enfin, toutes ces lectures sont justement ce qui sauve la situation."
    ),
    merliah: heroine(
      "Merliah",
      "Barbie in A Mermaid Tale and A Mermaid Tale 2 (2010–2012)",
      "A surfing champion who finds out she is half mermaid. You are sporty, competitive and happiest in the water, you speak your mind, and you would leave the podium behind to help the people who need you.",
      "Une championne de surf qui découvre qu’elle est à moitié sirène. Vous êtes sportive, compétitrice et heureuse dans l’eau, vous dites ce que vous pensez, et vous quitteriez le podium pour aider ceux qui ont besoin de vous."
    ),
    odette: heroine(
      "Odette",
      "Barbie of Swan Lake (2003)",
      "A baker’s daughter who follows a unicorn into an enchanted forest and turns out to be the one it needs. You are shy and gentle at first, but your kindness runs deep, and your courage grows every time someone counts on you.",
      "La fille d’un boulanger qui suit une licorne dans une forêt enchantée et se révèle être celle qu’elle attendait. Vous êtes timide et douce au premier abord, mais votre bonté est profonde, et votre courage grandit chaque fois que quelqu’un compte sur vous."
    ),
    rapunzel: heroine(
      "Rapunzel",
      "Barbie as Rapunzel (2002)",
      "A girl locked away who paints her way out, with a magic brush. You are an artist down to your fingertips, imaginative and patient, and no wall is tall enough to keep you from the life you picture for yourself.",
      "Une jeune fille enfermée qui s’évade grâce à la peinture et à un pinceau magique. Vous êtes artiste jusqu’au bout des doigts, imaginative et patiente, et aucun mur n’est assez haut pour vous tenir loin de la vie que vous vous imaginez."
    ),
    rosella: heroine(
      "Rosella",
      "Barbie as the Island Princess (2007)",
      "A girl raised on an island by animals, who sets out to learn where she comes from. You are curious about the whole wide world, at home in nature, and the creatures around you are as much your family as anyone.",
      "Une jeune fille élevée par des animaux sur une île, qui part découvrir d’où elle vient. Vous êtes curieuse du monde entier, à l’aise dans la nature, et les animaux qui vous entourent sont votre famille autant que n’importe qui."
    ),
    tori: heroine(
      "Tori",
      "Barbie: The Princess & the Popstar (2012)",
      "A princess who longs for the stage, until she swaps places with a pop star for a day. You are lively, fun and a little restless, and you learn that the best life is the one where you can be fully yourself.",
      "Une princesse qui rêve de la scène, jusqu’au jour où elle échange sa place avec une pop star. Vous êtes vive, drôle et un peu impatiente, et vous apprenez que la plus belle vie est celle où l’on peut être pleinement soi-même."
    ),
    dolphinMagic: herself(
      { en: "Dolphin Barbie", fr: "Barbie amie des dauphins" },
      "Barbie: Dolphin Magic (2017)",
      "A big sister on a coral reef who helps a mermaid save rare dolphins from a poacher. You love the ocean, you stand up for creatures that can’t speak for themselves, and you always look on the bright side.",
      "Une grande sœur sur un récif de corail qui aide une sirène à sauver des dauphins rares d’un braconnier. Vous aimez l’océan, vous défendez ceux qui ne peuvent pas parler pour eux-mêmes, et vous voyez toujours le bon côté des choses."
    ),
    dreamhouse: herself(
      { en: "Dreamhouse Barbie", fr: "Barbie de la Dreamhouse" },
      "Barbie Dreamhouse Adventures (2018–2020)",
      "Barbie at home in Malibu, juggling friends, sisters and a hundred projects at once. You are ambitious and caring, you can do almost anything, and your only weak spot is asking for help.",
      "Barbie chez elle à Malibu, entre ses amis, ses sœurs et cent projets à la fois. Vous êtes ambitieuse et attentionnée, vous savez presque tout faire, et votre seul point faible, c’est de demander de l’aide."
    ),
    fairySecret: herself(
      { en: "Fairy rescue Barbie", fr: "Barbie au pays des fées" },
      "Barbie: A Fairy Secret (2011)",
      "A film star who teams up with her rival to rescue Ken from a fairy kingdom, and comes home with a new friend. You are loyal, quick to forgive, and brave when a friend needs you.",
      "Une star de cinéma qui s’allie à sa rivale pour sauver Ken d’un royaume de fées, et en revient avec une nouvelle amie. Vous êtes fidèle, prompte à pardonner, et courageuse quand une amie a besoin de vous."
    ),
    fashionFairytale: herself(
      { en: "Fashion Barbie", fr: "Barbie de la mode" },
      "Barbie: A Fashion Fairytale (2010)",
      "A film star who loses a role and flies to Paris to save her aunt’s fashion house, with a little help from sparkling fairies. You turn setbacks into fresh starts, you have an eye for style, and you lift up the people around you.",
      "Une star de cinéma qui perd un rôle et s’envole pour Paris sauver la maison de couture de sa tante, avec l’aide de fées scintillantes. Vous transformez les revers en nouveaux départs, vous avez l’œil pour le style, et vous faites briller ceux qui vous entourent."
    ),
    perfectChristmas: herself(
      { en: "Christmas Barbie", fr: "Barbie de Noël" },
      "Barbie: A Perfect Christmas (2011)",
      "A big sister snowed in at a country inn on the way to a family Christmas, who makes the holiday perfect anyway. You are warm and upbeat, and you can turn a plan gone wrong into a happy memory.",
      "Une grande sœur bloquée par la neige dans une auberge de campagne en route vers un Noël en famille, qui rend les fêtes parfaites malgré tout. Vous êtes chaleureuse et enjouée, et vous savez transformer un plan raté en joli souvenir."
    ),
    ponyTale: herself(
      { en: "Pony Tale Barbie", fr: "Barbie cavalière" },
      "Barbie & Her Sisters in A Pony Tale (2013)",
      "A big sister on a riding holiday in the Swiss Alps, looking for a one-of-a-kind horse. You love the outdoors and animals, you are patient, and you know the best things are worth the wait.",
      "Une grande sœur en vacances à cheval dans les Alpes suisses, à la recherche d’un cheval unique. Vous aimez le grand air et les animaux, vous êtes patiente, et vous savez que les plus belles choses valent la peine d’attendre."
    ),
    princessAdventure: herself(
      { en: "Princess swap Barbie", fr: "Barbie princesse d’un jour" },
      "Barbie: Princess Adventure (2020)",
      "A visitor to a small kingdom who swaps places with a princess who looks just like her, then comes to her rescue. You are generous and adaptable, you put yourself in other people’s shoes, and you stand up for them.",
      "Une visiteuse dans un petit royaume qui échange sa place avec une princesse qui lui ressemble trait pour trait, puis vole à son secours. Vous êtes généreuse et souple, vous vous mettez à la place des autres, et vous les défendez."
    ),
    puppyAdventure: herself(
      { en: "Treasure hunt Barbie", fr: "Barbie chasseuse de trésor" },
      "Barbie & Her Sisters in The Great Puppy Adventure (2015)",
      "A big sister back in her small hometown, off on a treasure hunt with her sisters and their puppies. You are curious and playful, you love a mystery, and home means everything to you.",
      "Une grande sœur de retour dans sa petite ville natale, partie en chasse au trésor avec ses sœurs et leurs chiots. Vous êtes curieuse et joueuse, vous adorez les mystères, et votre chez-vous compte plus que tout."
    ),
    puppyChase: herself(
      { en: "Hawaii Barbie", fr: "Barbie à Hawaï" },
      "Barbie & Her Sisters in A Puppy Chase (2016)",
      "A big sister in Hawaii to cheer on her little sister at a dance competition, until the puppies go missing. You are sunny, sporty and supportive, and you would search a whole island for someone you love.",
      "Une grande sœur à Hawaï pour encourager sa petite sœur à un concours de danse, jusqu’à ce que les chiots disparaissent. Vous êtes solaire, sportive et toujours là pour les autres, et vous fouilleriez une île entière pour quelqu’un que vous aimez."
    ),
    spySquad: herself(
      { en: "Spy Barbie", fr: "Barbie espionne" },
      "Barbie: Spy Squad (2016)",
      "A gymnast recruited as a secret agent to catch a jewel thief, with her two best friends. You are athletic, quick-thinking and a true team player, and you love a challenge that keeps you on your toes.",
      "Une gymnaste recrutée comme agente secrète pour arrêter une voleuse de bijoux, avec ses deux meilleures amies. Vous êtes sportive, vive d’esprit et une vraie joueuse d’équipe, et vous adorez les défis qui vous tiennent en alerte."
    ),
    starLight: herself(
      { en: "Starlight Barbie", fr: "Barbie Starlight" },
      "Barbie: Star Light Adventure (2016)",
      "A hoverboarder from a faraway planet who can move things with her mind, and who brings the stars back. You are adventurous, a natural leader, and you believe one person can make the whole sky shine.",
      "Une adepte de l’hoverboard venue d’une planète lointaine, capable de déplacer les objets par la pensée, qui ramène les étoiles. Vous êtes aventurière, née pour mener, et vous croyez qu’une seule personne peut faire briller tout le ciel."
    ),
    videoGame: herself(
      { en: "Gamer Barbie", fr: "Barbie gameuse" },
      "Barbie: Video Game Hero (2017)",
      "A gamer pulled into her favourite video game as a roller-skating hero, who beats a virus with her new friends. You are quick, competitive and calm under pressure, and you never give up on a level.",
      "Une gameuse aspirée dans son jeu vidéo préféré en héroïne à rollers, qui vient à bout d’un virus avec ses nouvelles amies. Vous êtes rapide, compétitrice et calme sous pression, et vous n’abandonnez jamais un niveau."
    ),
    brooklyn: twoBarbies(
      { en: "Barbie “Brooklyn” Roberts", fr: "Barbie « Brooklyn » Roberts" },
      "Barbie: Big City, Big Dreams and the films after it (2021–2026)",
      "A Brooklyn girl who grew up in the big city and lives for music and writing songs. You are creative, independent and down to earth, you say what you think, and you never forget your friends.",
      "Une fille de Brooklyn qui a grandi dans la grande ville et vit pour la musique et l’écriture de chansons. Vous êtes créative, indépendante et les pieds sur terre, vous dites ce que vous pensez, et vous n’oubliez jamais vos amis."
    ),
    malibu: twoBarbies(
      { en: "Barbie “Malibu” Roberts", fr: "Barbie « Malibu » Roberts" },
      "Barbie: Big City, Big Dreams and the films after it (2021–2026)",
      "From Malibu, California, she dreams of starring on Broadway and heads to New York to study the performing arts. You are sunny and optimistic, you love music and the stage, and you light up every room.",
      "Venue de Malibu, en Californie, elle rêve de briller à Broadway et part à New York étudier les arts de la scène. Vous êtes solaire et optimiste, vous aimez la musique et la scène, et vous illuminez chaque pièce où vous entrez."
    ),
  },
  slug: "which-barbie-character",
  title: {
    en: "Which Barbie character are you?",
    fr: "Quel personnage de Barbie êtes-vous ?",
  },
  verdict: { en: "You are", fr: "Vous êtes" },
};
