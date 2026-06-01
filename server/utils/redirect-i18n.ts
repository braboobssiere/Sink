import type { H3Event } from 'h3'
import { parseAcceptLanguage } from 'intl-parse-accept-language'

interface RedirectTranslation {
  passwordTitle: string
  passwordLabel: string
  passwordPlaceholder: string
  passwordError: string
  continue: string
  unsafeTitle: string
  unsafeDesc: string
  goBack: string
}

const REDIRECT_LOCALES = [
  'de-DE',
  'en-US',
  'fr-FR',
  'id-ID',
  'it-IT',
  'pt-BR',
  'pt-PT',
  'vi-VN',
  'zh-CN',
  'zh-TW',
] as const

export type RedirectLocale = typeof REDIRECT_LOCALES[number]

const DEFAULT_REDIRECT_LOCALE = 'en-US' satisfies RedirectLocale
const REDIRECT_LOCALE_COOKIE = 'sink_i18n_redirected'

export const REDIRECT_TRANSLATIONS = {
  'de-DE': {
    passwordTitle: 'Passwort erforderlich',
    passwordLabel: 'Passwort',
    passwordPlaceholder: 'Passwort eingeben',
    passwordError: 'Falsches Passwort',
    continue: 'Weiter',
    unsafeTitle: 'Hinweis',
    unsafeDesc: 'Verkürzte URLs können zu schädlichen Websites führen. Überprüfen Sie die vollständige URL, bevor Sie fortfahren.',
    goBack: 'Zurück',
  },
  'en-US': {
    passwordTitle: 'Password Required',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    passwordError: 'Incorrect password',
    continue: 'Continue',
    unsafeTitle: 'Notice',
    unsafeDesc: 'Shortened URLs may lead to malicious sites. Check the full URL before proceeding.',
    goBack: 'Go Back',
  },
  'fr-FR': {
    passwordTitle: 'Mot de passe requis',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Entrez le mot de passe',
    passwordError: 'Mot de passe incorrect',
    continue: 'Continuer',
    unsafeTitle: 'Avis',
    unsafeDesc: 'Les URL raccourcies peuvent mener à des sites malveillants. Vérifiez l\'URL complète avant de continuer.',
    goBack: 'Retour',
  },
  'id-ID': {
    passwordTitle: 'Diperlukan Kata Sandi',
    passwordLabel: 'Kata Sandi',
    passwordPlaceholder: 'Masukkan kata sandi',
    passwordError: 'Kata sandi salah',
    continue: 'Lanjutkan',
    unsafeTitle: 'Pemberitahuan',
    unsafeDesc: 'URL yang dipendekkan dapat mengarah ke situs berbahaya. Periksa URL lengkap sebelum melanjutkan.',
    goBack: 'Kembali',
  },
  'it-IT': {
    passwordTitle: 'Password richiesta',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Inserisci la password',
    passwordError: 'Password errata',
    continue: 'Continua',
    unsafeTitle: 'Avviso',
    unsafeDesc: 'Gli URL abbreviati possono portare a siti dannosi. Controlla l\'URL completo prima di procedere.',
    goBack: 'Indietro',
  },
  'pt-BR': {
    passwordTitle: 'Senha necessária',
    passwordLabel: 'Senha',
    passwordPlaceholder: 'Digite a senha',
    passwordError: 'Senha incorreta',
    continue: 'Continuar',
    unsafeTitle: 'Aviso',
    unsafeDesc: 'URLs encurtadas podem levar a sites maliciosos. Verifique a URL completa antes de prosseguir.',
    goBack: 'Voltar',
  },
  'pt-PT': {
    passwordTitle: 'Palavra-passe necessária',
    passwordLabel: 'Palavra-passe',
    passwordPlaceholder: 'Introduza a palavra-passe',
    passwordError: 'Palavra-passe incorreta',
    continue: 'Continuar',
    unsafeTitle: 'Aviso',
    unsafeDesc: 'URLs encurtadas podem levar a sites maliciosos. Verifique o URL completo antes de prosseguir.',
    goBack: 'Voltar',
  },
  'vi-VN': {
    passwordTitle: 'Yêu cầu mật khẩu',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    passwordError: 'Mật khẩu không đúng',
    continue: 'Tiếp tục',
    unsafeTitle: 'Thông báo',
    unsafeDesc: 'URL rút gọn có thể dẫn đến các trang web độc hại. Hãy kiểm tra URL đầy đủ trước khi tiếp tục.',
    goBack: 'Quay lại',
  },
  'zh-CN': {
    passwordTitle: '需要密码',
    passwordLabel: '密码',
    passwordPlaceholder: '请输入密码',
    passwordError: '密码错误',
    continue: '继续',
    unsafeTitle: '注意',
    unsafeDesc: '短链接可能导向恶意网站。请在继续之前检查完整URL。',
    goBack: '返回',
  },
  'zh-TW': {
    passwordTitle: '需要密碼',
    passwordLabel: '密碼',
    passwordPlaceholder: '請輸入密碼',
    passwordError: '密碼錯誤',
    continue: '繼續',
    unsafeTitle: '注意',
    unsafeDesc: '短連結可能導向惡意網站。請在繼續之前檢查完整URL。',
    goBack: '返回',
  },
} as const satisfies Record<RedirectLocale, RedirectTranslation>

const SUPPORTED_LOCALES = [...REDIRECT_LOCALES]

const LOCALE_ALIASES: Record<string, RedirectLocale> = {
  'de': 'de-DE',
  'en': 'en-US',
  'fr': 'fr-FR',
  'id': 'id-ID',
  'it': 'it-IT',
  'pt': 'pt-BR',
  'vi': 'vi-VN',
  'zh': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-MO': 'zh-TW',
}

function normalizeLocaleCode(code: string): string {
  const normalized = code.replace('_', '-')
  try {
    return Intl.getCanonicalLocales(normalized)[0] || ''
  }
  catch {
    return ''
  }
}

function resolveLocaleCode(code: string | undefined): RedirectLocale | undefined {
  if (!code)
    return undefined

  const normalized = normalizeLocaleCode(code)
  if (!normalized)
    return undefined

  if (SUPPORTED_LOCALES.includes(normalized as RedirectLocale))
    return normalized as RedirectLocale

  const alias = LOCALE_ALIASES[normalized]
  if (alias)
    return alias

  const prefix = normalized.split('-')[0]
  return prefix ? LOCALE_ALIASES[prefix] : undefined
}

export function resolveRedirectLocale(event: H3Event): RedirectLocale {
  const cookieLocale = resolveLocaleCode(getCookie(event, REDIRECT_LOCALE_COOKIE))
  if (cookieLocale)
    return cookieLocale

  const header = getHeader(event, 'accept-language')
  if (!header)
    return DEFAULT_REDIRECT_LOCALE

  for (const code of parseAcceptLanguage(header)) {
    const locale = resolveLocaleCode(code)
    if (locale)
      return locale
  }

  return DEFAULT_REDIRECT_LOCALE
}
