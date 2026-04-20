import MarkdownIt from 'markdown-it'
import katex from 'katex'

const markdown = new MarkdownIt({
  html: false,
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

  const withBlockPlaceholders = source.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula: string) => {
    const token = `@@FORMULA_${formulas.length}@@`
    formulas.push(`<div class="math-block">${renderFormula(formula.trim(), true)}</div>`)
    return `\n\n${token}\n\n`
  })

  const withAllPlaceholders = withBlockPlaceholders.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, formula: string) => {
    const token = `@@FORMULA_${formulas.length}@@`
    formulas.push(`<span class="math-inline">${renderFormula(formula.trim(), false)}</span>`)
    return token
  })

  let html = markdown.render(withAllPlaceholders)
  formulas.forEach((formulaMarkup, index) => {
    html = html.replaceAll(`<p>@@FORMULA_${index}@@</p>`, formulaMarkup)
    html = html.replaceAll(`@@FORMULA_${index}@@`, formulaMarkup)
  })

  return html
}
