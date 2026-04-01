// ========== STATE ==========
let data = null;
let currentWords = [];
let currentIndex = 0;

// ========== DOM ==========
const screenSelect = document.getElementById('screen-select');
const screenCards  = document.getElementById('screen-cards');
const lessonList   = document.getElementById('lesson-list');
const flashcard    = document.getElementById('flashcard');
const cardJP       = document.getElementById('card-jp');
const cardReading  = document.getElementById('card-reading');
const cardMeaning  = document.getElementById('card-meaning');
const cardCounter  = document.getElementById('card-counter');
const topbarTitle  = document.getElementById('topbar-title');
const progressBar  = document.getElementById('progress-bar');
const btnBack      = document.getElementById('btn-back');
const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnShuffle   = document.getElementById('btn-shuffle');

// ========== LOAD DATA ==========
async function init() {
  const res = await fetch('./data.json');
  data = await res.json();
  renderLessonList();
}

// ========== RENDER LESSON SELECT ==========
function renderLessonList() {
  lessonList.innerHTML = '';

  data.lessons.forEach(lesson => {
    // Lesson group header
    const title = document.createElement('div');
    title.className = 'lesson-group-title';
    title.textContent = lesson.title;
    lessonList.appendChild(title);

    // "All words" button for the lesson
    const allWords = lesson.categories.flatMap(c => c.words);
    const allBtn = document.createElement('button');
    allBtn.className = 'lesson-btn';
    allBtn.id = `lesson-${lesson.lesson}-all`;
    allBtn.innerHTML = `<span>All Words</span><span class="tag">${allWords.length} cards</span>`;
    allBtn.addEventListener('click', () => startCards(`${lesson.title} — All`, allWords));
    lessonList.appendChild(allBtn);

    // Category buttons
    lesson.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'lesson-btn';
      btn.id = `lesson-${lesson.lesson}-${cat.category.toLowerCase().replace(/\s+/g, '-')}`;
      btn.innerHTML = `<span>${cat.category}</span><span class="tag">${cat.words.length}</span>`;
      btn.addEventListener('click', () => startCards(`${lesson.title} — ${cat.category}`, cat.words));
      lessonList.appendChild(btn);
    });
  });
}

// ========== START CARDS ==========
function startCards(title, words) {
  topbarTitle.textContent = title;
  currentWords = [...words];
  currentIndex = 0;
  showCard();
  switchScreen(screenCards);
}

// ========== SHOW CARD ==========
function showCard() {
  const inner = flashcard.querySelector('.card-inner');

  // Instantly remove flip (no animation) BEFORE updating content
  inner.style.transition = 'none';
  flashcard.classList.remove('flipped');
  // Force browser to apply the instant change
  inner.offsetHeight;
  inner.style.transition = '';

  // Now safely update card content
  const word = currentWords[currentIndex];
  cardJP.textContent = word.jp;
  cardReading.textContent = word.reading !== word.jp ? word.reading : '';
  cardMeaning.textContent = word.meaning;
  cardCounter.textContent = `${currentIndex + 1} / ${currentWords.length}`;
  progressBar.style.width = `${((currentIndex + 1) / currentWords.length) * 100}%`;
}

// ========== NAVIGATION ==========
function nextCard() {
  if (currentIndex < currentWords.length - 1) {
    currentIndex++;
    animateSwitch();
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    animateSwitch();
  }
}

function animateSwitch() {
  flashcard.classList.remove('flipped');
  flashcard.style.transition = 'opacity 0.15s ease';
  flashcard.style.opacity = '0';

  setTimeout(() => {
    showCard();
    flashcard.style.opacity = '1';
    setTimeout(() => {
      flashcard.style.transition = '';
      flashcard.style.opacity = '';
    }, 160);
  }, 150);
}

// ========== SHUFFLE ==========
function shuffleCards() {
  for (let i = currentWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]];
  }
  currentIndex = 0;
  showCard();

  // Quick spin animation on the button
  btnShuffle.style.transition = 'transform 0.4s ease';
  btnShuffle.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    btnShuffle.style.transition = 'none';
    btnShuffle.style.transform = 'rotate(0)';
  }, 400);
}

// ========== SCREEN SWITCH ==========
function switchScreen(target) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  target.classList.add('active');
}

// ========== EVENTS ==========
flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));

btnBack.addEventListener('click', () => switchScreen(screenSelect));
btnNext.addEventListener('click', nextCard);
btnPrev.addEventListener('click', prevCard);
btnShuffle.addEventListener('click', shuffleCards);

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!screenCards.classList.contains('active')) return;
  if (e.key === 'ArrowRight') nextCard();
  if (e.key === 'ArrowLeft') prevCard();
  if (e.key === ' ') { e.preventDefault(); flashcard.classList.toggle('flipped'); }
  if (e.key === 'Escape') switchScreen(screenSelect);
});

// Swipe support
let touchStartX = 0;
flashcard.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
flashcard.addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 60) {
    e.preventDefault();
    diff < 0 ? nextCard() : prevCard();
  }
});

// ========== INIT ==========
init();
