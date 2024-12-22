class QuizApp {
    constructor() {
        // 預設題目（以防 Excel 載入失敗時使用）
        this.questions = [
            {
                question: "1 + 1 = ?",
                options: ["1", "2", "3", "4"],
                correct: 1
            },
            {
                question: "2 + 2 = ?",
                options: ["2", "3", "4", "5"],
                correct: 2
            }
        ];
        
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        
        // 取得 DOM 元素
        this.questionText = document.getElementById('questionText');
        this.optionsBox = document.getElementById('optionsBox');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.questionNumber = document.getElementById('questionNumber');
        this.resultBox = document.getElementById('resultBox');
        this.scoreNumber = document.getElementById('scoreNumber');
        this.feedback = document.getElementById('feedback');
        this.restartBtn = document.getElementById('restartBtn');

        // 綁定事件
        this.prevBtn.addEventListener('click', () => this.showPreviousQuestion());
        this.nextBtn.addEventListener('click', () => this.showNextQuestion());
        this.submitBtn.addEventListener('click', () => this.submitQuiz());
        this.restartBtn.addEventListener('click', () => location.reload());

        // 嘗試載入 Excel 題目
        this.loadQuestions();
        
        // 立即顯示第一題（不等待 Excel 載入）
        this.showQuestion();
    }

    async loadQuestions() {
        try {
            const response = await fetch('quiz.xlsx');
            const data = await response.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            if (jsonData && jsonData.length > 0) {
                this.questions = jsonData.map(row => ({
                    question: row.question,
                    options: [row.option1, row.option2, row.option3, row.option4],
                    correct: parseInt(row.correct) - 1
                }));
                this.userAnswers = new Array(this.questions.length).fill(null);
                this.showQuestion();
            }
        } catch (error) {
            console.error('Excel 載入失敗，使用預設題目:', error);
        }
    }

    showQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;

        // 顯示題目
        this.questionText.textContent = question.question;
        
        // 顯示選項
        this.optionsBox.innerHTML = question.options.map((option, index) => `
            <div class="option ${this.userAnswers[this.currentQuestionIndex] === index ? 'selected' : ''}"
                 onclick="quiz.selectOption(${index})">
                ${option}
            </div>
        `).join('');

        // 更新題號
        this.questionNumber.textContent = `${this.currentQuestionIndex + 1} / ${this.questions.length}`;
        
        // 更新按鈕狀態
        this.updateNavigationButtons();
    }

    selectOption(index) {
        this.userAnswers[this.currentQuestionIndex] = index;
        const options = this.optionsBox.querySelectorAll('.option');
        options.forEach((option, i) => {
            option.classList.toggle('selected', i === index);
        });
    }

    showPreviousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    showNextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        this.nextBtn.disabled = this.currentQuestionIndex === this.questions.length - 1;
        this.submitBtn.style.display = 
            this.currentQuestionIndex === this.questions.length - 1 ? 'block' : 'none';
    }

    submitQuiz() {
        if (this.userAnswers.includes(null)) {
            alert('請回答所有題目');
            return;
        }

        const score = this.calculateScore();
        this.showResult(score);
    }

    calculateScore() {
        return this.userAnswers.reduce((score, answer, index) => {
            return score + (answer === this.questions[index].correct ? 1 : 0);
        }, 0) / this.questions.length * 100;
    }

    showResult(score) {
        document.querySelector('main').style.display = 'none';
        this.resultBox.style.display = 'block';
        
        const finalScore = Math.round(score);
        this.scoreNumber.textContent = finalScore;

        if (finalScore === 100) {
            this.feedback.textContent = '太棒了！';
        } else if (finalScore >= 80) {
            this.feedback.textContent = '很好！';
        } else if (finalScore >= 60) {
            this.feedback.textContent = '不錯唷！';
        } else {
            this.feedback.textContent = '再加油！';
        }
    }
}

// 當頁面載入完成後初始化應用
document.addEventListener('DOMContentLoaded', () => {
    window.quiz = new QuizApp();
});