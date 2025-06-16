// js/quiz.js
export class Quiz {
  constructor({ containerId, resultId, nextButtonId, questions, courseKey }) {
    this.container = document.getElementById(containerId);
    this.resultBox = document.getElementById(resultId);
    this.nextButton = document.getElementById(nextButtonId);
    this.questions = questions;
    this.courseKey = courseKey;
    this.username = localStorage.getItem("username") || "Guest";

    this.current = 0;
    this.score = 0;
    this.incorrect = 0;
    this.startTime = Date.now();
    this.firstAttemptScore = null;
    this.answered = false;

    this.nextButton.addEventListener("click", () => this.nextQuestion());
    this.showQuestion();
  }

  showQuestion() {
    const q = this.questions[this.current];
    this.answered = false;

    this.container.innerHTML = `
      <div class="question">
        <strong>Q${this.current + 1}: ${q.question}</strong><br>
        ${q.options.map((opt, i) =>
          `<button data-index="${i}" class="option-button">${opt}</button>`
        ).join("")}
      </div>
    `;

    this.resultBox.textContent = "";
    this.nextButton.style.display = "none";

    document.querySelectorAll(".option-button").forEach(button => {
      button.addEventListener("click", () => {
        const selectedIndex = parseInt(button.dataset.index);
        this.checkAnswer(selectedIndex);
      });
    });
  }

  checkAnswer(selected) {
    if (this.answered) return;
    this.answered = true;

    const correct = this.questions[this.current].answer;
    if (selected === correct) {
      this.score++;
      this.resultBox.textContent = "✅ Correct!";
    } else {
      this.incorrect++;
      this.resultBox.textContent = "❌ Incorrect.";
    }

    document.querySelectorAll(".option-button").forEach(btn => btn.disabled = true);
    this.nextButton.style.display = "inline-block";
  }

  nextQuestion() {
    this.current++;
    if (this.current < this.questions.length) {
      this.showQuestion();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    const endTime = Date.now();
    const elapsedSec = Math.floor((endTime - this.startTime) / 1000);
    const initialScorePercent = Math.round((this.score / this.questions.length) * 100);

    if (this.score === this.questions.length) {
      this.container.innerHTML = `<h2>🎉 Perfect! Quiz complete!</h2>`;
      this.resultBox.textContent = `Score: ${initialScorePercent}%, Time: ${elapsedSec} sec`;

      // 保存
      localStorage.setItem(`${this.username}_${this.courseKey}_score`, initialScorePercent);
      localStorage.setItem(`${this.username}_${this.courseKey}_time`, elapsedSec);

      // ランキング追加
      let ranking = JSON.parse(localStorage.getItem(`${this.courseKey}_ranking`) || "[]");
      ranking.push({ name: this.username, score: initialScorePercent, time: elapsedSec });
      localStorage.setItem(`${this.courseKey}_ranking`, JSON.stringify(ranking));

      // ✅ 2秒後に l3.html に自動遷移
      setTimeout(() => {
        window.location.href = "l3.html";
      }, 2000);
    } else {
      alert("You must answer all questions correctly. Try again!");

      if (this.firstAttemptScore === null) {
        this.firstAttemptScore = initialScorePercent;
        localStorage.setItem(`${this.username}_${this.courseKey}_score`, initialScorePercent);
      }

      this.current = 0;
      this.score = 0;
      this.incorrect = 0;
      this.startTime = Date.now();
      this.showQuestion();
    }
  }
}
