export type ImageStyle =
  | 'auto'
  | 'camera'
  | 'human'
  | 'cartoon2d'
  | 'render3d'
  | 'anime'
  | 'cinematic'
  | 'digitalart';

export interface StyleOption {
  id: ImageStyle;
  label: string;
  icon: string;
  description: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  { id: 'auto', label: 'Auto (Real Form)', icon: '✨', description: 'AI khud asli shakl aur shape samjhega' },
  { id: 'camera', label: 'Asli Camera (DSLR)', icon: '📸', description: 'True-to-life original camera photo, realistic lighting' },
  { id: 'human', label: 'Real Human (Portrait)', icon: '👤', description: 'Original human face, authentic skin pores & sharp eyes' },
  { id: 'cartoon2d', label: '2D Cartoon', icon: '🎨', description: 'Classic animation & clean comic line art' },
  { id: 'render3d', label: '3D Pixar / Disney', icon: '🧊', description: '3D CGI animation, Blender & Unreal Engine 5' },
  { id: 'anime', label: 'Anime / Manga', icon: '🎌', description: 'High definition Japanese anime style' },
  { id: 'cinematic', label: 'Cinematic Movie', icon: '🌌', description: 'Hollywood 35mm film still, dramatic grading' },
  { id: 'digitalart', label: 'Digital Art', icon: '🖌️', description: 'ArtStation trending digital concept painting' },
];

export function isPhotoIntent(text: string): boolean {
  const t = text.toLowerCase().trim();
  const triggers = [
    'photo', 'pic', 'pics', 'image', 'tasweer', 'tasvir', 'picture',
    'banao', 'bano', 'bana', 'generate', 'create', 'draw', 'portrait',
    'naksha', 'flag', 'jhanda', 'wallpaper', 'bnao', 'carton', 'cartoon',
    '2d', '3d', 'render', 'camera', 'dslr', 'dslr photo', 'painting', 'sketch',
    'shakl', 'shape', 'dikhaye', 'dikhana', 'asli halat', 'asli photo'
  ];
  return triggers.some(k => t.includes(k));
}

export function detectImageStyle(text: string): ImageStyle {
  const t = text.toLowerCase().trim();

  // 1. 2D Cartoon check
  if (
    t.includes('carton') ||
    t.includes('cartoon') ||
    t.includes('2d') ||
    t.includes('chibi') ||
    t.includes('comic') ||
    t.includes('caricature') ||
    t.includes('sketch') ||
    t.includes('drawing')
  ) {
    return 'cartoon2d';
  }

  // 2. 3D Render / Pixar check
  if (
    t.includes('3d') ||
    t.includes('pixar') ||
    t.includes('disney') ||
    t.includes('cgi') ||
    t.includes('blender') ||
    t.includes('unreal') ||
    t.includes('claymation')
  ) {
    return 'render3d';
  }

  // 3. Anime check
  if (
    t.includes('anime') ||
    t.includes('manga') ||
    t.includes('ghibli') ||
    t.includes('naruto')
  ) {
    return 'anime';
  }

  // 4. Cinematic check
  if (
    t.includes('cinematic') ||
    t.includes('movie') ||
    t.includes('film still')
  ) {
    return 'cinematic';
  }

  // 5. Digital Art check
  if (
    t.includes('digital art') ||
    t.includes('concept art') ||
    t.includes('painting') ||
    t.includes('artstation')
  ) {
    return 'digitalart';
  }

  // 6. Real Human check
  if (
    t.includes('human') ||
    t.includes('admi') ||
    t.includes('larki') ||
    t.includes('larka') ||
    t.includes('aurat') ||
    t.includes('mard') ||
    t.includes('bacha') ||
    t.includes('baby') ||
    t.includes('face') ||
    t.includes('chehra') ||
    t.includes('person') ||
    t.includes('insan') ||
    t.includes('portrait') ||
    t.includes('selfie') ||
    t.includes('girl') ||
    t.includes('boy') ||
    t.includes('woman') ||
    t.includes('man') ||
    t.includes('shakl') ||
    t.includes('babar') ||
    t.includes('imran') ||
    t.includes('actor') ||
    t.includes('superstar')
  ) {
    return 'human';
  }

  return 'camera';
}

// Urdu & Roman Urdu dictionary for 100% accurate subject resolution
export const URDU_TO_ENGLISH_MAP: Record<string, string> = {
  'babar azam': 'Pakistani cricket team captain Babar Azam with authentic recognizable facial likeness wearing green sports polo jersey',
  'babar': 'Pakistani cricket superstar Babar Azam with authentic facial likeness and features',
  'imran khan': 'Former Prime Minister Imran Khan with authentic facial likeness, charismatic expression, wearing traditional attire and sunglasses',
  'shah rukh khan': 'Bollywood superstar Shah Rukh Khan with original authentic face, sharp eyes, wearing tailored suit',
  'shahrukh khan': 'Bollywood superstar Shah Rukh Khan with original authentic face, sharp eyes, wearing tailored suit',
  'srk': 'Bollywood superstar Shah Rukh Khan with authentic likeness in black suit',
  'salman khan': 'Bollywood actor Salman Khan with authentic likeness and physique',
  'quaid e azam': 'Founder of Pakistan Muhammad Ali Jinnah Quaid-e-Azam in traditional Jinnah cap and formal sherwani with authentic historical likeness',
  'quaid-e-azam': 'Founder of Pakistan Muhammad Ali Jinnah Quaid-e-Azam in traditional Jinnah cap and formal sherwani with authentic historical likeness',
  'allama iqbal': 'Sir Allama Muhammad Iqbal in contemplative pose with authentic likeness',
  'billi': 'adorable domestic cat with detailed whiskers, soft clean fur, and bright natural eyes',
  'kutta': 'friendly healthy dog with glossy coat and alert natural eyes',
  'sher': 'majestic wild African lion with a magnificent full golden mane, powerful posture, and piercing eyes',
  'cheetah': 'sleek wild cheetah in savanna with authentic spotted coat and focused gaze',
  'ghora': 'graceful muscular Arabian horse galloping with flowing mane in sunlight',
  'hathi': 'magnificent Asian elephant with realistic wrinkled skin texture in nature',
  'tota': 'vibrant emerald green parrot with red beak perched on a flowering branch',
  'mor': 'magnificent royal peacock proudly displaying iridescent blue and green plumage',
  'parinda': 'beautiful colorful wild bird with sharp realistic plumage',
  'admi': 'handsome adult man with realistic natural facial proportions, authentic skin pores, and clear eyes',
  'mard': 'handsome South Asian man with authentic facial features, natural beard, and friendly expression',
  'larki': 'beautiful young South Asian woman with authentic natural facial structure, expressive eyes, and gentle smile',
  'aurat': 'graceful elegant woman with natural radiant skin and authentic facial features',
  'larka': 'handsome young man with realistic friendly face and natural hair',
  'bacha': 'cute smiling toddler child with innocent sparkling eyes and rosy cheeks',
  'baby': 'adorable newborn baby sleeping peacefully wrapped in soft warm blanket',
  'car': 'modern luxury sports car with gleaming metallic paint, realistic reflections, and aerodynamic contours',
  'gaadi': 'modern luxury automobile on a scenic asphalt road with authentic metallic reflections',
  'bike': 'powerful modern sport motorcycle parked on highway',
  'ghar': 'beautiful modern architectural luxury home with lush green lawn, warm windows, and clear blue sky',
  'khet': 'golden wheat agricultural fields swaying gently under warm sunset sunlight',
  'pahad': 'majestic snow-capped mountain peaks towering under a clear alpine sky',
  'darya': 'sparkling clear freshwater river flowing through a lush green valley',
  'samandar': 'turquoise ocean waves crashing gently onto a golden sandy beach at sunrise',
  'faisal masjid': 'The iconic Faisal Mosque Islamabad with its eight-sided concrete shell and four minarets against the Margalla Hills',
  'badshahi masjid': 'Historical Badshahi Mosque in Lahore showcasing red sandstone architecture and white marble domes',
  'minar e pakistan': 'Minar-e-Pakistan monument standing tall in Iqbal Park Lahore under clear daylight',
  'kaaba': 'The Holy Kaaba in Makkah with crisp gold embroidered Kiswah cloth under soft heavenly light',
  'burj khalifa': 'The Burj Khalifa skyscraper towering majestically into the twilight Dubai sky'
};

export function cleanRawSubject(rawText: string): string {
  let cleaned = rawText.toLowerCase();

  // Remove command prefixes and Urdu filler phrases
  const junkPatterns = [
    /banao\b/g, /bano\b/g, /bana do\b/g, /bna do\b/g, /bnao\b/g, /bana\b/g,
    /photo\b/g, /pic\b/g, /pics\b/g, /image\b/g, /tasweer\b/g, /tasvir\b/g, /picture\b/g,
    /generate\b/g, /create\b/g, /draw\b/g, /portrait\b/g, /wallpaper\b/g,
    /asli\b/g, /original\b/g, /real\b/g, /shakl\b/g, /shape\b/g, /halat\b/g, /halth\b/g,
    /sahi\b/g, /ajeeb\b/g, /nahi\b/g, /visible\b/g, /dikhaye\b/g, /dikhao\b/g,
    /camera say li hoi\b/g, /camera se li hui\b/g, /jasy hoti\b/g, /jaisi hoti\b/g,
    /har chz\b/g, /har cheez\b/g, /kisi ko b\b/g, /kisi ko bhi\b/g, /tu us ki\b/g, /us ki\b/g,
    /mujhe\b/g, /please\b/g, /aik\b/g, /ek\b/g, /ki\b/g, /ka\b/g, /ke\b/g, /mein\b/g, /main\b/g,
    /wali\b/g, /wala\b/g, /ko\b/g, /se\b/g, /say\b/g, /par\b/g
  ];

  for (const pat of junkPatterns) {
    cleaned = cleaned.replace(pat, ' ');
  }

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

export function smartEnhancePrompt(rawText: string, forcedStyle: ImageStyle = 'auto'): {
  enhancedPrompt: string;
  detectedStyle: ImageStyle;
  styleLabel: string;
  modelType: string;
} {
  const t = rawText.toLowerCase().trim();
  const effectiveStyle: ImageStyle = forcedStyle === 'auto' ? detectImageStyle(rawText) : forcedStyle;
  const rawSubject = cleanRawSubject(rawText);

  // Check known dictionary mappings first
  let resolvedSubject = '';
  for (const [key, val] of Object.entries(URDU_TO_ENGLISH_MAP)) {
    if (t.includes(key)) {
      resolvedSubject = val;
      break;
    }
  }

  if (!resolvedSubject) {
    resolvedSubject = rawSubject || rawText.trim();
  }

  // 1. National Flag of Pakistan
  if (t.includes('pakistan') && (t.includes('flag') || t.includes('jhanda'))) {
    return {
      enhancedPrompt: 'The authentic National Flag of Pakistan, deep emerald green with crisp white vertical stripe at the hoist, centered sharp white crescent and five-pointed star, realistic woven fabric texture, waving gracefully in the wind under natural outdoor sunlight, 8k resolution, photorealistic DSLR capture',
      detectedStyle: 'camera',
      styleLabel: '📸 Asli National Flag',
      modelType: 'flux-realism'
    };
  }

  // Build enhanced prompt tailored for authentic shape, original likeness & crystal-clear visibility
  switch (effectiveStyle) {
    case 'human':
      return {
        enhancedPrompt: `A hyper-realistic authentic 8k camera portrait of ${resolvedSubject}. Perfectly proportioned original facial anatomy, sharp natural eyes with realistic reflections, authentic detailed skin texture with visible natural pores and micro-details, authentic likeness, correctly shaped symmetrical features. Captured on professional 85mm f/1.4 lens, natural soft portrait lighting, true-to-life, crisp focus, unwarped, clean award-winning photography.`,
        detectedStyle: 'human',
        styleLabel: '👤 Asli Insaan (Real Portrait)',
        modelType: 'flux-realism'
      };

    case 'camera':
      return {
        enhancedPrompt: `An authentic original photograph of ${resolvedSubject}, true-to-life proportions, fully visible, crisp and undistorted original shape. Captured on professional 35mm DSLR camera, natural daylight, real-world textures, authentic depth of field, sharp edge details, award-winning photography, 8k resolution.`,
        detectedStyle: 'camera',
        styleLabel: '📸 Asli Camera Photo (DSLR)',
        modelType: 'flux-realism'
      };

    case 'cartoon2d':
      return {
        enhancedPrompt: `Charming 2D animated cartoon of ${resolvedSubject}, classic Disney animation aesthetic, clear expressive facial features, bold clean outlines, vibrant cheerful color palette, perfectly shaped character design, high resolution vector clarity.`,
        detectedStyle: 'cartoon2d',
        styleLabel: '🎨 2D Cartoon Animation',
        modelType: 'flux'
      };

    case 'render3d':
      return {
        enhancedPrompt: `Charming 3D Pixar and Disney animation character render of ${resolvedSubject}, rendered in Blender Cycles, adorable facial expression, soft subsurface scattering skin, volumetric lighting, raytraced ambient occlusion, masterfully modeled 3D proportions, 4k CGI render.`,
        detectedStyle: 'render3d',
        styleLabel: '🧊 3D Pixar / Disney Render',
        modelType: 'flux-3d'
      };

    case 'anime':
      return {
        enhancedPrompt: `Masterpiece anime visual of ${resolvedSubject}, Makoto Shinkai and Ufotable studio aesthetic, expressive glowing eyes, clean authentic proportions, cinematic dramatic lighting, beautifully painted Japanese animation artwork, 4k wallpaper.`,
        detectedStyle: 'anime',
        styleLabel: '🎌 Japanese Anime',
        modelType: 'flux-anime'
      };

    case 'cinematic':
      return {
        enhancedPrompt: `Cinematic movie film still of ${resolvedSubject}, shot on 35mm anamorphic camera, authentic original shape, realistic dramatic lighting, shallow depth of field, blockbuster movie color grading, 8k cinematic shot.`,
        detectedStyle: 'cinematic',
        styleLabel: '🌌 Cinematic Film Still',
        modelType: 'flux-realism'
      };

    case 'digitalart':
      return {
        enhancedPrompt: `Masterpiece digital concept art of ${resolvedSubject}, trending on ArtStation, dynamic brushwork, crisp details, moody atmospheric lighting, perfectly proportioned composition, award-winning artwork.`,
        detectedStyle: 'digitalart',
        styleLabel: '🖌️ Digital Art',
        modelType: 'flux'
      };

    default:
      return {
        enhancedPrompt: `A photorealistic authentic 8k photograph of ${resolvedSubject}, original true-to-life shape, perfectly visible details, natural daylight, sharp focus, unwarped, clean professional capture.`,
        detectedStyle: 'camera',
        styleLabel: '📸 Asli Photo',
        modelType: 'flux-realism'
      };
  }
}

export function generateFluxImageUrl(
  promptText: string,
  forcedStyle: ImageStyle = 'auto',
  customSeed?: number
): {
  url: string;
  enhancedPrompt: string;
  detectedStyle: ImageStyle;
  styleLabel: string;
  seed: number;
} {
  const { enhancedPrompt, detectedStyle, styleLabel, modelType } = smartEnhancePrompt(promptText, forcedStyle);
  const cleanP = encodeURIComponent(enhancedPrompt.trim());
  const seed = customSeed || (Math.floor(Math.random() * 900000) + 10000);
  
  // Use flux-realism for humans/camera to ensure authentic faces, eyes, and original shapes without distortion
  const url = `https://image.pollinations.ai/prompt/${cleanP}?width=1024&height=1024&nologo=true&seed=${seed}&model=${modelType}`;

  return {
    url,
    enhancedPrompt,
    detectedStyle,
    styleLabel,
    seed
  };
}
