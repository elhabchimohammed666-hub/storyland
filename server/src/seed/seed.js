import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Story from '../models/Story.js';
import Assignment from '../models/Assignment.js';
import ReadingProgress from '../models/ReadingProgress.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/storyland';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB: ${mongoUri}`);

    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Story.deleteMany({});
    await Assignment.deleteMany({});
    await ReadingProgress.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Teacher
    const teacher = await User.create({
      name: 'Ms. Clara Dupont',
      email: 'teacher@storyland.com',
      password: 'Teacher123!',
      role: 'teacher',
      avatar: 'owl',
    });
    console.log(`[Seed] Created Teacher: ${teacher.email} / Teacher123!`);

    // 2. Create Class: Young Readers
    const youngReadersClass = await Class.create({
      name: 'Young Readers',
      description: 'Engaging reading group for children aged 8 exploring stories of friendship and nature.',
      targetAge: 8,
      teacherId: teacher._id,
    });
    console.log(`[Seed] Created Class: ${youngReadersClass.name}`);

    // 3. Create Students
    const studentData = [
      { name: 'Sara Miller', username: 'sara', avatar: 'fox' },
      { name: 'Adam Evans', username: 'adam', avatar: 'bear' },
      { name: 'Lina Chen', username: 'lina', avatar: 'rabbit' },
      { name: 'Youssef Al-Mansoor', username: 'youssef', avatar: 'lion' },
      { name: 'Noor Zahra', username: 'noor', avatar: 'cat' },
    ];

    const students = [];
    for (const s of studentData) {
      const student = await User.create({
        name: s.name,
        username: s.username,
        password: 'student123',
        role: 'student',
        teacherId: teacher._id,
        classId: youngReadersClass._id,
        avatar: s.avatar,
      });
      students.push(student);
    }
    console.log(`[Seed] Created ${students.length} students with password "student123"`);

    // 4. Create Main English Story: "The Little Explorer" (10 pages)
    const littleExplorerStory = await Story.create({
      title: 'The Little Explorer',
      theme: 'Friendship and Teamwork',
      category: 'Friendship',
      targetAge: 8,
      language: 'en',
      pageCount: 10,
      status: 'published',
      teacherId: teacher._id,
      coverTheme: 'forest',
      pages: [
        {
          pageNumber: 1,
          content: 'Deep in the Whispering Woods lived Leo, a little fox who dreamed of finding the legendary Sun Valley. Today felt like the perfect day for an expedition.',
          scenePrompt: 'Leo the young fox standing at the edge of a lush green forest, looking toward sunlit mountains.',
        },
        {
          pageNumber: 2,
          content: 'As Leo packed his little wooden backpack, his friendly neighbor Bella the squirrel bounded over. "Are you going on an adventure? May I join you?" Bella asked excitedly.',
          scenePrompt: 'Leo packing apples into a knapsack while cheerful Bella the squirrel chatters on an oak branch.',
        },
        {
          pageNumber: 3,
          content: 'Together they set off along the winding pebble trail. Birds sang joyful tunes in the branches above, guiding their cheerful steps forward.',
          scenePrompt: 'Leo and Bella walking side by side down a winding trail sprinkled with colorful wildflowers.',
        },
        {
          pageNumber: 4,
          content: 'Soon, they arrived at the Great Blue River. The wooden footbridge was broken! Two large planks had slipped into the rushing water.',
          scenePrompt: 'A roaring blue stream with broken wooden bridge planks, two animal friends thinking together.',
        },
        {
          pageNumber: 5,
          content: 'Leo tried to leap across alone, but it was too wide. "Wait, Leo!" called Bella. "If we work together and gather fallen cedar logs, we can build a strong crossing!"',
          scenePrompt: 'Bella the squirrel pointing toward fallen tree branches, collaborating enthusiastically with Leo.',
        },
        {
          pageNumber: 6,
          content: 'Leo carried the sturdy branches with his paws while Bella tied them securely with supple wild vines. Step by step, a safe new bridge appeared.',
          scenePrompt: 'Fox and squirrel happily fastening logs with vines to construct a safe crossing over the stream.',
        },
        {
          pageNumber: 7,
          content: 'Hand in hand, they crossed the river safely. On the other side stood Oliver the wise old turtle, clapping his claws with a proud warm smile.',
          scenePrompt: 'An ancient kindly turtle in a mossy shell congratulating the two brave young friends.',
        },
        {
          pageNumber: 8,
          content: '"True courage is not about being the fastest," Oliver said gently. "It is about helping one another when the journey grows tough."',
          scenePrompt: 'Oliver sharing glowing fireflies with Leo and Bella under an arched willow tree.',
        },
        {
          pageNumber: 9,
          content: 'They climbed the final grassy hill, and suddenly the Sun Valley unfolded beneath them, shining like liquid gold filled with friendly blossoms.',
          scenePrompt: 'A breathtaking valley glowing in golden sunset light with sparkling waterfalls and blooming flowers.',
        },
        {
          pageNumber: 10,
          content: 'Leo smiled at Bella and said, "We could never have reached this beauty alone. The greatest adventure is the friendship we share." And together, they celebrated with joy.',
          scenePrompt: 'Leo and Bella hugging happily on the hilltop as stars begin to twinkle in the evening twilight.',
        },
      ],
    });

    // 5. Create French Story: "Le Robot et le Papillon Doré" (8 pages)
    const frenchStory = await Story.create({
      title: 'Le Robot et le Papillon Doré',
      theme: 'Curiosité et Amitié',
      category: 'Adventure',
      targetAge: 8,
      language: 'fr',
      pageCount: 8,
      status: 'published',
      teacherId: teacher._id,
      coverTheme: 'robot',
      pages: [
        {
          pageNumber: 1,
          content: 'Dans un petit atelier chaleureux, un gentil robot nommé Bip rêvait de découvrir ce qui existait au-delà des hautes collines de métal.',
          scenePrompt: 'Un gentil robot argenté aux yeux bleus lumineux observant le monde par une fenêtre ronde.',
        },
        {
          pageNumber: 2,
          content: 'Un matin printanier, un papillon aux ailes dorées voleta à travers la porte entrouverte. Il se posa doucement sur l’épaule de Bip en battant des ailes.',
          scenePrompt: 'Un magnifique papillon doré posé sur l’épaule d’un robot souriant.',
        },
        {
          pageNumber: 3,
          content: 'Curieux, Bip décida de suivre cette merveilleuse créature. Ensemble, ils traversèrent un jardin parsemé de fleurs chantantes et de ruisseaux cristallins.',
          scenePrompt: 'Le robot marchant délicatement dans une prairie fleurie en suivant le papillon lumineux.',
        },
        {
          pageNumber: 4,
          content: 'Bip rencontra une famille de hérissons qui peinait à ramasser des baies tombées dans un ravin escarpé. "Laissez-moi vous aider," proposa le robot.',
          scenePrompt: 'Le robot tendant son bras mécanique pour aider une mignonne famille de hérissons.',
        },
        {
          pageNumber: 5,
          content: 'Avec précaution et douceur, Bip remonta les baies sucrées sans en abîmer une seule. Les hérissons le remercièrent avec de grands sourires reconnaissants.',
          scenePrompt: 'Des petits hérissons joyeux partageant des fruits avec le robot Bip sous un grand chêne.',
        },
        {
          pageNumber: 6,
          content: 'Le papillon guida ensuite Bip jusqu’au sommet de la colline. De là-haut, le monde semblait infini, rempli de couleurs éclatantes et de mélodies douces.',
          scenePrompt: 'Vue panoramique depuis une colline verdoyante avec le robot et le papillon admirant le paysage.',
        },
        {
          pageNumber: 7,
          content: 'Bip comprit que son cœur mécanique pouvait ressentir une chaleur immense : la joie de rendre service et de contempler la vie.',
          scenePrompt: 'Le robot Bip posant sa main sur son cœur illuminé d’une douce lueur rose d’amitié.',
        },
        {
          pageNumber: 8,
          content: 'À la tombée de la nuit, Bip rentra chez lui, heureux et inspiré, prêt à imaginer de nouvelles histoires pour ses amis du monde entier.',
          scenePrompt: 'Bip dormant paisiblement dans son atelier tandis que le papillon veille près de lui sous les étoiles.',
        },
      ],
    });

    // 6. Create Arabic Story: "مغامرة في الغابة السحرية" (5 pages)
    const arabicStory = await Story.create({
      title: 'مغامرة في الغابة السحرية',
      theme: 'التعاون والصداقة',
      category: 'Adventure',
      targetAge: 8,
      language: 'ar',
      pageCount: 5,
      status: 'published',
      teacherId: teacher._id,
      coverTheme: 'magic_forest',
      pages: [
        {
          pageNumber: 1,
          content: 'في قرية وادعة تحيط بها الجبال الخضراء، انطلق طارق وصديقه الأرنب سيمو في نزهة صباحية منعشة لاستكشاف أسرار الغابة السحرية.',
          scenePrompt: 'طفل عربي صغير مبتسم وبرفقته أرنب لطيف يدخلان غابة مورقة ومضيئة.',
        },
        {
          pageNumber: 2,
          content: 'وصلا إلى نبع ماء متلألئ، فوجدا طائراً صغيراً يعجز عن الطيران لأن غصناً ثقيلاً قد سقط على طرف عشه الصغير.',
          scenePrompt: 'طائر صغير ملون يستنجد برفق بجوار نبع ماء نقي.',
        },
        {
          pageNumber: 3,
          content: 'تعاون طارق وسيمو بكل حرص: رفع طارق الغصن بلطف، بينما ساعد سيمو الطائر في استعادة توازنه واطمئنانه.',
          scenePrompt: 'الطفل والأرنب يتعاونان برفق لإنقاذ الطائر الصغير.',
        },
        {
          pageNumber: 4,
          content: 'غرد الطائر بفرح شديد وحلّق في السماء، ثم قادهما إلى شجرة تفاح ذهبية تتلألأ ثمارها تحت أشعة الشمس الدافئة كهدية شكر لهما.',
          scenePrompt: 'شجرة تفاح ذهبية تلمع في الغابة مع رفرفة الطائر في السماء.',
        },
        {
          pageNumber: 5,
          content: 'ابتسم طارق وقال: "ما أجمل أن نمد يد العون للآخرين! فالتعاون هو مفتاح السعادة الحقيقية في كل زمان ومكان."',
          scenePrompt: 'طارق وسيمو يتشاركان تفاحة لذيذة وهما يعودان للبيت بابتسامة تملأ وجهيهما.',
        },
      ],
    });

    // 7. Create a Draft Story for testing editing & publishing
    const draftStory = await Story.create({
      title: 'The Secret of the Whispering Coral',
      theme: 'Ocean Wonders and Marine Life',
      category: 'Science',
      targetAge: 10,
      language: 'en',
      pageCount: 5,
      status: 'draft',
      teacherId: teacher._id,
      coverTheme: 'ocean',
      pages: [
        {
          pageNumber: 1,
          content: 'Maya put on her diving goggles and took a deep breath. Today she was diving near the famous Coral Arch.',
          scenePrompt: 'A young girl snorkeler diving in crystal turquoise sea water near bright coral reefs.',
        },
        {
          pageNumber: 2,
          content: 'Beneath the waves, thousands of glowing fish danced like underwater stars. A sea turtle glided by gracefully.',
          scenePrompt: 'Vibrant school of neon fish surrounding a serene sea turtle in the clear ocean.',
        },
        {
          pageNumber: 3,
          content: 'Maya spotted a rare turquoise shell trapped under some plastic debris. She carefully removed the litter to protect the sea floor.',
          scenePrompt: 'Maya gently lifting a plastic cup away from the coral reef, preserving nature.',
        },
        {
          pageNumber: 4,
          content: 'The little octopus living inside peeked out gratefully, changing colors into a joyful rainbow shimmer.',
          scenePrompt: 'A tiny cute octopus glowing rainbow colors inside a beautiful iridescent seashell.',
        },
        {
          pageNumber: 5,
          content: 'Surfacing under the warm sun, Maya felt proud. She knew that protecting our oceans starts with small everyday acts of care.',
          scenePrompt: 'Maya waving cheerfully from the calm ocean water toward the research boat on the horizon.',
        },
      ],
    });

    // 8. Assign Stories to "Young Readers" class
    await Assignment.create({
      storyId: littleExplorerStory._id,
      classId: youngReadersClass._id,
      teacherId: teacher._id,
    });

    await Assignment.create({
      storyId: frenchStory._id,
      classId: youngReadersClass._id,
      teacherId: teacher._id,
    });

    await Assignment.create({
      storyId: arabicStory._id,
      classId: youngReadersClass._id,
      teacherId: teacher._id,
    });
    console.log('[Seed] Assigned 3 published stories to class "Young Readers".');

    // 9. Create Student Progress matching the PDF table (Page 6 & Page 10):
    // Sara: 10/10 pages -> Completed
    // Adam: 5/10 pages -> In Progress (lastOpenedPage: 6)
    // Lina: 2/10 pages -> In Progress (lastOpenedPage: 3)
    // Youssef: 0/10 pages -> Not Started
    // Noor: 0/10 pages -> Not Started

    const sara = students.find((s) => s.username === 'sara');
    const adam = students.find((s) => s.username === 'adam');
    const lina = students.find((s) => s.username === 'lina');
    const youssef = students.find((s) => s.username === 'youssef');
    const noor = students.find((s) => s.username === 'noor');

    // Sara: completed all 10 pages
    await ReadingProgress.create({
      studentId: sara._id,
      storyId: littleExplorerStory._id,
      classId: youngReadersClass._id,
      totalPages: 10,
      completedPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      lastOpenedPage: 10,
      status: 'completed',
      progressPercent: 100,
      completedAt: new Date(Date.now() - 3600000 * 2),
      lastReadAt: new Date(Date.now() - 3600000 * 2),
    });

    // Adam: completed 5 pages, currently viewing page 6
    await ReadingProgress.create({
      studentId: adam._id,
      storyId: littleExplorerStory._id,
      classId: youngReadersClass._id,
      totalPages: 10,
      completedPages: [1, 2, 3, 4, 5],
      lastOpenedPage: 6,
      status: 'in_progress',
      progressPercent: 50,
      lastReadAt: new Date(Date.now() - 3600000),
    });

    // Lina: completed 2 pages, currently viewing page 3
    await ReadingProgress.create({
      studentId: lina._id,
      storyId: littleExplorerStory._id,
      classId: youngReadersClass._id,
      totalPages: 10,
      completedPages: [1, 2],
      lastOpenedPage: 3,
      status: 'in_progress',
      progressPercent: 20,
      lastReadAt: new Date(Date.now() - 7200000),
    });

    // Youssef: not started (record can exist as not_started or be created on open)
    await ReadingProgress.create({
      studentId: youssef._id,
      storyId: littleExplorerStory._id,
      classId: youngReadersClass._id,
      totalPages: 10,
      completedPages: [],
      lastOpenedPage: 1,
      status: 'not_started',
      progressPercent: 0,
      lastReadAt: null,
    });

    // Noor: not started
    await ReadingProgress.create({
      studentId: noor._id,
      storyId: littleExplorerStory._id,
      classId: youngReadersClass._id,
      totalPages: 10,
      completedPages: [],
      lastOpenedPage: 1,
      status: 'not_started',
      progressPercent: 0,
      lastReadAt: null,
    });

    console.log('[Seed] Created exact Reading Progress scenario from the PDF specification!');
    console.log('[Seed] Database seeding completed successfully.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
