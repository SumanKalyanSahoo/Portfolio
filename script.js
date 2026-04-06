// ── State ──
let currentSection = 'welcome';
let history = [];
let historyIdx = -1;
const SECTIONS = { welcome: 'welcome.sh', about: 'about.js', projects: 'projects.json', contact: 'contact.md' };

// ── Boot messages ──
const bootLines = [
    { cls: 'out-dim', text: 'Portfolio Terminal v2.4.1  (JetBrains Mono, dark)' },
    { cls: 'out-dim', text: 'Type <span class="out-info">help</span> to see available commands.' },
    { cls: 'out-success', text: '✓ Loaded: about.js, projects.json, contact.md' },
    { cls: 'out-dim', text: '─'.repeat(58) },
];

function init() {
    const out = document.getElementById('termOutput');
    bootLines.forEach(l => {
        const d = document.createElement('div');
        d.className = 'term-line ' + l.cls;
        d.innerHTML = l.text;
        out.appendChild(d);
    });
    updateLineNumbers();
}

// ── Commands ──
const COMMANDS = {
    help: () => [
        { cls: 'out-info', text: 'Available commands:' },
        { cls: 'out-dim', text: '  <span class="out-success">open</span> [about|projects|contact|welcome]  — open a file' },
        { cls: 'out-dim', text: '  <span class="out-success">ls</span>                                   — list files' },
        { cls: 'out-dim', text: '  <span class="out-success">whoami</span>                               — about the developer' },
        { cls: 'out-dim', text: '  <span class="out-success">skills</span>                               — list tech skills' },
        { cls: 'out-dim', text: '  <span class="out-success">cat</span> [filename]                       — read a file' },
        { cls: 'out-dim', text: '  <span class="out-success">clear</span>                                — clear terminal' },
        { cls: 'out-dim', text: '  <span class="out-success">pwd</span>                                  — print working dir' },
        { cls: 'out-dim', text: '  <span class="out-success">date</span>                                  — print current date' },
        { cls: 'out-dim', text: '  <span class="out-success">echo</span> [text]                          — print text' },
    ],
    ls: () => [
        { cls: 'out-dim', text: 'total 4 files' },
        { cls: 'out-info', text: '<span class="ft-ext-js">⬡</span>  about.js        <span class="out-dim">2.1 KB</span>' },
        { cls: 'out-info', text: '<span style="color:var(--orange)">{}</span>  projects.json   <span class="out-dim">3.8 KB</span>' },
        { cls: 'out-info', text: '<span style="color:var(--blue)">M</span>  contact.md      <span class="out-dim">0.9 KB</span>' },
        { cls: 'out-info', text: '<span style="color:var(--green)">$</span>  welcome.sh      <span class="out-dim">1.2 KB</span>' },
    ],
    whoami: () => [
        { cls: 'out-info', text: 'Suman Kalyan Sahoo — Full-Stack Developer' },
        { cls: 'out-dim', text: '  📍 Bhadrak, Odisha, INDIA' },
        { cls: 'out-dim', text: '  💼 Learning' },
        { cls: 'out-success', text: '  🟢 Available for opportunities' },
    ],
    skills: () => [
        { cls: 'out-info', text: 'Technical Skills:' },
        { cls: 'out-dim', text: '  Frontend  → HTML5, CSS3 , Bootstrap' },
        { cls: 'out-dim', text: '  Backend   → Node.js, Express.js, REST API, PostgreSQL' },
        // { cls: 'out-dim', text: '  DevOps    → Docker, AWS, CI/CD, Terraform' },
        { cls: 'out-dim', text: '  Tools     →  Git, Canvas , VS Code' },
    ],
    pwd: () => [{ cls: 'out-dim', text: '/home/suman/portfolio' }],
    date: () => [{ cls: 'out-dim', text: new Date().toString() }],
    clear: () => { clearTerminal(); return []; },
};

function runCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    // Add to history
    history.unshift(cmd);
    historyIdx = -1;

    printPrompt(cmd);

    const parts = cmd.split(/\s+/);
    const base = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    if (base === 'open' || base === 'cat') {
        handleOpen(arg || base, cmd);
    } else if (base === 'echo') {
        printLines([{ cls: 'out-dim', text: parts.slice(1).join(' ') }]);
    } else if (COMMANDS[base]) {
        const lines = COMMANDS[base]();
        printLines(lines);
    } else {
        printLines([{ cls: 'out-err', text: `command not found: ${base} — try 'help'` }]);
    }
    scrollTerm();
}

function handleOpen(arg, raw) {
    const map = {
        about: 'about', 'about.js': 'about',
        projects: 'projects', 'projects.json': 'projects',
        contact: 'contact', 'contact.md': 'contact',
        welcome: 'welcome', 'welcome.sh': 'welcome',
    };
    const key = map[arg];
    if (key) {
        showSection(key);
        updateActiveTab(key);
        updateFileTree(key);
        printLines([{ cls: 'out-success', text: `✓ Opened ${SECTIONS[key]}` }]);
    } else {
        printLines([{ cls: 'out-err', text: `File not found: ${arg}` },
        { cls: 'out-dim', text: "Try: open about | open projects | open contact" }]);
    }
}

function printPrompt(cmd) {
    const out = document.getElementById('termOutput');
    const d = document.createElement('div');
    d.className = 'term-line';
    d.innerHTML = `<span class="prompt">suman</span><span class="prompt-sym">@</span><span class="prompt">devterm</span><span class="prompt-sym">:</span><span class="prompt-path">~/portfolio</span><span class="prompt-git"> (main)</span><span class="prompt-sym"> $ </span><span class="cmd-text">${escHtml(cmd)}</span>`;
    out.appendChild(d);
}

function printLines(lines) {
    const out = document.getElementById('termOutput');
    lines.forEach(l => {
        const d = document.createElement('div');
        d.className = 'term-line ' + (l.cls || '');
        d.innerHTML = l.text;
        out.appendChild(d);
    });
}

function clearTerminal() {
    document.getElementById('termOutput').innerHTML = '';
}

function scrollTerm() {
    const out = document.getElementById('termOutput');
    out.scrollTop = out.scrollHeight;
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Sections ──
function showSection(key) {
    document.querySelectorAll('.section-block').forEach(b => b.classList.remove('visible'));
    const block = document.getElementById('sec-' + key);
    if (block) block.classList.add('visible');
    currentSection = key;
    document.getElementById('sb-file').textContent = SECTIONS[key] || key;
    updateLineNumbers();
}

function updateActiveTab(key) {
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.section === key);
    });
}

function updateFileTree(key) {
    document.querySelectorAll('.ft-file').forEach(f => {
        f.classList.toggle('active', f.dataset.section === key);
    });
}

function switchTab(el, key) {
    showSection(key);
    updateActiveTab(key);
    updateFileTree(key);
}

function updateLineNumbers() {
    const n = 36;
    document.getElementById('lineNums').innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>');
}

// ── Input handler ──
    const input = document.getElementById('termInput');
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const v = input.value;
        input.value = '';
        runCommand(v);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx < history.length - 1) historyIdx++;
        input.value = history[historyIdx] || '';
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx > 0) historyIdx--;
        else { historyIdx = -1; input.value = ''; return; }
        input.value = history[historyIdx] || '';
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const v = input.value.toLowerCase();
        const cmds = ['open about', 'open projects', 'open contact', 'open welcome', 'help', 'ls', 'whoami', 'skills', 'clear', 'pwd', 'date', 'echo '];
        const match = cmds.find(c => c.startsWith(v));
        if (match) input.value = match;
    }
});

// Click anywhere to focus input
document.querySelector('.terminal-panel').addEventListener('click', () => input.focus());

// Contact handler
function handleContact(type) {
    const msgs = {
        email: 'Opening email client...',
        github: 'Opening GitHub profile...',
        twitter: 'Opening Twitter/X profile...',
        linkedin: 'Opening LinkedIn profile...',
    };
    runCommand(`echo ${msgs[type]}`);
    input.focus();
}

// ── Boot ──
init();
input.focus();