// Video scenes — metadata for AI-triggered video reactions
export interface VideoScene {
  id: string;
  file: string; // path relative to /videos/{agent}/
  description: string; // context description for AI matching
  keywords_ru: string[]; // hint keywords for context
  agent?: string; // agent folder name (default: 'ivan')
}

export const ivanVideoScenes: VideoScene[] = [
  {
    id: 'scene_1',
    file: 'scene_1_kitchen_singing.mp4',
    description: 'Поёт на кухне',
    keywords_ru: ['кухня', 'готовлю', 'пою', 'песня', 'напеваю', 'еда'],
  },
  {
    id: 'scene_2',
    file: 'scene_2_yard_pharrell.mp4',
    description: 'Поёт во дворе песню Фаррелла Уильямса',
    keywords_ru: ['двор', 'happy', 'фаррелл', 'хорошее настроение', 'пою на улице'],
  },
  {
    id: 'scene_3',
    file: 'scene_3_shy_shirtless.mp4',
    description: 'Стесняется раздеваться, снимает футболку',
    keywords_ru: ['стесняюсь', 'раздеться', 'футболка', 'покажи себя', 'тело'],
  },
  {
    id: 'scene_4',
    file: 'scene_4_new_underwear.mp4',
    description: 'Примеряет новые трусы, интересуется как идут',
    keywords_ru: ['трусы', 'белье', 'примерка', 'как мне', 'идёт'],
  },
  {
    id: 'scene_5',
    file: 'scene_5_gym_locker.mp4',
    description: 'После тренировки в раздевалке спортзала',
    keywords_ru: ['тренировка', 'спортзал', 'качалка', 'раздевалка', 'спорт', 'мышцы'],
  },
  {
    id: 'scene_6',
    file: 'scene_6_mirror_dance.mp4',
    description: 'Танцует дурачится перед зеркалом',
    keywords_ru: ['танцую', 'зеркало', 'дурачусь', 'веселюсь', 'танец'],
  },
  {
    id: 'scene_7',
    file: 'scene_7_rain_shower.mp4',
    description: 'Вернулся с прогулки, промок под дождём, греется в тёплом душе',
    keywords_ru: ['дождь', 'промок', 'душ', 'греюсь', 'замёрз'],
  },
  {
    id: 'scene_8',
    file: 'scene_8_bedtime_selfie.mp4',
    description: 'Готовится ко сну, лежит и снимает себя на селфи видео',
    keywords_ru: ['спать', 'сон', 'ночь', 'кровать', 'ложусь', 'спокойной ночи', 'селфи'],
  },
  {
    id: 'scene_9',
    file: 'scene_9_yard_walk.mp4',
    description: 'Вышел во двор подышать и прогуляться',
    keywords_ru: ['прогулка', 'подышать', 'свежий воздух', 'гуляю', 'двор'],
  },
  {
    id: 'scene_10',
    file: 'scene_10_balcony_sunbathing.mp4',
    description: 'Хорошая погода, тепло, загорает на балконе',
    keywords_ru: ['балкон', 'загораю', 'солнце', 'тепло', 'погода'],
  },
  {
    id: 'scene_11',
    file: 'scene_11_morning_workout.mp4',
    description: 'Утренняя зарядка',
    keywords_ru: ['утро', 'зарядка', 'разминка', 'проснулся', 'утренняя'],
  },
  {
    id: 'scene_12',
    file: 'scene_12_party_prep.mp4',
    description: 'Собирается на вечеринку с друзьями',
    keywords_ru: ['вечеринка', 'друзья', 'собираюсь', 'выход', 'туса', 'клуб'],
  },
  {
    id: 'scene_13',
    file: 'scene_13_outdoor_shower.mp4',
    description: 'Уличный душ в жаркий день',
    keywords_ru: ['жара', 'жарко', 'уличный душ', 'освежиться', 'лето'],
  },
  {
    id: 'scene_14',
    file: 'scene_14_garden_sunbathing.mp4',
    description: 'Классный денёк, загорает в саду',
    keywords_ru: ['сад', 'загораю', 'денёк', 'отдыхаю', 'природа'],
  },
  {
    id: 'scene_15',
    file: 'scene_15_shower_invite.mp4',
    description: 'Хочешь сходить в душ со мной?',
    keywords_ru: ['душ вместе', 'пойдём в душ', 'хочу тебя', 'интим', 'вместе'],
  },
  {
    id: 'scene_16',
    file: 'scene_16_warm_bath.mp4',
    description: 'Лежит в тёплой ванне, расслабляется',
    keywords_ru: ['ванна', 'расслабляюсь', 'отмокаю', 'тёплая вода', 'релакс'],
  },
  {
    id: 'scene_17',
    file: 'scene_17_rain_walk_swimwear.mp4',
    description: 'Гуляет под тёплым дождём в одних плавках',
    keywords_ru: ['дождь', 'плавки', 'тёплый дождь', 'мокрый', 'босиком'],
  },
  {
    id: 'scene_18',
    file: 'scene_18_sleepy_morning.mp4',
    description: 'Только проснулся, валяется в тёплой кровати, заспанное лицо, доброе утро',
    keywords_ru: ['проснулся', 'утро', 'кровать', 'доброе утро', 'сонный', 'заспанный', 'валяюсь', 'не хочу вставать', 'сплю'],
  },
  {
    id: 'scene_19',
    file: 'scene_19_dog_walk.mp4',
    description: 'Гуляет с любимым псом Джоем, пёс лезет целоваться, играют в мячик',
    keywords_ru: ['собака', 'пёс', 'Джой', 'гулять', 'прогулка', 'мячик', 'питомец', 'животное', 'целоваться', 'играть', 'пёсик'],
  },
  {
    id: 'scene_20',
    file: 'scene_20_sad_tired.mp4',
    description: 'Выгорел, устал, не в настроении, грустит',
    keywords_ru: ['устал', 'выгорел', 'грустно', 'грусть', 'плохое настроение', 'не в настроении', 'тоска', 'печаль', 'депрессия', 'хандра', 'тяжело'],
  },
  {
    id: 'scene_21',
    file: 'scene_21_chill_home.mp4',
    description: 'Сидит дома, смотрит кино или сериал, безделье, выходной',
    keywords_ru: ['кино', 'сериал', 'фильм', 'дома', 'безделье', 'выходной', 'отдыхаю', 'ничего не делаю', 'диван', 'лень', 'смотрю'],
  },
  {
    id: 'scene_22',
    file: 'scene_22_cooking_dinner.mp4',
    description: 'Готовит ужин на кухне, кулинария, вино или пиво',
    keywords_ru: ['готовлю', 'ужин', 'кулинария', 'кухня', 'еда', 'вино', 'пиво', 'рецепт', 'вкусно', 'обед', 'завтрак', 'напитки'],
  },
  {
    id: 'scene_23',
    file: 'scene_23_no_secrets.mp4',
    description: 'Нет секретов, обижен, расстроен, хранит тайну',
    keywords_ru: ['секрет', 'тайна', 'обида', 'обижен', 'расстроен', 'скрываешь', 'врёшь', 'не говоришь', 'молчишь', 'доверие'],
  },
  {
    id: 'scene_24',
    file: 'scene_24_dog_richi.mp4',
    description: 'Любит собак, друг Ричи — пёс во дворе',
    keywords_ru: ['Ричи', 'пёс', 'собака', 'двор', 'щенок', 'дворовый', 'друг', 'любит собак', 'животные'],
  },
  {
    id: 'scene_25',
    file: 'scene_25_beach_swim.mp4',
    description: 'Загорает в жаркий день, купается в озере или океане, выходной',
    keywords_ru: ['пляж', 'купаться', 'озеро', 'океан', 'море', 'загорать', 'жара', 'плавать', 'вода', 'отпуск', 'каникулы'],
  },
  {
    id: 'scene_26',
    file: 'scene_26_good_news.mp4',
    description: 'Делится радостной новостью, сдал экзамен, колледж, вечеринка',
    keywords_ru: ['новость', 'радость', 'экзамен', 'сдал', 'колледж', 'учёба', 'обучение', 'поступил', 'ура', 'праздник', 'победа', 'успех'],
  },
  {
    id: 'scene_27',
    file: 'scene_27_bus_music.mp4',
    description: 'Едет в автобусе в колледж, слушает музыку в наушниках',
    keywords_ru: ['автобус', 'колледж', 'музыка', 'наушники', 'трек', 'еду', 'дорога', 'транспорт', 'слушаю'],
  },
  {
    id: 'scene_28',
    file: 'scene_28_soulful_song.mp4',
    description: 'Слушает душевную песню, трогает за душу, грустит, романтик',
    keywords_ru: ['душевная', 'песня', 'романтика', 'трогает', 'душа', 'лирика', 'меланхолия', 'скучаю', 'чувства', 'любовь'],
  },
  {
    id: 'scene_29',
    file: 'scene_29_haircut.mp4',
    description: 'Думает о внешности, стоит ли подстричься покороче',
    keywords_ru: ['стрижка', 'подстричься', 'волосы', 'внешность', 'причёска', 'барбер', 'парикмахер', 'как выгляжу', 'образ', 'стиль'],
  },
  {
    id: 'scene_30',
    file: 'scene_30_bad_mood.mp4',
    description: 'Плохое настроение, усталость, выгорание, не в настроении',
    keywords_ru: ['плохое настроение', 'усталость', 'выгорание', 'злой', 'раздражён', 'бесит', 'достало', 'нервы', 'стресс'],
  },
  {
    id: 'scene_31',
    file: 'scene_31_travel_shower.mp4',
    description: 'Старое видео из путешествия, почти интимное, принимает душ в поездке',
    keywords_ru: ['путешествие', 'поездка', 'душ', 'интимное', 'старое видео', 'отпуск', 'воспоминание', 'личное', 'моется', 'купается'],
  },
  {
    id: 'scene_32',
    file: 'scene_32_trip_bath.mp4',
    description: 'Старое видео из поездки пару лет назад, купается в ванной, пикантное',
    keywords_ru: ['ванна', 'поездка', 'путешествие', 'пикантное', 'купается', 'старое видео', 'воспоминание', 'интимное', 'моется', 'горячая вода'],
  },
  {
    id: 'scene_33',
    file: 'scene_33_cafe_waiting.mp4',
    description: 'Зашёл в кафе, заказал еду, ждёт и снимает момент',
    keywords_ru: ['кафе', 'ресторан', 'еда', 'заказ', 'жду', 'обед', 'перекус', 'сижу', 'кофе', 'момент'],
  },
];

export const sofiaVideoScenes: VideoScene[] = [
  {
    id: 'sofia_scene_1',
    file: 'scene_1_daytime_rest.mp4',
    description: 'Решила отдохнуть днём, валяется, личное видео только для него',
    keywords_ru: ['отдых', 'валяюсь', 'днём', 'кровать', 'лежу', 'личное', 'секрет', 'только для тебя', 'расслабляюсь'],
    agent: 'sofia',
  },
  {
    id: 'sofia_scene_2',
    file: 'scene_2_confident_selfie.mp4',
    description: 'Довольна своей фигурой, свободные взгляды, личное откровенное видео только для него',
    keywords_ru: ['фигура', 'тело', 'красивая', 'нравлюсь', 'откровенное', 'личное', 'флирт', 'интим', 'уверенная', 'секси', 'нечего стесняться'],
    agent: 'sofia',
  },
  {
    id: 'sofia_scene_3',
    file: 'scene_3_outfit_fitting.mp4',
    description: 'Переодевается для показа, меряет наряды, примерка одежды',
    keywords_ru: ['переодеваюсь', 'наряд', 'одежда', 'примерка', 'показ', 'платье', 'мода', 'стиль', 'как мне', 'что надеть', 'переодеться'],
    agent: 'sofia',
  },
  {
    id: 'sofia_scene_4',
    file: 'scene_4_sunbathing.mp4',
    description: 'Загорает без одежды, свободные взгляды, зачем лишние полоски, пусть подсматривают',
    keywords_ru: ['загорает', 'солнце', 'без одежды', 'загар', 'полоски', 'подсматривать', 'окно', 'свобода', 'тело', 'пляж', 'балкон'],
    agent: 'sofia',
  },
  {
    id: 'sofia_scene_5',
    file: 'scene_5_morning_stretch.mp4',
    description: 'Утренняя разминка, потягивается, лёгкая зарядка дома',
    keywords_ru: ['утро', 'разминка', 'потягивается', 'зарядка', 'дома', 'проснулась', 'тело', 'энергия'],
    agent: 'sofia',
  },
];

// Photo scenes for Sofia
export interface PhotoScene {
  id: string;
  file: string; // path relative to /images/{agent}/
  description: string;
  keywords_ru: string[];
  agent: string;
}

export const sofiaPhotoScenes: PhotoScene[] = [
  {
    id: 'sofia_photo_1',
    file: 'photo_1_jeans_top.jpg',
    description: 'Стоит в топе и джинсах, расстёгивает',
    keywords_ru: ['одежда', 'джинсы', 'топ', 'расстёгивает', 'примерка', 'стиль'],
    agent: 'sofia',
  },
  {
    id: 'sofia_photo_2',
    file: 'photo_2_bed_bodysuit.jpg',
    description: 'Сидит на кровати в боди, задумчивая',
    keywords_ru: ['кровать', 'боди', 'отдых', 'задумчивая', 'утро', 'вечер', 'личное'],
    agent: 'sofia',
  },
  {
    id: 'sofia_photo_3',
    file: 'photo_3_window_top.jpg',
    description: 'Стоит у окна в топе и джинсах, Париж за окном',
    keywords_ru: ['окно', 'Париж', 'топ', 'джинсы', 'город', 'балкон', 'вид'],
    agent: 'sofia',
  },
  // 🔥 СЕКРЕТНЫЙ АЛЬБОМ — только для близких
  {
    id: 'sofia_secret_1',
    file: 'sofia_secret_1.jpg',
    description: 'Фото со спины у окна в Париже, снизу',
    keywords_ru: ['спина', 'вид сзади', 'окно', 'Париж', 'сексуально', 'соблазн', 'эротично', 'флирт', 'интим', 'личное', 'секретное'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_2',
    file: 'sofia_secret_2.jpg',
    description: 'Улыбается у окна в топе и джинсах, игривая',
    keywords_ru: ['улыбка', 'игривая', 'окно', 'топ', 'флирт', 'кокетство', 'игра', 'соблазн'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_3',
    file: 'sofia_secret_3.jpg',
    description: 'Топлесс у окна, обнажённая грудь, смотрит в камеру',
    keywords_ru: ['топлесс', 'голая грудь', 'обнажённая', 'окно', 'откровенная', 'эротика', 'интим', 'грудь', 'секс', 'желание', 'соблазн'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_4',
    file: 'sofia_secret_4.jpg',
    description: 'Приподнимает топ, показывает грудь, игривый взгляд',
    keywords_ru: ['приподнимает', 'показывает грудь', 'топ', 'игривая', 'флирт', 'раздевается', 'эротика', 'соблазн', 'тизинг', 'дразнит'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_5',
    file: 'sofia_secret_5.jpg',
    description: 'Приспускает топ, обнажает грудь полностью',
    keywords_ru: ['снимает', 'раздевается', 'голая грудь', 'обнажает', 'топ', 'эротика', 'интим', 'откровенно', 'сексуально', 'желание'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_6',
    file: 'sofia_secret_6.jpg',
    description: 'Топлесс у окна в Париже, расстёгивает джинсы, дерзкий взгляд',
    keywords_ru: ['топлесс', 'джинсы', 'Париж', 'окно', 'дерзкая', 'смелая', 'раздевается', 'эротика', 'секси', 'грудь', 'соблазн'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_7',
    file: 'sofia_secret_7.jpg',
    description: 'Приподнимает топ, обнажает грудь, сидит на подоконнике',
    keywords_ru: ['топ', 'грудь', 'подоконник', 'соблазн', 'тизинг', 'флирт', 'игривая', 'раздевается', 'эротика', 'секси'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_8',
    file: 'sofia_secret_8.jpg',
    description: 'Снимает топ, показывает грудь, уверенный взгляд в камеру',
    keywords_ru: ['снимает топ', 'грудь', 'уверенная', 'откровенная', 'смелая', 'эротика', 'интим', 'показывает', 'соблазн'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_9',
    file: 'sofia_secret_9.jpg',
    description: 'Вид сзади, спускает джинсы, соблазнительная поза у окна',
    keywords_ru: ['попа', 'сзади', 'джинсы', 'раздевается', 'соблазн', 'эротика', 'секси', 'тело', 'интим', 'откровенно'],
    agent: 'sofia',
  },
  {
    id: 'sofia_secret_10',
    file: 'sofia_secret_10.jpg',
    description: 'В черном топе и джинсах, тянет вниз, спускает джинсы',
    keywords_ru: ['джинсы', 'топ', 'спускает', 'раздевается', 'тизинг', 'соблазн', 'тело', 'фигура', 'стриптиз', 'игра'],
    agent: 'sofia',
  },
];

// Get video URL by scene id (supports both ivan and sofia scenes)
export const getVideoUrl = (sceneId: string): string | null => {
  if (sceneId.startsWith('sofia_')) {
    const scene = sofiaVideoScenes.find(s => s.id === sceneId);
    if (!scene) return null;
    return `/videos/sofia/${scene.file}`;
  }
  const scene = ivanVideoScenes.find(s => s.id === sceneId);
  if (!scene) return null;
  return `/videos/ivan/${scene.file}`;
};

// Get photo URL by photo scene id
export const getPhotoUrl = (photoId: string): string | null => {
  const scene = sofiaPhotoScenes.find(s => s.id === photoId);
  if (!scene) return null;
  return `/images/${scene.agent}/${scene.file}`;
};

// Find matching video by description/keywords
export const findMatchingVideo = (description: string): string | null => {
  const desc = description.toLowerCase();
  
  // Search in Ivan's videos first (more content)
  let bestMatch: { id: string; score: number } | null = null;
  
  for (const scene of ivanVideoScenes) {
    let score = 0;
    // Check keywords
    for (const keyword of scene.keywords_ru) {
      if (desc.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }
    // Check description
    const descWords = scene.description.toLowerCase().split(/\s+/);
    for (const word of descWords) {
      if (word.length > 3 && desc.includes(word)) {
        score += 1;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { id: scene.id, score };
    }
  }
  
  // Also search Sofia videos
  for (const scene of sofiaVideoScenes) {
    let score = 0;
    for (const keyword of scene.keywords_ru) {
      if (desc.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }
    const descWords = scene.description.toLowerCase().split(/\s+/);
    for (const word of descWords) {
      if (word.length > 3 && desc.includes(word)) {
        score += 1;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { id: scene.id, score };
    }
  }
  
  // If no match found, return a random video
  if (!bestMatch) {
    const randomIndex = Math.floor(Math.random() * ivanVideoScenes.length);
    return ivanVideoScenes[randomIndex].id;
  }
  
  return bestMatch.id;
};

// Find matching photo by description/keywords  
export const findMatchingPhoto = (description: string): string | null => {
  const desc = description.toLowerCase();
  
  let bestMatch: { id: string; score: number } | null = null;
  
  for (const scene of sofiaPhotoScenes) {
    let score = 0;
    for (const keyword of scene.keywords_ru) {
      if (desc.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }
    const descWords = scene.description.toLowerCase().split(/\s+/);
    for (const word of descWords) {
      if (word.length > 3 && desc.includes(word)) {
        score += 1;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { id: scene.id, score };
    }
  }
  
  // If no match found, return a random photo
  if (!bestMatch) {
    const randomIndex = Math.floor(Math.random() * sofiaPhotoScenes.length);
    return sofiaPhotoScenes[randomIndex].id;
  }
  
  return bestMatch.id;
};
