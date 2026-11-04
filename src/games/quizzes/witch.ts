import type { Answer, Quiz } from "./quiz";

/**
 * What type of witch are you? Sixteen kinds of witch and twelve questions of
 * six answers. Each answer gives 2 points to the witch it describes best, and
 * most give 1 to another it leans towards. Every witch is worth 13 points over
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
    en: "Twelve questions, sixteen kinds of witch. Find out which one you are, and how much of the others.",
    fr: "Douze questions, seize types de sorcière. Découvrez lequel est le vôtre, et ce que vous avez des autres.",
  },
  legend: "which-witch.txt",
  questions: [
    {
      answers: [
        answer(
          "Gardening, hands in the soil",
          "Jardiner, les mains dans la terre",
          { fairy: 1, green: 2 }
        ),
        answer(
          "Baking with the kettle on",
          "Faire un gâteau, la bouilloire sur le feu",
          { cottage: 1, kitchen: 2 }
        ),
        answer(
          "A walk on the beach, rain or shine",
          "Une balade sur la plage, qu’il pleuve ou qu’il vente",
          { sea: 2, storm: 1 }
        ),
        answer("Tinkering with an old radio", "Bricoler une vieille radio", {
          eclectic: 1,
          tech: 2,
        }),
        answer("Reading in bed till noon", "Lire au lit jusqu’à midi", {
          moon: 2,
        }),
        answer("Playing with your pets", "Jouer avec vos animaux", {
          hedge: 1,
          love: 2,
        }),
      ],
      prompt: {
        en: "Your ideal Saturday morning?",
        fr: "Votre samedi matin idéal ?",
      },
    },
    {
      answers: [
        answer("A cluster of amethyst", "Une géode d’améthyste", {
          crystal: 2,
          moon: 1,
        }),
        answer(
          "A candle you carved yourself",
          "Une bougie gravée de vos mains",
          { fire: 2, hedge: 1 }
        ),
        answer("Your birth chart", "Votre thème astral", {
          cosmic: 2,
          love: 1,
        }),
        answer("A jar of odds and ends", "Un bocal de bric-à-brac", {
          chaos: 1,
          eclectic: 2,
        }),
        answer("A jar of storm water", "Un bocal d’eau d’orage", {
          grey: 1,
          storm: 2,
        }),
        answer(
          "Fresh bread and dried herbs",
          "Du pain frais et des herbes séchées",
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
          "A thunderstorm: beautiful and dangerous at once",
          "Un orage : beau et dangereux à la fois",
          { grey: 1, storm: 2 }
        ),
        answer(
          "A misty morning in the woods",
          "Un matin de brume dans les bois",
          {
            fairy: 1,
            hedge: 2,
          }
        ),
        answer(
          "A clear night under a full moon",
          "Une nuit claire sous la pleine lune",
          { cosmic: 1, moon: 2 }
        ),
        answer(
          "Rain on the window, and a blanket",
          "La pluie à la fenêtre, et un plaid",
          { cottage: 2, love: 1 }
        ),
        answer(
          "Snow, every flake a tiny crystal",
          "La neige, chaque flocon un petit cristal",
          { crystal: 2, sea: 1 }
        ),
        answer("A clear, sunny day", "Une belle journée de soleil", {
          eclectic: 1,
          fire: 2,
        }),
      ],
      prompt: {
        en: "Your favourite weather?",
        fr: "Votre temps préféré ?",
      },
    },
    {
      answers: [
        answer("One to make anything grow", "Un sort pour tout faire pousser", {
          green: 2,
          kitchen: 1,
        }),
        answer(
          "A glamour to feel unstoppable",
          "Un charme pour vous sentir irrésistible",
          { fire: 1, love: 2 }
        ),
        answer(
          "One nobody has ever tried",
          "Un sort que personne n’a jamais tenté",
          { chaos: 2, eclectic: 1 }
        ),
        answer("A charm to mend anything", "Un charme pour tout réparer", {
          grey: 1,
          tech: 2,
        }),
        answer(
          "One to call the wind and rain",
          "Un sort pour appeler le vent et la pluie",
          { storm: 2 }
        ),
        answer("One to talk to animals", "Un sort pour parler aux animaux", {
          hedge: 2,
        }),
      ],
      prompt: {
        en: "The first spell you’d learn?",
        fr: "Le premier sort que vous apprendriez ?",
      },
    },
    {
      answers: [
        answer("By a crackling fire", "Près d’un feu qui crépite", {
          cottage: 2,
          fire: 1,
        }),
        answer(
          "In a lighthouse by the sea",
          "Dans un phare au bord de la mer",
          { moon: 1, sea: 2 }
        ),
        answer(
          "In an observatory, under the stars",
          "Dans un observatoire, sous les étoiles",
          { cosmic: 2, tech: 1 }
        ),
        answer(
          "In a mossy fairy glade",
          "Dans une clairière moussue, chez les fées",
          { fairy: 2, green: 1 }
        ),
        answer(
          "In a cave of glittering crystals",
          "Dans une grotte de cristaux scintillants",
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
        answer("Old wisdom, passed down", "Une sagesse ancienne, transmise", {
          hedge: 2,
          kitchen: 1,
        }),
        answer("Suggestions, at best", "Des suggestions, au mieux", {
          chaos: 2,
          storm: 1,
        }),
        answer(
          "Take what works, tinker with the rest",
          "On prend ce qui marche, on bricole le reste",
          { eclectic: 2, tech: 1 }
        ),
        answer("All about balance", "Une question d’équilibre", {
          cosmic: 1,
          grey: 2,
        }),
        answer(
          "Like the tides: always changing",
          "Comme les marées : toujours changeantes",
          { moon: 2, sea: 1 }
        ),
        answer("Kindness first", "La gentillesse d’abord", { love: 2 }),
      ],
      prompt: {
        en: "Rules are…",
        fr: "Les règles, c’est…",
      },
    },
    {
      answers: [
        answer("A mortar and pestle", "Un mortier et son pilon", {
          green: 1,
          kitchen: 2,
        }),
        answer("A quartz pendulum", "Un pendule de quartz", {
          crystal: 2,
          grey: 1,
        }),
        answer(
          "A toolbox of spare parts",
          "Une boîte à outils pleine de pièces détachées",
          { chaos: 1, tech: 2 }
        ),
        answer("A silver scrying bowl", "Un bol d’argent pour la divination", {
          moon: 2,
          sea: 1,
        }),
        answer(
          "A broom to sweep out bad luck",
          "Un balai pour chasser la malchance",
          { cottage: 2, hedge: 1 }
        ),
        answer("A brass astrolabe", "Un astrolabe en laiton", { cosmic: 2 }),
      ],
      prompt: {
        en: "Pick a tool.",
        fr: "Choisissez un outil.",
      },
    },
    {
      answers: [
        answer("At the full moon", "À la pleine lune", { crystal: 1, moon: 2 }),
        answer("In the middle of a storm", "En pleine tempête", {
          sea: 1,
          storm: 2,
        }),
        answer("By candlelight", "À la lueur des bougies", {
          cottage: 1,
          fire: 2,
        }),
        answer("When the planets align", "Quand les planètes s’alignent", {
          cosmic: 2,
          eclectic: 1,
        }),
        answer("At dawn, in the garden", "À l’aube, au jardin", {
          fairy: 2,
          green: 1,
        }),
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
        answer("Shells and sea glass", "Des coquillages et du verre de mer", {
          fairy: 1,
          sea: 2,
        }),
        answer("Old family remedies", "De vieux remèdes de famille", {
          cottage: 1,
          hedge: 2,
        }),
        answer("A bit of everything", "Un peu de tout", {
          eclectic: 2,
          tech: 1,
        }),
        answer("Rose quartz hearts", "Des cœurs en quartz rose", {
          crystal: 2,
          love: 1,
        }),
        answer("Jars of homemade jam", "Des pots de confiture maison", {
          green: 1,
          kitchen: 2,
        }),
        answer(
          "Candles in every colour",
          "Des bougies de toutes les couleurs",
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
        answer(
          "A toad from the garden pond",
          "Un crapaud de la mare du jardin",
          { green: 2, hedge: 1 }
        ),
        answer(
          "A black cat who judges everyone",
          "Un chat noir qui juge tout le monde",
          { fire: 1, grey: 2 }
        ),
        answer(
          "A raven who steals shiny things",
          "Un corbeau qui vole tout ce qui brille",
          { chaos: 1, storm: 2 }
        ),
        answer(
          "A moth drawn to the moon",
          "Un papillon de nuit attiré par la lune",
          { fairy: 2, moon: 1 }
        ),
        answer(
          "A clockwork owl you built",
          "Une chouette mécanique faite de vos mains",
          { cosmic: 1, tech: 2 }
        ),
        answer(
          "A seal who visits at high tide",
          "Un phoque qui vient à marée haute",
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
          "Teaching everyone to love themselves",
          "En apprenant à chacun à s’aimer",
          { crystal: 1, love: 2 }
        ),
        answer("Keeping wild places wild", "En protégeant les lieux sauvages", {
          fairy: 2,
          green: 1,
        }),
        answer("Rearranging the stars", "En réarrangeant les étoiles", {
          chaos: 2,
          cosmic: 1,
        }),
        answer("Keeping every home warm", "En gardant chaque foyer au chaud", {
          cottage: 2,
          kitchen: 1,
        }),
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
