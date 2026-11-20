const channel = new BroadcastChannel('quiz_channel');
let questions = [];
let currentQuestionIndex = 0;
let roomPin = Math.floor(1000 + Math.random() * 9000).toString();
let students = [];
let answersCount = 0;

// 1. Загрузка базовых вопросов по умолчанию
fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    updateQuestionsList();
  })
  .catch(err => console.error("Ошибка загрузки questions.json", err));

function updateQuestionsList() {
  const ul = document.getElementById('q-list');
  ul.innerHTML = '';
  questions.forEach((q, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${q.question} (${q.type})`;
    ul.appendChild(li);
  });
}

// 2. Обработка загрузки файла учителем
document.getElementById('file-upload').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const uploadedQuestions = JSON.parse(e.target.result);
      if (Array.isArray(uploadedQuestions)) {
        questions = questions.concat(uploadedQuestions);
        updateQuestionsList();
        alert('✅ Вопросы успешно добавлены!');
      } else {
        alert('❌ Ошибка: Файл должен содержать массив вопросов [ ... ].');
      }
    } catch (error) {
      alert('❌ Ошибка при чтении файла. Убедитесь, что это корректный JSON.');
    }
    event.target.value = ''; // Очищаем input
  };
  reader.readAsText(file);
});

// 3. Имитация AI генерации
document.getElementById('btn-generate-ai').addEventListener('click', () => {
  document.getElementById('ai-status').classList.remove('hidden');
  setTimeout(() => {
    questions.push({
      id: "ai_" + Date.now(),
      type: "multiple_choice",
      question: `Сгенерированный вопрос по теме: ${document.getElementById('ai-topic').value || 'Без темы'}`,
      options: ["Вариант А", "Вариант Б", "Вариант В"],
      correctIndex: 0
    });
    updateQuestionsList();
    document.getElementById('ai-status').classList.add('hidden');
  }, 1500);
});

// 4. Создание комнаты
document.getElementById('btn-create-room').addEventListener('click', () => {
  if(questions.length === 0) {
    alert("Добавьте хотя бы один вопрос!");
    return;
  }
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('game-lobby').classList.remove('hidden');
  document.getElementById('pin-display').textContent = roomPin;
  
  channel.postMessage({ type: 'ROOM_CREATED', pin: roomPin });
});

// 5. Слушаем подключения учеников
channel.onmessage = (event) => {
  const data = event.data;
  if (data.type === 'STUDENT_JOINED' && data.pin === roomPin) {
    students.push(data.name);
    const li = document.createElement('li');
    li.textContent = data.name;
    document.getElementById('students-list').appendChild(li);
    document.getElementById('total-students').textContent = students.length;
  }
  if (data.type === 'STUDENT_ANSWERED') {
    answersCount++;
    document.getElementById('answers-count').textContent = answersCount;
  }
};

// 6. Запуск игры и переключение вопросов
document.getElementById('btn-start-game').addEventListener('click', () => {
  document.getElementById('game-lobby').classList.add('hidden');
  document.getElementById('game-active').classList.remove('hidden');
  sendQuestion();
});

function sendQuestion() {
  answersCount = 0;
  document.getElementById('answers-count').textContent = '0';
  
  if (currentQuestionIndex < questions.length) {
    const q = questions[currentQuestionIndex];
    document.getElementById('active-question-text').textContent = q.question;
    channel.postMessage({ type: 'NEW_QUESTION', questionData: q });
  } else {
    document.getElementById('active-question-text').textContent = "Викторина завершена!";
    document.getElementById('btn-next-question').classList.add('hidden');
    channel.postMessage({ type: 'GAME_OVER' });
  }
}

document.getElementById('btn-next-question').addEventListener('click', () => {
  currentQuestionIndex++;
  sendQuestion();
});