const firebaseConfig = {
  apiKey: "AIzaSyDP2DynJ9p0Vr66RhXk60GDbUpuyWtttW4",
  authDomain: "doodle-3-ddd7c.firebaseapp.com",
  projectId: "doodle-3-ddd7c",
  storageBucket: "doodle-3-ddd7c.firebasestorage.app",
  messagingSenderId: "470581618546",
  appId: "1:470581618546:web:2fb1b11a1738d8fe4b5feb",
  measurementId: "G-QXKPXL65LK"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


const pageOrder = [
  { id: "OpenPage", title: "《千年瓷都：瓷韵纪年》 Jingdezhen: A Ceramic Journey Through Time" },
  { id: "Login", title: "登录 · Login" },
  { id: "PreQuiz", title: "前测验 · Pre-Quiz" },
  { id: "Timeline", title: "时间线 · Timeline" },
  { id: "0cLrW719LZuvIwaxQkUd", title: "唐 Dynasty (618-907)" },
  { id: "bVGP7yOceFZC15z8MBVs", title: "宋 Dynasty (960-1279)" },
  { id: "Q1oXbLfen3tkHxZXAWsS", title: "元 Dynasty (1271-1368)" },
  { id: "P4maFlRPrBQ0HctbjBUV", title: "明 Dynasty (1368-1644)" },
  { id: "f2g7EQ1rHj5m6Bh3uKi1", title: "清 Dynasty (1644-1912)" },
  { id: "oqc1NPJUzW8oxAb6sY2d", title: "民国 Republic (1912-1949)" },
  { id: "FinalQuiz", title: "最终测验 · Final Quiz" },
  { id: "EndPage", title: "旅程结束 · Journey End" }
];


const audioMap = {
  OpenPage: 'https://ys216899.github.io/doodle-sounds/openpage_music.mp3',
  EndPage: 'https://ys216899.github.io/doodle-sounds/endpage_music.mp3',
  '0cLrW719LZuvIwaxQkUd': 'https://ys216899.github.io/doodle-sounds/tang_bgm.mp3',
  'bVGP7yOceFZC15z8MBVs': 'https://ys216899.github.io/doodle-sounds/song_bgm.mp3',
  'Q1oXbLfen3tkHxZXAWsS': 'https://ys216899.github.io/doodle-sounds/yuan_bgm.mp3',
  'P4maFlRPrBQ0HctbjBUV': 'https://ys216899.github.io/doodle-sounds/ming_bgm.mp3',
  'f2g7EQ1rHj5m6Bh3uKi1': 'https://ys216899.github.io/doodle-sounds/qing_bgm.mp3',
  'oqc1NPJUzW8oxAb6sY2d': 'https://ys216899.github.io/doodle-sounds/republic_bgm.mp3'
};


const avatarUrls = {
  cat: './avatar_cat.PNG',
  female: './avatar_female.PNG',
  male: './avatar_male.PNG'
};


const userId = 'user_' + Math.random().toString(36).substring(2, 15);


const app = Vue.createApp({
  data() {
    return {
      
      userName: "",
      avatarUrl: "",
      isLoggedIn: false,
      
      currentIndex: 0,
      pageData: {},
      isLoading: false,
      transitionState: "",
      
      dynastyLabels: [
  { id: "0cLrW719LZuvIwaxQkUd", name: "唐", en: "Tang", years: "618-907", color: "red" },
  { id: "bVGP7yOceFZC15z8MBVs", name: "宋", en: "Song", years: "960-1279", color: "orange" },
  { id: "Q1oXbLfen3tkHxZXAWsS", name: "元", en: "Yuan", years: "1271-1368", color: "yellow" },
  { id: "P4maFlRPrBQ0HctbjBUV", name: "明", en: "Ming", years: "1368-1644", color: "green" },
  { id: "f2g7EQ1rHj5m6Bh3uKi1", name: "清", en: "Qing", years: "1644-1912", color: "blue" },
  { id: "oqc1NPJUzW8oxAb6sY2d", name: "民国", en: "Republic", years: "1912-1949", color: "purple" }
],

      
      quizzes: [],
      finalQuizzes: [],
      currentQuiz: null,
      preQuizId: null,
      selectedOption: null,
      quizAnswered: false,
      quizCorrect: false,
      quizCountdown: 10,
      quizScore: 0,
      finalQuizIndex: 0,
      finalQuizCount: 2,
      finalQuizCompleted: false,
      
      selectedFavoriteDynasty: null,
      userFavoriteDynasty: null,
      similarUsers: 0,
      favoriteRanking: [],
leaderboardTop10: [],

      showModal: false,
      modalImage: { url: '', caption: '' },
      
      userRank: null,
      totalUsers: 0,
      userFeedback: "",
      userComments: [],
      
      audioPlayer: null,
      isPlaying: false,
      volume: 0.5,
      audioProgress: 0,
      audioDuration: 0,
      
      toasts: [],
      
      showAvatarModal: false,
      previewAvatarUrl: ''
    }
  },
  computed: {
    currentPage() {
      return pageOrder[this.currentIndex];
    },
    currentPageId() {
      return this.currentPage.id;
    },
    pageTitle() {
      return this.currentPage.title || "";
    },
    isDynastyPage() {
      return this.currentIndex >= 4 && this.currentIndex <= 9;
    },
    showLoginButton() {
      return this.currentIndex === 0;
    },
    showStart() {
      return this.currentIndex === 0;
    },
    showRestart() {
      return this.currentIndex === 11;
    },
    showPrev() {
      return this.isDynastyPage;
    },
    showNext() {
      return this.isDynastyPage && this.currentIndex < 9;
    },
    showEnd() {
      return this.currentIndex === 9;
    },
    showBackToTimeline() {
      return this.isDynastyPage;
    },
    allQuizzesAnswered() {
      return this.finalQuizIndex >= this.finalQuizCount;
    }
  },
  methods: {
    
    goToEraById(docId) {
  const idx = pageOrder.findIndex(p => p.id === docId);
  if (idx === -1) {
    this.showToast("页面未匹配 / Page not found", "error");
    return;
  }
  this.loadPage(idx);
},

    
    
    
    loadFavoriteRanking() {
  return db.collection("users").get().then((snapshot) => {
    const counts = {};
    snapshot.forEach((doc) => {
      const d = doc.data() || {};
      if (d.favoriteDynasty) {
        counts[d.favoriteDynasty] = (counts[d.favoriteDynasty] || 0) + 1;
      }
    });

    // 按人数从高到低排序
    this.favoriteRanking = Object.entries(counts)
      .map(([dynasty, count]) => ({ dynasty, count }))
      .sort((a, b) => b.count - a.count);
  }).catch((err) => {
    console.error("loadFavoriteRanking failed:", err);
    this.favoriteRanking = [];
  });
},

    
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    startLoading() {
      this.isLoading = true;
      this.transitionState = "fade-out";
      setTimeout(() => {
        this.transitionState = "fade-in";
        setTimeout(() => {
          this.isLoading = false;
          this.transitionState = "";
        }, 500);
      }, 300);
    },
    loadPage(index) {
      this.startLoading();
      this.currentIndex = index; 
      this.pageData = { description: "加载中... / Loading...", imageData: [] };
      this.scrollToTop();
      
      
      if (this.audioPlayer) {
        this.audioPlayer.pause();
        this.isPlaying = false;
      }
      
      const page = pageOrder[index];
      if (page.id === "OpenPage") {
        this.quizScore = 0;
        this.finalQuizCompleted = false;
        this.selectedFavoriteDynasty = null;
        this.userFeedback = "";
        this.loadOpenPage();
        this.setupAudioPlayer(audioMap.OpenPage);
      }
      else if (page.id === "Login") {
        
      }
      else if (page.id === "PreQuiz") {
        this.loadRandomQuiz(true);
      }
      else if (page.id === "Timeline") {
    
        
      }
      else if (page.id === "FinalQuiz") {
        this.loadFinalQuizzes();
      }
      else if (page.id === "EndPage") {
        this.loadEndPage();
        this.loadUserStats();
        this.loadUserComments();
        this.setupAudioPlayer(audioMap.EndPage);
      }
      else {
        this.loadDynastyPage(page.id);
        
        this.setupAudioPlayer(audioMap[page.id]);
      }
    },
    
    
// ====== Replace these methods as a block ======

loadOpenPage() {
  return this.loadCeramicsDoc("OpenPage");
},

loadEndPage() {
  return this.loadCeramicsDoc("EndPage");
},

// 通用：读取 ceramics 某个文档并塞给 this.pageData
loadCeramicsDoc(docId) {
  return db.collection("ceramics").doc(docId).get()
    .then((doc) => {
      if (doc.exists) {
  const data = doc.data() || {};

  const imgs = Array.isArray(data.imageData)
    ? data.imageData
    : Object.values(data.imageData || {});

  this.pageData = {
    description: data.description || "内容未找到 / Content not found",
    imageData: imgs
  };
}
 else {
        this.pageData = { description: "内容未找到 / Content not found", imageData: [] };
        this.showToast("加载失败 / Failed to load content", "error");
      }
    })
    .catch((error) => {
      console.error("Error getting document:", docId, error);
      this.pageData = { description: "内容未找到 / Content not found", imageData: [] };
      this.showToast("加载失败 / Failed to load content", "error");
    });
},

loadDynastyPage(docId) {
  // 先读内容
  this.loadCeramicsDoc(docId);

  // ⚠️ viewCount（可选）：如果你 Rules 把 ceramics 设成只读，这里会报权限错误
  // 你要彻底关掉就把下面这个开关设为 false
  const ENABLE_VIEWCOUNT = false;

  if (ENABLE_VIEWCOUNT) {
    db.collection("ceramics").doc(docId).update({
      viewCount: firebase.firestore.FieldValue.increment(1)
    }).catch(error => {
      // 不弹 Toast，避免影响用户体验；只在 console 留记录
      console.warn("viewCount update failed:", docId, error);
    });
  }
},

// EndPage：留言墙（头像 + 名字 + 留言），新留言在上面
loadUserComments() {
  // 只展示有 feedback 的用户
  // 按 timestamp 倒序（你保存 feedback 时有写 timestamp）
  return db.collection("users")
    .orderBy("timestamp", "desc")
    .get()
    .then((querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        const d = doc.data() || {};
        if (d.feedback && d.name) {
          list.push({
            name: d.name,
            feedback: d.feedback,
            avatar: d.avatarUrl || avatarUrls.cat
          });
        }
      });
      this.userComments = list;
    })
    .catch((error) => {
      console.error("Error loading comments:", error);
      this.userComments = [];
      this.showToast("加载评论失败 / Failed to load comments", "error");
    });
},

// ====== End replacement block ======

    
    
    handleLogin() {
      if (!this.userName.trim()) {
        this.showToast("请输入您的名字 / Please enter your name", "error");
        return;
      }
      if (!this.avatarUrl) {
        this.showToast("请选择您的头像 / Please select your avatar", "error");
        return;
      }
      
      db.collection("users").doc(userId).set({
        name: this.userName,
        avatarUrl: this.avatarUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).then(() => {
        this.isLoggedIn = true;
        this.showToast("欢迎, " + this.userName + " / Welcome, " + this.userName, "success");
        // Go to PreQuiz
        this.loadPage(2);
      }).catch(error => {
        console.error("Error saving user:", error);
        this.showToast("登录失败 / Login failed", "error");
      });
    },
    
    selectAvatar(url) {
      this.avatarUrl = url;
    },
    
    
    previewAvatar(url) {
      this.previewAvatarUrl = url;
      this.showAvatarModal = true;
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    },
    
    closeAvatarPreview() {
      this.showAvatarModal = false;
      document.body.style.overflow = ''; 
      
    },
    
    
    goToOpen() { this.loadPage(0); },
    goToLogin() { this.loadPage(1); },
    goToPreQuiz() { this.loadPage(2); },
    goToTimeline() { this.loadPage(3); },
    goToEra(index) { this.loadPage(index); },
    goToPreviousEra() {
      if (this.currentIndex > 4) this.loadPage(this.currentIndex - 1);
    },
    goToNextEra() {
      if (this.currentIndex < 9) this.loadPage(this.currentIndex + 1);
    },
    goToFinalQuiz() { this.loadPage(10); },
    goToEnd() { this.loadPage(11); },
    
    
    loadRandomQuiz(isPreQuiz) {
      db.collection("quizzes").get().then((querySnapshot) => {
        const allQuizzes = [];
        querySnapshot.forEach((doc) => {
          allQuizzes.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        const availableQuizzes = isPreQuiz ?
          allQuizzes :
          allQuizzes.filter(quiz => quiz.id !== this.preQuizId);
        
        if (availableQuizzes.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
          this.currentQuiz = availableQuizzes[randomIndex];
          if (isPreQuiz) {
            this.preQuizId = this.currentQuiz.id;
          }
          this.quizAnswered = false;
          this.selectedOption = null;
        } else {
          this.showToast("没有可用的测验题 / No available quizzes", "error");
          
          this.currentQuiz = {
            question: "题目未能加载 / Question failed to load",
            options: ["选项未能加载 / Options failed to load"],
            correctAnswer: "",
            explanation: "解释未能加载 / Explanation failed to load"
          };
        }
      }).catch(error => {
        console.error("Error getting quizzes:", error);
        this.showToast("加载测验失败 / Failed to load quiz", "error");
        
        this.currentQuiz = {
          question: "题目未能加载 / Question failed to load",
          options: ["选项未能加载 / Options failed to load"],
          correctAnswer: "",
          explanation: "解释未能加载 / Explanation failed to load"
        };
      });
    },
    
    loadFinalQuizzes() {
      this.finalQuizIndex = 0;
      this.finalQuizzes = [];
      db.collection("quizzes").get().then((querySnapshot) => {
        const allQuizzes = [];
        querySnapshot.forEach((doc) => {
          allQuizzes.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        const availableQuizzes = allQuizzes.filter(quiz => quiz.id !== this.preQuizId);
        if (availableQuizzes.length >= 2) {
          const shuffled = [...availableQuizzes].sort(() => 0.5 - Math.random());
          this.finalQuizzes = shuffled.slice(0, 2);
          this.currentQuiz = this.finalQuizzes[0];
          // Reset quiz state
          this.quizAnswered = false;
          this.selectedOption = null;
        } else {
          this.showToast("没有足够的测验题 / Not enough quizzes available", "error");
          
          this.currentQuiz = {
            question: "题目未能加载 / Question failed to load",
            options: ["选项未能加载 / Options failed to load"],
            correctAnswer: "",
            explanation: "解释未能加载 / Explanation failed to load"
          };
        }
      }).catch(error => {
        console.error("Error getting quizzes:", error);
        this.showToast("加载测验失败 / Failed to load quiz", "error");
        
        this.currentQuiz = {
          question: "题目未能加载 / Question failed to load",
          options: ["选项未能加载 / Options failed to load"],
          correctAnswer: "",
          explanation: "解释未能加载 / Explanation failed to load"
        };
      });
    },
    
    
    compareQuizAnswer(selectedOption, correctAnswer) {
      
      const selectedEnglish = selectedOption.split('/')[1] ? 
        selectedOption.split('/')[1].trim() : selectedOption.trim();
      const correctEnglish = correctAnswer.split('/')[1] ? 
        correctAnswer.split('/')[1].trim() : correctAnswer.trim();
      
      return selectedEnglish === correctEnglish;
    },
    
    answerPreQuiz(option) {
      this.selectedOption = option;
      this.quizAnswered = true;
      
      this.quizCorrect = this.compareQuizAnswer(option, this.currentQuiz.correctAnswer);
      
      
      if (this.quizCorrect) {
        this.quizScore++;
      }
      
      this.quizCountdown = 10;
      this.startQuizCountdown();
    },
    
    answerFinalQuiz(option) {
      this.selectedOption = option;
      this.quizAnswered = true;
      
      this.quizCorrect = this.compareQuizAnswer(option, this.currentQuiz.correctAnswer);
      
      if (this.quizCorrect) {
        this.quizScore++;
      }
      
      setTimeout(() => {
        this.finalQuizIndex++;
        if (this.finalQuizIndex < this.finalQuizCount) {
          
          this.currentQuiz = this.finalQuizzes[this.finalQuizIndex];
          this.quizAnswered = false;
          this.selectedOption = null;
        } else {
          this.finalQuizCompleted = true;
          
          db.collection("users").doc(userId).set({
            quizScore: this.quizScore,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }).then(() => {
            this.showToast("测验已完成 / Quiz completed", "success");
            setTimeout(() => {
              this.goToEnd();
            }, 2000);
          }).catch(error => {
            console.error("Error saving quiz score:", error);
          });
        }
      }, 2000);
    },
    
    startQuizCountdown() {
      
      const countdownInterval = setInterval(() => {
        this.quizCountdown--;
        if (this.quizCountdown <= 0) {
          clearInterval(countdownInterval);
         
          
          if (this.currentPageId === 'PreQuiz') {
            this.goToTimeline();
          }
        }
      }, 1000);
    },
    
    
    selectFavoriteDynasty(dynasty) {
      this.selectedFavoriteDynasty = dynasty;
    },
    
    submitFavoriteDynasty() {
      if (!this.selectedFavoriteDynasty) {
        this.showToast("请选择一个朝代 / Please select a dynasty", "info");
        return;
      }
      
      db.collection("users").doc(userId).set({
        favoriteDynasty: this.selectedFavoriteDynasty,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).then(() => {
        this.userFavoriteDynasty = this.selectedFavoriteDynasty;
        this.showToast("选择已保存 / Your choice has been saved", "success");
      }).catch(error => {
        console.error("Error saving favorite dynasty:", error);
        this.showToast("保存失败 / Failed to save", "error");
      });
    },
    
    
    openModal(image) {
      this.modalImage = image;
      this.showModal = true;
      document.body.style.overflow = 'hidden'; 
      
    },
    
    closeModal() {
      this.showModal = false;
      document.body.style.overflow = ''; 
      
    },
    
    
    setupAudioPlayer(audioUrl) {
      if (!audioUrl) return;
      
      
      this.audioPlayer = new Audio(audioUrl);
      this.audioPlayer.loop = true;
      this.audioPlayer.volume = this.volume;
      
      
      this.audioPlayer.addEventListener('timeupdate', () => {
        if (this.audioPlayer.duration) {
          this.audioProgress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        }
      });
      
      this.audioPlayer.addEventListener('loadedmetadata', () => {
        this.audioDuration = this.audioPlayer.duration;
      });
      
      
      this.playAudio();
    },
    
    playAudio() {
      if (!this.audioPlayer) return;
      
      this.audioPlayer.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(error => {
          console.error("Audio play error:", error);
          this.isPlaying = false;
        });
    },
    
    pauseAudio() {
      if (!this.audioPlayer) return;
      this.audioPlayer.pause();
      this.isPlaying = false;
    },
    
    toggleAudio() {
      if (this.isPlaying) {
        this.pauseAudio();
      } else {
        this.playAudio();
      }
    },
    
    updateVolume() {
      if (this.audioPlayer) {
        this.audioPlayer.volume = this.volume;
      }
    },
    
    setAudioProgress(event) {
      if (!this.audioPlayer || !this.audioDuration) return;
      
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const position = (event.clientX - rect.left) / rect.width;
      this.audioPlayer.currentTime = position * this.audioDuration;
    },
    
    
    loadUserStats() {
      
      db.collection("users").doc(userId).get().then(doc => {
        if (doc.exists) {
          const userData = doc.data();
          this.userFavoriteDynasty = userData.favoriteDynasty;
          this.userName = userData.name || this.userName;
          this.avatarUrl = userData.avatarUrl || this.avatarUrl;
        }
      });
      
      
      db.collection("users").get().then(snapshot => {
        this.totalUsers = snapshot.size;
      });
      
  
      
      if (this.userFavoriteDynasty) {
        db.collection("users")
          .where("favoriteDynasty", "==", this.userFavoriteDynasty)
          .get()
          .then(querySnapshot => {
            this.similarUsers = querySnapshot.size;
         
        
        });
      }
      
      
      db.collection("users")
        .orderBy("quizScore", "desc")
        .get()
        .then(querySnapshot => {
          const allUsers = [];
    querySnapshot.forEach(doc => {
      const d = doc.data() || {};
      allUsers.push({
        id: doc.id,
        name: d.name || "Anonymous",
        avatarUrl: d.avatarUrl || avatarUrls.cat,
        quizScore: d.quizScore || 0,
        feedback: d.feedback || ""
      });
    });

    // ✅ 前10名榜单（给 EndPage 显示）
    this.leaderboardTop10 = allUsers.slice(0, 10);

    // ✅ 当前用户排名
    const userIndex = allUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.userRank = userIndex + 1;
    }
  });
    },
    
    submitFeedback() {
      if (!this.userFeedback.trim()) {
        this.showToast("请输入反馈 / Please enter your feedback", "info");
        return;
      }
      
      db.collection("users").doc(userId).update({
        feedback: this.userFeedback,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        this.showToast("感谢您的反馈 / Thank you for your feedback", "success");
        
        // ？？Add the new feedback to the comments list
        if (this.userName) {
          this.userComments.push({
            name: this.userName,
            feedback: this.userFeedback,
            avatar: this.avatarUrl || avatarUrls.cat
          });
        }
        
        this.userFeedback = ""; // Clear the input
      }).catch(error => {
        console.error("Error saving feedback:", error);
        this.showToast("提交失败 / Submission failed", "error");
      });
    },
    
    
    showToast(message, type = 'info') {
      // Add toast
      const toast = {
        id: Date.now(),
        message,
        type
      };
      
      this.toasts.push(toast);
      
      
      setTimeout(() => {
        const index = this.toasts.findIndex(t => t.id === toast.id);
        if (index !== -1) {
          this.toasts.splice(index, 1);
        }
      }, 3000);
    }
  },
  
  
  mounted() {
    
    this.loadPage(0);
    
    
    db.collection("users").doc(userId).set({
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    
    document.addEventListener('DOMContentLoaded', () => {
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.addEventListener('click', this.setAudioProgress);
      }
    });
  }
});


app.component('avatar-modal', {
  props: ['url', 'show'],
  template: `
    <div class="avatar-modal" v-if="show" @click="$emit('close')">
      <div class="avatar-modal-content" @click.stop>
        <img :src="url" alt="Avatar Preview" class="avatar-preview-img">
        <button class="btn btn-primary modal-close-btn" @click="$emit('close')">关闭 · Close</button>
      </div>
    </div>
  `
});


app.component('quiz-question', {
  props: ['quiz', 'answered', 'selectedOption', 'correct'],
  template: `
    <div class="quiz-content">
      <div class="quiz-question">{{ quiz.question }}</div>
      <div class="quiz-image" v-if="quiz.imageUrl">
        <img :src="quiz.imageUrl" alt="Quiz Image" @click="$emit('openImage', {url: quiz.imageUrl, caption: quiz.question})">
      </div>
      <div class="quiz-options">
        <div v-for="(option, idx) in (quiz.options || Object.entries(quiz).find(([key]) => key.trim() === 'options')?.[1] || [])" :key="idx"
          class="quiz-option btn btn-primary"
          :class="{
            'selected': selectedOption === option,
            'correct': answered && selectedOption === option && correct,
            'incorrect': answered && selectedOption === option && !correct
          }"
          @click="!answered && $emit('answer', option)">
          {{ option }}
        </div>
      </div>
      <div v-if="answered" class="quiz-explanation">
        <p class="quiz-result" :class="{ 'correct-text': correct, 'incorrect-text': !correct }">
          {{ correct ? '恭喜你答对了! / Correct!' : '很遗憾你答错了! / Incorrect!' }}
        </p>
        <p class="explanation-text">{{ quiz.explanation }}</p>
      </div>
    </div>
  `
});

// Add Image Modal Component
app.component('image-modal', {
  props: ['image', 'show'],
  template: `



<div class="image-modal" v-if="show" @click="$emit('close')">
      <div class="image-modal-content" @click.stop>
        <img :src="image.url" alt="Enlarged Image" class="modal-img">
        <p class="modal-caption">{{ image.caption }}</p>
        <button class="btn btn-primary modal-close-btn" @click="$emit('close')">关闭 · Close</button>
      </div>
    </div>
  `
});


app.component('toast-notification', {
  props: ['toast'],
  template: `
    <div class="toast" :class="'toast-' + toast.type">
      {{ toast.message }}
    </div>
  `
});


app.mount('#app');
