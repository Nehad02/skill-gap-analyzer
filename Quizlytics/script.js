let quizData = {
  title: "",
  timeLimit: 0,
  questions: [],
}

const currentQuestionIndex = 0
let timer
const quizzes = JSON.parse(localStorage.getItem("quizzes")) || []
let startTime
let userAnswers = []
let switchCount = 0

document.getElementById("add-question").addEventListener("click", addQuestion)
document.getElementById("create-quiz").addEventListener("click", createQuiz)
document.getElementById("submit-quiz").addEventListener("click", submitQuiz)
document.getElementById("restart-quiz").addEventListener("click", restartQuiz)
document.getElementById("view-quizzes").addEventListener("click", viewQuizzes)
document.getElementById("back-to-creator").addEventListener("click", backToCreator)

function addQuestion() {
  const questionsContainer = document.getElementById("questions-container")
  const questionDiv = document.createElement("div")
  questionDiv.classList.add("question")
  questionDiv.innerHTML = `
        <input type="text" class="question-text" placeholder="Enter question" required>
        <div class="options"></div>
        <button class="add-option">Add Option</button>
        <input type="number" class="correct-option" placeholder="Correct option number" required>
        <select class="difficulty">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
        </select>
    `
  questionsContainer.appendChild(questionDiv)

  questionDiv.querySelector(".add-option").addEventListener("click", () => addOption(questionDiv))
}

function addOption(questionDiv) {
  const optionsContainer = questionDiv.querySelector(".options")
  const optionInput = document.createElement("input")
  optionInput.type = "text"
  optionInput.classList.add("option")
  optionInput.placeholder = "Enter option"
  optionInput.required = true
  optionsContainer.appendChild(optionInput)
}

function createQuiz() {
  quizData.title = document.getElementById("quiz-title").value
  quizData.timeLimit = Number.parseInt(document.getElementById("quiz-time").value)

  const questionElements = document.querySelectorAll(".question")
  quizData.questions = Array.from(questionElements).map((questionEl) => {
    return {
      text: questionEl.querySelector(".question-text").value,
      options: Array.from(questionEl.querySelectorAll(".option")).map((option) => option.value),
      correctOption: Number.parseInt(questionEl.querySelector(".correct-option").value) - 1,
      difficulty: questionEl.querySelector(".difficulty").value,
    }
  })

  quizzes.push(quizData)
  localStorage.setItem("quizzes", JSON.stringify(quizzes))

  document.getElementById("quiz-creator").style.display = "none"
  document.getElementById("quiz-taker").style.display = "block"
  displayQuiz()
}

function displayQuiz() {
  document.getElementById("quiz-title-display").textContent = quizData.title
  const questionsDisplay = document.getElementById("questions-display")
  questionsDisplay.innerHTML = ""

  quizData.questions.forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.innerHTML = `
            <h3>Question ${index + 1}: ${question.text}</h3>
            ${question.options
              .map(
                (option, i) => `
                <div>
                    <input type="radio" name="question${index}" value="${i}" id="q${index}o${i}">
                    <label for="q${index}o${i}">${option}</label>
                </div>
            `,
              )
              .join("")}
        `
    questionsDisplay.appendChild(questionDiv)
  })

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const questionIndex = Number.parseInt(radio.name.replace("question", ""))
      if (userAnswers[questionIndex] !== undefined && userAnswers[questionIndex] !== Number.parseInt(radio.value)) {
        switchCount++
      }
      userAnswers[questionIndex] = Number.parseInt(radio.value)
    })
  })

  startTime = new Date()
  startTimer()
}

function startTimer() {
  let timeLeft = quizData.timeLimit * 60
  const timerDisplay = document.getElementById("timer")

  timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    timerDisplay.textContent = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

    if (timeLeft <= 0) {
      clearInterval(timer)
      submitQuiz()
    }
    timeLeft--
  }, 1000)
}

function submitQuiz() {
  clearInterval(timer)
  const endTime = new Date()
  const timeTaken = (endTime - startTime) / 1000 / 60 // in minutes

  const results = quizData.questions.map((question, index) => {
    return {
      question: question.text,
      userAnswer: userAnswers[index] !== undefined ? userAnswers[index] : -1,
      correctAnswer: question.correctOption,
      isCorrect: userAnswers[index] === question.correctOption,
      difficulty: question.difficulty,
    }
  })

  displayResults(results, timeTaken)
}

function displayResults(results, timeTaken) {
  document.getElementById("quiz-taker").style.display = "none"
  document.getElementById("quiz-results").style.display = "block"

  const resultsDisplay = document.getElementById("results-display")
  const incorrectResults = results.filter((result) => !result.isCorrect)

  if (incorrectResults.length > 0) {
    resultsDisplay.innerHTML =
      "<h3>Incorrect Answers:</h3>" +
      incorrectResults
        .map(
          (result, index) => `
            <div class="incorrect">
                <p><strong>Question ${results.indexOf(result) + 1}:</strong> ${result.question}</p>
                <p>Your answer: ${result.userAnswer !== -1 ? quizData.questions[results.indexOf(result)].options[result.userAnswer] : "Not answered"}</p>
                <p>Correct answer: ${quizData.questions[results.indexOf(result)].options[result.correctAnswer]}</p>
            </div>
        `,
        )
        .join("")
  } else {
    resultsDisplay.innerHTML = "<h3>Congratulations! You answered all questions correctly!</h3>"
  }

  const score = results.filter((r) => r.isCorrect).length
  const totalQuestions = results.length
  const hardQuestions = results.filter((r) => r.difficulty === "hard")
  const hardCorrect = hardQuestions.filter((r) => r.isCorrect).length

  // Simulating rank and percentile (you'd need a real database for accurate data)
  const rank = Math.floor(Math.random() * 20) + 1
  const percentile = Math.floor(((20 - rank) / 20) * 100)

  const detailedResults = document.getElementById("detailed-results")
  detailedResults.innerHTML = `
        <h3>Detailed Results</h3>
        <p><span class="result-highlight">Your Score: ${score}/${totalQuestions}</span></p>
        <p><span class="result-highlight">Time Taken: ${timeTaken.toFixed(2)} minutes</span> (Faster than ${Math.floor(Math.random() * 40 + 60)}% of users)</p>
        <p><span class="result-highlight">Hard Questions Correct: ${hardCorrect}/${hardQuestions.length}</span> (${hardCorrect === hardQuestions.length ? "Excellent" : "Good"} job on the tough ones!)</p>
        <p><span class="result-highlight">Option Switching: ${switchCount} switches</span> (Confidence: ${switchCount <= 2 ? "High" : switchCount <= 5 ? "Medium" : "Low"})</p>
        <p><span class="result-highlight">Final Rank: ${rank}${rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}</span> (Top ${percentile}%)</p>
    `
}

function restartQuiz() {
  document.getElementById("quiz-results").style.display = "none"
  document.getElementById("quiz-creator").style.display = "block"
  document.getElementById("questions-container").innerHTML = ""
  quizData = { title: "", timeLimit: 0, questions: [] }
  userAnswers = []
  switchCount = 0
}

function viewQuizzes() {
  document.getElementById("quiz-creator").style.display = "none"
  document.getElementById("previous-quizzes").style.display = "block"

  const quizzesList = document.getElementById("quizzes-list")
  quizzesList.innerHTML = ""

  quizzes.forEach((quiz, index) => {
    const quizItem = document.createElement("div")
    quizItem.classList.add("quiz-item")
    quizItem.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>Time Limit: ${quiz.timeLimit} minutes</p>
            <p>Questions: ${quiz.questions.length}</p>
        `
    quizItem.addEventListener("click", () => loadQuiz(index))
    quizzesList.appendChild(quizItem)
  })
}

function loadQuiz(index) {
  quizData = quizzes[index]
  document.getElementById("previous-quizzes").style.display = "none"
  document.getElementById("quiz-taker").style.display = "block"
  userAnswers = []
  switchCount = 0
  displayQuiz()
}

function backToCreator() {
  document.getElementById("previous-quizzes").style.display = "none"
  document.getElementById("quiz-creator").style.display = "block"
}

