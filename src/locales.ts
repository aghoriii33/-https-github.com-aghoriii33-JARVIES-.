export type SupportedLanguage = "en" | "es" | "de" | "zh" | "fr";

export interface TranslationSet {
  welcomeBack: string;
  howHelp: string;
  neuralSync: string;
  talkJarvis: string;
  talkJarvisSub: string;
  chatBot: string;
  chatBotSub: string;
  searchImage: string;
  searchImageSub: string;
  complianceEngine: string;
  complianceEngineSub: string;
  neuralTuner: string;
  neuralTunerSub: string;
  knowledgeRepo: string;
  knowledgeRepoSub: string;
  workspaceConnect: string;
  workspaceConnectSub: string;
  themeSettings: string;
  brightTheme: string;
  blackTheme: string;
  terminalQuick: string;
  codebaseQuick: string;
  languageSelect: string;
  diagnosticHistory: string;
}

export const translations: Record<SupportedLanguage, TranslationSet> = {
  en: {
    welcomeBack: "Welcome back",
    howHelp: "How may I help you today?",
    neuralSync: "Neural Core Sync",
    talkJarvis: "Talk with JARVIS",
    talkJarvisSub: "Activate high-latency sound-orb",
    chatBot: "Chat with Bot",
    chatBotSub: "Real-time Cognitive AI",
    searchImage: "Holographic Workspace",
    searchImageSub: "Manage Google Drive, Sheets, Slides",
    complianceEngine: "Compliance Engine",
    complianceEngineSub: "Index files and scan threat flags",
    neuralTuner: "Neural Core Tuner",
    neuralTunerSub: "Tune weights, epochs, and fine-tune datasets",
    knowledgeRepo: "Knowledge Bank",
    knowledgeRepoSub: "Browse schemas, vectors, and documents",
    workspaceConnect: "Workspace Cockpit",
    workspaceConnectSub: "Direct schema injection and integrations",
    themeSettings: "SYSTEM COGNITIVE THEME",
    brightTheme: "Bright Cyber",
    blackTheme: "Stark Black",
    terminalQuick: "Terminal",
    codebaseQuick: "Codebase",
    languageSelect: "CORE TRANSLATION MATRIX",
    diagnosticHistory: "DIAGNOSTIC HISTORY"
  },
  es: {
    welcomeBack: "Bienvenido de nuevo",
    howHelp: "¿Cómo puedo ayudarte hoy?",
    neuralSync: "Sincronización de Núcleo",
    talkJarvis: "Hablar con JARVIS",
    talkJarvisSub: "Activa el orbe de modulación vocal",
    chatBot: "Chat Cognitivo",
    chatBotSub: "IA de Procesamiento Verbal",
    searchImage: "Espacio Holográfico",
    searchImageSub: "Gestionar Drive, Hojas y Diapositivas",
    complianceEngine: "Motor de Cumplimiento",
    complianceEngineSub: "Indexar archivos y escanear amenazas",
    neuralTuner: "Ajustador de Sinapsis",
    neuralTunerSub: "Ajustar pesos, iteraciones y datos neurales",
    knowledgeRepo: "Banco de Datos",
    knowledgeRepoSub: "Explorar esquemas, vectores y documentos",
    workspaceConnect: "Cabina de Trabajo",
    workspaceConnectSub: "Sincronización directa de Google Workspace",
    themeSettings: "TEMA COGNITIVO DEL SISTEMA",
    brightTheme: "Ciber Brillante",
    blackTheme: "Negro Absoluto",
    terminalQuick: "Terminal",
    codebaseQuick: "Código",
    languageSelect: "MATRIZ DE TRADUCCIÓN NATIVA",
    diagnosticHistory: "HISTORIAL DE DIAGNÓSTICOS"
  },
  de: {
    welcomeBack: "Willkommen zurück",
    howHelp: "Wie kann ich heute helfen?",
    neuralSync: "Synapsen-Synchronisation",
    talkJarvis: "Mit JARVIS Sprechen",
    talkJarvisSub: "Vokale Modulationskuppel aktivieren",
    chatBot: "Kognitiver Chat",
    chatBotSub: "Echtzeit-KI-Modul",
    searchImage: "Holografischer Arbeitsbereich",
    searchImageSub: "Drive, Tabellen & Slides verwalten",
    complianceEngine: "Compliance-Modul",
    complianceEngineSub: "Dateien indizieren und Risiken scannen",
    neuralTuner: "Synaptischer Feinabstimmer",
    neuralTunerSub: "Gewichte, Epochen und Datensätze tunen",
    knowledgeRepo: "Wissensdatenbank",
    knowledgeRepoSub: "Dateien, Schemata und Vektoren sichten",
    workspaceConnect: "Arbeitsbereich-Cockpit",
    workspaceConnectSub: "Direkte Google Workspace Synchronisation",
    themeSettings: "KOGNITIVES DESIGN-SHEMA",
    brightTheme: "Hell / Cyber",
    blackTheme: "Tiefschwarz",
    terminalQuick: "Terminal",
    codebaseQuick: "Codebase",
    languageSelect: "SPRACHMATRIX-STEUERUNG",
    diagnosticHistory: "DIAGNOSE-HISTORIE"
  },
  zh: {
    welcomeBack: "欢迎回来",
    howHelp: "今天我该如何协助您？",
    neuralSync: "神经内核链路同步",
    talkJarvis: "启用语音交互模式",
    talkJarvisSub: "唤醒高保真音频频率共鸣",
    chatBot: "AI 认知交互终端",
    chatBotSub: "即时自适应神经网络",
    searchImage: "全息协同工作室",
    searchImageSub: "关联谷歌云盘、表格与演示文稿",
    complianceEngine: "安全合规审查器",
    complianceEngineSub: "索引分析文档提取风险警报",
    neuralTuner: "突触微调加速包",
    neuralTunerSub: "微调权重常数、迭代步数与训练数据集",
    knowledgeRepo: "智慧知识底座",
    knowledgeRepoSub: "查看索引数据库、特征向量与全局文档",
    workspaceConnect: "工作区驾驶舱",
    workspaceConnectSub: "直接无缝同步 Google 办公套件",
    themeSettings: "系统高阶视觉主题",
    brightTheme: "明亮赛博",
    blackTheme: "极暗黑曜石",
    terminalQuick: "终端",
    codebaseQuick: "源码",
    languageSelect: "多维语言编译矩阵",
    diagnosticHistory: "历史诊断会话"
  },
  fr: {
    welcomeBack: "Bon retour",
    howHelp: "Comment puis-je vous aider ?",
    neuralSync: "Synchro du Noyau Neural",
    talkJarvis: "Parler avec JARVIS",
    talkJarvisSub: "Activer l'orbe acoustique holographique",
    chatBot: "Discussion IA",
    chatBotSub: "Traitement cognitif en temps réel",
    searchImage: "Espace Holographique",
    searchImageSub: "Gérer Drive, Sheets et Slides",
    complianceEngine: "Analyse de Conformité",
    complianceEngineSub: "Indice de fichiers et scan des risques",
    neuralTuner: "Optimiseur Sinaptique",
    neuralTunerSub: "Régler les poids, époques et jeux de données",
    knowledgeRepo: "Banque de Savoir",
    knowledgeRepoSub: "Parcourir schémas, vecteurs et documents",
    workspaceConnect: "Poste de Pilotage",
    workspaceConnectSub: "Synchronisation directe de Google Workspace",
    themeSettings: "THÈME COGNITIF DU SYSTÈME",
    brightTheme: "Clair Cyber",
    blackTheme: "Noir Absolu",
    terminalQuick: "Terminal",
    codebaseQuick: "Dépôt",
    languageSelect: "MATRICE DE TRADUCTION CORE",
    diagnosticHistory: "RELEVÉ DES SEANCES"
  }
};
