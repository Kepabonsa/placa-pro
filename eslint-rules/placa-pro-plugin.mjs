// Local ESLint plugin that enforces the PlacaPro file conventions
// described in docs/rules/code-rules.md.

const AUTHOR_LINE = '// Author: Kevin Pabón'
const AUTHOR_PREFIX_PATTERN = /^\/\/ Author: /gm
const BLOCK_COMMENTS = {
  external: 'external imports',
  internal: 'internal imports',
}

/**
 * Tells whether an import source points to project code.
 * @param {string} source
 * @returns {boolean}
 */
function isInternalSource(source) {
  return source.startsWith('@/') || source.startsWith('.')
}

/**
 * Returns the imported name used to sort a declaration (first specifier).
 * @param {import('estree').ImportDeclaration} declaration
 * @returns {string | null}
 */
function getDeclarationSortKey(declaration) {
  const firstSpecifier = declaration.specifiers[0]
  if (!firstSpecifier) {
    return null
  }
  return getSpecifierName(firstSpecifier)
}

/**
 * Returns the imported name of a specifier (local name for default/namespace).
 * @param {import('estree').ImportDeclaration['specifiers'][number]} specifier
 * @returns {string}
 */
function getSpecifierName(specifier) {
  if (specifier.type === 'ImportSpecifier') {
    return specifier.imported.type === 'Identifier'
      ? specifier.imported.name
      : String(specifier.imported.value)
  }
  return specifier.local.name
}

/**
 * Case-insensitive comparison used for both declarations and specifiers.
 * @param {string} left
 * @param {string} right
 * @returns {boolean}
 */
function isOutOfOrder(left, right) {
  return left.toLowerCase() > right.toLowerCase()
}

/** @type {import('eslint').Rule.RuleModule} */
const authorHeaderRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Requires the author line as the first line of the file.' },
    schema: [],
  },
  create(context) {
    return {
      Program(program) {
        const text = context.sourceCode.getText()
        const firstLine = text.split(/\r?\n/, 1)[0]
        if (firstLine !== AUTHOR_LINE) {
          context.report({
            node: program,
            loc: { line: 1, column: 0 },
            message: `La primera línea debe ser exactamente "${AUTHOR_LINE}".`,
          })
        }
        const occurrences = text.match(AUTHOR_PREFIX_PATTERN) ?? []
        if (occurrences.length > 1) {
          context.report({
            node: program,
            loc: { line: 1, column: 0 },
            message: 'Solo se permite una línea de autor por archivo.',
          })
        }
      },
    }
  },
}

/** @type {import('eslint').Rule.RuleModule} */
const importBlocksRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Enforces external/internal import blocks sorted by imported name.' },
    schema: [],
  },
  create(context) {
    return {
      Program(program) {
        const declarations = program.body.filter(
          (statement) => statement.type === 'ImportDeclaration',
        )
        if (declarations.length === 0) {
          return
        }

        const blocks = { external: [], internal: [] }
        let hasSeenInternal = false
        for (const declaration of declarations) {
          const kind = isInternalSource(String(declaration.source.value)) ? 'internal' : 'external'
          blocks[kind].push(declaration)
          if (kind === 'internal') {
            hasSeenInternal = true
          } else if (hasSeenInternal) {
            context.report({
              node: declaration,
              message:
                'Las importaciones externas deben ir antes del bloque "// internal imports".',
            })
          }
        }

        for (const kind of /** @type {const} */ (['external', 'internal'])) {
          const block = blocks[kind]
          const firstDeclaration = block[0]
          if (!firstDeclaration) {
            continue
          }

          const leadingComments = context.sourceCode.getCommentsBefore(firstDeclaration)
          const closestComment = leadingComments.at(-1)
          if (
            !closestComment ||
            closestComment.type !== 'Line' ||
            closestComment.value.trim() !== BLOCK_COMMENTS[kind]
          ) {
            context.report({
              node: firstDeclaration,
              message: `Falta el comentario "// ${BLOCK_COMMENTS[kind]}" justo antes del bloque.`,
            })
          }

          const sortableDeclarations = block.filter(
            (declaration) => getDeclarationSortKey(declaration) !== null,
          )
          for (let position = 1; position < sortableDeclarations.length; position += 1) {
            const previousKey = getDeclarationSortKey(sortableDeclarations[position - 1])
            const currentKey = getDeclarationSortKey(sortableDeclarations[position])
            if (previousKey && currentKey && isOutOfOrder(previousKey, currentKey)) {
              context.report({
                node: sortableDeclarations[position],
                message: `Importación desordenada: "${currentKey}" debe ir antes de "${previousKey}" (orden alfabético sin distinguir mayúsculas).`,
              })
            }
          }
        }

        for (const declaration of declarations) {
          const namedSpecifiers = declaration.specifiers.filter(
            (specifier) => specifier.type === 'ImportSpecifier',
          )
          for (let position = 1; position < namedSpecifiers.length; position += 1) {
            const previousName = getSpecifierName(namedSpecifiers[position - 1])
            const currentName = getSpecifierName(namedSpecifiers[position])
            if (isOutOfOrder(previousName, currentName)) {
              context.report({
                node: namedSpecifiers[position],
                message: `Nombres desordenados dentro de { }: "${currentName}" debe ir antes de "${previousName}".`,
              })
            }
          }
        }
      },
    }
  },
}

export const placaProPlugin = {
  meta: { name: 'placa-pro' },
  rules: {
    'author-header': authorHeaderRule,
    'import-blocks': importBlocksRule,
  },
}
