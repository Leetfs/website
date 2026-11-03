import { execFileSync } from 'node:child_process'
import process from 'node:process'

// Treat the VitePress and Next.js locations as the same article. Moving the
// whole site twice should not reset a post's publication or modification date.
function documentPath(file) {
  if (file.startsWith('docs/')) file = file.slice('docs/'.length)
  else file = file.replace(/^content\/blog\/(?:zh\/)?/, '')
  return file.replace(/\/vp-fontSwitch\.md$/, '/vp-font-switch.md')
}

export function readHistory() {
  const dates = new Map()
  let output
  try {
    output = execFileSync('git', [
      '-c', 'core.quotepath=false', 'log', '--reverse', '--no-renames', '--diff-filter=AM',
      '--name-status', '--format=@%cI', '--', 'docs', 'content/blog',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 })
  } catch (error) {
    if (process.env.REQUIRE_GIT_DATES === '1') throw error
    return dates
  }
  let date
  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith('@')) {
      date = line.slice(1)
      continue
    }
    const [status, file] = line.split('\t')
    if (!file?.endsWith('.md')) continue
    const key = documentPath(file)
    const entry = dates.get(key)
    if (!entry) dates.set(key, { published: date, modified: date })
    else if (status === 'M') entry.modified = date
  }
  return dates
}
