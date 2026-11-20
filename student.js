const channel = new BroadcastChannel('quiz_channel');
let myName = "";
let currentCorrectIndex = -1;

document.getElementById('btn-join').addEventListener('click', () => {
  const pin = document.getElementById('join-pin').value;
  myName = document.getElementById('join-name').value;
  
  if (pin && myName) {
    channel.postMessage({ type: 'STUDENT_JOINED', pin: pin, name: myName });
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('waiting-screen').classList.remove('hidden');
  } else {
    alert("Введите ПИН-код и имя!");
  }
});

channel.onmessage = (event) => {
  const data = event.data;
  
  if (data.type === 'NEW_QUESTION') {
    document.getElementById('waiting-screen').classList.add('hidden');
    document.getElementById('question-screen').classList.remove('hidden');
    
    document.getElementById('student-q-text').textContent = data.questionData.question;
    currentCorrectIndex = data.questionData.correctIndex;
    document.getElementById('feedback-msg').textContent = "";
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = "";
    
    data.questionData.options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.onclick = () => submitAnswer(index, btn);
      optionsContainer.appendChild(btn);
    });
  }
  
  if (data.type === 'GAME_OVER') {
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
  }
};

function submitAnswer(selectedIndex, btnElement) {
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => b.disabled = true);
  
  const isCorrect = selectedIndex === currentCorrectIndex;
  btnElement.style.background = isCorrect ? "#4CAF50" : "#F44336";
  btnElement.style.color = "white";
  
  document.getElementById('feedback-msg').textContent = isCorrect ? "Правильно! 🎉" : "Неправильно 😔";
  
  channel.postMessage({ type: 'STUDENT_ANSWERED', name: myName, correct: isCorrect });
}