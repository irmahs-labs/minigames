import type { Answer, Quiz } from "./quiz";

/**
 * Are they your life partner? Five questions, each with a green answer, an
 * unsure one and a red flag, in a different order each time. A green answer
 * gives The one 1 point and an unsure one gives Food for thought 1, but a red
 * flag gives Time to run 2: one red flag outweighs one green answer. A tie goes
 * to Food for thought, whose English name comes first.
 */
const green = (en: string, fr: string): Answer => ({
  points: { one: 1 },
  text: { en, fr },
});

const unsure = (en: string, fr: string): Answer => ({
  points: { think: 1 },
  text: { en, fr },
});

const red = (en: string, fr: string): Answer => ({
  points: { run: 2 },
  text: { en, fr },
});

export const LIFE_PARTNER_QUIZ: Quiz = {
  blurb: {
    en: "Five honest questions about the person you love. Are they your life partner?",
    fr: "Cinq questions honnêtes sur la personne que vous aimez. Est-ce votre partenaire de vie ?",
  },
  legend: "life-partner.txt",
  questions: [
    {
      answers: [
        green(
          "Yes, I’d take it as a lovely compliment",
          "Oui, je le prendrais comme un joli compliment"
        ),
        unsure(
          "It depends which side of them they mean",
          "Ça dépend de quel côté de cette personne on parle"
        ),
        red(
          "No, I’d rather not hear that",
          "Non, je préférerais ne pas entendre ça"
        ),
      ],
      prompt: {
        en: "If someone told you you’re just like your partner, would that be a compliment to you?",
        fr: "Si quelqu’un vous disait que vous êtes tout le portrait de votre partenaire, le prendriez-vous comme un compliment ?",
      },
    },
    {
      answers: [
        red(
          "Honestly, mostly just less lonely",
          "Pour être honnête, surtout moins de solitude"
        ),
        green(
          "Truly fulfilled: my life is fuller with them in it",
          "Elle me comble : ma vie est plus riche avec cette personne"
        ),
        unsure("It depends on the day", "Ça dépend des jours"),
      ],
      prompt: {
        en: "Does your partner make you feel fully fulfilled, or just less lonely?",
        fr: "Votre relation vous comble-t-elle vraiment, ou vous évite-t-elle seulement la solitude ?",
      },
    },
    {
      answers: [
        unsure(
          "Mostly who they are, with a few hopes on the side",
          "Surtout celle d’aujourd’hui, avec quelques espoirs en plus"
        ),
        red(
          "Who they could be, if only they changed",
          "Celle qu’elle pourrait être, si seulement elle changeait"
        ),
        green(
          "Who they are today, just as they are",
          "Celle qu’elle est aujourd’hui, telle qu’elle est"
        ),
      ],
      prompt: {
        en: "Are you in love with the person they are right now, or with their potential?",
        fr: "Aimez-vous la personne qu’elle est aujourd’hui, ou son potentiel ?",
      },
    },
    {
      answers: [
        green(
          "Completely myself, quirks and all",
          "Entièrement moi-même, avec toutes mes manies"
        ),
        red(
          "I often hide parts of me to keep the peace",
          "Je cache souvent une part de moi pour avoir la paix"
        ),
        unsure(
          "Mostly, though I still tone a few things down",
          "Presque, même si j’atténue encore certaines choses"
        ),
      ],
      prompt: {
        en: "Can you be truly yourself with them, or do you sometimes hide parts of you just to keep them comfortable?",
        fr: "Pouvez-vous être vraiment vous-même avec cette personne, ou cachez-vous parfois une part de vous pour la mettre à l’aise ?",
      },
    },
    {
      answers: [
        unsure(
          "I’d want a long talk with them first",
          "J’en parlerais d’abord longuement avec mon enfant"
        ),
        green(
          "I’d be happy for them: that’s what I’d wish them",
          "Je m’en réjouirais : c’est ce que je lui souhaite"
        ),
        red("I’d tell them to run", "Je lui dirais de fuir"),
      ],
      prompt: {
        en: "If your child dated someone just like your partner, would you be happy for them, or tell them to run?",
        fr: "Si votre enfant sortait avec quelqu’un tout comme votre partenaire, vous en réjouiriez-vous, ou lui diriez-vous de fuir ?",
      },
    },
  ],
  results: {
    one: {
      about: {
        en: "Green lights all the way. You love the person in front of you, not who they might become, you can be all of yourself with them, and you’d wish someone just like them on the people you love most. That sounds like a life partner.",
        fr: "Que des feux verts. Vous aimez la personne qui est en face de vous, pas celle qu’elle pourrait devenir, vous pouvez être pleinement vous-même avec elle, et vous souhaiteriez quelqu’un comme elle à ceux que vous aimez le plus. Ça ressemble à un partenaire de vie.",
      },
      name: { en: "The one", fr: "La bonne personne" },
    },
    run: {
      about: {
        en: "A red flag counts double here, and yours outweigh the rest. Being less lonely isn’t the same as being fulfilled, and you deserve someone it would be a compliment to resemble.",
        fr: "Ici, un signal d’alarme compte double, et les vôtres l’emportent. Avoir moins de solitude, ce n’est pas le bonheur, et vous méritez quelqu’un à qui ressembler serait un compliment.",
      },
      name: { en: "Time to run", fr: "Fuyez !" },
    },
    think: {
      about: {
        en: "Not a no, not quite a yes. There’s plenty here you love, and a few things you’re not sure of. They’re worth an honest talk, with them and with yourself, starting with the answers you hesitated on.",
        fr: "Pas un non, pas tout à fait un oui. Il y a beaucoup de choses que vous aimez, et quelques doutes. Ils valent une discussion honnête, avec cette personne et avec vous-même, en commençant par les réponses où vous avez hésité.",
      },
      name: { en: "Food for thought", fr: "Matière à réflexion" },
    },
  },
  slug: "are-they-your-life-partner",
  title: {
    en: "Are they your life partner?",
    fr: "Est-ce votre partenaire de vie ?",
  },
  verdict: { en: "Verdict:", fr: "Verdict :" },
};
