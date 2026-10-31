import type { Language } from "./language";

/**
 * The server's refusals are English sentences (server/app.ts and
 * server/lobby.ts). This is each of them in French, for a visitor reading
 * the site in French; a sentence it doesn't know shows as the server wrote it.
 */
const FRENCH = new Map([
  [
    "Brews are only taken from the site itself.",
    "Les préparations ne sont acceptées que depuis le site lui-même.",
  ],
  ["Sign in to brew.", "Connectez-vous pour préparer une potion."],
  [
    "The cauldron needs a moment. Try again in a minute.",
    "Le chaudron a besoin d’un moment. Réessayez dans une minute.",
  ],
  ["That brew was not understood.", "Cette préparation n’a pas été comprise."],
  ["There is no potion by that name.", "Aucune potion ne porte ce nom."],
  [
    "Sign in to keep your own grimoire.",
    "Connectez-vous pour tenir votre propre grimoire.",
  ],
  [
    "Only the site itself can start a grimoire over.",
    "Seul le site lui-même peut recommencer un grimoire.",
  ],
  ["Sign in to start over.", "Connectez-vous pour recommencer."],
  [
    "Notes are only taken from the site itself.",
    "Les notes ne sont acceptées que depuis le site lui-même.",
  ],
  ["Sign in to stick a note.", "Connectez-vous pour coller une note."],
  ["That note can't go up.", "Cette note ne peut pas être collée."],
  [
    "Votes are only taken from the site itself.",
    "Les votes ne sont acceptés que depuis le site lui-même.",
  ],
  ["Sign in to vote.", "Connectez-vous pour voter."],
  [
    "That's a lot of votes. Try again in a minute.",
    "Ça fait beaucoup de votes. Réessayez dans une minute.",
  ],
  ["That vote was not understood.", "Ce vote n’a pas été compris."],
  ["There is no such note.", "Cette note n’existe pas."],
  [
    "Notes are only taken down from the site itself.",
    "Les notes ne sont décrochées que depuis le site lui-même.",
  ],
  ["Sign in to take a note down.", "Connectez-vous pour décrocher une note."],
  [
    "Only an admin can take a note down.",
    "Seul un admin peut décrocher une note.",
  ],
  [
    "Sockets are only accepted from the site itself.",
    "Les connexions ne sont acceptées que depuis le site lui-même.",
  ],
  ["Sign in to play online.", "Connectez-vous pour jouer en ligne."],
  ["You are not in a game.", "Vous n’êtes pas dans une partie."],
  ["It is not your turn.", "Ce n’est pas votre tour."],
  ["That square cannot be played.", "Cette case ne peut pas être jouée."],
  // The board's own, when the server didn't say
  ["The note didn't go up.", "La note n’a pas été collée."],
  [
    "The board's answer made no sense.",
    "La réponse du tableau n’avait aucun sens.",
  ],
  [
    "The board can't be reached right now.",
    "Le tableau est injoignable pour le moment.",
  ],
]);

const NOTES_A_DAY =
  /^That's your (?<count>\d+) notes for today\. More once one comes down\.$/u;

/** A sentence from the server, in the page's language. */
export const serverWords = (message: string, language: Language): string => {
  if (language === "en") {
    return message;
  }

  const count = NOTES_A_DAY.exec(message)?.groups?.count;

  if (count) {
    return `C’est votre quota de ${count} notes pour aujourd’hui. D’autres dès qu’une sera décrochée.`;
  }

  return FRENCH.get(message) ?? message;
};
