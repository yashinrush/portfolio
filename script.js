// --- Data and State ---
const terminal = document.getElementById('terminal');
const input = document.getElementById('input');
const promptSpan = document.getElementById('prompt');
const terminalTitle = document.getElementById('terminal-title');
const beep = document.getElementById('beep');
let promptText = 'C:\\Users\\Yash>';
let theme = 'dark';
let history = [];
let historyIndex = -1;
let lastCommand = '';
// Aliases
const aliasMap = {
  p: 'projects',
  s: 'skills',
  e: 'education',
  x: 'experience',
  soc: 'socials',
  r: 'resume',
  f: 'fun',
  c: 'contact',
  h: 'help',
  t: 'theme',
};
const allCommands = [
  'about', 'projects', 'skills', 'education', 'experience', 'socials', 'resume', 'fun', 'contact', 'clear', 'help', 'theme', 'ascii'
];
const commands = {
  help: `Available commands:\nabout\nprojects\nskills\neducation\nexperience\nsocials\nresume\nfun\ncontact\nclear\nhelp\ntheme`,
  
  about: `Hi, I'm Yash Sonawane!\nI'm a Computer Engineering student passionate about building impactful software, exploring AI, and creating gamified learning tools.\nI’ve worked on AI voice assistants, gamified web platforms, and data science projects.\nI thrive in development, competitive coding, and tech innovation.`,

  projects: `1. Learnify Web App – Learniverse (React.js, Firebase, Tailwind CSS, TypeScript)\n2. AI Voice Desktop Assistant (Python, Hugging Face API, SQLite, Web Interface)\n3. Movie Recommendation System (Python, Scikit-learn, Pandas, Matplotlib)`,

  skills: `Languages: Python, Java, C, HTML/CSS, JavaScript, SQL\nFrameworks/Technologies: React, Node.js, Firebase, Tailwind CSS, Linux, WordPress\nDeveloper Tools: VS Code, Eclipse, GitHub, Android Studio, Google Cloud Platform`,

  education: `Bachelor of Engineering in Computer Engineering – Dr. D.Y. Patil Institute (2024–Present)\nDiploma in Computer Technology – K.B.H. Polytechnic, Malegaon (87.60%)`,

  experience: `Internship – Sumago Infotech (Jan 2024 – Feb 2024)\n- Built responsive front-end & worked on live deployment.\nInternship – Acmegrade (Mar 2024 – May 2024)\n- Built ML models, handled data cleaning, analysis, evaluation.\nVirtual Internship – Deloitte (June 2025)\n- Worked on data analysis using Tableau, Excel & forensic tools.`,

  socials: `GitHub: https://github.com/yashinrush\nLinkedIn: https://linkedin.com/in/yash-sonawane-077a69297\nInstagram: https://www.instagram.com/theynahlike.yash/\nYouTube: https://www.youtube.com/@YashSoNew`,

  resume: `Download my resume: https://drive.google.com/file/d/1Zf0zosK3f7j-Zk7909bexq8XHYF1IVH2/view?usp=sharing`,

  fun: `🎮 I love playing games, making content, and producing music!\nFun fact: I built a voice assistant with NLP and a gamified learning platform before age 21.`,

  contact: `📧 Email: ysonawane014@gmail.com\n💼 LinkedIn: https://linkedin.com/in/yash-sonawane-077a69297\n📁 GitHub: https://github.com/yashinrush`,

  clear: '',
  theme: `Theme toggled!`,
  ascii: `
   [ coding ]
      .--.      .--.
     |  |      |  |
     |  |.-"""-.|  |
     |  /  0  0  \ |
     |  \   --   / |
     |  |\     /|  |
     |  | '---' |  |
     |  |       |  |
     '=='       '=='
   <Code is Art>
  `,
};


// --- Utility Functions ---
function playBeep() {
  beep.currentTime = 0;
  beep.play();
}
function scrollToBottom() {
  terminal.scrollTop = terminal.scrollHeight;
}
function linkify(text) {
  // URLs
  text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1<\/a>');
  // Email
  text = text.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1<\/a>');
  return text;
}
function printOutput(text, isHtml = false, speed = 12) {
  if (text) {
    const output = document.createElement('div');
    output.className = 'output';
    terminal.insertBefore(output, terminal.lastElementChild);
    let i = 0;
    function typeChar() {
      if (i <= text.length) {
        if (isHtml) {
          output.innerHTML = linkify(text.slice(0, i));
        } else {
          output.textContent = text.slice(0, i);
        }
        i++;
        setTimeout(typeChar, speed);
      }
    }
    typeChar();
    scrollToBottom();
  }
}
function printMenu() {
  const menu = document.createElement('div');
  menu.className = 'output menu-fade';
  // Add label at the top
  const label = document.createElement('div');
  label.className = 'menu-label';
  label.textContent = 'Type or click a command below:';
  menu.appendChild(label);
  const commandsList = [
    'about', 'projects', 'skills', 'education', 'experience',
    'socials', 'resume', 'fun', 'contact', 'clear',
    'help', 'theme', 'ascii'
  ];
  const rowLength = 5;
  for (let i = 0; i < commandsList.length; i += rowLength) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '0.5em';
    row.style.marginBottom = '0.5em';
    for (let j = i; j < i + rowLength && j < commandsList.length; j++) {
      const btn = document.createElement('button');
      btn.className = 'menu-command';
      btn.textContent = commandsList[j];
      btn.onclick = () => {
        const lastInput = terminal.querySelector('.line:last-child input');
        if (lastInput) {
          lastInput.value = commandsList[j];
          const event = new KeyboardEvent('keydown', { key: 'Enter' });
          lastInput.dispatchEvent(event);
        }
      };
      row.appendChild(btn);
    }
    menu.appendChild(row);
  }
  terminal.insertBefore(menu, terminal.lastElementChild);
  scrollToBottom();
}
function showSuggestions(value, inputField) {
  removeSuggestions();
  if (!value) return;
  const matches = allCommands.filter(cmd => cmd.startsWith(value.toLowerCase()) && cmd !== value.toLowerCase());
  if (matches.length === 0) return;
  const suggestions = document.createElement('div');
  suggestions.className = 'suggestions';
  matches.forEach((cmd, idx) => {
    const sug = document.createElement('span');
    sug.className = 'suggestion';
    sug.textContent = cmd;
    sug.tabIndex = 0;
    sug.addEventListener('mousedown', e => {
      e.preventDefault();
      inputField.value = cmd;
      removeSuggestions();
      inputField.focus();
    });
    suggestions.appendChild(sug);
  });
  inputField.parentNode.appendChild(suggestions);
}
function removeSuggestions() {
  document.querySelectorAll('.suggestions').forEach(el => el.remove());
}
function newPrompt() {
  const line = document.createElement('div');
  line.className = 'line prompt-fade';
  const prompt = document.createElement('span');
  prompt.className = 'prompt';
  prompt.textContent = promptText;
  const inputField = document.createElement('input');
  inputField.className = 'input';
  inputField.autofocus = true;
  inputField.autocomplete = 'off';
  inputField.setAttribute('aria-label', 'Type a command');
  line.appendChild(prompt);
  line.appendChild(inputField);
  terminal.appendChild(line);
  setTimeout(() => {
    line.classList.remove('prompt-fade');
  }, 800);
  inputField.focus();
  inputField.addEventListener('keydown', handleInput);
  inputField.addEventListener('input', e => {
    showSuggestions(e.target.value, inputField);
  });
  inputField.addEventListener('blur', removeSuggestions);
  scrollToBottom();
}
function didYouMean(cmd) {
  let minDist = 99, best = '';
  for (const c of allCommands) {
    let d = levenshtein(cmd, c);
    if (d < minDist) {
      minDist = d;
      best = c;
    }
  }
  return minDist <= 2 ? best : '';
}
// Levenshtein distance for typo suggestions
function levenshtein(a, b) {
  const dp = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
// --- Input Handler ---
function handleInput(e) {
  const inputField = e.target;
  if (e.key === 'Enter') {
    playBeep();
    removeSuggestions();
    const value = inputField.value.trim();
    if (value) history.push(value);
    historyIndex = history.length;
    const parent = inputField.parentNode;
    // Replace input with static text
    const staticInput = document.createElement('span');
    staticInput.textContent = value;
    staticInput.style.color = '#fff';
    parent.replaceChild(staticInput, inputField);
    // Aliases
    let cmd = value.split(' ')[0].toLowerCase();
    let args = value.split(' ').slice(1);
    if (aliasMap[cmd]) cmd = aliasMap[cmd];
    // Handle command
    if (cmd === 'clear') {
      // Clear all terminal content
      terminal.innerHTML = '';

      // Create and add the welcome text as the very first element
      const welcomeDiv = document.createElement('div');
      welcomeDiv.className = 'output';
      terminal.appendChild(welcomeDiv);
      const message = "Welcome to Yash Sonawane's Portfolio!";
      let i = 0;
      // Animate the welcome text typing effect
      function typeLoop() {
        if (i <= message.length) {
          welcomeDiv.textContent = message.slice(0, i);
          i++;
          setTimeout(typeLoop, 32);
        }
      }
      typeLoop();

      // Create and add the menu as the second element
      const menu = document.createElement('div');
      menu.className = 'output menu-fade';
      // Add a label to guide the user
      const label = document.createElement('div');
      label.className = 'menu-label';
      label.textContent = 'Type or click a command below:';
      menu.appendChild(label);
      // List of available commands
      const commandsList = [
        'about', 'projects', 'skills', 'education', 'experience',
        'socials', 'resume', 'fun', 'contact', 'clear',
        'help', 'theme', 'ascii'
      ];
      const rowLength = 5;
      // Create menu buttons in rows
      for (let i = 0; i < commandsList.length; i += rowLength) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '0.5em';
        row.style.marginBottom = '0.5em';
        for (let j = i; j < i + rowLength && j < commandsList.length; j++) {
          const btn = document.createElement('button');
          btn.className = 'menu-command';
          btn.textContent = commandsList[j];
          // When a menu button is clicked, fill the input and trigger the command
          btn.onclick = () => {
            const lastInput = terminal.querySelector('.line:last-child input');
            if (lastInput) {
              lastInput.value = commandsList[j];
              const event = new KeyboardEvent('keydown', { key: 'Enter' });
              lastInput.dispatchEvent(event);
            }
          };
          row.appendChild(btn);
        }
        menu.appendChild(row);
      }
      // Add the menu to the terminal (as the second element)
      terminal.appendChild(menu);

      // Add a new prompt for the next command
      newPrompt();
      return;
    }
    if (cmd === 'theme') {
      theme = theme === 'dark' ? 'light' : 'dark';
      document.body.classList.toggle('light-theme');
      printOutput(commands.theme);
    } else if (cmd === 'resume') {
      printOutput(commands.resume, true);
      setTimeout(() => {
        window.open('https://drive.google.com/file/d/1Zf0zosK3f7j-Zk7909bexq8XHYF1IVH2/view?usp=sharing', '_blank');
      }, 800);
    } else if (cmd === 'ascii') {
      printOutput(commands.ascii, true);
    } else if (commands[cmd]) {
      printOutput(commands[cmd], true);
    } else if (cmd) {
      const suggestion = didYouMean(cmd);
      if (suggestion) {
        printOutput(`'${cmd}' is not recognized. Did you mean '${suggestion}'?`, false);
      } else {
        printOutput(`'${cmd}' is not recognized as an internal or external command.`, false);
      }
    }
    newPrompt();
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const value = inputField.value.trim();
    const matches = allCommands.filter(cmd => cmd.startsWith(value.toLowerCase()));
    if (matches.length === 1) {
      inputField.value = matches[0];
      removeSuggestions();
    }
  } else if (e.key === 'ArrowUp') {
    if (history.length === 0) return;
    if (historyIndex > 0) historyIndex--;
    inputField.value = history[historyIndex] || '';
    setTimeout(() => inputField.setSelectionRange(inputField.value.length, inputField.value.length), 0);
    showSuggestions(inputField.value, inputField);
  } else if (e.key === 'ArrowDown') {
    if (history.length === 0) return;
    if (historyIndex < history.length - 1) historyIndex++;
    else historyIndex = history.length;
    inputField.value = history[historyIndex] || '';
    setTimeout(() => inputField.setSelectionRange(inputField.value.length, inputField.value.length), 0);
    showSuggestions(inputField.value, inputField);
  }
}
// One-time animated welcome intro
function welcomeAnimationOnce() {
  const message = "Welcome to Yash Sonawane's Portfolio!";
  let output = document.createElement('div');
  output.className = 'output';
  terminal.insertBefore(output, terminal.firstChild);
  let i = 0;
  function typeLoop() {
    if (i <= message.length) {
      output.textContent = message.slice(0, i);
      i++;
      setTimeout(typeLoop, 32);
    }
  }
  typeLoop();
}
// --- Initial Load ---
input.addEventListener('keydown', handleInput);
input.addEventListener('input', e => {
  showSuggestions(e.target.value, input);
});
input.addEventListener('blur', removeSuggestions);
input.focus();
scrollToBottom();
// Show one-time animated welcome intro and then the menu on first load
welcomeAnimationOnce();
printMenu();

// --- Terminal Window Controls ---
window.addEventListener('DOMContentLoaded', () => {
  const terminalWindow = document.querySelector('.terminal-window');
  const redDot = document.querySelector('.dot-red');
  const yellowDot = document.querySelector('.dot-yellow');
  const greenDot = document.querySelector('.dot-green');
  const terminalToggleBtn = document.getElementById('terminal-toggle-btn');

  // Fullscreen toggle
  greenDot.addEventListener('click', () => {
    if (terminalWindow.classList.contains('fullscreen')) {
      terminalWindow.classList.remove('fullscreen');
    } else {
      terminalWindow.classList.add('fullscreen');
      terminalWindow.classList.remove('minimized');
    }
  });

  // Minimize toggle
  yellowDot.addEventListener('click', () => {
    if (terminalWindow.classList.contains('minimized')) {
      terminalWindow.classList.remove('minimized');
    } else {
      terminalWindow.classList.add('minimized');
      terminalWindow.classList.remove('fullscreen');
    }
  });

  // Red dot: hide terminal, show logo button
  redDot.addEventListener('click', () => {
    terminalWindow.style.display = 'none';
    terminalToggleBtn.style.display = 'block';
  });

  // Logo button: show terminal, hide logo button
  terminalToggleBtn.addEventListener('click', () => {
    terminalWindow.style.display = '';
    terminalToggleBtn.style.display = 'none';
  });
});
