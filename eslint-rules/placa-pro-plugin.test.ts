// Author: Kevin Pabón
// external imports
import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'

// internal imports
import { placaProPlugin } from './placa-pro-plugin.mjs'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
})

const AUTHOR = '// Author: Kevin Pabón'

ruleTester.run('author-header', placaProPlugin.rules['author-header'], {
  valid: [{ code: `${AUTHOR}\nexport const value = 1\n` }],
  invalid: [
    {
      code: 'export const value = 1\n',
      errors: [{ message: `La primera línea debe ser exactamente "${AUTHOR}".` }],
    },
    {
      code: `${AUTHOR}\n// Author: Otra Persona\nexport const value = 1\n`,
      errors: [{ message: 'Solo se permite una línea de autor por archivo.' }],
    },
  ],
})

ruleTester.run('import-blocks', placaProPlugin.rules['import-blocks'], {
  valid: [
    {
      code: [
        AUTHOR,
        '// external imports',
        "import { NextResponse } from 'next/server'",
        "import { z } from 'zod'",
        '',
        '// internal imports',
        "import { CurrencyUtil } from '@/utils/CurrencyUtil'",
        "import { DEAL_TAGS, QUERY_MODES } from '@/constants/domain'",
        "import './globals.css'",
      ].join('\n'),
    },
    { code: `${AUTHOR}\nexport const value = 1\n` },
  ],
  invalid: [
    {
      code: [AUTHOR, "import { z } from 'zod'"].join('\n'),
      errors: [{ message: 'Falta el comentario "// external imports" justo antes del bloque.' }],
    },
    {
      code: [
        AUTHOR,
        '// external imports',
        "import { z } from 'zod'",
        "import { NextResponse } from 'next/server'",
      ].join('\n'),
      errors: [
        {
          message:
            'Importación desordenada: "NextResponse" debe ir antes de "z" (orden alfabético sin distinguir mayúsculas).',
        },
      ],
    },
    {
      code: [AUTHOR, '// external imports', "import { useState, useEffect } from 'react'"].join(
        '\n',
      ),
      errors: [
        { message: 'Nombres desordenados dentro de { }: "useEffect" debe ir antes de "useState".' },
      ],
    },
    {
      code: [
        AUTHOR,
        '// internal imports',
        "import { CurrencyUtil } from '@/utils/CurrencyUtil'",
        '// external imports',
        "import { z } from 'zod'",
      ].join('\n'),
      errors: [
        { message: 'Las importaciones externas deben ir antes del bloque "// internal imports".' },
      ],
    },
  ],
})
