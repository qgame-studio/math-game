class GameComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Define the game state
    this.score = 0;
    this.questionsAsked = 0;
    this.currentLevel = 1;
    this.timeLeft = 30;
    this.timer = null;
    this.num1 = 0;
    this.num2 = 0;
    this.operator = '';
    this.correctAnswer = 0;
    this.gameActive = false;

    // Render the component
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
        }
        h1 {
          margin-bottom: 10px;
          font-size: 28px;
          color: #2c3e50;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .stats-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          background-color: rgba(255, 255, 255, 0.7);
          padding: 10px;
          border-radius: 8px;
          font-weight: bold;
        }
        .equation {
          font-size: 32px;
          font-weight: bold;
          margin: 25px 0;
          padding: 20px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          color: #2c3e50;
          transition: all 0.3s ease;
        }
        .equation.correct {
          background-color: #d4edda;
          color: #155724;
        }
        .equation.incorrect {
          background-color: #f8d7da;
          color: #721c24;
        }
        input {
          padding: 12px;
          font-size: 18px;
          width: 80%;
          margin-bottom: 20px;
          border: 2px solid #ddd;
          border-radius: 8px;
          transition: border-color 0.3s;
          text-align: center;
        }
        input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
        }
        .button-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        button {
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background-color: #3498db;
          color: white;
          margin: 5px;
          transition: all 0.2s ease;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        button:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        #start-btn {
          background-color: #2ecc71;
        }
        #start-btn:hover {
          background-color: #27ae60;
        }
        #next-btn {
          background-color: #9b59b6;
        }
        #next-btn:hover {
          background-color: #8e44ad;
        }
        #result {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          min-height: 27px;
          color: #2c3e50;
        }
        .progress-container {
          width: 100%;
          background-color: #e0e0e0;
          border-radius: 5px;
          margin: 15px 0;
          overflow: hidden;
        }
        .progress-bar {
          height: 8px;
          background-color: #3498db;
          width: 0%;
          transition: width 1s linear;
        }
        .game-over {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .difficulty-selector {
          margin-bottom: 15px;
        }
        .difficulty-selector label {
          margin-right: 10px;
        }
        .level-badge {
          background-color: #f39c12;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 14px;
        }
        .operator-buttons {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
          gap: 10px;
        }
        .operator-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          background-color: #ecf0f1;
          border: 2px solid #bdc3c7;
          cursor: pointer;
          transition: all 0.2s;
        }
        .operator-button.active {
          background-color: #3498db;
          color: white;
          border-color: #2980b9;
          transform: scale(1.1);
        }
        .streak-container {
          margin-top: 10px;
          font-size: 14px;
          color: #7f8c8d;
        }
        .streak {
          color: #e74c3c;
          font-weight: bold;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .pulse {
          animation: pulse 0.5s;
        }
      </style>
      <div class="container">
        <h1>Math Challenge</h1>
        
        <div id="game-setup" style="display: block;">
          <div class="difficulty-selector">
            <p>Select difficulty:</p>
            <button id="easy-btn" class="active">Easy</button>
            <button id="medium-btn">Medium</button>
            <button id="hard-btn">Hard</button>
          </div>
          
          <div class="operator-buttons">
            <div class="operator-button active" data-op="+">+</div>
            <div class="operator-button active" data-op="-">-</div>
            <div class="operator-button active" data-op="*">×</div>
            <div class="operator-button" data-op="/">÷</div>
          </div>
          
          <button id="start-btn">Start Game</button>
        </div>
        
        <div id="game-area" style="display: none;">
          <div class="stats-bar">
            <div>Score: <span id="score">0</span></div>
            <div>Level: <span id="level" class="level-badge">1</span></div>
            <div>Time: <span id="timer">30</span>s</div>
          </div>
          
          <div class="progress-container">
            <div id="time-bar" class="progress-bar"></div>
          </div>
          
          <p>Solve the equation:</p>
          <div id="equation" class="equation"></div>
          <input type="number" id="user-input" placeholder="Your answer" step="any">
          <div class="button-container">
            <button id="submit-btn">Submit</button>
            <button id="next-btn" style="display: none;">Next Question</button>
          </div>
          <p id="result"></p>
          <div class="streak-container">
            Current streak: <span id="streak" class="streak">0</span>
          </div>
        </div>
        
        <div id="game-over" class="game-over" style="display: none;">
          <h2>Game Over!</h2>
          <p>Your final score: <span id="final-score">0</span></p>
          <p>Questions answered: <span id="questions-answered">0</span></p>
          <p>Accuracy: <span id="accuracy">0</span>%</p>
          <button id="play-again-btn">Play Again</button>
        </div>
      </div>
    `;

    // Bind methods to the component
    this.generateEquation = this.generateEquation.bind(this);
    this.displayEquation = this.displayEquation.bind(this);
    this.checkAnswer = this.checkAnswer.bind(this);
    this.startGame = this.startGame.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.endGame = this.endGame.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.setDifficulty = this.setDifficulty.bind(this);
    this.toggleOperator = this.toggleOperator.bind(this);

    // Set initial values
    this.difficultyLevel = 'easy';
    this.enabledOperators = ['+', '-', '*'];
    this.currentStreak = 0;
    this.bestStreak = 0;

    // Add event listeners
    this.shadowRoot.getElementById('start-btn').addEventListener('click', this.startGame);
    this.shadowRoot.getElementById('submit-btn').addEventListener('click', this.checkAnswer);
    this.shadowRoot.getElementById('next-btn').addEventListener('click', this.nextQuestion);
    this.shadowRoot.getElementById('play-again-btn').addEventListener('click', this.startGame);

    // Difficulty buttons
    this.shadowRoot.getElementById('easy-btn').addEventListener('click', () => this.setDifficulty('easy'));
    this.shadowRoot.getElementById('medium-btn').addEventListener('click', () => this.setDifficulty('medium'));
    this.shadowRoot.getElementById('hard-btn').addEventListener('click', () => this.setDifficulty('hard'));

    // Operator toggles
    const operatorButtons = this.shadowRoot.querySelectorAll('.operator-button');
    operatorButtons.forEach(button => {
      button.addEventListener('click', () => this.toggleOperator(button));
    });

    // Input enter key
    this.shadowRoot.getElementById('user-input').addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        this.checkAnswer();
      }
    });
  }

  setDifficulty(level) {
    // Reset active state for all buttons
    ['easy-btn', 'medium-btn', 'hard-btn'].forEach(id => {
      this.shadowRoot.getElementById(id).classList.remove('active');
    });

    // Set active state for selected button
    this.shadowRoot.getElementById(`${level}-btn`).classList.add('active');
    this.difficultyLevel = level;
  }

  toggleOperator(button) {
    const operator = button.getAttribute('data-op');

    // Toggle active state
    button.classList.toggle('active');

    // Update enabled operators
    if (button.classList.contains('active')) {
      if (!this.enabledOperators.includes(operator)) {
        this.enabledOperators.push(operator);
      }
    } else {
      this.enabledOperators = this.enabledOperators.filter(op => op !== operator);
    }

    // Ensure at least one operator is selected
    if (this.enabledOperators.length === 0) {
      button.classList.add('active');
      this.enabledOperators.push(operator);
    }
  }

  startGame() {
    // Reset game state
    this.score = 0;
    this.questionsAsked = 0;
    this.currentLevel = 1;
    this.timeLeft = 30;
    this.currentStreak = 0;
    this.gameActive = true;

    // Update UI
    this.shadowRoot.getElementById('score').textContent = this.score;
    this.shadowRoot.getElementById('level').textContent = this.currentLevel;
    this.shadowRoot.getElementById('timer').textContent = this.timeLeft;
    this.shadowRoot.getElementById('streak').textContent = this.currentStreak;

    // Show game area, hide setup and game over
    this.shadowRoot.getElementById('game-setup').style.display = 'none';
    this.shadowRoot.getElementById('game-area').style.display = 'block';
    this.shadowRoot.getElementById('game-over').style.display = 'none';

    // Start timer
    this.updateTimer();

    // Generate first equation
    this.generateEquation();
    this.displayEquation();

    // Focus input
    setTimeout(() => {
      this.shadowRoot.getElementById('user-input').focus();
    }, 100);
  }

  updateTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const timeBar = this.shadowRoot.getElementById('time-bar');
    timeBar.style.width = '100%';

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.shadowRoot.getElementById('timer').textContent = this.timeLeft;

      // Update progress bar
      const percentage = (this.timeLeft / 30) * 100;
      timeBar.style.width = `${percentage}%`;

      if (percentage < 30) {
        timeBar.style.backgroundColor = '#e74c3c';
      } else if (percentage < 60) {
        timeBar.style.backgroundColor = '#f39c12';
      } else {
        timeBar.style.backgroundColor = '#3498db';
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.endGame();
      }
    }, 1000);
  }

  // Helper function to generate a random equation based on difficulty
  generateEquation() {
    let maxNum, minNum;

    // Set number ranges based on difficulty
    switch (this.difficultyLevel) {
      case 'easy':
        minNum = 1;
        maxNum = 10;
        break;
      case 'medium':
        minNum = 5;
        maxNum = 20;
        break;
      case 'hard':
        minNum = 10;
        maxNum = 50;
        break;
    }

    // Generate random numbers based on the current level and difficulty
    this.num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    this.num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    // Ensure the second number is not zero for division
    if (this.enabledOperators.includes('/') && this.num2 === 0) {
      this.num2 = Math.floor(Math.random() * (maxNum - 1)) + 1;
    }

    // For subtraction at easy level, ensure result is positive
    if (this.difficultyLevel === 'easy' && this.enabledOperators.includes('-') && this.num2 > this.num1) {
      [this.num1, this.num2] = [this.num2, this.num1];
    }

    // Select a random operator from enabled ones
    this.operator = this.enabledOperators[Math.floor(Math.random() * this.enabledOperators.length)];

    // Special handling for division - ensure clean division for easier levels
    if (this.operator === '/' && (this.difficultyLevel === 'easy' || this.difficultyLevel === 'medium')) {
      this.num1 = this.num2 * Math.floor(Math.random() * 10 + 1);
    }

    // Calculate the correct answer
    switch (this.operator) {
      case '+':
        this.correctAnswer = this.num1 + this.num2;
        break;
      case '-':
        this.correctAnswer = this.num1 - this.num2;
        break;
      case '*':
        this.correctAnswer = this.num1 * this.num2;
        break;
      case '/':
        this.correctAnswer = this.num1 / this.num2;
        // Round to 2 decimal places for division
        this.correctAnswer = Math.round(this.correctAnswer * 100) / 100;
        break;
    }
  }

  // Display the equation to the user
  displayEquation() {
    let operatorDisplay = this.operator;
    if (operatorDisplay === '*') operatorDisplay = '×';
    if (operatorDisplay === '/') operatorDisplay = '÷';

    this.shadowRoot.getElementById('equation').textContent = `${this.num1} ${operatorDisplay} ${this.num2} = ?`;
    this.shadowRoot.getElementById('equation').className = 'equation';
    this.shadowRoot.getElementById('user-input').value = '';
    this.shadowRoot.getElementById('result').textContent = '';
    this.shadowRoot.getElementById('next-btn').style.display = 'none';
    this.shadowRoot.getElementById('submit-btn').style.display = 'inline-block';

    // Focus the input field
    this.shadowRoot.getElementById('user-input').focus();
  }

  // Check the user's answer
  checkAnswer() {
    if (!this.gameActive) return;

    const userAnswer = parseFloat(this.shadowRoot.getElementById('user-input').value);
    const equation = this.shadowRoot.getElementById('equation');
    const result = this.shadowRoot.getElementById('result');

    if (isNaN(userAnswer)) {
      result.textContent = 'Please enter a number!';
      return;
    }

    const isCorrect =
      this.operator === '/'
        ? Math.abs(userAnswer - this.correctAnswer) < 0.01  // Allow small rounding errors for division
        : userAnswer === this.correctAnswer;

    if (isCorrect) {
      result.textContent = 'Correct! 🎉';
      equation.classList.add('correct');
      equation.classList.add('pulse');

      // Update score and streak
      this.score += this.currentLevel * 10;
      this.currentStreak++;

      // Add time bonus for correct answers
      this.timeLeft += 2;
      this.shadowRoot.getElementById('timer').textContent = this.timeLeft;

      // Level up after every 5 correct answers
      if (this.questionsAsked > 0 && this.questionsAsked % 5 === 0) {
        this.currentLevel++;
        this.shadowRoot.getElementById('level').textContent = this.currentLevel;
        result.textContent = `Correct! 🎉 Level up! You're now at level ${this.currentLevel}`;
      }
    } else {
      result.textContent = `Incorrect! The correct answer is ${this.correctAnswer}.`;
      equation.classList.add('incorrect');
      equation.classList.add('pulse');
      this.currentStreak = 0;

      // Time penalty for wrong answers
      this.timeLeft = Math.max(1, this.timeLeft - 3);
      this.shadowRoot.getElementById('timer').textContent = this.timeLeft;
    }

    // Update UI
    this.questionsAsked++;
    this.shadowRoot.getElementById('score').textContent = this.score;
    this.shadowRoot.getElementById('streak').textContent = this.currentStreak;
    this.shadowRoot.getElementById('next-btn').style.display = 'inline-block';
    this.shadowRoot.getElementById('submit-btn').style.display = 'none';

    setTimeout(() => {
      equation.classList.remove('pulse');
    }, 500);
  }

  nextQuestion() {
    if (!this.gameActive) return;

    this.generateEquation();
    this.displayEquation();
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.timer);

    // Calculate final statistics
    const accuracy = this.questionsAsked > 0
      ? Math.round((this.score / (this.questionsAsked * 10)) * 100)
      : 0;

    // Update game over screen
    this.shadowRoot.getElementById('final-score').textContent = this.score;
    this.shadowRoot.getElementById('questions-answered').textContent = this.questionsAsked;
    this.shadowRoot.getElementById('accuracy').textContent = accuracy;

    // Show game over screen
    this.shadowRoot.getElementById('game-area').style.display = 'none';
    this.shadowRoot.getElementById('game-over').style.display = 'block';
  }
}

// Define the custom element
customElements.define('game-component', GameComponent);
