import { createContext, useContext, useState, useEffect } from 'react'

const TRANSLATIONS = {
  fr: {
    // Nav
    home: 'Accueil',
    doctors: 'Médecins',
    appointments: 'RDV',
    chat: 'Chat',
    profile: 'Profil',
    // Home
    hello: 'Bonjour',
    how_help: 'Comment pouvons-nous vous aider ?',
    consult: 'Consulter',
    book: 'Rendez-vous',
    messages: 'Messages',
    online_doctors: 'Médecins en ligne',
    see_all: 'Voir tout →',
    why_beni: 'Pourquoi BéniConsult ?',
    instant: 'Consultation instantanée',
    instant_desc: 'Médecin disponible en moins de 2 min',
    confidential: 'Confidentiel',
    confidential_desc: 'Vos données protégées et sécurisées',
    available: 'Disponible maintenant',
    no_doctor: 'Aucun médecin en ligne pour le moment.',
    // Médecins
    search_placeholder: 'Nom, spécialité, hôpital...',
    online_only: 'Disponible maintenant',
    no_result: 'Aucun résultat',
    // Chat
    write_message: 'Écrire un message...',
    // Général
    loading: 'Chargement...',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    back: 'Retour',
    logout: 'Se déconnecter',
  },
  fon: {
    home: 'Xɔmɛ',
    doctors: 'Dɔgɔzitɔ',
    appointments: 'Azǎn',
    chat: 'Xɔ gbɔ',
    profile: 'Mì',
    hello: 'Aɖo',
    how_help: 'Etɛ ka na d\'alɔ mì ?',
    consult: 'Kpɔ dɔgɔzitɔ',
    book: 'Azǎn',
    messages: 'Xó',
    online_doctors: 'Dɔgɔzitɔ e ɖo',
    see_all: 'Kpɔ bǐ →',
    why_beni: 'Etɛwu BéniConsult ?',
    instant: 'Azǎn tɔtɔ',
    instant_desc: 'Dɔgɔzitɔ ɖo kpɔɖɛ wɛ',
    confidential: 'Wǔjɔmɛ',
    confidential_desc: 'Nǔ towe lɛ ɖo gbɛ̀ mɛ',
    available: 'Ɖo wɛ sixu kpɔ',
    no_doctor: 'Dɔgɔzitɔ ɖěɖě ma ɖo.',
    search_placeholder: 'Wlí dɔgɔzitɔ...',
    online_only: 'Ɖo wɛ sixu kpɔ',
    no_result: 'Mɔ ǎ',
    write_message: 'Wlan xó...',
    loading: 'Ɖo bló...',
    save: 'Ɖo kɔ',
    cancel: 'Yí sɛ́',
    confirm: 'Ðɔ nyɔ',
    back: 'Vɔ',
    logout: 'Lɛ́n',
  },
  yoruba: {
    home: 'Ilé',
    doctors: 'Dókítà',
    appointments: 'Àpèjọ',
    chat: 'Ọ̀rọ̀',
    profile: 'Èmi',
    hello: 'Ẹ káàbọ̀',
    how_help: 'Báwo ni a ṣe lè ràn ọ́ lọ́wọ́ ?',
    consult: 'Bá dókítà sọ̀rọ̀',
    book: 'Àpèjọ',
    messages: 'Ìfiranṣẹ',
    online_doctors: 'Àwọn dókítà tó wà',
    see_all: 'Wo gbogbo →',
    why_beni: 'Pátàkì BéniConsult ?',
    instant: 'Ìjíròrò kíákíá',
    instant_desc: 'Dókítà wà ní ìṣẹ́jú 2',
    confidential: 'Ìpamọ́',
    confidential_desc: 'Àwọn ìsọfúnni rẹ wà ní ààbò',
    available: 'Wà báyìí',
    no_doctor: 'Kò sí dókítà tó wà báyìí.',
    search_placeholder: 'Wá dókítà...',
    online_only: 'Wà báyìí',
    no_result: 'Kò sí ohun',
    write_message: 'Kọ ìfiranṣẹ...',
    loading: 'Ń ṣiṣẹ́...',
    save: 'Pamọ́',
    cancel: 'Fagilee',
    confirm: 'Jẹrìísí',
    back: 'Padà',
    logout: 'Jáde',
  },
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('beniconsult_lang') || 'fr')

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem('beniconsult_lang', l)
  }

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.fr[key] || key

  return (
    <LangContext.Provider value={{ lang, changeLang, t, langs: ['fr', 'fon', 'yoruba'] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)