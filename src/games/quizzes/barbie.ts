import type { Answer, Quiz, QuizResult } from "./quiz";

/**
 * Which Barbie character are you? Fourteen heroines Barbie plays in the
 * animated films of 2001 to 2010, and fourteen questions of six answers. Each
 * answer gives 2 points to the heroine it describes best and 1 to another she
 * is close to. Every heroine is worth 18 points over all the answers and never
 * twice in one question, so each has the same chance and can come out on top.
 */
const answer = (
  en: string,
  fr: string,
  points: Record<string, number>
): Answer => ({ points, text: { en, fr } });

/** A heroine, opening with the film she is from, its English title and year. */
const heroine = (
  name: string,
  film: string,
  en: string,
  fr: string
): QuizResult => ({
  about: {
    en: `From ${film}. ${en}`,
    fr: `Dans ${film}. ${fr}`,
  },
  name: { en: name, fr: name },
});

export const BARBIE_QUIZ: Quiz = {
  blurb: {
    en: "Fourteen questions, fourteen heroines from the classic animated Barbie films. Which one are you?",
    fr: "Quatorze questions, quatorze héroïnes des grands films d’animation Barbie. Laquelle êtes-vous ?",
  },
  legend: "barbie-heroine.txt",
  questions: [
    {
      answers: [
        answer(
          "Painting something huge and bold, just to see if I can",
          "Peindre quelque chose d’immense et d’audacieux, juste pour voir si j’en suis capable",
          { corinne: 1, rapunzel: 2 }
        ),
        answer(
          "A quiet walk by a lake, feeding the birds",
          "Une balade tranquille au bord d’un lac, en nourrissant les oiseaux",
          { elina: 1, odette: 2 }
        ),
        answer(
          "Curling up with an old storybook and wishing I could step inside",
          "Me blottir avec un vieux livre de contes en rêvant d’y entrer",
          { annika: 1, clara: 2 }
        ),
        answer(
          "Reading in the garden, among the butterflies",
          "Lire au jardin, au milieu des papillons",
          { liana: 1, mariposa: 2 }
        ),
        answer(
          "Catching the first waves at sunrise",
          "Attraper les premières vagues au lever du soleil",
          { eden: 1, merliah: 2 }
        ),
        answer(
          "Exploring a beach I’ve never seen, barefoot",
          "Explorer pieds nus une plage que je ne connais pas",
          { erika: 1, rosella: 2 }
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
          { mariposa: 2, rapunzel: 1 }
        ),
        answer(
          "Go anyway, and face whatever happens",
          "Y aller quand même, et affronter ce qui arrive",
          { annika: 1, clara: 2 }
        ),
        answer(
          "Ask my sisters to come along: we’re stronger together",
          "Demander à mes sœurs de venir : ensemble, on est plus fortes",
          { anneliese: 1, genevieve: 2 }
        ),
        answer(
          "Slip out and help, even if no one believes in me yet",
          "M’éclipser pour aider, même si personne ne croit encore en moi",
          { elina: 2, odette: 1 }
        ),
        answer(
          "Practise in secret until I’m good enough to prove them wrong",
          "M’entraîner en secret jusqu’à leur prouver qu’ils ont tort",
          { corinne: 2, erika: 1 }
        ),
        answer(
          "Paddle out to sea: the answer’s out there somewhere",
          "Pagayer vers le large : la réponse est quelque part là-bas",
          { merliah: 2, rosella: 1 }
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
        }),
        answer(
          "A surfboard, always waxed",
          "Une planche de surf, toujours fartée",
          { erika: 1, merliah: 2 }
        ),
        answer(
          "A box of rocks and crystals, each one labelled",
          "Une boîte de pierres et de cristaux, chacune étiquetée",
          { anneliese: 2, liana: 1 }
        ),
        answer(
          "Brushes and paints, a little worn",
          "Des pinceaux et des couleurs, un peu usés",
          { rapunzel: 2, rosella: 1 }
        ),
        answer(
          "A pressed flower from a secret meadow",
          "Une fleur séchée d’une prairie secrète",
          { elina: 2, mariposa: 1 }
        ),
        answer("A sparkling microphone", "Un micro qui brille", {
          clara: 1,
          eden: 2,
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
          { anneliese: 2, genevieve: 1 }
        ),
        answer(
          "The one who befriends every creature in the forest",
          "Celle qui se lie d’amitié avec toutes les créatures de la forêt",
          { elina: 2, rosella: 1 }
        ),
        answer(
          "The one who sings for her supper and dreams bigger",
          "Celle qui chante pour gagner sa vie et rêve plus grand",
          { corinne: 1, erika: 2 }
        ),
        answer(
          "The sporty one who’d rather be outdoors",
          "La sportive qui préfère être dehors",
          { eden: 1, merliah: 2 }
        ),
        answer(
          "The loyal friend who shares everything",
          "L’amie fidèle qui partage tout",
          { liana: 2, mariposa: 1 }
        ),
        answer(
          "The curious one who wanders off into an adventure",
          "La curieuse qui s’égare dans une aventure",
          { annika: 1, clara: 2 }
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
          { corinne: 2, merliah: 1 }
        ),
        answer(
          "Keep going, even when I’m scared",
          "Continuer, même quand j’ai peur",
          { annika: 2, odette: 1 }
        ),
        answer(
          "Read up on it, then solve it calmly",
          "Me documenter, puis régler ça calmement",
          { anneliese: 2, mariposa: 1 }
        ),
        answer(
          "Stay light on my feet and look for the rhythm in it",
          "Rester légère et chercher le rythme de la chose",
          { clara: 1, genevieve: 2 }
        ),
        answer(
          "Make it into a song and sing it out loud",
          "En faire une chanson et la chanter à pleine voix",
          { eden: 2, liana: 1 }
        ),
        answer(
          "Ask the animals: they always know something",
          "Demander aux animaux : ils savent toujours quelque chose",
          { elina: 1, rosella: 2 }
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
          { clara: 2, genevieve: 1 }
        ),
        answer(
          "Singing a duet with my best friend",
          "Chanter en duo avec ma meilleure amie",
          { anneliese: 1, liana: 2 }
        ),
        answer(
          "Performing for a crowd, then going home on my own terms",
          "Me produire devant la foule, puis rentrer comme je l’entends",
          { erika: 2, merliah: 1 }
        ),
        answer(
          "Stepping into the spotlight, with the whole team behind me",
          "Entrer dans la lumière, avec toute l’équipe derrière moi",
          { corinne: 1, eden: 2 }
        ),
        answer(
          "Painting a backdrop full of hidden butterflies",
          "Peindre un décor rempli de papillons cachés",
          { mariposa: 1, rapunzel: 2 }
        ),
        answer(
          "Twirling by the water, on tiptoe",
          "Tourbillonner au bord de l’eau, sur la pointe des pieds",
          { elina: 2, odette: 1 }
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
          { liana: 2, mariposa: 1 }
        ),
        answer(
          "Someone who’s honest with me and helps me grow",
          "Quelqu’un d’honnête qui m’aide à grandir",
          { anneliese: 2, rapunzel: 1 }
        ),
        answer(
          "A furry, feathered or finned best friend",
          "Un meilleur ami à poils, à plumes ou à nageoires",
          { merliah: 1, rosella: 2 }
        ),
        answer(
          "Someone who gives me a second chance",
          "Quelqu’un qui me laisse une seconde chance",
          { clara: 1, eden: 2 }
        ),
        answer(
          "A crew I can count on in a fight",
          "Une équipe sur qui compter dans la bataille",
          { corinne: 2, genevieve: 1 }
        ),
        answer(
          "Someone who believes I’m braver than I think",
          "Quelqu’un qui me croit plus courageuse que je ne pense",
          { annika: 1, odette: 2 }
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
          { liana: 1, mariposa: 2 }
        ),
        answer(
          "A ballroom with a floor that gleams",
          "Une salle de bal au parquet qui brille",
          { corinne: 1, genevieve: 2 }
        ),
        answer(
          "A theatre stage with velvet curtains",
          "Une scène de théâtre aux rideaux de velours",
          { eden: 2, erika: 1 }
        ),
        answer(
          "A sunny studio with a view over the hills",
          "Un atelier ensoleillé avec vue sur les collines",
          { anneliese: 1, rapunzel: 2 }
        ),
        answer(
          "A quiet glade where swans come to rest",
          "Une clairière tranquille où les cygnes viennent se poser",
          { annika: 1, odette: 2 }
        ),
        answer(
          "A treehouse by the sea, open to every animal",
          "Une cabane dans les arbres face à la mer, ouverte à tous les animaux",
          { elina: 1, rosella: 2 }
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
          { anneliese: 1, genevieve: 2 }
        ),
        answer(
          "Write in my journal by candlelight",
          "Écrire dans mon journal à la lueur d’une bougie",
          { mariposa: 2, rapunzel: 1 }
        ),
        answer(
          "Play music with my best friend",
          "Jouer de la musique avec ma meilleure amie",
          { eden: 1, liana: 2 }
        ),
        answer(
          "Wander through the woods, talking to the fireflies",
          "Me promener dans les bois en parlant aux lucioles",
          { elina: 2, odette: 1 }
        ),
        answer(
          "Sing to myself while I work late",
          "Chanter pour moi en travaillant tard",
          { corinne: 1, erika: 2 }
        ),
        answer(
          "Skate on the frozen lake under the stars",
          "Patiner sur le lac gelé sous les étoiles",
          { annika: 2, clara: 1 }
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
          { eden: 2, erika: 1 }
        ),
        answer(
          "Making handmade gifts, each one a little painting",
          "Fabriquer des cadeaux faits main, chacun une petite peinture",
          { rapunzel: 2, rosella: 1 }
        ),
        answer(
          "A snowball fight, then a race to the hot chocolate",
          "Une bataille de boules de neige, puis une course jusqu’au chocolat chaud",
          { corinne: 2, merliah: 1 }
        ),
        answer(
          "Planning a dinner for the whole village",
          "Organiser un dîner pour tout le village",
          { anneliese: 2, liana: 1 }
        ),
        answer(
          "Sledging down the biggest hill there is",
          "Descendre en luge la plus grande colline qui soit",
          { annika: 2, clara: 1 }
        ),
        answer(
          "Dancing round the tree with the people I love",
          "Danser autour du sapin avec ceux que j’aime",
          { genevieve: 2, odette: 1 }
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
          { eden: 1, merliah: 2 }
        ),
        answer(
          "Snowflakes and a sleigh ride",
          "Des flocons et une balade en traîneau",
          { annika: 1, clara: 2 }
        ),
        answer(
          "A library, a lamp and a long afternoon",
          "Une bibliothèque, une lampe et un long après-midi",
          { anneliese: 2, rapunzel: 1 }
        ),
        answer(
          "Swords crossed in a palace courtyard",
          "Des épées croisées dans la cour d’un palais",
          { corinne: 2, genevieve: 1 }
        ),
        answer(
          "Lanterns over a street full of music",
          "Des lanternes au-dessus d’une rue pleine de musique",
          { erika: 2, rosella: 1 }
        ),
        answer("Moonlight on still water", "Le clair de lune sur l’eau calme", {
          elina: 1,
          odette: 2,
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
          { anneliese: 1, liana: 2 }
        ),
        answer(
          "Determined: I’ll find my own way",
          "Déterminée : je trouverai mon propre chemin",
          { corinne: 1, erika: 2 }
        ),
        answer(
          "Open-hearted: I see the magic in everyday things",
          "Au cœur ouvert : je vois la magie dans les choses du quotidien",
          { clara: 2, genevieve: 1 }
        ),
        answer(
          "Thoughtful: I notice the little things",
          "Attentive : je remarque les petites choses",
          { mariposa: 2, rapunzel: 1 }
        ),
        answer(
          "Gentle: I protect what’s small and growing",
          "Douce : je protège ce qui est petit et qui grandit",
          { elina: 2, rosella: 1 }
        ),
        answer(
          "Fearless: give me a mountain to climb",
          "Intrépide : donnez-moi une montagne à gravir",
          { annika: 2, merliah: 1 }
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
          { liana: 2, mariposa: 1 }
        ),
        answer(
          "Waste my talent by playing it safe",
          "Gâcher mon talent en restant prudente",
          { eden: 1, merliah: 2 }
        ),
        answer(
          "Never be free to choose my own life",
          "Ne jamais être libre de choisir ma vie",
          { anneliese: 1, rapunzel: 2 }
        ),
        answer(
          "Never find out where I really come from",
          "Ne jamais découvrir d’où je viens vraiment",
          { erika: 1, rosella: 2 }
        ),
        answer(
          "Be the one who could have helped, and didn’t",
          "Être celle qui aurait pu aider, et ne l’a pas fait",
          { elina: 1, odette: 2 }
        ),
        answer(
          "Let the team down when it counts",
          "Lâcher l’équipe au moment décisif",
          { corinne: 2, genevieve: 1 }
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
          { clara: 1, genevieve: 2 }
        ),
        answer(
          "Swinging from vines over a hidden lagoon",
          "Me balancer de liane en liane au-dessus d’un lagon caché",
          { rapunzel: 1, rosella: 2 }
        ),
        answer(
          "Headlining a sold-out show",
          "Être la tête d’affiche d’un concert complet",
          { eden: 1, erika: 2 }
        ),
        answer(
          "Flying across the sky on a winged horse",
          "Traverser le ciel sur un cheval ailé",
          { annika: 2, merliah: 1 }
        ),
        answer(
          "Turning into a swan for a night",
          "Me changer en cygne le temps d’une nuit",
          { elina: 1, odette: 2 }
        ),
        answer(
          "Opening a book that leads to another world",
          "Ouvrir un livre qui mène à un autre monde",
          { liana: 1, mariposa: 2 }
        ),
      ],
      prompt: {
        en: "If magic were real, you’d spend it on…",
        fr: "Si la magie existait, vous l’utiliseriez pour…",
      },
    },
  ],
  results: {
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
    eden: heroine(
      "Eden Starling",
      "Barbie in a Christmas Carol (2008)",
      "A star of the London stage who has to learn what the holidays are really for. You shine in front of a crowd and you like things done your way, but you can own a mistake, and once you open your heart you give more than anyone.",
      "Une vedette des scènes de Londres qui doit apprendre à quoi servent vraiment les fêtes. Vous brillez devant la foule et vous aimez que les choses se fassent à votre façon, mais vous savez reconnaître une erreur, et une fois votre cœur ouvert, vous donnez plus que personne."
    ),
    elina: heroine(
      "Elina",
      "Barbie: Fairytopia (2005)",
      "A flower fairy born without wings, who saves her world anyway. You are kind to every living thing, you don’t need anyone’s permission to help, and you have proved more than once that what makes you different is your strength.",
      "Une fée des fleurs née sans ailes, qui sauve son monde malgré tout. Vous êtes bienveillante envers tout ce qui vit, vous n’attendez la permission de personne pour aider, et vous avez prouvé plus d’une fois que votre différence fait votre force."
    ),
    erika: heroine(
      "Erika",
      "Barbie as the Princess and the Pauper (2004)",
      "A singer working to pay off a debt, who wants a life of her own choosing. You are independent, hard-working and honest, you sing when things get tough, and you won’t trade your freedom for anything, not even a crown.",
      "Une chanteuse qui travaille pour rembourser une dette et qui veut une vie choisie par elle. Vous êtes indépendante, travailleuse et honnête, vous chantez quand les choses se compliquent, et vous n’échangeriez votre liberté contre rien, pas même une couronne."
    ),
    genevieve: heroine(
      "Genevieve",
      "Barbie in the 12 Dancing Princesses (2006)",
      "One of twelve sisters, who dances through every hall and every worry. You are graceful and warm, your family is your whole world, and when someone threatens the people you love, you step up and lead.",
      "Une des douze sœurs, celle qui danse dans chaque salle et à travers chaque souci. Vous êtes gracieuse et chaleureuse, votre famille est tout pour vous, et quand quelqu’un menace ceux que vous aimez, vous prenez les choses en main."
    ),
    liana: heroine(
      "Liana",
      "Barbie and the Diamond Castle (2008)",
      "A girl who shares everything with her best friend, songs most of all. Friendship is your treasure and your magic: you would turn down anything, even a palace, before you would leave a friend behind.",
      "Une jeune fille qui partage tout avec sa meilleure amie, les chansons surtout. L’amitié est votre trésor et votre magie : vous refuseriez tout, même un palais, plutôt que d’abandonner une amie."
    ),
    mariposa: heroine(
      "Mariposa",
      "Barbie Mariposa (2008)",
      "A butterfly fairy who would rather read than flutter about. You are quiet, clever and full of ideas you found in books, and when an adventure finally comes, all that reading turns out to be exactly what saves the day.",
      "Une fée papillon qui préfère lire que voleter. Vous êtes discrète, maligne et pleine d’idées trouvées dans les livres, et quand l’aventure arrive enfin, toutes ces lectures sont justement ce qui sauve la situation."
    ),
    merliah: heroine(
      "Merliah",
      "Barbie in A Mermaid Tale (2010)",
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
  },
  slug: "which-barbie-character",
  title: {
    en: "Which Barbie character are you?",
    fr: "Quel personnage de Barbie êtes-vous ?",
  },
  verdict: { en: "You are", fr: "Vous êtes" },
};
