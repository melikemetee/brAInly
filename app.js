// brAInly Application Logic & Local State Manager
// =====================================================
// Future Firebase Integration:
// childProfile      → Firestore collection: childProfiles
// routineTasks      → Firestore collection: routineTasks
// learningCards     → Firestore collection: learningCards
// cardResult        → Firestore collection: cardResults
// socialScenarios   → Firestore collection: socialScenarios
// scenarioResult    → Firestore collection: scenarioResults
// aiRecommendations → Firestore collection: aiRecommendations
// progressData      → Firestore collection: progressData (computed doc per child)
// =====================================================

// Activity totals for progress calculation
const TOTAL_ROUTINES = 10;
const TOTAL_CARDS = 20;
const TOTAL_SCENARIOS = 10;
const TOTAL_ACTIVITIES = 40;

// Developer mode: add ?dev=true to URL to show inspector panel
const IS_DEV_MODE = new URLSearchParams(window.location.search).get('dev') === 'true';

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// App State (In-Memory Database Syncing with localStorage)
let db = {
  currentUser: null,
  childProfile: null,
  routineTasks: [],
  learningCards: [],
  cardResult: [],
  socialScenarios: [],
  scenarioResult: [],
  progressData: {},
  aiRecommendations: [],
  activeTab: 'childProfile',
  currentQuizCard: null,
  currentQuizScenario: null,
  lastScreen: null,
  lastActivity: null
};

// Step-by-step instructions for each routine task
const ROUTINE_STEPS = {
  'Brush Teeth': [
    'Pick up your toothbrush.',
    'Add a pea-sized amount of toothpaste.',
    'Brush your teeth thoroughly for 2 minutes.',
    'Rinse your mouth with water.',
    'Wash your brush and put it away.'
  ],
  'Wash Hands': [
    'Turn on the water tap and wet your hands.',
    'Apply soap and rub all over.',
    'Scrub fingers, wrists, and palms for 20 seconds.',
    'Rinse bubbles with clean water.',
    'Dry with a clean soft towel.'
  ],
  'Get Dressed': [
    'Choose clean clothes for today.',
    'Put on your shirt or top first.',
    'Put on pants or a skirt.',
    'Put on socks and shoes.',
    'Check yourself in the mirror.'
  ],
  'Eat Breakfast': [
    'Wash your hands before eating.',
    'Sit at the table calmly.',
    'Eat your food slowly and chew well.',
    'Drink water or juice.',
    'Clear your plate when finished.'
  ],
  'Pack School Bag': [
    'Find your school bag.',
    'Put in your books and notebooks.',
    'Add pencils and school supplies.',
    'Pack your lunch box if needed.',
    'Zip up the bag and place by the door.'
  ],
  'Homework Routine': [
    'Find a quiet place to work.',
    'Get your homework materials ready.',
    'Read the instructions carefully.',
    'Complete one task at a time.',
    'Put materials away when finished.'
  ],
  'Tidy Up Toys': [
    'Look at the toys on the floor.',
    'Pick up one type of toy at a time.',
    'Put each toy in the right box or shelf.',
    'Make sure the floor is clear.',
    'Wash your hands after tidying.'
  ],
  'Bedtime Routine': [
    'Put on your pajamas.',
    'Brush your teeth.',
    'Read a short story or calm activity.',
    'Turn off bright lights.',
    'Lie down and rest quietly.'
  ],
  'Healthy Eating': [
    'Look at the food on your plate.',
    'Try a small bite of each food.',
    'Chew slowly and enjoy the taste.',
    'Drink water with your meal.',
    'Say thank you when finished.'
  ],
  'Personal Hygiene': [
    'Check if you need a shower or bath.',
    'Use soap to wash your body.',
    'Wash your hair with shampoo.',
    'Dry off with a clean towel.',
    'Put on clean clothes.'
  ]
};

// Default Setup Data
const DEFAULT_MOCK_DATA = {
  childProfile: {
    childId: 'child_adam',
    name: 'Adam',
    age: 6,
    supportLevel: 'Beginner',
    mainFocus: 'Daily Routine',
    notes: 'Responds well to visual praise and step-by-step routines.',
    createdAt: '2026-07-05T10:00:00Z'
  },
  currentUser: {
    email: 'demo@brainly.edu',
    name: 'Demo User',
    role: 'Parent'
  },
  routineTasks: [
    { taskId: 'task_1', childId: 'child_adam', title: 'Brush Teeth', category: 'Hygiene', isCompleted: false, completedAt: null, icon: '🪥' },
    { taskId: 'task_2', childId: 'child_adam', title: 'Wash Hands', category: 'Hygiene', isCompleted: false, completedAt: null, icon: '🧼' },
    { taskId: 'task_3', childId: 'child_adam', title: 'Get Dressed', category: 'Routine', isCompleted: false, completedAt: null, icon: '👕' },
    { taskId: 'task_4', childId: 'child_adam', title: 'Eat Breakfast', category: 'Routine', isCompleted: false, completedAt: null, icon: '🍳' },
    { taskId: 'task_5', childId: 'child_adam', title: 'Pack School Bag', category: 'School', isCompleted: false, completedAt: null, icon: '🎒' },
    { taskId: 'task_6', childId: 'child_adam', title: 'Homework Routine', category: 'School', isCompleted: false, completedAt: null, icon: '📝' },
    { taskId: 'task_7', childId: 'child_adam', title: 'Tidy Up Toys', category: 'Home', isCompleted: false, completedAt: null, icon: '🧸' },
    { taskId: 'task_8', childId: 'child_adam', title: 'Bedtime Routine', category: 'Routine', isCompleted: false, completedAt: null, icon: '🌙' },
    { taskId: 'task_9', childId: 'child_adam', title: 'Healthy Eating', category: 'Routine', isCompleted: false, completedAt: null, icon: '🍎' },
    { taskId: 'task_10', childId: 'child_adam', title: 'Personal Hygiene', category: 'Hygiene', isCompleted: false, completedAt: null, icon: '🚿' }
  ],
  learningCards: [
    { cardId: 'card_1', category: 'Emotions', title: 'Happy', imageUrl: '😊', correctAnswer: 'Happy' },
    { cardId: 'card_2', category: 'Emotions', title: 'Sad', imageUrl: '😢', correctAnswer: 'Sad' },
    { cardId: 'card_3', category: 'Emotions', title: 'Angry', imageUrl: '😠', correctAnswer: 'Angry' },
    { cardId: 'card_4', category: 'Emotions', title: 'Surprised', imageUrl: '😮', correctAnswer: 'Surprised' },
    { cardId: 'card_5', category: 'Emotions', title: 'Calm', imageUrl: '😌', correctAnswer: 'Calm' },
    { cardId: 'card_6', category: 'Colors', title: 'Red', imageUrl: '🔴', correctAnswer: 'Red' },
    { cardId: 'card_7', category: 'Colors', title: 'Blue', imageUrl: '🔵', correctAnswer: 'Blue' },
    { cardId: 'card_8', category: 'Colors', title: 'Green', imageUrl: '🟢', correctAnswer: 'Green' },
    { cardId: 'card_9', category: 'Colors', title: 'Yellow', imageUrl: '🟡', correctAnswer: 'Yellow' },
    { cardId: 'card_10', category: 'Animals', title: 'Cat', imageUrl: '🐱', correctAnswer: 'Cat' },
    { cardId: 'card_11', category: 'Animals', title: 'Dog', imageUrl: '🐶', correctAnswer: 'Dog' },
    { cardId: 'card_12', category: 'Animals', title: 'Bird', imageUrl: '🐦', correctAnswer: 'Bird' },
    { cardId: 'card_13', category: 'Everyday Objects', title: 'Apple', imageUrl: '🍎', correctAnswer: 'Apple' },
    { cardId: 'card_14', category: 'Everyday Objects', title: 'Cup', imageUrl: '🥤', correctAnswer: 'Cup' },
    { cardId: 'card_15', category: 'Everyday Objects', title: 'Toothbrush', imageUrl: '🪥', correctAnswer: 'Toothbrush' },
    { cardId: 'card_16', category: 'School Materials', title: 'Pencil', imageUrl: '✏️', correctAnswer: 'Pencil' },
    { cardId: 'card_17', category: 'School Materials', title: 'Book', imageUrl: '📘', correctAnswer: 'Book' },
    { cardId: 'card_18', category: 'School Materials', title: 'Bag', imageUrl: '🎒', correctAnswer: 'Bag' },
    { cardId: 'card_19', category: 'Family Members', title: 'Mother', imageUrl: '👩', correctAnswer: 'Mother' },
    { cardId: 'card_20', category: 'Family Members', title: 'Father', imageUrl: '👨', correctAnswer: 'Father' }
  ],
  socialScenarios: [
    { scenarioId: 'scen_1', title: 'Greeting Others', question: 'Your friend says hello to you. What should you do?', options: ['Say hello back', 'Ignore them', 'Push them away'], correctAnswer: 'Say hello back', difficulty: 'Easy', icon: '👋' },
    { scenarioId: 'scen_2', title: 'Asking for Help', question: 'You cannot open a jar. What is the best thing to say?', options: ['Scream loudly', 'Please help me', 'Throw the jar'], correctAnswer: 'Please help me', difficulty: 'Easy', icon: '🙋‍♂️' },
    { scenarioId: 'scen_3', title: 'Waiting Patiently', question: 'Other kids are playing on the swing. What should you do?', options: ['Wait in line for your turn', 'Push them off the swing', 'Go home angry'], correctAnswer: 'Wait in line for your turn', difficulty: 'Easy', icon: '⏳' },
    { scenarioId: 'scen_4', title: 'Sharing with Friends', question: 'Your friend wants to play with your blocks. What do you do?', options: ['Hide the blocks', 'Share some blocks to play together', 'Throw the blocks away'], correctAnswer: 'Share some blocks to play together', difficulty: 'Medium', icon: '🎁' },
    { scenarioId: 'scen_5', title: 'Following Rules', question: "The teacher says 'quiet reading time'. What do we do?", options: ['Sing a song', 'Open a book and read silently', 'Run around the room'], correctAnswer: 'Open a book and read silently', difficulty: 'Easy', icon: '🏫' },
    { scenarioId: 'scen_6', title: 'Crossing the Road', question: 'You want to cross the street. When is it safe?', options: ['When the walk signal light is green', 'Whenever I am in a hurry', 'When cars are driving fast'], correctAnswer: 'When the walk signal light is green', difficulty: 'Medium', icon: '🚶‍♂️' },
    { scenarioId: 'scen_7', title: 'Visiting a Doctor', question: "You are at the doctor's office. How should you act?", options: ['Run and hide under tables', 'Sit calm and let the doctor check you', 'Cry and throw items'], correctAnswer: 'Sit calm and let the doctor check you', difficulty: 'Medium', icon: '🩺' },
    { scenarioId: 'scen_8', title: 'Ordering Food', question: 'You want to order juice at the shop. What do you say?', options: ['Gimme juice now!', 'Can I have juice, please?', 'Grab it myself'], correctAnswer: 'Can I have juice, please?', difficulty: 'Medium', icon: '🥤' },
    { scenarioId: 'scen_9', title: 'Managing Emotions', question: 'You are feeling very angry. What helps you calm down?', options: ['Take deep breaths or count to 10', 'Hit the wall', 'Yell at everyone'], correctAnswer: 'Take deep breaths or count to 10', difficulty: 'Medium', icon: '🧘' },
    { scenarioId: 'scen_10', title: 'Playing Classmates', question: 'Your classmate is building a tower. What can you say?', options: ['Can I join and build with you?', 'Kick their tower down', 'Stand and stare closely'], correctAnswer: 'Can I join and build with you?', difficulty: 'Easy', icon: '🧱' }
  ]
};

// Safe main screens for session restore
const SAFE_MAIN_SCREENS = [
  'scr-home', 'scr-routine', 'scr-learning-cards', 'scr-social-scenarios',
  'scr-progress', 'scr-ai', 'scr-settings'
];

// Global routing state
let currentScreenId = 'scr-welcome';
let lastScreenId = 'scr-welcome';
let activeTaskId = null;

// ----------------------------------------------------
// CORE DB CONTROLLER FUNCTIONS
// ----------------------------------------------------

function initApp() {
  // Set presentation or dev mode on body
  if (IS_DEV_MODE) {
    document.body.classList.add('dev-mode');
  } else {
    document.body.classList.add('presentation-mode');
  }

  loadDB();

  setupNavigationBindings();
  setupAuthBindings();
  setupProfileSetupBindings();
  setupRoutineBindings();
  setupLearningBindings();
  setupSocialBindings();
  setupSettingsBindings();
  if (IS_DEV_MODE) setupPresentationHelper();

  if (IS_DEV_MODE) renderInspector();
  updateClock();
  setInterval(updateClock, 1000);

  // Determine initial screen based on saved session
  const initialScreen = resolveInitialScreen();
  showScreen(initialScreen, true);

  refreshAllScreensUI();
}

function loadDB() {
  const persistedState = localStorage.getItem('brainly_state');
  if (!persistedState) {
    initDefaultContent();
    return;
  }

  try {
    const parsed = JSON.parse(persistedState);
    db = { ...db, ...parsed };

    // Validate and repair incomplete or broken data
    if (!db.childProfile || !db.childProfile.childId) {
      db.childProfile = { ...DEFAULT_MOCK_DATA.childProfile };
    }
    if (!Array.isArray(db.routineTasks) || db.routineTasks.length === 0) {
      db.routineTasks = DEFAULT_MOCK_DATA.routineTasks.map(t => ({ ...t }));
    }
    if (!Array.isArray(db.learningCards) || db.learningCards.length === 0) {
      db.learningCards = DEFAULT_MOCK_DATA.learningCards.map(c => ({ ...c }));
    }
    if (!Array.isArray(db.socialScenarios) || db.socialScenarios.length === 0) {
      db.socialScenarios = DEFAULT_MOCK_DATA.socialScenarios.map(s => ({ ...s }));
    }
    if (!Array.isArray(db.cardResult)) db.cardResult = [];
    if (!Array.isArray(db.scenarioResult)) db.scenarioResult = [];
    if (!Array.isArray(db.aiRecommendations)) db.aiRecommendations = [];

    recalculateProgress();
    generateAISuggestions();
  } catch (e) {
    console.error('Error reading saved state, resetting...', e);
    initDefaultContent();
  }
}

// Load static content without creating an active session
function initDefaultContent() {
  db.currentUser = null;
  db.childProfile = { ...DEFAULT_MOCK_DATA.childProfile };
  db.routineTasks = DEFAULT_MOCK_DATA.routineTasks.map(t => ({ ...t }));
  db.learningCards = DEFAULT_MOCK_DATA.learningCards.map(c => ({ ...c }));
  db.socialScenarios = DEFAULT_MOCK_DATA.socialScenarios.map(s => ({ ...s }));
  db.cardResult = [];
  db.scenarioResult = [];
  db.aiRecommendations = [];
  db.activeTab = 'childProfile';
  db.currentQuizCard = null;
  db.currentQuizScenario = null;
  db.lastActivity = null;
  db.lastScreen = null;

  recalculateProgress();
  generateAISuggestions();
}

function saveDB() {
  db.lastScreen = currentScreenId;
  localStorage.setItem('brainly_state', JSON.stringify(db));
  if (IS_DEV_MODE) renderInspector();
  refreshAllScreensUI();
}

function resetToDefaultMock(saveAfter = true) {
  db.currentUser = { ...DEFAULT_MOCK_DATA.currentUser };
  db.childProfile = { ...DEFAULT_MOCK_DATA.childProfile };
  db.routineTasks = DEFAULT_MOCK_DATA.routineTasks.map(t => ({ ...t }));
  db.learningCards = DEFAULT_MOCK_DATA.learningCards.map(c => ({ ...c }));
  db.socialScenarios = DEFAULT_MOCK_DATA.socialScenarios.map(s => ({ ...s }));
  db.cardResult = [];
  db.scenarioResult = [];
  db.aiRecommendations = [];
  db.activeTab = 'childProfile';
  db.currentQuizCard = null;
  db.currentQuizScenario = null;
  db.lastActivity = null;
  db.lastScreen = 'scr-home';

  recalculateProgress();
  generateAISuggestions();

  if (saveAfter) saveDB();
}

function continueAsDemoUser() {
  // Ensure demo user and Adam profile without wiping existing progress
  db.currentUser = { ...DEFAULT_MOCK_DATA.currentUser };

  if (!db.childProfile || !db.childProfile.childId) {
    db.childProfile = { ...DEFAULT_MOCK_DATA.childProfile };
  }

  // Ensure static content arrays exist
  if (!Array.isArray(db.routineTasks) || db.routineTasks.length === 0) {
    db.routineTasks = DEFAULT_MOCK_DATA.routineTasks.map(t => ({ ...t }));
  }
  if (!Array.isArray(db.learningCards) || db.learningCards.length === 0) {
    db.learningCards = DEFAULT_MOCK_DATA.learningCards.map(c => ({ ...c }));
  }
  if (!Array.isArray(db.socialScenarios) || db.socialScenarios.length === 0) {
    db.socialScenarios = DEFAULT_MOCK_DATA.socialScenarios.map(s => ({ ...s }));
  }
  if (!Array.isArray(db.cardResult)) db.cardResult = [];
  if (!Array.isArray(db.scenarioResult)) db.scenarioResult = [];

  recalculateProgress();
  generateAISuggestions();
  saveDB();
  showScreen('scr-home');
}

function resolveInitialScreen() {
  const hasSession = db.currentUser && db.childProfile && db.childProfile.childId;

  if (!hasSession) {
    return 'scr-welcome';
  }

  // Restore last main screen if valid, otherwise home
  if (db.lastScreen && SAFE_MAIN_SCREENS.includes(db.lastScreen)) {
    return db.lastScreen;
  }

  return 'scr-home';
}

// Count unique correct answers (no duplicate counting)
function getUniqueCorrectCardIds() {
  const correctIds = new Set();
  db.cardResult.forEach(r => {
    if (r.isCorrect) correctIds.add(r.cardId);
  });
  return correctIds;
}

function getUniqueCorrectScenarioIds() {
  const correctIds = new Set();
  db.scenarioResult.forEach(r => {
    if (r.isCorrect) correctIds.add(r.scenarioId);
  });
  return correctIds;
}

function recalculateProgress() {
  const completedRoutineCount = db.routineTasks.filter(t => t.isCompleted).length;
  const completedCardCount = getUniqueCorrectCardIds().size;
  const completedScenarioCount = getUniqueCorrectScenarioIds().size;
  const totalCompleted = completedRoutineCount + completedCardCount + completedScenarioCount;
  const overallProgress = Math.round((totalCompleted / TOTAL_ACTIVITIES) * 100);

  db.progressData = {
    childId: db.childProfile ? db.childProfile.childId : 'child_adam',
    completedRoutineCount,
    completedCardCount,
    completedScenarioCount,
    totalCompleted,
    overallProgress,
    updatedAt: new Date().toISOString()
  };
}

// ----------------------------------------------------
// AI SUGGESTION GENERATOR (Rule-based, no API)
// ----------------------------------------------------

function generateAISuggestions() {
  if (!db.childProfile) return;

  const { completedRoutineCount, completedCardCount, completedScenarioCount, overallProgress } = db.progressData;
  const childName = db.childProfile.name;
  const mainFocus = db.childProfile.mainFocus;
  const childId = db.childProfile.childId;
  const now = new Date().toISOString();

  const recommendations = [];
  let recCounter = 1;

  function addRec(suggestionText, category, priority, inputSummary) {
    recommendations.push({
      recommendationId: `rec_${recCounter++}`,
      childId,
      inputSummary,
      suggestionText,
      category,
      priority,
      createdAt: now
    });
  }

  // Rule: Low routine completion
  if (completedRoutineCount < 3) {
    addRec(
      'Focus on completing two simple daily routine tasks today, such as Brush Teeth and Wash Hands.',
      'Daily Routine',
      'high',
      `completedRoutineCount=${completedRoutineCount}`
    );
  }

  // Rule: Low learning card completion
  if (completedCardCount < 5) {
    addRec(
      'Practice visual learning cards for 5 minutes. Start with emotions and everyday objects.',
      'Learning Cards',
      'high',
      `completedCardCount=${completedCardCount}`
    );
  }

  // Rule: High scenario mistakes
  const wrongScenarios = db.scenarioResult.filter(r => !r.isCorrect);
  if (wrongScenarios.length >= 2) {
    addRec(
      'Repeat social scenarios about greeting others and asking for help.',
      'Social Skills',
      'medium',
      `wrongScenarioCount=${wrongScenarios.length}`
    );
  }

  // Rule: Main focus area
  if (mainFocus === 'Daily Routine') {
    addRec(
      `Since ${childName}'s main focus is Daily Routine, start today with a short hygiene routine.`,
      'Daily Routine',
      'medium',
      `mainFocus=${mainFocus}`
    );
  } else if (mainFocus === 'Emotions') {
    addRec(
      `Since ${childName}'s main focus is Emotions, review Happy, Sad, and Angry cards today.`,
      'Emotions',
      'medium',
      `mainFocus=${mainFocus}`
    );
  } else if (mainFocus === 'Social Skills') {
    addRec(
      `Since ${childName}'s main focus is Social Skills, try one greeting scenario today.`,
      'Social Skills',
      'medium',
      `mainFocus=${mainFocus}`
    );
  }

  // Rule: Learning card mistakes in Emotions category
  const wrongCardResults = db.cardResult.filter(r => !r.isCorrect);
  const emotionMistakes = wrongCardResults.filter(r => {
    const card = db.learningCards.find(c => c.cardId === r.cardId);
    return card && card.category === 'Emotions';
  });
  if (emotionMistakes.length >= 1) {
    addRec(
      `${childName} may benefit from reviewing emotion cards such as Happy, Sad, and Angry.`,
      'Emotions',
      'medium',
      `emotionMistakes=${emotionMistakes.length}`
    );
  }

  // Rule: High overall progress
  if (overallProgress >= 50) {
    addRec(
      'Great progress today. Keep the next session short and positive.',
      'Encouragement',
      'low',
      `overallProgress=${overallProgress}`
    );
  }

  // Fallback recommendation if none generated
  if (recommendations.length === 0) {
    addRec(
      `Keep practicing a little each day, ${childName}. Short positive sessions work best.`,
      'General',
      'low',
      'default'
    );
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  db.aiRecommendations = recommendations;
}

// ----------------------------------------------------
// RECENT ACTIVITY TRACKER
// ----------------------------------------------------

function getRecentActivities(limit = 3) {
  const activities = [];

  // Routine completions
  db.routineTasks
    .filter(t => t.isCompleted && t.completedAt)
    .forEach(t => {
      activities.push({
        type: 'routine',
        title: t.title,
        label: `${t.title} completed`,
        completedAt: t.completedAt,
        icon: t.icon
      });
    });

  // Card results (only latest correct per card)
  const latestCardResults = {};
  db.cardResult.forEach(r => {
    if (!latestCardResults[r.cardId] || r.completedAt > latestCardResults[r.cardId].completedAt) {
      latestCardResults[r.cardId] = r;
    }
  });
  Object.values(latestCardResults).forEach(r => {
    const card = db.learningCards.find(c => c.cardId === r.cardId);
    if (card) {
      activities.push({
        type: 'card',
        title: card.title,
        label: `${card.title} card answered ${r.isCorrect ? 'correctly' : 'incorrectly'}`,
        completedAt: r.completedAt,
        icon: card.imageUrl
      });
    }
  });

  // Scenario results
  const latestScenarioResults = {};
  db.scenarioResult.forEach(r => {
    if (!latestScenarioResults[r.scenarioId] || r.completedAt > latestScenarioResults[r.scenarioId].completedAt) {
      latestScenarioResults[r.scenarioId] = r;
    }
  });
  Object.values(latestScenarioResults).forEach(r => {
    const scen = db.socialScenarios.find(s => s.scenarioId === r.scenarioId);
    if (scen) {
      activities.push({
        type: 'scenario',
        title: scen.title,
        label: `${scen.title} scenario ${r.isCorrect ? 'completed' : 'attempted'}`,
        completedAt: r.completedAt,
        icon: scen.icon
      });
    }
  });

  return activities
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, limit);
}

function setLastActivity(type, id, title, icon) {
  db.lastActivity = { type, id, title, icon, timestamp: new Date().toISOString() };
}

// ----------------------------------------------------
// UI ENGINE / ROUTER
// ----------------------------------------------------

function showScreen(screenId, skipSave = false) {
  if (screenId === currentScreenId) return;

  const currentDom = document.getElementById(currentScreenId);
  const nextDom = document.getElementById(screenId);

  if (!nextDom) {
    console.error(`Screen ID ${screenId} does not exist.`);
    return;
  }

  lastScreenId = currentScreenId;
  currentScreenId = screenId;

  if (currentDom) currentDom.classList.remove('active');
  nextDom.classList.add('active');

  const bottomNav = document.getElementById('app-bottom-nav');
  if (nextDom.classList.contains('no-nav')) {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = 'flex';
  }

  updateBottomNavActiveState(screenId);

  const keyboard = document.getElementById('simulated-keyboard');
  if (keyboard) keyboard.style.height = '0px';

  if (!skipSave && db.currentUser) {
    db.lastScreen = SAFE_MAIN_SCREENS.includes(screenId) ? screenId : db.lastScreen;
    localStorage.setItem('brainly_state', JSON.stringify(db));
  }
}

function updateBottomNavActiveState(screenId) {
  document.querySelectorAll('.bottom-nav-item').forEach(tab => tab.classList.remove('active'));

  if (screenId === 'scr-home') {
    document.querySelector('[data-nav="home"]')?.classList.add('active');
  } else if (['scr-routine', 'scr-learning-cards', 'scr-social-scenarios'].includes(screenId)) {
    document.querySelector('[data-nav="activities"]')?.classList.add('active');
  } else if (screenId === 'scr-progress') {
    document.querySelector('[data-nav="progress"]')?.classList.add('active');
  } else if (screenId === 'scr-settings') {
    document.querySelector('[data-nav="profile"]')?.classList.add('active');
  }
}

// ----------------------------------------------------
// SCREEN POPULATION ENGINE
// ----------------------------------------------------

function refreshAllScreensUI() {
  if (!db.childProfile) return;

  recalculateProgress();
  generateAISuggestions();

  updateHomeDashboardUI();
  updateSettingsUI();
  updateRoutineScreenUI();
  renderLearningCardsGrid();
  updateSocialScenariosUI();
  updateProgressDashboardUI();
  renderAISuggestionsList();
}

function updateHomeDashboardUI() {
  const childName = db.childProfile.name;
  document.querySelectorAll('.lbl-child-name').forEach(el => { el.textContent = childName; });

  const pct = db.progressData.overallProgress || 0;
  const total = db.progressData.totalCompleted || 0;

  const homePct = document.getElementById('home-progress-pct');
  const homeRing = document.getElementById('home-progress-ring');
  const homeCount = document.getElementById('home-completed-count');

  if (homePct) homePct.textContent = `${pct}%`;
  if (homeRing) homeRing.style.background = `conic-gradient(var(--primary) 0% ${pct}%, var(--border-color) ${pct}% 100%)`;
  if (homeCount) homeCount.textContent = `Completed Activities: ${total} / ${TOTAL_ACTIVITIES}`;

  // AI suggestion preview from top recommendation
  const topRec = db.aiRecommendations[0];
  const previewTitle = document.getElementById('txt-db-routine-title');
  const previewText = document.getElementById('txt-db-routine-suggestion');
  if (topRec && previewTitle && previewText) {
    previewTitle.textContent = topRec.category || "Today's Suggestion";
    previewText.textContent = topRec.suggestionText;
  }

  // Continue Last Activity card
  const continueCard = document.getElementById('continue-activity-card');
  const continueTitle = document.getElementById('continue-activity-title');
  const continueIcon = document.getElementById('continue-activity-icon');

  if (db.lastActivity && continueCard) {
    continueCard.style.display = 'flex';
    if (continueTitle) continueTitle.textContent = db.lastActivity.title;
    if (continueIcon) continueIcon.textContent = db.lastActivity.icon || '▶';

    continueCard.onclick = () => resumeLastActivity();
    continueCard.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') resumeLastActivity();
    };
  } else if (continueCard) {
    continueCard.style.display = 'none';
  }
}

function resumeLastActivity() {
  if (!db.lastActivity) return;
  const { type, id } = db.lastActivity;

  if (type === 'routine') openRoutineDetail(id);
  else if (type === 'card') openLearningQuiz(id);
  else if (type === 'scenario') openSocialQuiz(id);
}

function updateSettingsUI() {
  const setDetails = document.getElementById('set-child-details');
  if (setDetails && db.childProfile) {
    setDetails.innerHTML = `
      <strong>${db.childProfile.name}</strong>, Age ${db.childProfile.age}<br>
      Level: ${db.childProfile.supportLevel}<br>
      Focus: ${db.childProfile.mainFocus}
    `;
  }

  const roleBadge = document.getElementById('set-user-role');
  if (roleBadge && db.currentUser) {
    roleBadge.textContent = `Role: ${db.currentUser.role || 'Parent'}`;
  }

  // Profile setup form fields
  const pName = document.getElementById('ip-child-name');
  if (pName) pName.value = db.childProfile.name;
  const pAge = document.getElementById('ip-child-age');
  if (pAge) pAge.value = db.childProfile.age;
  const pLevel = document.getElementById('ip-child-level');
  if (pLevel) pLevel.value = db.childProfile.supportLevel;
  const pFocus = document.getElementById('ip-child-focus');
  if (pFocus) pFocus.value = db.childProfile.mainFocus;
  const pNotes = document.getElementById('ip-child-notes');
  if (pNotes) pNotes.value = db.childProfile.notes || '';
}

function updateRoutineScreenUI() {
  const routineProgressText = document.getElementById('routine-progress-text');
  if (routineProgressText) {
    routineProgressText.textContent = `Daily Routine Progress: ${db.progressData.completedRoutineCount} / ${TOTAL_ROUTINES} completed`;
  }
  const routineProgressFill = document.getElementById('routine-progress-fill');
  if (routineProgressFill) {
    routineProgressFill.style.width = `${(db.progressData.completedRoutineCount / TOTAL_ROUTINES) * 100}%`;
  }
  renderRoutineList();
}

function renderRoutineList() {
  const container = document.getElementById('routine-list-container');
  if (!container) return;

  container.innerHTML = '';
  db.routineTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `activity-card ${task.isCompleted ? 'completed' : ''}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${task.title} routine task`);

    card.addEventListener('click', () => openRoutineDetail(task.taskId));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openRoutineDetail(task.taskId);
    });

    card.innerHTML = `
      <div class="activity-card-icon" aria-hidden="true">${task.icon}</div>
      <div class="activity-card-info">
        <div class="activity-card-title">${task.title}</div>
        <div class="activity-card-category">${task.category}</div>
        <div class="activity-card-status">${task.isCompleted ? '✓ Completed' : 'Not Started'}</div>
      </div>
      <button class="activity-card-btn ${task.isCompleted ? 'btn-task-completed' : 'btn-task-start'}" aria-label="${task.isCompleted ? 'Review' : 'Start'} ${task.title}">
        ${task.isCompleted ? 'Review' : 'Start'}
      </button>
    `;

    container.appendChild(card);
  });
}

function renderLearningCardsGrid() {
  const container = document.getElementById('learning-cards-container');
  if (!container) return;

  // Update cards progress bar
  const cardsProgressText = document.getElementById('cards-progress-text');
  const cardsProgressFill = document.getElementById('cards-progress-fill');
  if (cardsProgressText) {
    cardsProgressText.textContent = `Learning Cards: ${db.progressData.completedCardCount} / ${TOTAL_CARDS} completed`;
  }
  if (cardsProgressFill) {
    cardsProgressFill.style.width = `${(db.progressData.completedCardCount / TOTAL_CARDS) * 100}%`;
  }

  container.innerHTML = '';

  const activePill = document.querySelector('.category-pill.active');
  const activeCategory = activePill ? activePill.dataset.category : 'All';

  const filteredCards = activeCategory === 'All'
    ? db.learningCards
    : db.learningCards.filter(c => c.category === activeCategory);

  const correctIds = getUniqueCorrectCardIds();

  filteredCards.forEach(card => {
    const cardEl = document.createElement('div');
    const isDone = correctIds.has(card.cardId);
    cardEl.className = `learning-card ${isDone ? 'completed' : ''}`;
    cardEl.setAttribute('role', 'button');
    cardEl.setAttribute('tabindex', '0');
    cardEl.setAttribute('aria-label', `Learning card: ${card.title}`);

    cardEl.addEventListener('click', () => openLearningQuiz(card.cardId));
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openLearningQuiz(card.cardId);
    });

    cardEl.innerHTML = `
      <div class="learning-card-avatar" aria-hidden="true">${card.imageUrl}</div>
      <div class="learning-card-label">${card.title}</div>
      <div class="learning-card-category">${card.category}</div>
      ${isDone ? '<span class="learning-card-badge">✓ Done</span>' : ''}
    `;
    container.appendChild(cardEl);
  });
}

function updateSocialScenariosUI() {
  const scenProgressText = document.getElementById('scenarios-progress-text');
  const scenProgressFill = document.getElementById('scenarios-progress-fill');
  if (scenProgressText) {
    scenProgressText.textContent = `Social Scenarios: ${db.progressData.completedScenarioCount} / ${TOTAL_SCENARIOS} completed`;
  }
  if (scenProgressFill) {
    scenProgressFill.style.width = `${(db.progressData.completedScenarioCount / TOTAL_SCENARIOS) * 100}%`;
  }
  renderSocialScenariosList();
}

function renderSocialScenariosList() {
  const container = document.getElementById('social-scenarios-container');
  if (!container) return;

  container.innerHTML = '';
  const correctIds = getUniqueCorrectScenarioIds();

  db.socialScenarios.forEach(scen => {
    const cardEl = document.createElement('div');
    const isDone = correctIds.has(scen.scenarioId);
    cardEl.className = `activity-card ${isDone ? 'completed' : ''}`;
    cardEl.setAttribute('role', 'button');
    cardEl.setAttribute('tabindex', '0');
    cardEl.setAttribute('aria-label', `Social scenario: ${scen.title}`);

    cardEl.addEventListener('click', () => openSocialQuiz(scen.scenarioId));
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openSocialQuiz(scen.scenarioId);
    });

    cardEl.innerHTML = `
      <div class="activity-card-icon" style="background-color:var(--accent-green-light);color:var(--accent-green)" aria-hidden="true">${scen.icon}</div>
      <div class="activity-card-info">
        <div class="activity-card-title">${scen.title}</div>
        <div class="activity-card-status">
          <span class="scenario-pill ${scen.difficulty === 'Easy' ? 'scenario-easy' : 'scenario-medium'}">${scen.difficulty}</span>
          ${isDone ? '<span style="color:var(--accent-green);margin-left:5px;font-weight:700">✓ Done</span>' : ''}
        </div>
      </div>
      <button class="activity-card-btn btn-task-start" style="background-color:var(--accent-green-light);color:var(--accent-green)" aria-label="${isDone ? 'Review' : 'Play'} ${scen.title}">
        ${isDone ? 'Review' : 'Play'}
      </button>
    `;
    container.appendChild(cardEl);
  });
}

function updateProgressDashboardUI() {
  recalculateProgress();

  const progressPctText = document.getElementById('txt-progress-overall-pct');
  const dummyCircle = document.getElementById('progress-circle-dummy');
  if (progressPctText && dummyCircle) {
    const pct = db.progressData.overallProgress;
    progressPctText.textContent = `${pct}%`;
    dummyCircle.style.background = `conic-gradient(var(--primary) 0% ${pct}%, var(--border-color) ${pct}% 100%)`;
  }

  const lblRoutines = document.getElementById('lbl-stat-routines');
  const fillRoutines = document.getElementById('fill-stat-routines');
  if (lblRoutines && fillRoutines) {
    lblRoutines.textContent = `${db.progressData.completedRoutineCount} / ${TOTAL_ROUTINES}`;
    fillRoutines.style.width = `${(db.progressData.completedRoutineCount / TOTAL_ROUTINES) * 100}%`;
  }

  const lblCards = document.getElementById('lbl-stat-cards');
  const fillCards = document.getElementById('fill-stat-cards');
  if (lblCards && fillCards) {
    lblCards.textContent = `${db.progressData.completedCardCount} / ${TOTAL_CARDS}`;
    fillCards.style.width = `${(db.progressData.completedCardCount / TOTAL_CARDS) * 100}%`;
  }

  const lblScenarios = document.getElementById('lbl-stat-scenarios');
  const fillScenarios = document.getElementById('fill-stat-scenarios');
  if (lblScenarios && fillScenarios) {
    lblScenarios.textContent = `${db.progressData.completedScenarioCount} / ${TOTAL_SCENARIOS}`;
    fillScenarios.style.width = `${(db.progressData.completedScenarioCount / TOTAL_SCENARIOS) * 100}%`;
  }

  const lblTotal = document.getElementById('lbl-stat-total');
  if (lblTotal) {
    lblTotal.textContent = `${db.progressData.totalCompleted} / ${TOTAL_ACTIVITIES}`;
  }

  const lblUpdated = document.getElementById('lbl-progress-updated');
  if (lblUpdated && db.progressData.updatedAt) {
    const date = new Date(db.progressData.updatedAt);
    lblUpdated.textContent = `Last updated: ${date.toLocaleString()}`;
  }

  // Recent activity list
  const recentList = document.getElementById('recent-activity-list');
  if (recentList) {
    const activities = getRecentActivities(3);
    if (activities.length === 0) {
      recentList.innerHTML = '<li class="recent-activity-empty">No activities completed yet. Start with a daily routine task.</li>';
    } else {
      recentList.innerHTML = activities.map(a => `<li>${a.label}</li>`).join('');
    }
  }
}

function renderAISuggestionsList() {
  const container = document.getElementById('ai-suggestions-list');
  if (!container) return;

  container.innerHTML = '';
  db.aiRecommendations.forEach((rec, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    const priorityColor = rec.priority === 'high' ? 'var(--accent-red)' : rec.priority === 'medium' ? 'var(--accent-orange)' : 'var(--primary)';
    card.style.borderLeft = `4px solid ${priorityColor}`;
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="font-weight:700;font-size:14px;color:var(--primary-dark)">${rec.category}</div>
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:${priorityColor}">${rec.priority}</span>
      </div>
      <div style="font-size:13px;line-height:1.4;color:var(--text-medium)">${rec.suggestionText}</div>
    `;
    container.appendChild(card);
  });

  // Update AI summary banner
  const banner = document.getElementById('ai-summary-banner');
  if (banner && db.childProfile) {
    const name = db.childProfile.name;
    const total = db.progressData.totalCompleted || 0;
    banner.innerHTML = `Based on today's activities, <span class="lbl-child-name">${name}</span> has completed ${total} of ${TOTAL_ACTIVITIES} activities. Keep sessions short and positive.`;
  }
}

// ----------------------------------------------------
// ROUTINE DETAIL CONTROLLER
// ----------------------------------------------------

function openRoutineDetail(taskId) {
  activeTaskId = taskId;
  const task = db.routineTasks.find(t => t.taskId === taskId);
  if (!task) return;

  setLastActivity('routine', taskId, task.title, task.icon);

  const container = document.getElementById('routine-detail-screen-content');
  if (!container) return;

  const titleEl = document.getElementById('lbl-routine-detail-title');
  if (titleEl) titleEl.textContent = task.title;

  const steps = ROUTINE_STEPS[task.title] || [
    `Prepare for ${task.title}.`,
    'Focus on the task step-by-step.',
    'Ask a parent or teacher if you need help.',
    'Complete the last step calmly.',
    'Mark as done and celebrate your progress!'
  ];

  const stepsHtml = steps.map((s, idx) => `
    <div class="step-item">
      <div class="step-number">${idx + 1}</div>
      <div class="step-text">${s}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:72px;margin:12px 0;" aria-hidden="true">${task.icon}</div>
      <h2 style="font-size:24px;font-weight:800;color:var(--text-dark);">${task.title}</h2>
      <p style="color:var(--text-medium);font-size:13px;margin-top:4px;">${task.category}</p>
      <p style="color:var(--text-medium);font-size:14px;margin-top:6px;">Let's complete this activity step by step.</p>
    </div>

    <div class="steps-container">
      ${stepsHtml}
    </div>

    <div id="routine-success" class="routine-success-modal ${task.isCompleted ? 'active' : ''}">
      <h3>Great job!</h3>
      <p>${task.isCompleted ? 'You have already completed this activity.' : 'Routine completed successfully 🎉'}</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px;">
      <button class="btn btn-primary" id="btn-complete-routine-task" ${task.isCompleted ? 'disabled style="opacity:0.6"' : ''} aria-label="Mark routine as completed">
        ${task.isCompleted ? 'Already Done' : 'Mark as Completed'}
      </button>
      ${task.isCompleted ? '<button class="btn btn-outline" id="btn-undo-routine-task" aria-label="Undo routine completion">Undo Completion</button>' : ''}
      <button class="btn btn-outline" id="btn-back-to-routines" aria-label="Back to routines list">Back to Routines</button>
    </div>
  `;

  const compBtn = document.getElementById('btn-complete-routine-task');
  if (compBtn && !task.isCompleted) {
    compBtn.addEventListener('click', () => completeRoutineTask(taskId));
  }

  const undoBtn = document.getElementById('btn-undo-routine-task');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => undoRoutineTask(taskId));
  }

  document.getElementById('btn-back-to-routines')?.addEventListener('click', () => {
    showScreen('scr-routine');
  });

  showScreen('scr-routine-detail');
}

function completeRoutineTask(taskId) {
  const task = db.routineTasks.find(t => t.taskId === taskId);
  if (!task || task.isCompleted) return;

  task.isCompleted = true;
  task.completedAt = new Date().toISOString();

  recalculateProgress();
  generateAISuggestions();
  saveDB();

  const successModal = document.getElementById('routine-success');
  if (successModal) {
    successModal.classList.add('active');
    successModal.querySelector('p').textContent = 'Routine completed successfully 🎉';
  }

  const compBtn = document.getElementById('btn-complete-routine-task');
  if (compBtn) {
    compBtn.disabled = true;
    compBtn.textContent = 'Already Done';
    compBtn.style.opacity = 0.6;
  }

  // Add undo button if not present
  if (!document.getElementById('btn-undo-routine-task')) {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-outline';
    undoBtn.id = 'btn-undo-routine-task';
    undoBtn.setAttribute('aria-label', 'Undo routine completion');
    undoBtn.textContent = 'Undo Completion';
    undoBtn.addEventListener('click', () => undoRoutineTask(taskId));
    compBtn?.parentNode?.insertBefore(undoBtn, compBtn.nextSibling);
  }
}

function undoRoutineTask(taskId) {
  const task = db.routineTasks.find(t => t.taskId === taskId);
  if (!task) return;

  task.isCompleted = false;
  task.completedAt = null;

  recalculateProgress();
  generateAISuggestions();
  saveDB();

  openRoutineDetail(taskId);
}

// ----------------------------------------------------
// LEARNING CARD QUIZ CONTROLLER
// ----------------------------------------------------

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function openLearningQuiz(cardId) {
  const card = db.learningCards.find(c => c.cardId === cardId);
  if (!card) return;

  db.currentQuizCard = card;
  setLastActivity('card', cardId, card.title, card.imageUrl);

  const container = document.getElementById('learning-quiz-screen-content');
  if (!container) return;

  // Generate 2 wrong answers from other learning cards
  const otherCards = db.learningCards.filter(c => c.cardId !== cardId);
  const distractors = shuffleArray(otherCards).slice(0, 2).map(c => c.correctAnswer);
  const options = shuffleArray([card.correctAnswer, ...distractors]);

  const optionsHtml = options.map(opt => `
    <button class="quiz-btn-option" data-option="${opt}" aria-label="Answer: ${opt}">${opt}</button>
  `).join('');

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:12px;">
      <span class="learning-card-category">${card.category}</span>
    </div>
    <div class="quiz-media-container" aria-hidden="true">${card.imageUrl}</div>
    <div class="quiz-question">What is this?</div>
    <div class="quiz-options" id="quiz-card-choices">
      ${optionsHtml}
    </div>
    <div class="quiz-feedback-box" id="quiz-card-feedback" role="alert"></div>
    <div style="display:flex;gap:12px;margin-top:20px;visibility:hidden" id="quiz-card-nav-buttons">
      <button class="btn btn-outline" id="btn-back-learning" aria-label="Back to learning cards">Categories</button>
      <button class="btn btn-primary" id="btn-next-learning" aria-label="Next learning card">Next Card</button>
    </div>
  `;

  container.querySelectorAll('.quiz-btn-option').forEach(btn => {
    btn.addEventListener('click', () => submitLearningAnswer(btn.dataset.option));
  });

  document.getElementById('btn-back-learning')?.addEventListener('click', () => {
    showScreen('scr-learning-cards');
  });

  document.getElementById('btn-next-learning')?.addEventListener('click', () => {
    const nextId = getNextCardId(cardId);
    if (nextId) openLearningQuiz(nextId);
    else showScreen('scr-learning-cards');
  });

  showScreen('scr-learning-quiz');
}

function submitLearningAnswer(selectedAnswer) {
  const card = db.currentQuizCard;
  if (!card) return;

  const isCorrect = selectedAnswer === card.correctAnswer;
  const feedback = document.getElementById('quiz-card-feedback');
  const choiceButtons = document.querySelectorAll('.quiz-btn-option');

  choiceButtons.forEach(b => { b.style.pointerEvents = 'none'; });

  const newResult = {
    childId: db.childProfile.childId,
    cardId: card.cardId,
    selectedAnswer,
    isCorrect,
    completedAt: new Date().toISOString()
  };
  db.cardResult.push(newResult);

  feedback.className = 'quiz-feedback-box active';

  if (isCorrect) {
    choiceButtons.forEach(b => {
      if (b.dataset.option === selectedAnswer) b.classList.add('correct');
    });
    feedback.classList.add('correct');
    feedback.textContent = 'Correct! Great job.';
  } else {
    choiceButtons.forEach(b => {
      if (b.dataset.option === selectedAnswer) b.classList.add('wrong');
      if (b.dataset.option === card.correctAnswer) b.classList.add('correct');
    });
    feedback.classList.add('wrong');
    feedback.textContent = 'Try again.';
  }

  recalculateProgress();
  generateAISuggestions();
  saveDB();

  const navButtons = document.getElementById('quiz-card-nav-buttons');
  if (navButtons) navButtons.style.visibility = 'visible';
}

function getNextCardId(currentCardId) {
  const currentCard = db.learningCards.find(c => c.cardId === currentCardId);
  if (!currentCard) return null;

  const currentIndex = db.learningCards.findIndex(c => c.cardId === currentCardId);

  // Try next card in same category
  const sameCategory = db.learningCards.filter(c => c.category === currentCard.category);
  const catIndex = sameCategory.findIndex(c => c.cardId === currentCardId);
  if (catIndex < sameCategory.length - 1) {
    return sameCategory[catIndex + 1].cardId;
  }

  // Otherwise next card in master list
  if (currentIndex < db.learningCards.length - 1) {
    return db.learningCards[currentIndex + 1].cardId;
  }

  return null;
}

// ----------------------------------------------------
// SOCIAL SCENARIO QUIZ CONTROLLER
// ----------------------------------------------------

function openSocialQuiz(scenarioId) {
  const scen = db.socialScenarios.find(s => s.scenarioId === scenarioId);
  if (!scen) return;

  db.currentQuizScenario = scen;
  setLastActivity('scenario', scenarioId, scen.title, scen.icon);

  const container = document.getElementById('social-quiz-screen-content');
  if (!container) return;

  const optionsHtml = scen.options.map(opt => `
    <button class="quiz-btn-option" data-option="${opt}" aria-label="Answer: ${opt}">${opt}</button>
  `).join('');

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:12px;">
      <span class="scenario-pill ${scen.difficulty === 'Easy' ? 'scenario-easy' : 'scenario-medium'}">${scen.difficulty}</span>
    </div>
    <div class="quiz-media-container" style="background-color:var(--accent-green-light);color:var(--accent-green)" aria-hidden="true">${scen.icon}</div>
    <h2 style="font-size:16px;font-weight:700;text-align:center;margin-bottom:8px;">${scen.title}</h2>
    <div class="quiz-question" style="font-size:16px;">${scen.question}</div>
    <div class="quiz-options" id="quiz-social-choices">
      ${optionsHtml}
    </div>
    <div class="quiz-feedback-box" id="quiz-social-feedback" role="alert"></div>
    <div style="display:flex;gap:12px;margin-top:20px;visibility:hidden" id="quiz-social-nav-buttons">
      <button class="btn btn-outline" id="btn-back-social" aria-label="Back to social scenarios">All Scenarios</button>
      <button class="btn btn-primary" id="btn-next-social" aria-label="Next social scenario">Next Scenario</button>
    </div>
  `;

  container.querySelectorAll('.quiz-btn-option').forEach(btn => {
    btn.addEventListener('click', () => submitScenarioAnswer(btn.dataset.option));
  });

  document.getElementById('btn-back-social')?.addEventListener('click', () => {
    showScreen('scr-social-scenarios');
  });

  document.getElementById('btn-next-social')?.addEventListener('click', () => {
    const nextId = getNextScenarioId(scenarioId);
    if (nextId) openSocialQuiz(nextId);
    else showScreen('scr-social-scenarios');
  });

  showScreen('scr-social-quiz');
}

function submitScenarioAnswer(selectedAnswer) {
  const scen = db.currentQuizScenario;
  if (!scen) return;

  const isCorrect = selectedAnswer === scen.correctAnswer;
  const feedback = document.getElementById('quiz-social-feedback');
  const choiceButtons = document.querySelectorAll('.quiz-btn-option');

  choiceButtons.forEach(b => { b.style.pointerEvents = 'none'; });

  const newResult = {
    childId: db.childProfile.childId,
    scenarioId: scen.scenarioId,
    selectedAnswer,
    isCorrect,
    completedAt: new Date().toISOString()
  };
  db.scenarioResult.push(newResult);

  feedback.className = 'quiz-feedback-box active';

  if (isCorrect) {
    choiceButtons.forEach(b => {
      if (b.dataset.option === selectedAnswer) b.classList.add('correct');
    });
    feedback.classList.add('correct');
    feedback.textContent = 'Great choice!';
  } else {
    choiceButtons.forEach(b => {
      if (b.dataset.option === selectedAnswer) b.classList.add('wrong');
      if (b.dataset.option === scen.correctAnswer) b.classList.add('correct');
    });
    feedback.classList.add('wrong');
    feedback.textContent = `Let's try again. A better answer is: ${scen.correctAnswer}`;
  }

  recalculateProgress();
  generateAISuggestions();
  saveDB();

  const navButtons = document.getElementById('quiz-social-nav-buttons');
  if (navButtons) navButtons.style.visibility = 'visible';
}

function getNextScenarioId(currentScenarioId) {
  const currentIndex = db.socialScenarios.findIndex(s => s.scenarioId === currentScenarioId);
  if (currentIndex < db.socialScenarios.length - 1) {
    return db.socialScenarios[currentIndex + 1].scenarioId;
  }
  return null;
}

// ----------------------------------------------------
// BINDINGS & SCREEN ACTIONS
// ----------------------------------------------------

function setupNavigationBindings() {
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.goto);
    });
  });

  document.querySelectorAll('.bottom-nav-item').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetNav = tab.dataset.nav;
      if (targetNav === 'home') showScreen('scr-home');
      else if (targetNav === 'activities') showScreen('scr-routine');
      else if (targetNav === 'progress') showScreen('scr-progress');
      else if (targetNav === 'profile') showScreen('scr-settings');
    });
  });
}

function setupAuthBindings() {
  document.getElementById('btn-login-submit')?.addEventListener('click', () => {
    const email = document.getElementById('ip-login-email')?.value || 'demo@brainly.edu';
    db.currentUser = { email, name: 'Sample Parent', role: 'Parent' };

    if (!db.childProfile) {
      db.childProfile = { ...DEFAULT_MOCK_DATA.childProfile };
    }
    recalculateProgress();
    generateAISuggestions();
    saveDB();
    showScreen('scr-home');
  });

  document.getElementById('btn-demo-submit')?.addEventListener('click', () => {
    continueAsDemoUser();
  });

  document.getElementById('btn-signup-submit')?.addEventListener('click', () => {
    const name = document.getElementById('ip-signup-name')?.value || 'Teacher Jane';
    const email = document.getElementById('ip-signup-email')?.value || 'jane@brainly.edu';
    const role = document.getElementById('ip-signup-role')?.value || 'Teacher';

    db.currentUser = { email, name, role };
    saveDB();
    showScreen('scr-profile-setup');
  });

  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      const keyboard = document.getElementById('simulated-keyboard');
      if (keyboard) keyboard.style.height = '180px';
    });
  });
}

function setupProfileSetupBindings() {
  document.getElementById('btn-save-profile')?.addEventListener('click', () => {
    const name = document.getElementById('ip-child-name')?.value || 'Adam';
    const age = parseInt(document.getElementById('ip-child-age')?.value) || 6;
    const level = document.getElementById('ip-child-level')?.value || 'Beginner';
    const focus = document.getElementById('ip-child-focus')?.value || 'Daily Routine';
    const notes = document.getElementById('ip-child-notes')?.value || '';

    db.childProfile = {
      childId: 'child_' + name.toLowerCase().replace(/\s+/g, '_'),
      name,
      age,
      supportLevel: level,
      mainFocus: focus,
      notes,
      createdAt: new Date().toISOString()
    };

    recalculateProgress();
    generateAISuggestions();
    saveDB();
    showScreen('scr-home');
  });
}

function setupRoutineBindings() {
  // Routine list interactions handled in renderRoutineList
}

function setupLearningBindings() {
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderLearningCardsGrid();
    });
  });
}

function setupSocialBindings() {
  // Social list interactions handled in renderSocialScenariosList
}

function setupSettingsBindings() {
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    // Logout goes to login screen but preserves demo data
    db.currentUser = null;
    db.lastScreen = null;
    localStorage.setItem('brainly_state', JSON.stringify(db));
    showScreen('scr-login');
  });

  document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
    showScreen('scr-profile-setup');
  });

  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    if (confirm('Reset all demo data? This will clear routines, cards, scenarios, progress, and AI suggestions.')) {
      resetToDefaultMock();
      showScreen('scr-home');
    }
  });
}

// ----------------------------------------------------
// DEV MODE: FIRESTORE EMULATOR VIEW (only with ?dev=true)
// ----------------------------------------------------

function setupPresentationHelper() {
  document.querySelectorAll('.db-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.db-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      db.activeTab = tab.dataset.col;
      renderInspector();
    });
  });

  document.getElementById('btn-inspector-reset')?.addEventListener('click', () => {
    if (confirm('Reset Mock DB back to starter values?')) {
      resetToDefaultMock();
    }
  });

  const helpToggle = document.getElementById('help-pill');
  const overlay = document.getElementById('help-overlay');
  const closeHelp = document.getElementById('btn-close-help');

  if (helpToggle && overlay && closeHelp) {
    helpToggle.addEventListener('click', () => overlay.classList.add('active'));
    closeHelp.addEventListener('click', () => overlay.classList.remove('active'));
  }
}

function renderInspector() {
  const inspectorContent = document.getElementById('db-inspector-content');
  if (!inspectorContent) return;

  const currentTab = db.activeTab;
  let jsonString = '';
  let descriptionStr = '';

  switch (currentTab) {
    case 'childProfile':
      jsonString = JSON.stringify(db.childProfile, null, 2);
      descriptionStr = 'Firestore collection <code>childProfiles</code>. Path <code>/childProfiles/{childId}</code>.';
      break;
    case 'routineTasks':
      jsonString = JSON.stringify(db.routineTasks, null, 2);
      descriptionStr = 'Firestore collection <code>routineTasks</code>. Path <code>/routineTasks/{taskId}</code>.';
      break;
    case 'learningCards':
      jsonString = JSON.stringify(db.learningCards.slice(0, 5), null, 2).replace(']', '  ... \n]');
      descriptionStr = 'Firestore collection <code>learningCards</code>. First 5 shown.';
      break;
    case 'cardResult':
      jsonString = JSON.stringify(db.cardResult, null, 2);
      descriptionStr = 'Firestore collection <code>cardResults</code>.';
      break;
    case 'socialScenarios':
      jsonString = JSON.stringify(db.socialScenarios.slice(0, 3), null, 2).replace(']', '  ... \n]');
      descriptionStr = 'Firestore collection <code>socialScenarios</code>. First 3 shown.';
      break;
    case 'scenarioResult':
      jsonString = JSON.stringify(db.scenarioResult, null, 2);
      descriptionStr = 'Firestore collection <code>scenarioResults</code>.';
      break;
    case 'progressData':
      jsonString = JSON.stringify(db.progressData, null, 2);
      descriptionStr = 'Firestore collection <code>progressData</code>. Computed on writes.';
      break;
    case 'aiRecommendations':
      jsonString = JSON.stringify(db.aiRecommendations, null, 2);
      descriptionStr = 'Firestore collection <code>aiRecommendations</code>. Rule-based for now.';
      break;
    case 'appState':
      jsonString = JSON.stringify({
        currentUser: db.currentUser,
        currentScreenId,
        lastScreenId,
        lastActivity: db.lastActivity
      }, null, 2);
      descriptionStr = 'Device-local app state (SharedPreferences equivalent).';
      break;
    default:
      jsonString = '{}';
  }

  inspectorContent.innerHTML = `<pre>${colorizeHtmlJson(jsonString)}</pre>`;

  const schemaInfo = document.getElementById('db-schema-label');
  if (schemaInfo) schemaInfo.innerHTML = descriptionStr;

  inspectorContent.classList.remove('flash-highlight');
  void inspectorContent.offsetWidth;
  inspectorContent.classList.add('flash-highlight');
}

function colorizeHtmlJson(jsonStr) {
  if (!jsonStr) return '';
  jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
        match = match.substring(0, match.length - 1);
        return `<span class="${cls}">${match}</span>:`;
      }
      cls = 'json-string';
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

function updateClock() {
  const clockEl = document.getElementById('phone-clock');
  if (clockEl) {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}`;
  }
}
