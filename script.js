// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAu_GIcdkekULGpgdi3PJU05e8LdaLC2JM",
  authDomain: "prayertracker-db2f2.firebaseapp.com",
  databaseURL: "https://prayertracker-db2f2-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "prayertracker-db2f2",
  storageBucket: "prayertracker-db2f2.firebasestorage.app",
  messagingSenderId: "152895762913",
  appId: "1:152895762913:web:af39deb7d8a46e921262a0",
  measurementId: "G-MHP7CMWGRD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
function writeUserData(userId, name, email, password) {
  // Create a new user in the database
  const db = getDatabase();
  const reference = ref(db, '/users/'+ userId );
  
  set(reference, {
    username: name,
    email: email,
    password: password,
    userId: userId
  });
} 
writeUserData('322389982', 'AHMAD', 'ahmad.f2001@hotmail.com', 'Asf732001'); // Example usage
// Main Application Script
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Set Ramadan date
  setRamadanDate();
  
  // Load resources from JSON
  loadResources();
  
  // Check auth status
  checkAuthStatus();
  
  // Initialize with home page
  showPage('home');
});

// Set Ramadan date display
function setRamadanDate() {
  const ramadanStart = new Date();
  ramadanStart.setMonth(2); // March (0-indexed)
  ramadanStart.setDate(22); // Example start date
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const endDate = new Date(ramadanStart);
  endDate.setDate(ramadanStart.getDate() + 29);
  
  const dateStr = `رمضان ${ramadanStart.toLocaleDateString('ar-EG', options)} - ${endDate.toLocaleDateString('ar-EG', options)}`;
  document.getElementById('ramadan-date').textContent = dateStr;
}

// Page Navigation
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('[id$="-page"]').forEach(page => {
    page.style.display = 'none';
  });
  
  // Show requested page
  const page = document.getElementById(`${pageId}-page`);
  if (page) {
    page.style.display = 'block';
  }
  
  // Special page handling
  if (pageId === 'tracker') {
    generateCalendar();
  } else if (pageId === 'profile') {
    loadProfilePage();
  } else if (pageId === 'admin') {
    loadAdminPage();
  }
}

// Calendar and Tracker Functions
const calendar = document.getElementById("calendar");
const trackerContainer = document.getElementById("tracker-container");
const trackerTitle = document.getElementById("tracker-title");
const trackerContent = document.getElementById("tracker-content");
const dayProgressBar = document.getElementById("day-progress-bar");

function generateCalendar() {
  calendar.innerHTML = '';
  const daysInMonth = 30;
  const currentDay = getCurrentRamadanDay();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.innerText = `اليوم ${day}`;
    
    // Highlight current day
    if (day === currentDay) {
      dayElement.style.border = "2px solid var(--secondary-color)";
    }
    
    dayElement.onclick = () => openTracker(day);
    calendar.appendChild(dayElement);
    updateDayStyle(dayElement, day);
  }
}

function getCurrentRamadanDay() {
  // In a real app, calculate based on actual Ramadan dates
  // For demo, we'll return day 10 as example
  return 10;
}

function openTracker(day) {
  const user = getCurrentUser();
  if (!user) {
    alert('الرجاء تسجيل الدخول لتسجيل متابعتك');
    toggleAuthModal();
    return;
  }
  
  trackerTitle.innerText = `اليوم ${day}`;
  trackerContent.innerHTML = document.getElementById("template-content").innerHTML;
  
  // Load saved data for this day
  trackerContent.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    const task = checkbox.getAttribute("data-task");
    const key = `${user.id}-day${day}-${task}`;
    checkbox.checked = localStorage.getItem(key) === "true";
    
    checkbox.onchange = () => {
      localStorage.setItem(key, checkbox.checked);
      updateDayStyle(document.querySelector(`.day:nth-child(${day})`), day);
      updateDayProgressBar(day);
    };
  });
  
  trackerContainer.style.display = "block";
  updateDayProgressBar(day);
}

function updateDayProgressBar(day) {
  const user = getCurrentUser();
  if (!user) return;
  
  const tasks = [
    "fajr", "dhuhr", "asr", "maghrib", "isha",
    "ghiba", "kazb", "kalam", "juz", "hizb",
    "rahm", "saim", "gedal", "eslah",
    "taraweh", "dohaw", "etkaf"
  ];
  
  const completedTasks = tasks.filter(task => {
    return localStorage.getItem(`${user.id}-day${day}-${task}`) === "true";
  }).length;
  
  const progress = (completedTasks / tasks.length) * 100;
  dayProgressBar.style.width = `${progress}%`;
  
  // Update progress bar color
  if (progress < 25) {
    dayProgressBar.style.backgroundColor = "red";
  } else if (progress >= 25 && progress < 50) {
    dayProgressBar.style.backgroundColor = "orange";
  } else if (progress >= 50 && progress < 75) {
    dayProgressBar.style.backgroundColor = "yellow";
  } else if (progress >= 75 && progress < 99) {
    dayProgressBar.style.backgroundColor = "lightgreen";
  } else {
    dayProgressBar.style.backgroundColor = "darkgreen";
  }
}

function updateDayStyle(dayElement, day) {
  const user = getCurrentUser();
  if (!user) return;
  
  const tasks = [
    "fajr", "dhuhr", "asr", "maghrib", "isha",
    "ghiba", "kazb", "kalam", "juz", "hizb",
    "rahm", "saim", "gedal", "eslah",
    "taraweh", "dohaw", "etkaf"
  ];
  
  const completedTasks = tasks.filter(task => {
    return localStorage.getItem(`${user.id}-day${day}-${task}`) === "true";
  }).length;
  
  const progress = (completedTasks / tasks.length) * 100;

  // Update background color
  if (progress < 25) {
    dayElement.style.backgroundColor = "red";
  } else if (progress >= 25 && progress < 50) {
    dayElement.style.backgroundColor = "orange";
  } else if (progress >= 50 && progress < 75) {
    dayElement.style.backgroundColor = "yellow";
  } else if (progress >= 75 && progress < 99) {
    dayElement.style.backgroundColor = "lightgreen";
  } else {
    dayElement.style.backgroundColor = "darkgreen";
  }

  // Mark as completed if all tasks are finished
  const allTasksCompleted = tasks.every(task => {
    return localStorage.getItem(`${user.id}-day${day}-${task}`) === "true";
  });
  
  dayElement.classList.toggle("completed", allTasksCompleted);
}

function goBack() {
  trackerContainer.style.display = "none";
}

// Resources Functions
function loadResources() {
  fetch('resources.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      displayResources(data.prayers, 'prayers-resources');
      displayResources(data.quran, 'quran-resources');
      displayResources(data.lessons, 'lessons-resources');
    })
    .catch(error => {
      console.error('Error loading resources:', error);
      loadDefaultResources();
    });
}

function displayResources(resources, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;
  
  container.innerHTML = '';
  
  resources.forEach(resource => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${resource.url}" target="_blank">${resource.title}</a>`;
    container.appendChild(li);
  });
}

function loadDefaultResources() {
  const defaultResources = {
    prayers: [
      { title: "الأذكار الموسمية", url: "https://d1.islamhouse.com/data/ar/ih_books/single/ar_athkar_almushafiah.pdf" },
      { title: "أدعية رمضان", url: "https://ar.islamway.net/collection/4746/%D8%A3%D8%AF%D8%B9%D9%8A%D8%A9-%D8%B1%D9%85%D8%B6%D8%A7%D9%86" }
    ],
    quran: [
      { title: "القرآن الكريم بقراءات متعددة", url: "https://quran.ksu.edu.sa/" },
      { title: "تلاوات للقراء المشهورين", url: "https://server.mp3quran.net/" }
    ],
    lessons: [
      { title: "دروس رمضانية", url: "https://ar.islamway.net/lessons?month=9" },
      { title: "سلسلة دروس رمضان", url: "https://www.youtube.com/playlist?list=PLxI8Ct9zH7e8jQ1uFQJiV1J3T1T1Z1Z1Z" }
    ]
  };
  
  displayResources(defaultResources.prayers, 'prayers-resources');
  displayResources(defaultResources.quran, 'quran-resources');
  displayResources(defaultResources.lessons, 'lessons-resources');
}

// User Authentication Functions
let currentUser = null;

function checkAuthStatus() {
  const user = getCurrentUser();
  const authLink = document.getElementById('auth-link');
  const profileLink = document.getElementById('profile-link');
  const adminLink = document.getElementById('admin-link');
  
  if (user) {
    authLink.textContent = 'تسجيل الخروج';
    authLink.onclick = logout;
    profileLink.style.display = 'block';
    
    // Set profile avatar
    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
      avatar.textContent = user.username.charAt(0).toUpperCase();
    }
    
    // Show admin link if user is admin
    if (user.isAdmin) {
      adminLink.style.display = 'block';
    } else {
      adminLink.style.display = 'none';
    }
  } else {
    authLink.textContent = 'تسجيل الدخول';
    authLink.onclick = toggleAuthModal;
    profileLink.style.display = 'none';
    adminLink.style.display = 'none';
  }
}

function toggleAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal.style.display === 'block') {
    modal.style.display = 'none';
  } else {
    modal.style.display = 'block';
    showLoginForm();
  }
}

function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('username').focus();
}

function showRegisterForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('reg-username').focus();
}

function closeModal() {
  document.getElementById('auth-modal').style.display = 'none';
  document.getElementById('reset-modal').style.display = 'none';
}

function register() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const message = document.getElementById('register-message');
  
  // Validation
  if (!username || !email || !password || !confirmPassword) {
    message.textContent = 'الرجاء ملء جميع الحقول';
    message.className = 'message error';
    return;
  }
  
  if (password !== confirmPassword) {
    message.textContent = 'كلمة المرور غير متطابقة';
    message.className = 'message error';
    return;
  }
  
  if (password.length < 6) {
    message.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    message.className = 'message error';
    return;
  }
  
  // Check if user exists
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userExists = users.some(u => u.username === username || u.email === email);
  
  if (userExists) {
    message.textContent = 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل';
    message.className = 'message error';
    return;
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password, // Note: In production, hash the password
    joinDate: new Date().toLocaleDateString('ar-EG'),
    isAdmin: users.length === 0 // First user is admin
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Auto-login
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  currentUser = newUser;
  
  message.textContent = 'تم إنشاء الحساب بنجاح!';
  message.className = 'message success';
  
  setTimeout(() => {
    closeModal();
    checkAuthStatus();
    showPage('profile');
  }, 1000);
}

function login() {
  const usernameOrEmail = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const message = document.getElementById('login-message');
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => 
    (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
    u.password === password
  );
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
    
    message.textContent = 'تم تسجيل الدخول بنجاح!';
    message.className = 'message success';
    
    setTimeout(() => {
      closeModal();
      checkAuthStatus();
      showPage(user.isAdmin ? 'admin' : 'profile');
    }, 1000);
  } else {
    message.textContent = 'اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة';
    message.className = 'message error';
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  checkAuthStatus();
  showPage('home');
}

function getCurrentUser() {
  if (currentUser) return currentUser;
  
  const userJson = localStorage.getItem('currentUser');
  if (userJson) {
    try {
      currentUser = JSON.parse(userJson);
      return currentUser;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  
  return null;
}

// Profile Page Functions
function loadProfilePage() {
  const user = getCurrentUser();
  if (!user) {
    showPage('home');
    return;
  }
  
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-join-date').textContent = user.joinDate;
  const avatar = document.getElementById('profile-avatar');
  if (avatar) {
    avatar.textContent = user.username.charAt(0).toUpperCase();
  }
  
  // Calculate remaining days
  const currentDay = getCurrentRamadanDay();
  const remainingDays = 30 - currentDay;
  const remainingDaysElement = document.getElementById('remaining-days');
  if (remainingDaysElement) {
    remainingDaysElement.textContent = remainingDays > 0 ? remainingDays : 'انتهى رمضان';
  }
  
  // Calculate user stats
  const stats = calculateUserStats();
  document.getElementById('completed-days').textContent = stats.completedDays;
  document.getElementById('completion-rate').textContent = `${stats.completionRate}%`;
  document.getElementById('completed-prayers').textContent = stats.completedPrayers;
  document.getElementById('completed-juz').textContent = stats.completedJuz;
}

function calculateUserStats() {
  const user = getCurrentUser();
  if (!user) return {
    completedDays: 0,
    completionRate: 0,
    completedPrayers: 0,
    completedJuz: 0
  };
  
  const prayerTasks = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  let completedDays = 0;
  let completedPrayers = 0;
  let completedJuz = 0;
  
  for (let day = 1; day <= 30; day++) {
    let dayCompleted = true;
    let dayPrayersCompleted = 0;
    
    // Check all tasks for this day
    const tasks = [
      "fajr", "dhuhr", "asr", "maghrib", "isha",
      "ghiba", "kazb", "kalam", "juz", "hizb",
      "rahm", "saim", "gedal", "eslah",
      "taraweh", "dohaw", "etkaf"
    ];
    
    tasks.forEach(task => {
      const key = `${user.id}-day${day}-${task}`;
      const isCompleted = localStorage.getItem(key) === "true";
      
      if (!isCompleted) dayCompleted = false;
      
      // Count prayers
      if (prayerTasks.includes(task) && isCompleted) {
        dayPrayersCompleted++;
      }
      
      // Count juz
      if (task === 'juz' && isCompleted) {
        completedJuz++;
      }
    });
    
    if (dayCompleted) completedDays++;
    completedPrayers += dayPrayersCompleted;
  }
  
  const completionRate = Math.round((completedDays / 30) * 100);
  
  return {
    completedDays,
    completionRate,
    completedPrayers,
    completedJuz
  };
}

function showResetConfirm() {
  document.getElementById('reset-modal').style.display = 'block';
}

function resetUserData() {
  const user = getCurrentUser();
  if (!user) return;
  
  // Delete all user-specific data
  for (let day = 1; day <= 30; day++) {
    const tasks = [
      "fajr", "dhuhr", "asr", "maghrib", "isha",
      "ghiba", "kazb", "kalam", "juz", "hizb",
      "rahm", "saim", "gedal", "eslah",
      "taraweh", "dohaw", "etkaf"
    ];
    
    tasks.forEach(task => {
      localStorage.removeItem(`${user.id}-day${day}-${task}`);
    });
  }
  
  closeModal();
  alert('تم إعادة تعيين بياناتك بنجاح');
  loadProfilePage();
  generateCalendar();
}
