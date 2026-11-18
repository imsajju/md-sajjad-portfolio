import './style.css'

const year = document.getElementById('year')
if (year) year.textContent = String(new Date().getFullYear())

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

/* ——— Boot splash: full-screen fintech.spec.ts ——— */
const FINTECH_TESTS = [
  'KYC onboarding — PAN + Aadhaar verify',
  'EFT credit — amount + beneficiary match',
  'portfolio NAV refresh under load',
  'order place — equity buy path',
  'order reject — insufficient margin',
  'mutual fund SIP create + mandate',
  'API auth — JWT expiry + refresh',
  'wallet ledger — debit/credit integrity',
  'AI agent — KYC intent multi-turn',
  'AI agent — no hallucinated balances',
  'SAST gate — Semgrep critical = 0',
  'DAST — OWASP ZAP high = 0',
  'secrets scan — GitLeaks clean',
  'release verdict — staging clear',
]

const PASS_GLYPH: Record<string, string[]> = {
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
}

type DotCell = { x: number; y: number; on: boolean; t: number }

function finishBoot(boot: HTMLElement) {
  try {
    sessionStorage.setItem('booted', '1')
  } catch {
    /* ignore */
  }
  boot.classList.add('is-leaving')
  window.setTimeout(() => {
    document.documentElement.classList.remove('booting')
    boot.setAttribute('aria-hidden', 'true')
    boot.style.display = 'none'
  }, 450)
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function runBootSequence() {
  const boot = document.getElementById('boot')
  if (!boot) return

  const shouldAnimate = document.documentElement.classList.contains('booting')
  if (!shouldAnimate) {
    boot.style.display = 'none'
    return
  }

  boot.setAttribute('aria-hidden', 'false')

  const rowsHost = document.getElementById('boot-rows')
  const cnt = document.getElementById('boot-cnt')
  const verdict = document.getElementById('boot-verdict')
  const progress = document.getElementById('boot-progress')
  const goBtn = document.getElementById('boot-go') as HTMLButtonElement | null
  const canvas = document.getElementById('boot-dots') as HTMLCanvasElement | null
  const ctx = canvas?.getContext('2d')
  const total = FINTECH_TESTS.length
  const started = performance.now()

  if (!rowsHost || !cnt || !verdict || !progress || !goBtn || !canvas || !ctx) {
    finishBoot(boot)
    return
  }

  rowsHost.innerHTML = ''
  FINTECH_TESTS.forEach((test) => {
    const row = document.createElement('div')
    row.className = 'boot-card__row'
    row.innerHTML = `<span class="n"><span class="c">✓</span>${test}</span><span class="s">OK</span>`
    rowsHost.appendChild(row)
  })

  const cells: DotCell[] = []
  'PASS'.split('').forEach((ch, i) => {
    const glyph = PASS_GLYPH[ch]
    if (!glyph) return
    glyph.forEach((r, y) => {
      ;[...r].forEach((b, x) => {
        cells.push({ x: i * 6 + x, y, on: b === '1', t: Math.random() })
      })
    })
  })

  const draw = (prog: number) => {
    ctx.clearRect(0, 0, 400, 140)
    const s = 16
    cells.forEach((c) => {
      const lit = c.on && c.t <= prog
      ctx.beginPath()
      ctx.arc(8 + c.x * s + 4, 8 + c.y * s + 4, lit ? 5.5 : 3.2, 0, Math.PI * 2)
      ctx.fillStyle = lit ? cssVar('--boot-amber') || '#f5c518' : cssVar('--boot-dot') || '#24231d'
      ctx.fill()
    })
  }

  draw(0)

  const unlockGo = () => {
    const elapsed = ((performance.now() - started) / 1000).toFixed(1)
    verdict.innerHTML = `<span style="color:var(--boot-ok)">✓ Release verdict — staging clear</span> (${elapsed}s)`
    goBtn.classList.add('on')
    goBtn.disabled = false
  }

  goBtn.addEventListener('click', () => {
    verdict.textContent = 'Launching…'
    finishBoot(boot)
  })

  if (reduceMotion) {
    Array.from(rowsHost.children).forEach((row) => row.classList.add('on'))
    cnt.textContent = String(total)
    progress.style.width = '100%'
    draw(1)
    unlockGo()
    return
  }

  let n = 0
  const timer = window.setInterval(() => {
    if (n < total) {
      rowsHost.children[n]?.classList.add('on')
    }
    n += 1
    const done = Math.min(n, total)
    cnt.textContent = String(done)
    progress.style.width = `${(done / total) * 100}%`
    draw(done / total)

    if (n >= total) {
      window.clearInterval(timer)
      unlockGo()
      // Auto-enter after a short beat if user doesn't click
      window.setTimeout(() => {
        if (document.documentElement.classList.contains('booting')) finishBoot(boot)
      }, 550)
    }
  }, 42)
}

void runBootSequence()

/* Mobile drawer */
const menuBtn = document.querySelector<HTMLButtonElement>('.menu-btn')
const drawer = document.getElementById('drawer')

function setMenu(open: boolean) {
  if (!menuBtn || !drawer) return
  menuBtn.setAttribute('aria-expanded', String(open))
  drawer.hidden = !open
  document.body.classList.toggle('menu-open', open)
}

menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true'
  setMenu(open)
})

drawer?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false))
})

/* Scroll progress + solid topbar after hero */
const progressBar = document.querySelector<HTMLElement>('.scroll-progress span')
const topbar = document.querySelector<HTMLElement>('.topbar')
const hero = document.getElementById('top')

function updateProgress() {
  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const value = max > 0 ? (window.scrollY / max) * 100 : 0
    progressBar.style.width = `${value}%`
  }

  if (topbar && hero) {
    const pastHero = window.scrollY > hero.offsetHeight - 64
    topbar.classList.toggle('is-solid', pastHero)
  }
}

window.addEventListener('scroll', updateProgress, { passive: true })
updateProgress()

/* Reveal on scroll */
const revealTargets = document.querySelectorAll<HTMLElement>(
  '.story__body p, .role, .method__grid article, .build-note, .signals__item, .connect__panel > *, .toolbox__intro, .toolbox__creds > div',
)

revealTargets.forEach((el) => el.classList.add('reveal'))

if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )
  revealTargets.forEach((el) => io.observe(el))
} else {
  revealTargets.forEach((el) => el.classList.add('is-in'))
}

/* ——— Live visit → automation script ——— */
type Fmt = 'playwright' | 'postman' | 'pytest'
type Step =
  | { kind: 'goto' }
  | { kind: 'click'; label: string }
  | { kind: 'hover'; label: string }
  | { kind: 'scroll'; section: string }

const MAX_STEPS = 7
const steps: Step[] = [{ kind: 'goto' }]
let fmt: Fmt = 'playwright'
let lastScrollAt = 0
let lastHoverKey = ''

const codeHost = document.querySelector<HTMLElement>('#recorder-code code')
const tabButtons = document.querySelectorAll<HTMLButtonElement>('.recorder__tabs button')
const fullTestBtn = document.getElementById('full-test-btn')

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function labelFor(el: Element | null): string {
  if (!el || !(el instanceof HTMLElement)) return 'page'
  const named =
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    (el instanceof HTMLAnchorElement || el instanceof HTMLButtonElement
      ? el.textContent?.trim()
      : '') ||
    el.id
  if (named && named.length < 42) return named.replace(/\s+/g, ' ')
  const tag = el.tagName.toLowerCase()
  const cls = typeof el.className === 'string' ? el.className.split(/\s+/).find(Boolean) : ''
  return cls ? `${tag}.${cls}` : tag
}

function sectionForScroll(): string {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id], aside.verdict-band, .signals'))
  const y = window.scrollY + window.innerHeight * 0.35
  for (const section of sections) {
    const top = section.offsetTop
    const bottom = top + section.offsetHeight
    if (y >= top && y < bottom) {
      return section.id || section.className.split(/\s+/)[0] || 'content'
    }
  }
  return 'page'
}

function lineFor(step: Step, format: Fmt): string {
  if (format === 'playwright') {
    if (step.kind === 'goto') return `await page.goto('/');`
    if (step.kind === 'click') return `await page.getByRole('link', { name: '${step.label}' }).click();`
    if (step.kind === 'hover') return `await page.getByText('${step.label}').hover();`
    return `await page.locator('#${step.section}').scrollIntoViewIfNeeded();`
  }

  if (format === 'postman') {
    if (step.kind === 'goto') return `pm.sendRequest('https://mdsajjad.dev/');`
    if (step.kind === 'click') return `pm.test('clicked ${step.label}', () => pm.expect(true).to.be.true);`
    if (step.kind === 'hover') return `pm.test('hovered ${step.label}', () => pm.response.to.have.status(200));`
    return `pm.test('scrolled to ${step.section}', () => pm.expect('${step.section}').to.be.ok);`
  }

  // pytest
  if (step.kind === 'goto') return `page.goto("/")`
  if (step.kind === 'click') return `page.get_by_text("${step.label}").click()`
  if (step.kind === 'hover') return `page.get_by_text("${step.label}").hover()`
  return `page.locator("#${step.section}").scroll_into_view_if_needed()`
}

function decorate(raw: string): string {
  // Highlight on plain text first, then escape — never run quote matchers on HTML attributes.
  const withMarks = raw
    .replace(/('[^']*'|"[^"]*")/g, '§S§$1§E§')
    .replace(/\b(await|from|import|def|true|false)\b/g, '§K§$1§E§')
    .replace(/\b(page|pm)\b/g, '§F§$1§E§')

  return escapeHtml(withMarks)
    .replaceAll('§S§', '<span class="str">')
    .replaceAll('§K§', '<span class="kw">')
    .replaceAll('§F§', '<span class="fn">')
    .replaceAll('§E§', '</span>')
}

function renderCode() {
  if (!codeHost) return
  const visible = steps.slice(-MAX_STEPS)
  codeHost.innerHTML = visible
    .map((step, index) => {
      const n = steps.length - visible.length + index + 1
      return `<div class="recorder__line"><span>${n}</span><span>${decorate(lineFor(step, fmt))}</span></div>`
    })
    .join('')
}

function pushStep(step: Step) {
  const last = steps[steps.length - 1]
  if (last && JSON.stringify(last) === JSON.stringify(step)) return
  steps.push(step)
  if (steps.length > 40) steps.splice(1, steps.length - 40)
  renderCode()
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    fmt = (btn.dataset.fmt as Fmt) || 'playwright'
    tabButtons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)))
    renderCode()
  })
})

fullTestBtn?.addEventListener('click', () => {
  const blob = [
    fmt === 'playwright'
      ? `import { test, expect } from '@playwright/test';\n\ntest('visit sajjad portfolio', async ({ page }) => {`
      : fmt === 'postman'
        ? `// Postman collection script — visit flow`
        : `def test_visit_portfolio(page):`,
    ...steps.map((step) => `  ${lineFor(step, fmt)}`),
    fmt === 'playwright' ? `  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();\n});` : '',
  ]
    .filter(Boolean)
    .join('\n')

  void navigator.clipboard?.writeText(blob)
  const label = fullTestBtn.querySelector('.full-test-label')
  if (label) {
    label.textContent = 'Copied'
    window.setTimeout(() => {
      label.textContent = 'Full test'
    }, 1400)
  }
})

document.addEventListener(
  'click',
  (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('.recorder') || target.closest('.menu-btn') || target.closest('.drawer')) return
    const actionable = target.closest('a, button, .core-stack li, .signals__item, .role, .method__grid article')
    pushStep({ kind: 'click', label: labelFor(actionable ?? target) })
  },
  true,
)

document.addEventListener(
  'pointerover',
  (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('.recorder')) return
    const actionable = target.closest('a, button, h1, h2, h3, .badge, .core-stack li')
    if (!actionable) return
    const key = labelFor(actionable)
    if (key === lastHoverKey) return
    lastHoverKey = key
    pushStep({ kind: 'hover', label: key })
  },
  true,
)

window.addEventListener(
  'scroll',
  () => {
    const now = Date.now()
    if (now - lastScrollAt < 700) return
    lastScrollAt = now
    pushStep({ kind: 'scroll', section: sectionForScroll() })
  },
  { passive: true },
)

renderCode()

/* Verdict board */
type CheckState = 'queued' | 'running' | 'pass'

const checks: { key: string; passLabel: string; delay: number }[] = [
  { key: 'functional', passLabel: 'PASS', delay: 400 },
  { key: 'api', passLabel: 'PASS', delay: 750 },
  { key: 'sast', passLabel: 'PASS', delay: 1100 },
  { key: 'dast', passLabel: 'PASS', delay: 1450 },
  { key: 'sca', passLabel: 'PASS', delay: 1800 },
  { key: 'agent', passLabel: 'PASS', delay: 2150 },
  { key: 'iso', passLabel: 'READY', delay: 2500 },
]

const list = document.getElementById('verdict-list')
const result = document.getElementById('verdict-result')
const buildEl = document.getElementById('verdict-build')

function setRow(key: string, state: CheckState, label: string) {
  const row = list?.querySelector<HTMLElement>(`li[data-k="${key}"]`)
  if (!row) return
  const status = row.querySelector('span')
  row.classList.remove('is-run', 'is-pass')
  if (state === 'running') row.classList.add('is-run')
  if (state === 'pass') row.classList.add('is-pass')
  if (status) status.textContent = label
}

function runVerdict() {
  if (!list || !result) return

  checks.forEach(({ key }) => setRow(key, 'queued', 'queued'))
  result.classList.remove('is-clear')
  const stamp = result.querySelector('.verdict__stamp')
  const copy = result.querySelector('p')
  if (stamp) stamp.textContent = 'PENDING'
  if (copy) copy.textContent = 'Checks in flight…'

  if (buildEl) {
    const patch = Math.floor(Math.random() * 8) + 1
    buildEl.textContent = `build 2.4.${patch}`
  }

  if (reduceMotion) {
    checks.forEach(({ key, passLabel }) => setRow(key, 'pass', passLabel))
    result.classList.add('is-clear')
    if (stamp) stamp.textContent = 'CLEAR'
    if (copy) copy.textContent = 'All gates green · release approved'
    return
  }

  checks.forEach(({ key, passLabel, delay }) => {
    window.setTimeout(() => setRow(key, 'running', 'running'), delay - 280)
    window.setTimeout(() => setRow(key, 'pass', passLabel), delay)
  })

  window.setTimeout(() => {
    result.classList.add('is-clear')
    if (stamp) stamp.textContent = 'CLEAR'
    if (copy) copy.textContent = 'All gates green · release approved'
  }, 2900)
}

runVerdict()
window.setInterval(runVerdict, 9000)

/* ——— Toolbox ring (full section) ——— */
type Tool = { name: string; group: string; filter: string; logo?: string; mark?: string; core?: boolean }

const TOOLS: Tool[] = [
  { name: 'Playwright', group: 'Web UI', filter: 'Web UI', logo: '/logos/playwright.svg', core: true },
  { name: 'Selenium WebDriver', group: 'Web UI', filter: 'Web UI', logo: '/logos/selenium.svg' },
  { name: 'Selenium Grid', group: 'Web UI', filter: 'Web UI', logo: '/logos/selenium.svg' },
  { name: 'Selenoid', group: 'Web UI', filter: 'Web UI', logo: '/logos/selenoid.svg' },
  { name: 'Cypress', group: 'Web UI', filter: 'Web UI', logo: '/logos/cypress.svg' },
  { name: 'WebdriverIO', group: 'Web UI', filter: 'Web UI', logo: '/logos/webdriverio.svg' },
  { name: 'Puppeteer', group: 'Web UI', filter: 'Web UI', logo: '/logos/puppeteer.svg' },
  { name: 'Robot Framework', group: 'Web UI', filter: 'Test frameworks', logo: '/logos/robot-framework.svg' },
  { name: 'Tricentis Tosca', group: 'Web UI', filter: 'Test frameworks', logo: '/logos/tricentis-tosca.svg' },
  { name: 'Katalon', group: 'Web UI', filter: 'Test frameworks', logo: '/logos/katalon.svg' },
  { name: 'TestCafe', group: 'Web UI', filter: 'Web UI', logo: '/logos/testcafe.svg' },
  { name: 'Protractor', group: 'Web UI', filter: 'Web UI', logo: '/logos/protractor.svg' },
  { name: 'RestAssured', group: 'API', filter: 'API and services', logo: '/logos/rest-assured.png' },
  { name: 'Karate DSL', group: 'API', filter: 'API and services', logo: '/logos/karate-dsl.svg' },
  { name: 'SuperTest', group: 'API', filter: 'API and services', logo: '/logos/supertest.svg' },
  { name: 'Postman', group: 'API', filter: 'API and services', logo: '/logos/postman.svg', core: true },
  { name: 'Bruno', group: 'API', filter: 'API and services', logo: '/logos/bruno.png' },
  { name: 'Appium', group: 'Mobile', filter: 'Mobile', logo: '/logos/appium.svg' },
  { name: 'XCUITest', group: 'Mobile', filter: 'Mobile', logo: '/logos/xcode-xcuitest.svg' },
  { name: 'Espresso', group: 'Mobile', filter: 'Mobile', logo: '/logos/android-espresso.svg' },
  { name: 'Maestro', group: 'Mobile', filter: 'Mobile', logo: '/logos/maestro.svg', core: true },
  { name: 'Detox', group: 'Mobile', filter: 'Mobile', logo: '/logos/detox.png' },
  { name: 'K6', group: 'Performance', filter: 'Performance', logo: '/logos/k6.svg' },
  { name: 'JMeter', group: 'Performance', filter: 'Performance', logo: '/logos/apache-jmeter.svg' },
  { name: 'Gatling', group: 'Performance', filter: 'Performance', logo: '/logos/gatling.svg' },
  { name: 'BlazeMeter', group: 'Performance', filter: 'Performance', logo: '/logos/blazemeter.svg' },
  { name: 'Locust', group: 'Performance', filter: 'Performance', logo: '/logos/locust.svg' },
  { name: 'Claude Code', group: 'AI', filter: 'AI and agentic QA', logo: '/logos/claude-code.svg', core: true },
  { name: 'Cursor', group: 'AI', filter: 'AI and agentic QA', logo: '/logos/cursor.svg', core: true },
  { name: 'GitHub Copilot', group: 'AI', filter: 'AI and agentic QA', logo: '/logos/github-copilot.svg' },
  { name: 'Codex', group: 'AI', filter: 'AI and agentic QA', logo: '/logos/codex.svg' },
  { name: 'Gemini CLI', group: 'AI', filter: 'AI and agentic QA', logo: '/logos/gemini-cli.png' },
  { name: 'MCP', group: 'AI', filter: 'AI protocols', logo: '/logos/mcp.png', core: true },
  { name: 'LangChain', group: 'AI', filter: 'AI protocols', logo: '/logos/langchain.svg' },
  { name: 'LangGraph', group: 'AI', filter: 'AI protocols', logo: '/logos/langgraph.svg' },
  { name: 'LLM evaluation', group: 'AI', filter: 'AI testing', logo: '/logos/llm.svg' },
  { name: 'Agent behavior', group: 'AI', filter: 'AI testing', logo: '/logos/agent-behavior.svg' },
  { name: 'Java', group: 'Languages', filter: 'Languages', logo: '/logos/java.svg' },
  { name: 'JavaScript', group: 'Languages', filter: 'Languages', logo: '/logos/javascript.svg', core: true },
  { name: 'TypeScript', group: 'Languages', filter: 'Languages', logo: '/logos/typescript.svg', core: true },
  { name: 'Python', group: 'Languages', filter: 'Languages', logo: '/logos/python.svg', core: true },
  { name: 'Kotlin', group: 'Languages', filter: 'Languages', logo: '/logos/kotlin.svg' },
  { name: 'Scala', group: 'Languages', filter: 'Languages', logo: '/logos/scala.svg' },
  { name: 'SQL', group: 'Languages', filter: 'Languages', logo: '/logos/sql.svg' },
  { name: 'PyTest', group: 'Test frameworks', filter: 'Test frameworks', logo: '/logos/pytest.svg' },
  { name: 'Jest', group: 'Test frameworks', filter: 'Test frameworks', logo: '/logos/jest.svg' },
  { name: 'AWS', group: 'Cloud', filter: 'Cloud', logo: '/logos/aws.svg' },
  { name: 'Azure', group: 'Cloud', filter: 'Cloud', logo: '/logos/microsoft-azure.svg' },
  { name: 'GCP', group: 'Cloud', filter: 'Cloud', logo: '/logos/google-cloud-gcp.svg' },
  { name: 'Jenkins', group: 'CI/CD', filter: 'CI/CD', logo: '/logos/jenkins.svg' },
  { name: 'GitHub', group: 'CI/CD', filter: 'CI/CD', logo: '/logos/github-actions.svg', core: true },
  { name: 'GitLab CI/CD', group: 'CI/CD', filter: 'CI/CD', logo: '/logos/gitlab.svg' },
  { name: 'Git', group: 'CI/CD', filter: 'CI/CD', logo: '/logos/git.svg', core: true },
  { name: 'Docker', group: 'Containers', filter: 'Containers and IaC', logo: '/logos/docker.svg' },
  { name: 'Kubernetes', group: 'Containers', filter: 'Containers and IaC', logo: '/logos/kubernetes.svg' },
  { name: 'MySQL', group: 'Databases', filter: 'Databases', logo: '/logos/mysql.svg' },
  { name: 'PostgreSQL', group: 'Databases', filter: 'Databases', logo: '/logos/postgresql.svg' },
  { name: 'MongoDB', group: 'Databases', filter: 'Databases', logo: '/logos/mongodb.svg' },
  { name: 'Semgrep', group: 'Security', filter: 'Security', logo: '/logos/semgrep.svg', core: true },
  { name: 'SonarQube', group: 'Security', filter: 'Security', logo: '/logos/sonarqube.svg' },
  { name: 'OWASP ZAP', group: 'Security', filter: 'Security', logo: '/logos/zap.svg' },
  { name: 'Trivy', group: 'Security', filter: 'Security', logo: '/logos/trivy.svg' },
  { name: 'GitLeaks', group: 'Security', filter: 'Security', logo: '/logos/gitleaks.svg' },
  { name: 'Dependency-Check', group: 'Security', filter: 'Security', logo: '/logos/owasp-dependency-check.svg' },
  { name: 'ISO 27001', group: 'Compliance', filter: 'Security', logo: '/logos/iso-27001.svg', core: true },
  { name: 'Grafana', group: 'Observability', filter: 'Observability', logo: '/logos/grafana.svg' },
  { name: 'InfluxDB', group: 'Observability', filter: 'Observability', logo: '/logos/influxdb.svg' },
  { name: 'Kafka', group: 'Messaging', filter: 'Messaging and events', logo: '/logos/apache-kafka.svg' },
  { name: 'Pact', group: 'Contract', filter: 'Contract testing', logo: '/logos/pact.svg' },
  { name: 'WireMock', group: 'Virtualization', filter: 'Service virtualization', logo: '/logos/wiremock.svg' },
  { name: 'Jira', group: 'Test management', filter: 'Test management', logo: '/logos/jira.svg', core: true },
  { name: 'Huly', group: 'Test management', filter: 'Test management', logo: '/logos/huly.png' },
]

const FILTERS = [
  'Core skills',
  'Web UI',
  'API and services',
  'Mobile',
  'Performance',
  'AI and agentic QA',
  'AI protocols',
  'AI testing',
  'Languages',
  'Test frameworks',
  'Cloud',
  'CI/CD',
  'Containers and IaC',
  'Databases',
  'Security',
  'Observability',
  'Messaging and events',
  'Contract testing',
  'Service virtualization',
  'Test management',
]

function initToolbox() {
  const ring = document.getElementById('tool-ring')
  const filtersHost = document.getElementById('tool-filters')
  const pauseBtn = document.getElementById('tool-pause')
  if (!ring || !filtersHost || !pauseBtn) return

  const track = document.createElement('div')
  track.className = 'tool-ring__track'
  ring.appendChild(track)

  let activeFilter = FILTERS[0]
  let visibleTools: Tool[] = []
  let angleOffset = 0
  let paused = false
  let last = performance.now()

  function makeCard(tool: Tool) {
    const card = document.createElement('div')
    card.className = 'tool-ring__card' + (tool.core ? ' is-core' : '')

    const group = document.createElement('span')
    group.className = 'tool-ring__group'
    group.textContent = tool.core ? 'Core' : tool.group

    const logoWrap = document.createElement('span')
    logoWrap.className = 'tool-ring__logo'

    const mark = document.createElement('span')
    mark.className = 'tool-ring__mark'
    mark.textContent = tool.mark || tool.name.slice(0, 2).toUpperCase()

    if (tool.logo) {
      const img = document.createElement('img')
      img.src = tool.logo
      img.alt = ''
      img.width = 40
      img.height = 40
      img.loading = 'lazy'
      img.addEventListener('error', () => img.replaceWith(mark.cloneNode(true)))
      logoWrap.appendChild(img)
    } else {
      logoWrap.appendChild(mark)
    }

    const name = document.createElement('span')
    name.className = 'tool-ring__name'
    name.textContent = tool.name

    card.append(group, logoWrap, name)
    return card
  }

  function radiusFor(count: number) {
    const mobile = window.innerWidth < 720
    const cardSpan = mobile ? 150 : 210
    const needed = (count * cardSpan) / (2 * Math.PI)
    const maxR = Math.min(640, window.innerWidth * (mobile ? 0.4 : 0.48))
    const minR = mobile ? 130 : 280
    return Math.min(maxR, Math.max(minR, needed))
  }

  function rebuild(filter: string) {
    activeFilter = filter
    let list =
      filter === 'Core skills' ? TOOLS.filter((t) => t.core) : TOOLS.filter((t) => t.filter === filter)
    if (list.length === 0) list = TOOLS.filter((t) => t.core)

    // Duplicate small categories so the ring still feels full and readable
    while (list.length > 0 && list.length < 7) {
      list = list.concat(list)
    }
    const mobile = window.innerWidth < 720
    const maxCards = filter === 'Core skills' ? (mobile ? 10 : 16) : mobile ? 8 : 10
    if (list.length > maxCards) list = list.slice(0, maxCards)

    visibleTools = list
    track.innerHTML = ''
    visibleTools.forEach((tool) => track.appendChild(makeCard(tool)))
    angleOffset = 0
    layout(angleOffset)
  }

  function layout(rot: number) {
    const cards = track.querySelectorAll<HTMLElement>('.tool-ring__card')
    const count = cards.length || 1
    const radius = radiusFor(count)

    cards.forEach((card, i) => {
      const step = 360 / count
      const a = rot + i * step
      const rad = (a * Math.PI) / 180
      const x = Math.sin(rad) * radius
      const z = Math.cos(rad) * radius
      // Mild coverflow tilt — keeps logos/names readable
      const tilt = Math.max(-52, Math.min(52, -a * 0.5))
      card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${tilt}deg)`

      // Front hemisphere more opaque; hide deep back cards
      const norm = ((a % 360) + 360) % 360
      const frontness = Math.cos(rad) // 1 front, -1 back
      const visible = frontness > 0.05
      card.style.opacity = visible ? String(0.45 + Math.max(0, frontness) * 0.55) : '0'
      card.style.pointerEvents = visible ? 'auto' : 'none'
      card.style.zIndex = String(Math.round(500 + z))
      card.style.visibility = norm > 105 && norm < 255 ? 'hidden' : 'visible'
    })
  }

  FILTERS.forEach((label, i) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.setAttribute('role', 'tab')
    btn.textContent = label
    btn.setAttribute('aria-selected', String(i === 0))
    btn.addEventListener('click', () => {
      filtersHost.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', 'false'))
      btn.setAttribute('aria-selected', 'true')
      rebuild(label)
    })
    filtersHost.appendChild(btn)
  })

  function tick(now: number) {
    const dt = Math.min(32, now - last)
    last = now
    if (!paused && !reduceMotion) angleOffset -= dt * 0.007
    layout(angleOffset)
    requestAnimationFrame(tick)
  }

  pauseBtn.addEventListener('click', () => {
    paused = !paused
    pauseBtn.classList.toggle('is-paused', paused)
    pauseBtn.textContent = paused ? 'Resume the ring' : 'Pause the ring'
  })

  rebuild(activeFilter)
  requestAnimationFrame(tick)

  window.addEventListener(
    'resize',
    () => {
      layout(angleOffset)
    },
    { passive: true },
  )
}

initToolbox()

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle')
  if (!btn) return

  const apply = (theme: 'light' | 'dark') => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* ignore */
    }
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')
  }

  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  apply(current)

  btn.addEventListener('click', () => {
    apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
  })
}

initThemeToggle()
