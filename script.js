// Список курсів
const courses = [
    { id: 1, name: "Course 1", questionsFile: "course1.json", started: false, completed: false },
    { id: 2, name: "Course 2", questionsFile: "course2.json", started: false, completed: false }
];

// Початок роботи після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
    const mainElement = document.getElementById('main');
    const quizElement = document.getElementById('quiz');

    // Перевірка, на якій сторінці знаходимося
    if (mainElement) {
        loadCourses();
    } else if (quizElement) {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course');
        if (courseId) {
            loadQuiz(parseInt(courseId));
        }
        // Підключення обробників подій для кнопок навігації
        document.getElementById('prev-btn').addEventListener('click', prevQuestion);
        document.getElementById('next-btn').addEventListener('click', nextQuestion);
        document.getElementById('finish-btn').addEventListener('click', finishQuiz);
        document.getElementById('end-btn').addEventListener('click', endQuiz);
        document.getElementById('close-result-btn').addEventListener('click', closeResult);
    }
});

// Завантаження списку курсів
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

// Початок курсу
function startCourse(courseId) {
    const currentCourse = courses.find(course => course.id === courseId);
    if (currentCourse) {
        window.location.href = `quiz.html?course=${courseId}`;
    }
}

// Змінні для поточного курсу і питань
let currentCourse = null;
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];

// Завантаження квізу
function loadQuiz(courseId) {
    currentCourse = courses.find(course => course.id === courseId);
    if (currentCourse) {
        fetch(currentCourse.questionsFile)
            .then(response => response.json())
            .then(data => {
                questions = data;
                userAnswers = new Array(questions.length).fill(null);
                loadQuestion();
                document.getElementById('course-title').innerText = currentCourse.name;
                updateNavigationButtons();
            })
            .catch(error => {
                console.error('Error loading questions:', error);
            });
    }
}

// Завантаження питання
function loadQuestion() {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.isDropdown) {
        questionElement.innerHTML = currentQuestion.question;
        optionsElement.innerHTML = currentQuestion.dropdownOptions.map((options, index) => {
            return `<select id="dropdown-${index}">${options.map((option, i) => `<option value="${i}">${option}</option>`).join('')}</select>`;
        }).join('');
    } else {
        questionElement.innerHTML = currentQuestion.question;
        optionsElement.innerHTML = currentQuestion.options.map((option, index) => {
            return `<div>
                <input type="${currentQuestion.allowMultiple ? 'checkbox' : 'radio'}" name="option" id="option-${index}" value="${index}">
                <label for="option-${index}">${option}</label>
            </div>`;
        }).join('');
    }
}

// Перехід до попереднього питання
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
        updateNavigationButtons();
    }
}

// Перехід до наступного питання
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        updateNavigationButtons();
    }
}

// Завершення квізу
function finishQuiz() {
    const result = calculateResults();
    showResult(result);
    // Позначення курсу як завершеного
    currentCourse.completed = true;
    currentCourse.started = false;
    // Збереження прогресу
    saveProgress();
}

// Закінчення квізу
function endQuiz() {
    window.location.href = 'index.html';
}

// Закриття результатів
function closeResult() {
    document.getElementById('result').classList.add('hidden');
    endQuiz();
}

// Оновлення кнопок навігації
function updateNavigationButtons() {
    document.getElementById('prev-btn').style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    document.getElementById('next-btn').style.display = currentQuestionIndex < questions.length - 1 ? 'block' : 'none';
    document.getElementById('finish-btn').style.display = 'block';
    document.getElementById('end-btn').style.display = currentQuestionIndex === questions.length - 1 ? 'block' : 'none';
}

// Обчислення результатів
function calculateResults() {
    // Реалізуйте обчислення результатів
    return { correct: 0, incorrect: 0, percentage: 0 };
}

// Відображення результатів
function showResult(result) {
    const resultElement = document.getElementById('result');
    const resultContent = document.getElementById('result-content');
    resultContent.innerHTML = `
        <p>Кількість правильних відповідей: ${result.correct}</p>
        <p>Кількість неправильних відповідей: ${result.incorrect}</p>
        <p>Відсоток правильних відповідей: ${result.percentage}%</p>
    `;
    resultElement.classList.remove('hidden');
}

// Збереження прогресу
function saveProgress() {
    // Збереження прогресу користувача
}
