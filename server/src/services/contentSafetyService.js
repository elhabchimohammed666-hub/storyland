// Content safety check for child appropriateness (supporting English, French, Arabic)

const UNSAFE_KEYWORDS = [
  // Violence / Harm
  'kill', 'murder', 'blood', 'weapon', 'gun', 'knife', 'suicide', 'die', 'death', 'corpse',
  'tuer', 'meurtre', 'sang', 'arme', 'fusil', 'couteau', 'mort', 'cadavre',
  'قتل', 'سلاح', 'دم', 'موت', 'سكين', 'انتحار',

  // Adult / Inappropriate
  'sex', 'porn', 'naked', 'drug', 'alcohol', 'cigarette', 'beer', 'wine', 'drunk',
  'drogue', 'alcool', 'biere', 'vin', 'nu', 'sexe',
  'مخدرات', 'كحول', 'جنس',

  // Hate / Profanity
  'hate', 'ugly', 'stupid', 'idiot', 'bastard', 'curse',
  'haine', 'idiot', 'merde',
  'كراهية', 'غبي'
];

export const checkContentSafety = (text) => {
  if (!text || typeof text !== 'string') return { safe: true };

  const normalized = text.toLowerCase();
  for (const word of UNSAFE_KEYWORDS) {
    // Word boundary or containment check
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        safe: false,
        reason: `Content contains inappropriate language or theme for children: "${word}"`,
      };
    }
  }

  return { safe: true };
};

export const sanitizeStoryPages = (pages) => {
  for (const page of pages) {
    const safety = checkContentSafety(page.content);
    if (!safety.safe) {
      return safety;
    }
  }
  return { safe: true };
};
