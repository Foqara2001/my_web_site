// Admin Functions
function loadAdminPage() {
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    showPage('home');
    return;
  }
  
  loadUserStats();
}

function addResource() {
  const type = document.getElementById('resource-type').value;
  const title = document.getElementById('resource-title').value.trim();
  const url = document.getElementById('resource-url').value.trim();
  
  if (!title || !url) {
    alert('الرجاء إدخال عنوان المورد ورابطه');
    return;
  }
  
  // In a real app, this would send to a server
  // For demo, we'll update the UI directly
  const containerId = `${type}-resources`;
  const container = document.getElementById(containerId);
  
  if (container) {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${url}" target="_blank">${title}</a>`;
    container.appendChild(li);
  }
  
  // Clear form
  document.getElementById('resource-title').value = '';
  document.getElementById('resource-url').value = '';
  
  // Show success message
  alert('تم إضافة المورد بنجاح');
}

function loadUserStats() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const statsContainer = document.getElementById('user-stats');
  
  if (!statsContainer) return;
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <h4>إجمالي المستخدمين</h4>
      <p>${users.length}</p>
    </div>
    <div class="stat-card">
      <h4>المسجلون اليوم</h4>
      <p>${users.filter(u => new Date(u.joinDate).toDateString() === new Date().toDateString()).length}</p>
    </div>
    <div class="stat-card">
      <h4>المشرفون</h4>
      <p>${users.filter(u => u.isAdmin).length}</p>
    </div>
  `;
}

function exportData() {
  const data = {
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    trackerData: getAllTrackerData(),
    resources: getCurrentResources()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ramadan-tracker-export.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

function getAllTrackerData() {
  const data = {};
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  users.forEach(user => {
    data[user.id] = {};
    
    for (let day = 1; day <= 30; day++) {
      const dayData = {};
      const tasks = [
        "fajr", "dhuhr", "asr", "maghrib", "isha",
        "ghiba", "kazb", "kalam", "juz", "hizb",
        "rahm", "saim", "gedal", "eslah",
        "taraweh", "dohaw", "etkaf"
      ];
      
      tasks.forEach(task => {
        const key = `${user.id}-day${day}-${task}`;
        dayData[task] = localStorage.getItem(key) === "true";
      });
      
      data[user.id][`day${day}`] = dayData;
    }
  });
  
  return data;
}

function getCurrentResources() {
  // In a real app, this would fetch from server
  return {
    prayers: Array.from(document.querySelectorAll('#prayers-resources a')).map(a => ({
      title: a.textContent,
      url: a.href
    })),
    quran: Array.from(document.querySelectorAll('#quran-resources a')).map(a => ({
      title: a.textContent,
      url: a.href
    })),
    lessons: Array.from(document.querySelectorAll('#lessons-resources a')).map(a => ({
      title: a.textContent,
      url: a.href
    }))
  };
}

// Handle file import
document.getElementById('import-file').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.users) {
        localStorage.setItem('users', JSON.stringify(data.users));
      }
      
      if (data.trackerData) {
        for (const userId in data.trackerData) {
          for (const day in data.trackerData[userId]) {
            for (const task in data.trackerData[userId][day]) {
              const key = `${userId}-${day}-${task}`;
              localStorage.setItem(key, data.trackerData[userId][day][task]);
            }
          }
        }
      }
      
      if (data.resources) {
        displayResources(data.resources.prayers, 'prayers-resources');
        displayResources(data.resources.quran, 'quran-resources');
        displayResources(data.resources.lessons, 'lessons-resources');
      }
      
      alert('تم استيراد البيانات بنجاح');
      location.reload();
    } catch (error) {
      alert('خطأ في استيراد الملف: ' + error.message);
    }
  };
  reader.readAsText(file);
});