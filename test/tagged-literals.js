import { expect } from 'chai'

let locale = null

const translations = {
  'Welcome to , you are visitor number ': {
    fr: 'Bienvenue à {0}, vous êtes le {1}ème visiteur',
    de: 'Besucher Nr. {1}, willkommen bei {0}',
    wrong: 'Cher {2} vous êtes le {1}ème visiteur à {0}'
  }
}

function l10n (message, ...args) {
  const key = message.join('')
  if (!(key in translations) || !(locale in translations[key])) {
    return message.map((n, i) => n + (i < args.length ? args[i] : '')).join('')
  }
  const translated = translations[key][locale]
  const parts = translated.split(/\{(\d+)\}/)
  const result = []
  for (const [i, part] of parts.entries()) {
    result.push(i % 2 ? args[Number(part)] : part)
  }
  return result.join('')
}

describe('Tagged literals', () => {
  const company = 'Acme'
  const number = 3

  it('should default to string for unknown locale', () => {
    locale = 'it'
    expect(
      l10n`Welcome to ${company}, you are visitor number ${number}`
    ).to.equal('Welcome to Acme, you are visitor number 3')
  })

  it('should default to string for untranslated string', () => {
    locale = 'fr'
    expect(l10n`Welcome to ${company}`).to.equal('Welcome to Acme')
  })

  it('should use available translation', () => {
    locale = 'fr'
    expect(
      l10n`Welcome to ${company}, you are visitor number ${number}`
    ).to.equal('Bienvenue à Acme, vous êtes le 3ème visiteur')
  })

  it('should use translation argument ordering', () => {
    locale = 'de'
    expect(
      l10n`Welcome to ${company}, you are visitor number ${number}`
    ).to.equal('Besucher Nr. 3, willkommen bei Acme')
  })

  it('should only use available arguments', () => {
    locale = 'wrong'
    expect(
      l10n`Welcome to ${company}, you are visitor number ${number}`
    ).to.equal('Cher  vous êtes le 3ème visiteur à Acme')
  })
})
