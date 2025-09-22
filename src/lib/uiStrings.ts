import { LanguageCode } from '@/types/settings'

type UIKey =
  | 'appName'
  | 'tagline'
  | 'newChat'
  | 'myGPTs'
  | 'documentSearch'
  | 'settings'
  | 'preferences'
  | 'languageLabel'
  | 'languageHelperShort'
  | 'activeMyGPT'
  | 'toggleSearchShow'
  | 'toggleSearchHide'
  | 'documentsFound'
  | 'documentsContextBanner'
  | 'startNewChat'
  | 'useDefaultGPT'
  | 'defaultWelcomeMessage'
  | 'defaultHelperText'
  | 'disclaimer'

const STRINGS: Record<LanguageCode, Record<UIKey, string>> = {
  auto: {
    appName: 'Clavi Local Mining',
    tagline: 'Default assistant',
    newChat: 'New Chat',
    myGPTs: 'My GPTs',
    documentSearch: 'Document Search',
    settings: 'Settings',
    preferences: 'Preferences',
    languageLabel: 'Language',
    languageHelperShort: 'Change how Clavi Local Mining responds.',
    activeMyGPT: 'Active MyGPT',
    toggleSearchShow: 'Show Document Search',
    toggleSearchHide: 'Hide Document Search',
    documentsFound: '{count} relevant document(s)',
    documentsContextBanner: '📚 Document context will be included automatically.',
    startNewChat: 'Start a new chat',
    useDefaultGPT: 'Use default GPT',
    defaultWelcomeMessage: 'How can I help you today?',
    defaultHelperText: 'Select a custom assistant or start a new conversation.',
    disclaimer: 'Clavi Local Mining can make mistakes. Check important info.'
  },
  en: {
    appName: 'Clavi Local Mining',
    tagline: 'Default assistant',
    newChat: 'New Chat',
    myGPTs: 'My GPTs',
    documentSearch: 'Document Search',
    settings: 'Settings',
    preferences: 'Preferences',
    languageLabel: 'Language',
    languageHelperShort: 'Change how Clavi Local Mining responds.',
    activeMyGPT: 'Active MyGPT',
    toggleSearchShow: 'Show Document Search',
    toggleSearchHide: 'Hide Document Search',
    documentsFound: '{count} relevant document(s)',
    documentsContextBanner: '📚 Document context will be included automatically.',
    startNewChat: 'Start a new chat',
    useDefaultGPT: 'Use default GPT',
    defaultWelcomeMessage: 'How can I help you today?',
    defaultHelperText: 'Select a custom assistant or start a new conversation.',
    disclaimer: 'Clavi Local Mining can make mistakes. Check important info.'
  },
  ja: {
    appName: 'Clavi Local Mining',
    tagline: '標準アシスタント',
    newChat: '新しいチャット',
    myGPTs: 'マイGPT',
    documentSearch: 'ドキュメント検索',
    settings: '設定',
    preferences: '環境設定',
    languageLabel: '言語',
    languageHelperShort: 'Clavi Local Mining の応答言語を切り替えます。',
    activeMyGPT: '使用中のマイGPT',
    toggleSearchShow: 'ドキュメント検索を表示',
    toggleSearchHide: 'ドキュメント検索を隠す',
    documentsFound: '関連ドキュメント {count} 件',
    documentsContextBanner: '📚 検索結果のコンテキストが自動的に回答へ反映されます。',
    startNewChat: '新しいチャットを開始',
    useDefaultGPT: '標準アシスタントを使う',
    defaultWelcomeMessage: '今日はどのようにお手伝いできますか？',
    defaultHelperText: 'マイGPTを選択するか、新しい会話を始めてください。',
    disclaimer: 'Clavi Local Mining の回答には誤りが含まれる場合があります。重要な情報は必ず確認してください。'
  },
  fr: {
    appName: 'Clavi Local Mining',
    tagline: 'Assistant par défaut',
    newChat: 'Nouvelle discussion',
    myGPTs: 'Mes GPTs',
    documentSearch: 'Recherche de documents',
    settings: 'Paramètres',
    preferences: 'Préférences',
    languageLabel: 'Langue',
    languageHelperShort: 'Définissez la langue de réponse de Clavi Local Mining.',
    activeMyGPT: 'MyGPT actif',
    toggleSearchShow: 'Afficher la recherche de documents',
    toggleSearchHide: 'Masquer la recherche de documents',
    documentsFound: '{count} document(s) pertinent(s)',
    documentsContextBanner: '📚 Le contexte des documents sera ajouté automatiquement.',
    startNewChat: 'Commencer une nouvelle discussion',
    useDefaultGPT: 'Utiliser le GPT par défaut',
    defaultWelcomeMessage: 'Comment puis-je vous aider aujourd’hui ?',
    defaultHelperText: 'Choisissez un assistant personnalisé ou démarrez une nouvelle discussion.',
    disclaimer: 'Clavi Local Mining peut contenir des erreurs. Vérifiez les informations importantes.'
  },
  it: {
    appName: 'Clavi Local Mining',
    tagline: 'Assistente predefinito',
    newChat: 'Nuova chat',
    myGPTs: 'I miei GPT',
    documentSearch: 'Ricerca documenti',
    settings: 'Impostazioni',
    preferences: 'Preferenze',
    languageLabel: 'Lingua',
    languageHelperShort: 'Imposta la lingua delle risposte di Clavi Local Mining.',
    activeMyGPT: 'MyGPT attivo',
    toggleSearchShow: 'Mostra ricerca documenti',
    toggleSearchHide: 'Nascondi ricerca documenti',
    documentsFound: '{count} documenti rilevanti',
    documentsContextBanner: '📚 Il contesto dei documenti verrà aggiunto automaticamente alla risposta.',
    startNewChat: 'Avvia una nuova chat',
    useDefaultGPT: 'Usa il GPT predefinito',
    defaultWelcomeMessage: 'Come posso aiutarti oggi?',
    defaultHelperText: 'Seleziona un assistente personalizzato oppure avvia una nuova conversazione.',
    disclaimer: 'Clavi Local Mining può commettere errori. Controlla sempre le informazioni importanti.'
  },
  pt: {
    appName: 'Clavi Local Mining',
    tagline: 'Assistente padrão',
    newChat: 'Nova conversa',
    myGPTs: 'Meus GPTs',
    documentSearch: 'Pesquisa de documentos',
    settings: 'Configurações',
    preferences: 'Preferências',
    languageLabel: 'Idioma',
    languageHelperShort: 'Defina o idioma das respostas do Clavi Local Mining.',
    activeMyGPT: 'MyGPT ativo',
    toggleSearchShow: 'Mostrar pesquisa de documentos',
    toggleSearchHide: 'Ocultar pesquisa de documentos',
    documentsFound: '{count} documento(s) relevante(s)',
    documentsContextBanner: '📚 O contexto dos documentos será incluído automaticamente.',
    startNewChat: 'Iniciar nova conversa',
    useDefaultGPT: 'Usar GPT padrão',
    defaultWelcomeMessage: 'Como posso ajudar você hoje?',
    defaultHelperText: 'Selecione um assistente personalizado ou inicie uma nova conversa.',
    disclaimer: 'Clavi Local Mining pode conter erros. Verifique informações importantes.'
  },
  de: {
    appName: 'Clavi Local Mining',
    tagline: 'Standard-Assistent',
    newChat: 'Neuer Chat',
    myGPTs: 'Meine GPTs',
    documentSearch: 'Dokumentensuche',
    settings: 'Einstellungen',
    preferences: 'Einstellungen',
    languageLabel: 'Sprache',
    languageHelperShort: 'Legt die Antwortsprache von Clavi Local Mining fest.',
    activeMyGPT: 'Aktiver MyGPT',
    toggleSearchShow: 'Dokumentensuche anzeigen',
    toggleSearchHide: 'Dokumentensuche ausblenden',
    documentsFound: '{count} relevante Dokument(e)',
    documentsContextBanner: '📚 Dokumentenkontext wird automatisch in die Antwort aufgenommen.',
    startNewChat: 'Neuen Chat starten',
    useDefaultGPT: 'Standard-GPT verwenden',
    defaultWelcomeMessage: 'Wie kann ich Ihnen heute helfen?',
    defaultHelperText: 'Wählen Sie einen individuellen Assistenten oder starten Sie ein neues Gespräch.',
    disclaimer: 'Clavi Local Mining kann Fehler enthalten. Prüfen Sie wichtige Informationen.'
  },
  zh: {
    appName: 'Clavi Local Mining',
    tagline: '默认助手',
    newChat: '新建对话',
    myGPTs: '我的 GPT',
    documentSearch: '文档搜索',
    settings: '设置',
    preferences: '偏好设置',
    languageLabel: '语言',
    languageHelperShort: '设置 Clavi Local Mining 的回复语言。',
    activeMyGPT: '当前 MyGPT',
    toggleSearchShow: '显示文档搜索',
    toggleSearchHide: '隐藏文档搜索',
    documentsFound: '相关文档 {count} 个',
    documentsContextBanner: '📚 文档上下文将自动添加到回复中。',
    startNewChat: '开始新对话',
    useDefaultGPT: '使用默认 GPT',
    defaultWelcomeMessage: '今天有什么可以帮您？',
    defaultHelperText: '请选择自定义助手或开始新的对话。',
    disclaimer: 'Clavi Local Mining 可能会出错，请核实重要信息。'
  },
  ko: {
    appName: 'Clavi Local Mining',
    tagline: '기본 어시스턴트',
    newChat: '새 채팅',
    myGPTs: '내 GPT',
    documentSearch: '문서 검색',
    settings: '설정',
    preferences: '환경설정',
    languageLabel: '언어',
    languageHelperShort: 'Clavi Local Mining의 응답 언어를 설정합니다.',
    activeMyGPT: '활성 MyGPT',
    toggleSearchShow: '문서 검색 표시',
    toggleSearchHide: '문서 검색 숨기기',
    documentsFound: '관련 문서 {count}건',
    documentsContextBanner: '📚 문서 컨텍스트가 자동으로 답변에 포함됩니다.',
    startNewChat: '새 채팅 시작',
    useDefaultGPT: '기본 GPT 사용',
    defaultWelcomeMessage: '오늘 무엇을 도와드릴까요?',
    defaultHelperText: '맞춤형 어시스턴트를 선택하거나 새 대화를 시작하세요.',
    disclaimer: 'Clavi Local Mining의 답변에는 오류가 있을 수 있습니다. 중요한 정보는 반드시 확인하세요.'
  },
  th: {
    appName: 'Clavi Local Mining',
    tagline: 'ผู้ช่วยเริ่มต้น',
    newChat: 'สนทนาใหม่',
    myGPTs: 'GPT ของฉัน',
    documentSearch: 'ค้นหาเอกสาร',
    settings: 'การตั้งค่า',
    preferences: 'การตั้งค่า',
    languageLabel: 'ภาษา',
    languageHelperShort: 'กำหนดภาษาที่ Clavi Local Mining ตอบกลับ',
    activeMyGPT: 'MyGPT ที่ใช้งาน',
    toggleSearchShow: 'แสดงการค้นหาเอกสาร',
    toggleSearchHide: 'ซ่อนการค้นหาเอกสาร',
    documentsFound: 'พบเอกสารที่เกี่ยวข้อง {count} รายการ',
    documentsContextBanner: '📚 บริบทของเอกสารจะถูกใส่ในคำตอบโดยอัตโนมัติ',
    startNewChat: 'เริ่มการสนทนาใหม่',
    useDefaultGPT: 'ใช้ GPT เริ่มต้น',
    defaultWelcomeMessage: 'วันนี้ให้ช่วยอะไรคุณได้บ้าง?',
    defaultHelperText: 'เลือกผู้ช่วยที่คุณต้องการหรือตั้งต้นการสนทนาใหม่',
    disclaimer: 'Clavi Local Mining อาจให้ข้อมูลผิดพลาด ตรวจสอบข้อมูลสำคัญเสมอ'
  },
  vi: {
    appName: 'Clavi Local Mining',
    tagline: 'Trợ lý mặc định',
    newChat: 'Cuộc trò chuyện mới',
    myGPTs: 'GPT của tôi',
    documentSearch: 'Tìm kiếm tài liệu',
    settings: 'Cài đặt',
    preferences: 'Tùy chọn',
    languageLabel: 'Ngôn ngữ',
    languageHelperShort: 'Chọn ngôn ngữ trả lời của Clavi Local Mining.',
    activeMyGPT: 'MyGPT đang hoạt động',
    toggleSearchShow: 'Hiển thị tìm kiếm tài liệu',
    toggleSearchHide: 'Ẩn tìm kiếm tài liệu',
    documentsFound: '{count} tài liệu liên quan',
    documentsContextBanner: '📚 Ngữ cảnh tài liệu sẽ được thêm vào câu trả lời tự động.',
    startNewChat: 'Bắt đầu cuộc trò chuyện mới',
    useDefaultGPT: 'Dùng GPT mặc định',
    defaultWelcomeMessage: 'Tôi có thể giúp gì cho bạn hôm nay?',
    defaultHelperText: 'Hãy chọn trợ lý tuỳ chỉnh hoặc bắt đầu cuộc trò chuyện mới.',
    disclaimer: 'Clavi Local Mining có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.'
  }
}

export function getUIText(language: LanguageCode, key: UIKey, params?: Record<string, string | number>): string {
  const lang = STRINGS[language] ? language : 'en'
  const fallback = STRINGS['en']
  const template = STRINGS[lang][key] ?? fallback[key]
  if (!params) return template
  return Object.entries(params).reduce((acc, [paramKey, value]) => acc.replace(`{${paramKey}}`, String(value)), template)
}
