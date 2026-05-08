import MarkdownIt from 'markdown-it'
import katex from 'katex'
import sanitizeHtml from 'sanitize-html'

const markdown = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: true,
  breaks: true,
})

const markdownSanitizeOptions = {
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
    'center',
    'code',
    'dd',
    'del',
    'details',
    'div',
    'dl',
    'dt',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strong',
    'sub',
    'summary',
    'sup',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'ul',
  ],
  allowedAttributes: {
    '*': ['class', 'id'],
    a: ['href', 'title'],
    img: ['src', 'alt', 'width', 'height'],
    details: ['open'],
    td: ['align'],
    th: ['align'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
} satisfies NonNullable<Parameters<typeof sanitizeHtml>[1]>

function renderFormula(source: string, display = false) {
  return katex.renderToString(source, {
    displayMode: display,
    throwOnError: false,
    strict: 'ignore',
    output: 'html',
  })
}

export function renderMarkdownWithMath(source: string) {
  const formulas: string[] = []
  const protectedBlocks: string[] = []

  const protectBlock = (block: string, inline = false) => {
    const token = `@@PROTECTED_BLOCK_${protectedBlocks.length}@@`
    protectedBlocks.push(inline ? markdown.renderInline(block) : markdown.render(block).trim())
    return token
  }

  const stashFormula = (formula: string, display: boolean) => {
    const token = `@@FORMULA_${formulas.length}@@`
    const markup = renderFormula(formula.trim(), display)
    formulas.push(display ? `<div class="math-block">${markup}</div>` : `<span class="math-inline">${markup}</span>`)
    return token
  }

  const protectedSource = source
    .replace(/```[\s\S]*?```/g, (block) => protectBlock(block))
    .replace(/`[^`\n]+`/g, (block) => protectBlock(block, true))

  const withBracketBlocks = protectedSource.replace(/\\{1,2}\[([\s\S]+?)\\{1,2}\]/g, (_, formula: string) => {
    return `\n\n${stashFormula(formula, true)}\n\n`
  })

  const withDollarBlocks = withBracketBlocks.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula: string) => {
    return `\n\n${stashFormula(formula, true)}\n\n`
  })

  const withSingleDollarBlocks = withDollarBlocks.replace(
    /(^|\n)\s*\$\s*\n([\s\S]+?)\n\s*\$\s*(?=\n|$)/g,
    (_full: string, prefix: string, formula: string) => {
      return `${prefix}\n\n${stashFormula(formula, true)}\n\n`
    },
  )

  const withParenInline = withSingleDollarBlocks.replace(/\\{1,2}\(([\s\S]+?)\\{1,2}\)/g, (_, formula: string) => {
    return stashFormula(formula, false)
  })

  const withAllPlaceholders = withParenInline.replace(
    /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
    (_, formula: string) => {
      return stashFormula(formula, false)
    },
  )

  let html = sanitizeHtml(markdown.render(withAllPlaceholders), markdownSanitizeOptions)
  formulas.forEach((formulaMarkup, index) => {
    html = html.replaceAll(`<p>@@FORMULA_${index}@@</p>`, () => formulaMarkup)
    html = html.replaceAll(`@@FORMULA_${index}@@`, () => formulaMarkup)
  })
  protectedBlocks.forEach((block, index) => {
    html = html.replaceAll(`<p>@@PROTECTED_BLOCK_${index}@@</p>`, () => block)
    html = html.replaceAll(`@@PROTECTED_BLOCK_${index}@@`, () => block)
  })

  return html
}
