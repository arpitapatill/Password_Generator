// selectors
const passwordEl = document.getElementById('password');
const toggleVisBtn = document.getElementById('toggleVis');
const copyBtn = document.getElementById('copyBtn');
const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const uppercase = document.getElementById('uppercase');
const lowercase = document.getElementById('lowercase');
const numbers = document.getElementById('numbers');
const symbols = document.getElementById('symbols');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const checkStrengthBtn = document.getElementById('checkStrengthBtn');
const manualInput = document.getElementById('manualInput');
const meter = document.getElementById('meter').querySelector(".inner");
const historyList = document.getElementById('historyList');
const copyAllBtn = document.getElementById('copyAllBtn');
const themeToggle = document.getElementById('themeToggle');

let history = JSON.parse(localStorage.getItem("passwordHistory")) || [];

/* ✅ APPLY SAVED THEME */
(function loadTheme(){
  const saved = localStorage.getItem("theme");
  if(saved === "light"){
    document.documentElement.classList.add("light");
    themeToggle.textContent = "☀️";
  } else {
    document.documentElement.classList.remove("light");
    themeToggle.textContent = "🌙";
  }
})();

/* ✅ TOGGLE THEME */
themeToggle.onclick = () => {
  document.documentElement.classList.toggle("light");
  const light = document.documentElement.classList.contains("light");

  themeToggle.textContent = light ? "☀️" : "🌙";
  localStorage.setItem("theme", light ? "light" : "dark");
};

/* slider display */
lengthValue.textContent = lengthRange.value;
lengthRange.oninput = () => lengthValue.textContent = lengthRange.value;

/* password generator */
function generatePassword(){
  const sets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    nums: "0123456789",
    syms: "!@#$%^&*()_+-=[]{}|;:.<>/?"
  };

  let allowed = "";
  if(uppercase.checked) allowed += sets.upper;
  if(lowercase.checked) allowed += sets.lower;
  if(numbers.checked) allowed += sets.nums;
  if(symbols.checked) allowed += sets.syms;

  if(!allowed){
    alert("Select at least one option!");
    return "";
  }

  let pwd = "";
  for(let i=0; i<+lengthRange.value; i++){
    pwd += allowed[Math.floor(Math.random()*allowed.length)];
  }

  updateStrength(pwd);
  return pwd;
}

/* strength meter */
function updateStrength(pwd){
  let score = 0;
  if(pwd.length>=8) score++;
  if(pwd.length>=12) score++;
  if(/[A-Z]/.test(pwd)) score++;
  if(/[a-z]/.test(pwd)) score++;
  if(/[0-9]/.test(pwd)) score++;
  if(/[^A-Za-z0-9]/.test(pwd)) score++;

  let pct = Math.floor(score / 6 * 100);
  meter.style.width = pct + "%";

  if(pct < 40) meter.style.background = "#ff4d4d";
  else if(pct < 70) meter.style.background = "#ff9f00";
  else meter.style.background = "linear-gradient(90deg,var(--accent),var(--accent2))";
}

/* generate click */
generateBtn.onclick = () => {
  const pwd = generatePassword();
  if(pwd) passwordEl.value = pwd;
};

/* toggle visibility */
toggleVisBtn.onclick = () => {
  passwordEl.type = passwordEl.type === "password" ? "text" : "password";
  toggleVisBtn.textContent = passwordEl.type === "password" ? "👁️" : "🙈";
};

/* copy */
copyBtn.onclick = async () => {
  if(!passwordEl.value) return;
  await navigator.clipboard.writeText(passwordEl.value);
  copyBtn.textContent = "✅";
  setTimeout(()=>copyBtn.textContent="📋",1000);
};

/* manual check */
checkStrengthBtn.onclick = () => {
  const v = manualInput.value.trim();
  if(!v) return alert("Type password");
  passwordEl.value = v;
  updateStrength(v);
};

/* save */
saveBtn.onclick = () => {
  if(!passwordEl.value) return alert("Generate a password first");
  history.push(passwordEl.value);
  localStorage.setItem("passwordHistory", JSON.stringify(history));
  renderHistory();
};

/* mask */
function mask(p){
  if(p.length <= 6) return "••••••";
  return p.slice(0,3)+"•••"+p.slice(-3);
}

/* render history */
function renderHistory(){
  historyList.innerHTML = "";
  if(history.length === 0){
    historyList.innerHTML = `<div style="color:var(--muted)">No saved passwords yet</div>`;
    return;
  }

  history.slice().reverse().forEach((pwd, index) => {
    const realIndex = history.length - 1 - index;

    const row = document.createElement("div");
    row.className = "history-item";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = mask(pwd);

    const controls = document.createElement("div");
    controls.className = "controls";

    const reveal = document.createElement("button");
    reveal.className = "small-btn";
    reveal.textContent = "Reveal";
    reveal.onclick = () => {
      if(label.textContent.includes("•••")){
        label.textContent = pwd;
        reveal.textContent = "Hide";
      } else {
        label.textContent = mask(pwd);
        reveal.textContent = "Reveal";
      }
    };

    const copyOne = document.createElement("button");
    copyOne.className = "small-btn";
    copyOne.textContent = "Copy";
    copyOne.onclick = async () => {
      await navigator.clipboard.writeText(pwd);
      copyOne.textContent = "✅";
      setTimeout(()=>copyOne.textContent="Copy",1000);
    };

    const del = document.createElement("button");
    del.className = "small-btn";
    del.textContent = "❌";
    del.onclick = () => {
      history.splice(realIndex, 1);
      localStorage.setItem("passwordHistory", JSON.stringify(history));
      renderHistory();
    };

    controls.appendChild(reveal);
    controls.appendChild(copyOne);
    controls.appendChild(del);
    row.appendChild(label);
    row.appendChild(controls);

    historyList.appendChild(row);
  });
}
renderHistory();

/* copy all */
copyAllBtn.onclick = async () => {
  if(history.length === 0) return alert("No saved passwords");
  await navigator.clipboard.writeText(history.join("\n"));
  copyAllBtn.textContent = "✅";
  setTimeout(()=>copyAllBtn.textContent="Copy All",1000);
};
