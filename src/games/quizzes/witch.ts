import type { Answer, Quiz } from "./quiz";

/**
 * What type of witch are you? Sixteen kinds of witch and twelve questions.
 * Each answer gives 2 points to the witch it describes best and 1 to another
 * it leans towards, and every witch is the best fit of three answers and the
 * lean of three more, so each can come out on top.
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
          "Pottering in the garden, hands in the soil",
          "Bricoler au jardin, les mains dans la terre",
          { fairy: 1, green: 2 }
        ),
        answer(
          "Baking something while the kettle sings",
          "Faire un gâteau pendant que la bouilloire chante",
          { cottage: 1, kitchen: 2 }
        ),
        answer(
          "A walk along the shore, whatever the weather",
          "Une balade au bord de la mer, quel que soit le temps",
          { sea: 2, storm: 1 }
        ),
        answer(
          "Taking a gadget apart and building something new from the pieces",
          "Démonter un gadget et construire autre chose avec les pièces",
          { eclectic: 1, tech: 2 }
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
          "A cluster of amethyst that glows by moonlight",
          "Une géode d’améthyste qui brille au clair de lune",
          { crystal: 2, moon: 1 }
        ),
        answer(
          "A candle you carved with old symbols yourself",
          "Une bougie que vous avez gravée vous-même de vieux symboles",
          { fire: 2, hedge: 1 }
        ),
        answer(
          "The star chart of the night you were born, beside a photo of someone you love",
          "La carte du ciel de votre naissance, à côté de la photo de quelqu’un que vous aimez",
          { cosmic: 2, love: 1 }
        ),
        answer(
          "A jar of odds and ends that nobody else understands",
          "Un bocal de bric-à-brac que personne d’autre ne comprend",
          { chaos: 1, eclectic: 2 }
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
          "Make the soup your gran made for broken hearts",
          "Vous lui préparez la soupe que votre grand-mère faisait pour les cœurs brisés",
          { hedge: 1, kitchen: 2 }
        ),
        answer(
          "Help them burn the old letters, out in the wind",
          "Vous l’aidez à brûler les vieilles lettres, dehors, dans le vent",
          { fire: 2, storm: 1 }
        ),
        answer(
          "Hand them a smoky quartz and tell them the truth, kind and hard at once",
          "Vous lui tendez un quartz fumé et lui dites la vérité, avec douceur et sans détour",
          { crystal: 1, grey: 2 }
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
          "A clear, cold night under a full moon",
          "Une nuit claire et froide sous la pleine lune",
          { cosmic: 1, moon: 2 }
        ),
        answer(
          "Rain on the window, a blanket and someone you love",
          "La pluie à la fenêtre, un plaid et quelqu’un que vous aimez",
          { cottage: 2, love: 1 }
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
          "One to make anything grow, from basil to tomatoes",
          "Un sort pour tout faire pousser, du basilic aux tomates",
          { green: 2, kitchen: 1 }
        ),
        answer(
          "A glamour to feel unstoppable",
          "Un charme pour vous sentir irrésistible",
          { fire: 1, love: 2 }
        ),
        answer(
          "Something nobody has ever tried, just to see",
          "Un sort que personne n’a jamais tenté, juste pour voir",
          { chaos: 2, eclectic: 1 }
        ),
        answer(
          "A protection charm for your phone and your passwords",
          "Un charme de protection pour votre téléphone et vos mots de passe",
          { grey: 1, tech: 2 }
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
          "By a crackling hearth",
          "Près d’un feu de cheminée qui crépite",
          { cottage: 2, fire: 1 }
        ),
        answer(
          "In a lighthouse, watching the moon on the water",
          "Dans un phare, à regarder la lune sur l’eau",
          { moon: 1, sea: 2 }
        ),
        answer(
          "In a rooftop observatory full of screens",
          "Dans un observatoire sur les toits, plein d’écrans",
          { cosmic: 2, tech: 1 }
        ),
        answer(
          "In a mossy clearing where the fair folk dance",
          "Dans une clairière moussue où dansent les fées",
          { fairy: 2, green: 1 }
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
          "Old wisdom, like a family recipe",
          "Une sagesse ancienne, comme une recette de famille",
          { hedge: 2, kitchen: 1 }
        ),
        answer("Suggestions, at best", "Des suggestions, au mieux", {
          chaos: 2,
          storm: 1,
        }),
        answer(
          "Open source: take what works, rewrite the rest",
          "Du code libre : on prend ce qui marche, on réécrit le reste",
          { eclectic: 2, tech: 1 }
        ),
        answer(
          "Like the planets: everything in its orbit, light and dark in balance",
          "Comme les planètes : chaque chose sur son orbite, l’ombre et la lumière en équilibre",
          { cosmic: 1, grey: 2 }
        ),
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
        answer(
          "A quartz pendulum, swinging between yes and no",
          "Un pendule de quartz, qui oscille entre oui et non",
          { crystal: 2, grey: 1 }
        ),
        answer(
          "A laptop with a sigil for a wallpaper",
          "Un ordinateur avec un sigil en fond d’écran",
          { chaos: 1, tech: 2 }
        ),
        answer(
          "A silver bowl of water for scrying",
          "Un bol d’argent rempli d’eau pour la divination",
          { moon: 2, sea: 1 }
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
          "At the full moon, with your crystals charging on the sill",
          "À la pleine lune, avec vos cristaux qui se rechargent sur le rebord de la fenêtre",
          { crystal: 1, moon: 2 }
        ),
        answer("In the middle of a storm at sea", "En pleine tempête en mer", {
          sea: 1,
          storm: 2,
        }),
        answer(
          "When the candles are lit and the house is quiet",
          "Quand les bougies sont allumées et que la maison est calme",
          { cottage: 1, fire: 2 }
        ),
        answer(
          "When the planets line up and anything feels possible",
          "Quand les planètes s’alignent et que tout semble possible",
          { cosmic: 2, eclectic: 1 }
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
          "Shells and sea glass, and the odd fairy stone",
          "Des coquillages, du verre de mer et parfois une pierre de fée",
          { fairy: 1, sea: 2 }
        ),
        answer(
          "Old family remedies, handwritten",
          "De vieux remèdes de famille, écrits à la main",
          { cottage: 1, hedge: 2 }
        ),
        answer(
          "A bit of everything, and far too many browser tabs",
          "Un peu de tout, et beaucoup trop d’onglets ouverts",
          { eclectic: 2, tech: 1 }
        ),
        answer(
          "Rose quartz hearts in every size",
          "Des cœurs en quartz rose de toutes les tailles",
          { crystal: 2, love: 1 }
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
          "A toad from the garden pond who knows the old ways",
          "Un crapaud de la mare du jardin, qui connaît les anciennes coutumes",
          { green: 2, hedge: 1 }
        ),
        answer(
          "A black cat who sits by the fire and judges everyone equally",
          "Un chat noir qui se tient près du feu et juge tout le monde de la même façon",
          { fire: 1, grey: 2 }
        ),
        answer(
          "A raven who rides the wind and steals shiny things",
          "Un corbeau qui chevauche le vent et vole tout ce qui brille",
          { chaos: 1, storm: 2 }
        ),
        answer(
          "A moth that flies out to meet the moon",
          "Un papillon de nuit qui s’envole à la rencontre de la lune",
          { fairy: 2, moon: 1 }
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
          "Teaching everyone to love themselves, rose quartz included",
          "En apprenant à chacun à s’aimer, quartz rose compris",
          { crystal: 1, love: 2 }
        ),
        answer(
          "Leaving wild places wild, for the spirits who live there",
          "En laissant les lieux sauvages à l’état sauvage, pour les esprits qui y vivent",
          { fairy: 2, green: 1 }
        ),
        answer(
          "Rearranging the stars, just to see what happens",
          "En réarrangeant les étoiles, juste pour voir ce qui se passe",
          { chaos: 2, cosmic: 1 }
        ),
        answer(
          "Keeping every home warm and every table full",
          "En gardant chaque foyer au chaud et chaque table bien garnie",
          { cottage: 2, kitchen: 1 }
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
        en: "Magic with a digital twist: sigils for wallpapers, playlists for spells, a tarot app and a well-guarded password. Your wand has a battery.",
        fr: "La magie version numérique : des sigils en fond d’écran, des playlists en guise de sorts, une appli de tarot et un mot de passe bien gardé. Votre baguette a une batterie.",
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
