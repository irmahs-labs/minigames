import type { Retrograde, Wanderer } from "./sky";
import { placementOf } from "./zodiac";

/**
 * What each planet's retrograde is said to stir up, sign by sign: the same
 * for everyone, so each card reads the sign its planet turns back in. A
 * Mercury retrograde in Pisces and one in Scorpio say different things.
 */
/** One line for each sign, Aries to Pisces. */
type BySign = readonly [
  aries: string,
  taurus: string,
  gemini: string,
  cancer: string,
  leo: string,
  virgo: string,
  libra: string,
  scorpio: string,
  sagittarius: string,
  capricorn: string,
  aquarius: string,
  pisces: string,
];

export const RETROGRADE_LORE: Readonly<Record<Wanderer, BySign>> = {
  Jupiter: [
    "Bold plans want a second look. Grow your courage quietly before you leap.",
    "Abundance turns inward. Enjoy what you already have, and slow the spending down.",
    "Too many ideas, not enough depth. Pick one subject and study it properly.",
    "Growth starts at home. Tend your roots, your family and your inner safety.",
    "Joy turns inward. Find what makes you play when nobody is clapping.",
    "Growth comes from small fixes. Refine your habits and your health instead of chasing big wins.",
    "Partnerships come up for review. Notice where you give too much and where you take.",
    "Shared money, debts and trust come up. Grow by letting go of what you hold too tight.",
    "Jupiter at home asks what you really believe. Revisit your faith, your studies and your travel dreams.",
    "Ambition meets realism. Rebuild the plan so it grows on firmer ground.",
    "Growth through the group. Rethink your ideals and the circles you belong to.",
    "Spiritual growth goes inward. Dream, meditate, and trust the quiet nudges.",
  ],
  Mars: [
    "Mars at home, and frustrated: energy flares, then fizzles. Put it into finishing, not starting.",
    "Stubborn standoffs, often over money. Slow, steady effort beats force.",
    "Arguments by text and energy scattered in ten directions. Pick one project and stop debating.",
    "Anger turns inward or leaks out at home. Name your feelings plainly, and rest more.",
    "Bruised pride and creative blocks. Return to an old project instead of chasing applause.",
    "Burnout from overwork. Fix your routines and your body before you push harder.",
    "Passive-aggression creeps into relationships. Say what you want, and fight fair.",
    "Grudges simmer and power games tempt. Transform the anger instead of acting on it.",
    "Restless energy with nowhere to go. Plan the adventure before you book it.",
    "Ambition stalls and progress feels slow. Rework the plan and the structure under it.",
    "Rebellion looking for a cause. Rethink which fights and groups deserve your fire.",
    "Motivation dissolves like salt in water. Rest, swim, and go with the current.",
  ],
  Mercury: [
    "Words come out before thoughts do. Count to ten before you send, and revisit plans you rushed.",
    "Money talk and contracts stall. Recheck bank details, subscriptions, and anything signed in a hurry.",
    "Mercury at home turns up the chaos: crossed wires, double bookings, lost chargers. Write everything down twice.",
    "Old family stories and unsaid feelings resurface. Call home, and listen more than you explain.",
    "Pride gets in the way of clear words. Revise your creative work and how you present yourself.",
    "Details slip through the cracks at work and in your schedule. Proofread, refile, and redo the to-do list.",
    "Misunderstandings in partnerships and deals. Hold off on signing, and give old conversations a second hearing.",
    "Secrets surface and suspicion creeps in. Research and dig deep, but don't read too much into a short reply.",
    "Travel plans tangle and big opinions clash. Double-check bookings and passports, and rethink a belief you hold tight.",
    "Work plans and deadlines slide. Review your long-term goals and the routines that carry them.",
    "Tech glitches and group chats misfire. Update your devices, back up, and rethink your place in the group.",
    "Thoughts go foggy and dreamy; facts get lost. Keep a dream journal, trust your gut, and check the details twice.",
  ],
  Neptune: [
    "Illusions about yourself fall away. See your own fire as it is.",
    "The haze lifts from money and comfort. Get real about what things are worth.",
    "Misinformation clears. Check your sources, then trust your own read.",
    "The fog lifts from family myths. See your roots as they really are.",
    "The glamour fades from fame and romance. What stays is real.",
    "The dream of perfection dissolves. Help others without becoming a martyr.",
    "Rose-coloured views of relationships clear up. See partners as they are.",
    "Hidden truths about intimacy and power drift out of the fog.",
    "Illusions about gurus and faiths dissolve. Find a truth of your own.",
    "Illusions about success and institutions fade. Ask who your ambition serves.",
    "Utopian dreams meet reality. Keep the ideal, drop the fantasy.",
    "Neptune at home: dreams run vivid and boundaries thin. Ground yourself, and trust your psychic hits.",
  ],
  Pluto: [
    "A struggle with the self. Let go of who you were to become who you are.",
    "Deep change in money and values, right down at the roots.",
    "The way we think and speak transforms. Let an old story about yourself die.",
    "Ancestral patterns rise to be healed. Do the shadow work your family skipped.",
    "Ego death and creative rebirth. Burn what was only for show.",
    "Transformation through work and health. Release the habits that drain you.",
    "Power in relationships is laid bare. Rebalance it, quietly.",
    "Pluto at home: deep shadow work, endings and rebirth.",
    "Beliefs die and are reborn. Let a certainty go.",
    "The structures of power are examined from within, yours included.",
    "Buried things surface in the collective and online. Leave behind the communities you have outgrown.",
    "Old illusions dissolve for a spiritual rebirth. Let the tide take what it takes.",
  ],
  Saturn: [
    "Lessons in patience and in going it alone. Shore up your self-discipline.",
    "Lessons in money and security. Review your budget and what you have built slowly.",
    "Lessons in words and learning. Finish the course, and keep your promises.",
    "Family duties and old emotional patterns come back for review. Set boundaries at home.",
    "Lessons in recognition. Do the creative work for its own sake.",
    "Work and health routines come back for review. Let perfectionism soften into practice.",
    "Commitments come back for review. Restructure the relationships that tip out of balance.",
    "Lessons in trust, control and shared money. Face what you have been avoiding.",
    "Beliefs are tested. Keep what holds weight, and drop what doesn't.",
    "Saturn at home reviews your career and your authority. Rebuild ambitions on solid ground.",
    "Lessons in community and in what you owe the group. Shore up the foundations you skipped.",
    "Dreams and escapes need boundaries. Give your spiritual practice a shape.",
  ],
  Uranus: [
    "The urge to break free turns inward. Reinvent yourself from the inside first.",
    "Shake-ups around money, the body and the land slow down. Rethink what security means to you.",
    "Change works on how we think and talk. Unlearn an old way of seeing things.",
    "Home and family arrangements shift beneath the surface. Make room for a new kind of nest.",
    "Creative breakthroughs brew in secret. Surprise people later; experiment now.",
    "Work and health routines want reinventing. Change one small habit at a time.",
    "Relationships restructure quietly. Find freedom inside partnership.",
    "Hidden change in intimacy, power and shared resources. Expect what you did not see coming.",
    "Beliefs shift under the surface. Question the teachers you followed.",
    "Old structures crack quietly. Rethink the career path you were handed.",
    "Uranus at home: rebel ideas incubate. Prepare the change you want to see.",
    "Awakenings arrive in dreams. Trust the strange intuitions.",
  ],
  Venus: [
    "Impulsive crushes and quick fights. Let passion cool before you act, and don't cut your own hair.",
    "Money and comforts come up for review. Hold off on luxuries, and notice what truly makes you feel safe.",
    "Flirty texts from the past light up your phone. Say what you want from love instead of chasing novelty.",
    "Nostalgia for old loves and old homes. Tend your family bonds and the way you care for yourself.",
    "Romance wants an audience and doesn't get one. Revisit how you show love and what makes you feel adored.",
    "Love gets picked apart. Be gentle with flaws, yours included, and mend the small rituals of care.",
    "Exes and old tastes return, and every scale tips. Weigh what you give and take before committing to anything new.",
    "Jealousy, old wounds and intense exes resurface. Heal what is under the surface, and stay out of power games in love and money.",
    "Freedom versus commitment. Rethink what you are looking for before a whirlwind trip with a new flame.",
    "Love meets duty. Review long-term commitments and your finances; slow is wise.",
    "Friendships and unusual loves come back around. Ask how much closeness you really want.",
    "The rose-coloured glasses slip. See people as they are; forgive, but don't rescue.",
  ],
};

/** What a retrograde of this planet, at this longitude, is said to bring. */
export const retrogradeLore = (planet: Wanderer, longitude: number): string =>
  RETROGRADE_LORE[planet][placementOf(longitude).index] ?? "";

/**
 * A retrograde's lore: its starting sign's, and when it backs into the sign
 * before, that sign's too.
 */
export const loreFor = ({ planet, start, end }: Retrograde): string[] => {
  const from = retrogradeLore(planet, start.longitude);
  const to = retrogradeLore(planet, end.longitude);

  return to === from ? [from] : [from, to];
};
