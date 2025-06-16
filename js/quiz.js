// quiz.js

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

    this.showQuestion();
  }

  showQuestion() {
    const q = this.questions[this.current];
    this.container.innerHTML = `
      <div class="question">
        <strong>Q${this.current + 1}: ${q.question}</strong><br>
        ${q.options.map((opt, i) =>
          `<button onclick="quiz.checkAnswer(${i})">${opt}</button>`).join("")}
      </div>
    `;
    this.nextButton.style.display = "none";
    this.resultBox.textContent = "";
  }

  checkAnswer(selected) {
    const correct = this.questions[this.current].answer;
    if (selected === correct) {
      this.score++;
      this.resultBox.textContent = "✅ Correct!";
    } else {
      this.incorrect++;
      this.resultBox.textContent = "❌ Incorrect.";
    }

    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
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

      // ランキング登録
      let ranking = JSON.parse(localStorage.getItem(`${this.courseKey}_ranking`) || "[]");
      ranking.push({ name: this.username, score: initialScorePercent, time: elapsedSec });
      localStorage.setItem(`${this.courseKey}_ranking`, JSON.stringify(ranking));
    } else {
      alert("You must answer all questions correctly. Try again!");
      if (this.firstAttemptScore === null) {
        this.firstAttemptScore = initialScorePercent;
        localStorage.setItem(`${this.username}_${this.courseKey}_score`, initialScorePercent);
      }
      // Reset
      this.current = 0;
      this.score = 0;
      this.incorrect = 0;
      this.startTime = Date.now();
      this.showQuestion();
    }
  }
}
