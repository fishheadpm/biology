let data = [];
let currentRound = null;
let queue = [];
let index = 0;
let history = {};

fetch('data.json?v=1')
  .then(res => res.json())
  .then(json => {
    data = json;
    init();
  })
  .catch(err => {
    alert('data.jsonの読み込みに失敗しました。JSONの形式を確認してください。');
    console.error(err);
  });

function init() {
  const area = document.getElementById('seriesButtons');
  area.innerHTML = '';

  data.forEach(round => {
    const btn = document.createElement('button');
    btn.textContent = round.name;
    btn.onclick = () => selectRound(round);
    area.appendChild(btn);
  });
}

function selectRound(round) {
  currentRound = round;
  document.getElementById('roundTitle').textContent = round.name;
  loadHistory();
  show('menuScreen');
}

function start() {
  queue = shuffle(currentRound.questions.map(q => q.id));
  index = 0;
  saveProgress();
  next();
}

function continueGame() {
  const saved = JSON.parse(localStorage.getItem(progressKey()));
  loadHistory();

  if (saved && Array.isArray(saved.queue)) {
    queue = saved.queue;
    index = saved.index || 0;
  } else {
    start();
    return;
  }

  next();
}

function next() {
  if (index >= queue.length) {
    localStorage.removeItem(progressKey());
    alert('終了です。全問正解しました。');
    backToMenu();
    return;
  }

  const q = getCurrentQuestion();
  if (!q) {
    alert('問題データが見つかりません。idの重複や削除を確認してください。');
    backToMenu();
    return;
  }

  document.getElementById('progress').textContent = `${index + 1} / ${queue.length}`;
  document.getElementById('question').textContent = q.question;
  document.getElementById('answer').textContent = '';
  document.getElementById('answerArea').classList.add('hidden');
  document.getElementById('showAnswerButton').classList.remove('hidden');

  show('quizScreen');
}

function showAnswer() {
  const q = getCurrentQuestion();
  document.getElementById('answer').textContent = q.answer;
  document.getElementById('answerArea').classList.remove('hidden');
  document.getElementById('showAnswerButton').classList.add('hidden');
}

function correct() {
  index++;
  saveProgress();
  next();
}

function wrong() {
  const q = getCurrentQuestion();
  history[q.id] = (history[q.id] || 0) + 1;
  queue.push(q.id);
  index++;
  saveHistory();
  saveProgress();
  next();
}

function getCurrentQuestion() {
  return currentRound.questions.find(q => q.id === queue[index]);
}

function showHistory() {
  loadHistory();
  const entries = Object.entries(history);

  if (entries.length === 0) {
    alert('履歴なし');
    return;
  }

  let text = '';
  entries.forEach(([id, count]) => {
    const q = currentRound.questions.find(item => item.id === id);
    if (q) {
      text += `${q.answer}：${count}回\n${q.question}\n\n`;
    }
  });

  alert(text || '履歴なし');
}

function resetHistory() {
  localStorage.removeItem(progressKey());
  localStorage.removeItem(historyKey());
  history = {};
  alert('履歴をリセットしました。');
}

function saveProgress() {
  localStorage.setItem(progressKey(), JSON.stringify({ queue, index }));
}

function loadHistory() {
  history = JSON.parse(localStorage.getItem(historyKey())) || {};
}

function saveHistory() {
  localStorage.setItem(historyKey(), JSON.stringify(history));
}

function progressKey() {
  return `biology_progress_${currentRound.id}_self`;
}

function historyKey() {
  return `biology_history_${currentRound.id}`;
}

function shuffle(arr) {
  const copied = [...arr];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function show(id) {
  ['seriesScreen', 'menuScreen', 'quizScreen'].forEach(screenId => {
    document.getElementById(screenId).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

function backToSeries() {
  show('seriesScreen');
}

function backToMenu() {
  show('menuScreen');
}
