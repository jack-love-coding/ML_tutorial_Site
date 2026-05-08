import MarkdownIt from 'markdown-it'
import katex from 'katex'

const markdown = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: true,
  breaks: true,
})

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

  const withParenInline = withDollarBlocks.replace(/\\{1,2}\(([\s\S]+?)\\{1,2}\)/g, (_, formula: string) => {
    return stashFormula(formula, false)
  })

  const withAllPlaceholders = withParenInline.replace(
    /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
    (_, formula: string) => {
      return stashFormula(formula, false)
    },
  )

  let html = markdown.render(withAllPlaceholders)
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
