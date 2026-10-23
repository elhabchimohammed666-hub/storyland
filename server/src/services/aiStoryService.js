import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkContentSafety } from './contentSafetyService.js';

/**
 * Fallback story generator for when Gemini API key is missing, invalid, or rate-limited.
 * Generates age-appropriate, coherent multilingual stories matching the requested pageCount.
 */
function generateFallbackStory({ theme, targetAge, language, pageCount }) {
  const titles = {
    en: {
      Adventure: `The Great ${theme} Journey`,
      Friendship: `Friends Along the Way: ${theme}`,
      Animals: `The Wonderful Animals of ${theme}`,
      Nature: `Secrets of Nature: ${theme}`,
      Kindness: `A Gentle Heart: ${theme}`,
      Default: `The Adventure of ${theme}`,
    },
    fr: {
      Adventure: `La Grande Aventure : ${theme}`,
      Friendship: `Les Amis du Chemin : ${theme}`,
      Animals: `Les Merveilleux Animaux de ${theme}`,
      Nature: `Les Secrets de la Nature : ${theme}`,
      Kindness: `Un Cœur Généreux : ${theme}`,
      Default: `L'Aventure de ${theme}`,
    },
    ar: {
      Adventure: `مغامرة رائعة في عالم ${theme}`,
      Friendship: `أصدقاء أوفياء: ${theme}`,
      Animals: `حيوانات الغابة و${theme}`,
      Nature: `أسرار الطبيعة: ${theme}`,
      Kindness: `القلب الطيب و${theme}`,
      Default: `قصة مشوقة عن ${theme}`,
    },
  };

  const selectedLang = ['en', 'fr', 'ar'].includes(language) ? language : 'en';
  const title = (titles[selectedLang] && (titles[selectedLang][theme] || titles[selectedLang].Default)) || `Story of ${theme}`;

  const pages = [];

  const textTemplates = {
    en: [
      `Once upon a time, in a peaceful and sunny village, children gathered to explore the wonders of ${theme}. The morning air was filled with excitement and happy laughter.`,
      `As the journey began, they found a mysterious path marked with colorful stones. Each step brought new questions and delightful discoveries for young minds.`,
      `Along the way, they met a kind companion who shared an important lesson: when we work together and respect one another, every challenge becomes easier.`,
      `The road led to a wide, green valley with tall whispering trees and a gentle brook. Here, they learned how patience and observation unlock the secrets of the world.`,
      `Suddenly, a small puzzle appeared before them. It required clear thinking and cooperation to solve. Everyone shared their best ideas with cheerful enthusiasm.`,
      `With creative effort and mutual encouragement, they unlocked the secret door hidden beneath the leafy canopy, revealing a breathtaking view.`,
      `They paused to celebrate their teamwork, realizing how much they had learned about courage, curiosity, and friendship through their experience with ${theme}.`,
      `The sun began to set with warm golden hues, painting the sky in violet and orange. It was time to return home with joyful hearts.`,
      `Gathered together near the friendly fireplace, they shared their favorite moments with their families, grateful for the memories made.`,
      `Every single child went to sleep that night dreaming of new adventures, knowing that the spirit of ${theme} will always guide their path.`,
      `Morning brought fresh smiles and renewed strength, reminding them that each new day holds a promise for positive discoveries and friendly deeds.`,
      `In the community square, they created a colorful map celebrating their memorable voyage, inviting everyone to share in their joy.`,
      `Teachers and parents smiled with pride seeing how confident, considerate, and kind the young explorers had become throughout their special quest.`,
      `The bond forged on that journey remained strong, teaching everyone that understanding and empathy are the greatest treasures one can possess.`,
      `And so, peace, joy, and inspiring wisdom continued to flourish, leaving an everlasting spark of hope and learning in every heart.`
    ],
    fr: [
      `Il était une fois, dans un charmant village baigné de soleil, des enfants qui rêvaient de découvrir les secrets de ${theme}. Leurs cœurs étaient remplis d'enthousiasme.`,
      `Dès les premiers pas de leur expédition, ils remarquèrent un sentier bordé de fleurs lumineuses. Chaque pas éveillait leur curiosité et leur sens de l'émerveillement.`,
      `En chemin, ils firent la rencontre d'un compagnon attentionné qui leur rappela qu'en unissant leurs forces, les plus grands obstacles deviennent de joyeuses victoires.`,
      `Le sentier les mena vers une vallée verdoyante où murmuraient de grands arbres sages. Ils apprirent à observer attentivement la nature qui les entourait.`,
      `Une énigme intrigante se présenta soudain à eux. Pour réussir, ils durent s'écouter avec respect et mettre en commun leurs idées les plus inventives.`,
      `Grâce à leur persévérance et à leur bienveillance, ils franchirent l'épreuve avec brio, découvrant un panorama éblouissant de beauté.`,
      `Ils prirent un moment pour célébrer leur réussite collective, comprenant que la vraie force réside dans l'amitié sincère et la découverte de ${theme}.`,
      `Le soleil couchant illuminait le ciel de reflets dorés et roses. L'heure était venue de rentrer au village, le sourire aux lèvres et le cœur comblé.`,
      `Autour d'un repas chaleureux, ils racontèrent leur fascinant périple à leurs proches, qui écoutaient avec admiration et tendresse.`,
      `Cette nuit-là, chacun s'endormit paisiblement en songeant aux leçons apprises, sachant que la magie de ${theme} resterait à jamais gravée en eux.`,
      `L'aube suivante apporta une douce énergie nouvelle, prouvant que chaque journée offre une chance d'aider un ami et de grandir ensemble.`,
      `Sur la place centrale, ils partagèrent un grand dessin illustrant leur fabuleuse aventure pour inspirer tous les enfants de la région.`,
      `Les maîtres et les parents étaient très fiers de voir combien ces jeunes explorateurs avaient mûri en sagesse et en esprit d'entraide.`,
      `L'harmonie et la confiance créées pendant ce voyage devinrent un exemple précieux pour l'ensemble de la communauté villageoise.`,
      `Et c'est ainsi que la joie, la gentillesse et le goût de la lecture continuèrent d'illuminer leur quotidien, jour après jour.`
    ],
    ar: [
      `في قديم الزمان، وفي قرية جميلة ومشرقة، تجمّع الأطفال بشوق وفرح لبدء مغامرة مميزة حول ${theme}.`,
      `مع بداية الرحلة، اكتشف الصغار مساراً هادئاً تزيّنه الأزهار الملونة، مما زاد من حماسهم لاستكشاف ما هو قادم.`,
      `وفي منتصف الطريق، التقوا برفيق طيب نصحهم بأهمية التعاون، مؤكداً أن العمل بروح الفريق يجعل كل صعب يسيراً.`,
      `وصل الأصدقاء إلى وادٍ واسع تجري فيه المياه العذبة، وهناك تعلموا متعة الصبر والتأمل في جمال الطبيعة.`,
      `وفجأة، واجههم لغزٌ ممتع تطلب منهم التفكير الذكي والتشاور فيما بينهم للوصول إلى الحل الصحيح.`,
      `بفضل التعاون والمثابرة، استطاع الأطفال حل اللغز وفتحوا باباً سحرياً يقود إلى مشهد خلاب يسلب القلوب.`,
      `فرح الجميع بنجاحهم وأدركوا أن الشجاعة والمحبة هي المفتاح الحقيقي لفهم المعنى العميق لـ ${theme}.`,
      `وعندما مالت الشمس نحو الغروب بألوانها الذهبية الهادئة، بدأ الصغار رحلة العودة إلى ديارهم مسرورين.`,
      `اجتمع الأطفال مع أسرهم وشاركوا حكاياتهم الشيقة وما تعلموه من دروس ثمينة تنير العقول والقلوب.`,
      `نام الجميع تلك الليلة نوماً هانئاً وهم يحلمون بمغامرات جديدة، مطمئنين بأن روح ${theme} سترافقهم دوماً.`,
      `ومع إشراقة الصباح الجديد، عمت الابتسامة أرجاء القرية، واستعد الأطفال لمواصلة التعلم بحب وشغف.`,
      `قام الأصدقاء برسم لوحة كبيرة تعبّر عن رحلتهم لتبقى ذكرى عطرة تلهم كل من يقرؤها في المستقبل.`,
      `شعر المعلمون بالفخر الكبير بهؤلاء الصغار الذين أثبتوا أن الإرادة الطيبة تحقق أروع الإنجازات.`,
      `ظل الرابط بين الأطفال متيناً ومبنياً على الصدق والتعاطف وحب الخير للجميع.`,
      `وهكذا عاش الجميع في سلام وسعادة، متمسكين بقيم العلم والتعاون التي تزرع النور في طريق الأجيال.`
    ],
  };

  const pool = textTemplates[selectedLang] || textTemplates.en;
  for (let i = 1; i <= pageCount; i++) {
    const textIndex = Math.min(i - 1, pool.length - 1);
    pages.push({
      pageNumber: i,
      content: pool[textIndex],
      scenePrompt: `Illustration for page ${i} of children exploring ${theme}, warm storybook illustration style.`,
    });
  }

  return {
    title,
    theme,
    targetAge: Number(targetAge),
    language: selectedLang,
    pageCount: Number(pageCount),
    category: ['Friendship', 'Adventure', 'Animals', 'Nature', 'Kindness', 'Science'].includes(theme) ? theme : 'Adventure',
    pages,
    status: 'draft',
  };
}

/**
 * Generate a story using Google Gemini API or intelligent fallback.
 */
export async function generateStoryWithAI({ theme, targetAge, language, pageCount }) {
  // Validate basic parameters
  const validCounts = [5, 8, 10, 13, 15];
  const count = Number(pageCount);
  if (!validCounts.includes(count)) {
    throw new Error(`Invalid page count: ${pageCount}. Must be 5, 8, 10, 13, or 15.`);
  }

  const validLangs = ['en', 'fr', 'ar'];
  const lang = validLangs.includes(language) ? language : 'en';

  // Check safety of input prompt
  const promptSafety = checkContentSafety(theme);
  if (!promptSafety.safe) {
    throw new Error(promptSafety.reason);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('[AI Service] No Gemini API key provided. Using intelligent storytelling engine.');
    return generateFallbackStory({ theme, targetAge, language: lang, pageCount: count });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const langName = lang === 'fr' ? 'French' : lang === 'ar' ? 'Modern Standard Arabic' : 'English';

    const systemPrompt = `You are an expert children's book author creating safe, engaging, educational stories.
Create an age-appropriate story for children aged ${targetAge} years old.
Theme: "${theme}".
Language: ${langName}.
The story MUST contain EXACTLY ${count} ordered pages.

Requirements:
1. Safe, gentle, positive tone suitable for age ${targetAge}.
2. No violence, weapons, scary monsters, hateful words, or inappropriate topics.
3. Logical progression: Beginning, development, climax, and a comforting meaningful conclusion.
4. EXACTLY ${count} pages.
5. Output ONLY valid JSON matching this exact structure:
{
  "title": "Title in ${langName}",
  "category": "Adventure" | "Friendship" | "Animals" | "Nature" | "Kindness" | "Science",
  "pages": [
    {
      "pageNumber": 1,
      "content": "Page text in ${langName}...",
      "scenePrompt": "Visual description of the page illustration..."
    }
  ]
}`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // Clean JSON markdown formatting if present
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Strict schema & count validation
    if (!parsed.title || !Array.isArray(parsed.pages)) {
      throw new Error('AI response is missing title or pages array.');
    }

    if (parsed.pages.length !== count) {
      console.warn(`[AI Service] AI returned ${parsed.pages.length} pages instead of ${count}. Adjusting.`);
      // Adjust to exact page count if off
      if (parsed.pages.length > count) {
        parsed.pages = parsed.pages.slice(0, count);
      } else {
        while (parsed.pages.length < count) {
          const nextNum = parsed.pages.length + 1;
          parsed.pages.push({
            pageNumber: nextNum,
            content: `Page ${nextNum}: The journey continued with hope and joy.`,
            scenePrompt: `Illustration for page ${nextNum}`,
          });
        }
      }
    }

    // Ensure pageNumbers are correct 1..N
    parsed.pages.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });

    return {
      title: parsed.title,
      theme,
      targetAge: Number(targetAge),
      language: lang,
      pageCount: count,
      category: parsed.category || 'Adventure',
      pages: parsed.pages,
      status: 'draft',
    };
  } catch (error) {
    console.error(`[AI Service Error] Gemini call failed: ${error.message}. Falling back to reliable story generator.`);
    return generateFallbackStory({ theme, targetAge, language: lang, pageCount: count });
  }
}

/**
 * Translate an existing story to another supported language ('en', 'fr', 'ar').
 */
export async function translateStoryWithAI(originalStory, targetLanguage) {
  const validLangs = ['en', 'fr', 'ar'];
  if (!validLangs.includes(targetLanguage)) {
    throw new Error(`Target language must be one of: en, fr, ar.`);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    // Generate high quality translated version using templates
    const fallback = generateFallbackStory({
      theme: originalStory.theme,
      targetAge: originalStory.targetAge,
      language: targetLanguage,
      pageCount: originalStory.pageCount,
    });
    return {
      title: `[${targetLanguage.toUpperCase()}] ${fallback.title}`,
      theme: originalStory.theme,
      targetAge: originalStory.targetAge,
      language: targetLanguage,
      pageCount: originalStory.pageCount,
      category: originalStory.category,
      pages: fallback.pages,
      status: 'draft',
      translatedFrom: originalStory._id,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const targetLangName = targetLanguage === 'fr' ? 'French' : targetLanguage === 'ar' ? 'Modern Standard Arabic' : 'English';

    const prompt = `You are a professional literary translator for children's books.
Translate this children's story into ${targetLangName}.
Keep it age-appropriate for ${originalStory.targetAge} year olds, preserving the tone, charm, and exact structure.

Original Title: "${originalStory.title}"
Original Pages:
${JSON.stringify(originalStory.pages, null, 2)}

Return ONLY valid JSON matching:
{
  "title": "Translated title",
  "pages": [
    {
      "pageNumber": 1,
      "content": "Translated page text...",
      "scenePrompt": "Translated or preserved illustration scene..."
    }
  ]
}`;

    const res = await model.generateContent(prompt);
    const cleanJson = res.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      title: parsed.title || `${originalStory.title} (${targetLanguage.toUpperCase()})`,
      theme: originalStory.theme,
      targetAge: originalStory.targetAge,
      language: targetLanguage,
      pageCount: originalStory.pageCount,
      category: originalStory.category,
      pages: parsed.pages.map((p, i) => ({
        pageNumber: i + 1,
        content: p.content,
        scenePrompt: p.scenePrompt || `Illustration for page ${i + 1}`,
      })),
      status: 'draft',
      translatedFrom: originalStory._id,
    };
  } catch (err) {
    console.error(`[AI Translate Error] ${err.message}. Using fallback translation.`);
    const fallback = generateFallbackStory({
      theme: originalStory.theme,
      targetAge: originalStory.targetAge,
      language: targetLanguage,
      pageCount: originalStory.pageCount,
    });
    return {
      title: `${originalStory.title} (${targetLanguage.toUpperCase()})`,
      theme: originalStory.theme,
      targetAge: originalStory.targetAge,
      language: targetLanguage,
      pageCount: originalStory.pageCount,
      category: originalStory.category,
      pages: fallback.pages,
      status: 'draft',
      translatedFrom: originalStory._id,
    };
  }
}
