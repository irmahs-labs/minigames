import { useCopy } from "../../lib/language";

const COPY = {
  en: {
    rules: [
      "Pink 🌸 starts, on any planet. Then Purple 🔮, and so on.",
      "The square you take sends the other player to the planet it is named after.",
      "Three in a row on a planet conquers it.",
      "Sent to a planet that is conquered or full? Visit any planet.",
      "Conquer three planets in a row to win.",
    ],
    title: "How to play",
  },
  fr: {
    rules: [
      "Rose 🌸 commence, sur n’importe quelle planète. Puis Violet 🔮, et ainsi de suite.",
      "La case que vous prenez envoie l’autre joueur sur la planète dont elle porte le nom.",
      "Trois cases alignées sur une planète la conquièrent.",
      "Envoyé sur une planète conquise ou pleine ? Allez sur n’importe quelle planète.",
      "Conquérez trois planètes alignées pour gagner.",
    ],
    title: "Comment jouer",
  },
};

/** The rules in five lines, under both the local and the online game. */
export const HowToPlay = () => {
  const t = useCopy(COPY);

  return (
    <div className="stack">
      <h3 className="field-label">{t.title}</h3>
      <ol className="how-to">
        {t.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
    </div>
  );
};
