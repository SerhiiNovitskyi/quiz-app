const courses = [
    { id: 1, name: "Coding Principles", questionsFile: "course1.json", started: false, completed: false },
    { id: 2, name: "Course 2", questionsFile: "course2.json", started: false, completed: false }
];

const course1Data = [
    {
        "question": "<p>What is the capital of France?</p><p><strong>Select the correct answer:</strong></p>",
        "options": [
            "<p>Berlin</p>",
            "<p>Madrid</p>",
            "<p><strong>Paris</strong></p>",
            "<p>Lisbon</p>"
        ],
        "correctAnswers": [2],
        "allowMultiple": false,
        "isDropdown": false
    },
    {
        "question": "<p>Which of the following are programming languages?</p><p><em>Select all that apply:</em></p>",
        "options": [
            "<p><code>Python</code></p>",
            "<p><code>HTML</code></p>",
            "<p><code>JavaScript</code></p>",
            "<p><code>CSS</code></p>"
        ],
        "correctAnswers": [0, 2],
        "allowMultiple": true,
        "isDropdown": false
    },
    {
        "question": "<p>Fill in the blanks in the following code:</p><pre><code>let x = ______;\nif (x < 10) {\n    console.log('Small');\n} else {\n    console.log('Large');\n}</code></pre>",
        "dropdownOptions": [
            ["5", "15", "20"],
            ["5", "15", "20"]
        ],
        "correctAnswers": [0, 0],
        "isDropdown": true,
        "allowMultiple": true
    },
    {
        "question": "<p>Which one of the following best explains why you would use an event in a program?</p>",
        "options": [
            "To trigger something happening in the program",
            "To test if certain conditions exist in order to control what happens",
            "To carry out instructions in the program repeatedly",
            "To define data storage and what operations to carry out on data"
        ],
        "correctAnswers": [0],
        "allowMultiple": false,
        "isDropdown": false
    },
    {
        "question": "The term that best describes a subroutine that calculates a value for the program in which it is contained is:",
        "options": [
            "Function",
            "Debugging",
            "Procedure",
            "For loop"
        ],
        "correctAnswers": [0],
        "allowMultiple": false,
        "isDropdown": false
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const mainElement = document.getElementById('main');
    const quizElement = document.getElementById('quiz');

    if (mainElement) {
        loadCourses();
    } else if (quizElement) {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course');
        if (courseId) {
            loadQuiz(parseInt(courseId));
        }
        document.getElementById('prev-btn').addEventListener('click', prevQuestion);
        document.getElementById('next-btn').addEventListener('click', nextQuestion);
        document.getElementById('finish-btn').addEventListener('click', finishQuiz);
        document.getElementById('close-result-btn').addEventListener('click', closeResult);
    }
});

function loadCourses() {
    const coursesContainer = document.getElementById('courses');
    coursesContainer.innerHTML = '';
    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.innerHTML = `
                <span>${course.name}</span>
                <button onclick="startCourse(${course.id})">${course.started ? 'Продовжити' : 'Старт'}</button>
            `;
        coursesContainer.appendChild(courseElement);
    });
}

function startCourse(courseId) {
    const currentCourse = courses.find(course => course.id === courseId);
    if (currentCourse) {
        window.location.href = `quiz.html?course=${courseId}`;
    }
}

let currentCourse = null;
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let shuffledQuestions = [];

function loadQuiz(courseId) {
    currentCourse = courses.find(course => course.id === courseId);
    if (currentCourse) {
        let data;
        if (courseId === 1) {
            data = course1Data;
        } else {
            console.error('Course not found');
            return;
        }
        questions = data;
        shuffledQuestions = shuffleArray(questions.map((q, i) => ({ ...q, originalIndex: i })));
        userAnswers = new Array(questions.length).fill(null);
        loadQuestion();
        document.getElementById('course-title').innerText = currentCourse.name;
        updateProgress();
        updateNavigationButtons();
    }
}

function loadQuestion() {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    if (currentQuestion.isDropdown) {
        questionElement.innerHTML = currentQuestion.question;
        optionsElement.innerHTML = currentQuestion.dropdownOptions.map((options, index) => {
            return `<select id="dropdown-${index}">${options.map((option, i) => `<option value="${i}">${option}</option>`).join('')}</select>`;
        }).join('');
    } else {
        questionElement.innerHTML = currentQuestion.question;
        optionsElement.innerHTML = shuffleArray(currentQuestion.options).map((option, index) => {
            return `<div>
                    <input type="${currentQuestion.allowMultiple ? 'checkbox' : 'radio'}" name="option" id="option-${index}" value="${index}">
                    <label for="option-${index}">${option}</label>
                </div>`;
        }).join('');
    }
    document.getElementById('next-btn').disabled = true;
    const optionsInputs = optionsElement.querySelectorAll('input, select');
    optionsInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (currentQuestion.isDropdown) {
                const allSelected = Array.from(optionsInputs).every(input => input.value !== '');
                document.getElementById('next-btn').disabled = !allSelected;
            } else {
                const anySelected = Array.from(optionsInputs).some(input => input.checked);
                document.getElementById('next-btn').disabled = !anySelected;
            }
        });
    });
    updateProgress();
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
        updateNavigationButtons();
    }
}

function nextQuestion() {
    saveUserAnswer();
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        updateNavigationButtons();
    }
}

function finishQuiz() {
    saveUserAnswer();
    const result = calculateResults();
    showResult(result);
}

function updateNavigationButtons() {
    document.getElementById('prev-btn').style.display = currentQuestionIndex === 0 ? 'none' : 'block';
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('finish-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'block';
        document.getElementById('finish-btn').style.display = 'none';
    }
}

function closeResult() {
    document.getElementById('result').classList.add('hidden');
}

function calculateResults() {
    let correct = 0;
    let incorrect = 0;
    shuffledQuestions.forEach((question, index) => {
        if (userAnswers[question.originalIndex] !== null) {
            const correctAnswers = question.correctAnswers;
            const userAnswer = userAnswers[question.originalIndex];
            if (Array.isArray(userAnswer) && Array.isArray(correctAnswers)) {
                if (userAnswer.sort().toString() === correctAnswers.sort().toString()) {
                    correct++;
                } else {
                    incorrect++;
                }
            } else if (userAnswer === correctAnswers[0]) {
                correct++;
            } else {
                incorrect++;
            }
        }
    });
    const percentage = (correct / shuffledQuestions.length) * 100;
    return { correct, incorrect, percentage };
}

function showResult(result) {
    const resultElement = document.getElementById('result');
    const resultContent = document.getElementById('result-content');
    resultContent.innerHTML = `
            <p>Кількість правильних відповідей: ${result.correct}</p>
            <p>Кількість неправильних відповідей: ${result.incorrect}</p>
            <p>Відсоток правильних відповідей: ${result.percentage.toFixed(2)}%</p>
        `;
    resultElement.classList.remove('hidden');
}
function saveUserAnswer() {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (currentQuestion.isDropdown) {
        const dropdowns = document.querySelectorAll('[id^="dropdown-"]');
        userAnswers[currentQuestion.originalIndex] = Array.from(dropdowns).map(dropdown => parseInt(dropdown.value));
    } else {
        const selectedOptions = document.querySelectorAll('input[name="option"]:checked');
        userAnswers[currentQuestion.originalIndex] = Array.from(selectedOptions).map(option => parseInt(option.value));
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateProgress() {
    document.getElementById('progress-count').innerText = currentQuestionIndex + 1;
    document.getElementById('progress-total').innerText = shuffledQuestions.length;
}
