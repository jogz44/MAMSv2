<template>
  <div class="about-page">

    <!-- HERO SECTION -->
    <div class="hero">
      <div class="hero-overlay" />
      <div class="hero-content">
        <div class="hero-tag">The Team Behind</div>
        <h1 class="hero-title">
          <div class="logo-wrapper">
            <img class="logo-main" src="../assets/logo12.png" alt="Logo" />
            <div class="trade-group">
              <img class="logo-trade" src="../assets/trademake.png" alt="Trademark" />
              <span class="tm-mark">TM</span>
            </div>
          </div>
        </h1>
      </div>
    </div>
    <!-- INTRO SECTION -->
<div class="section intro-section">
  <div class="section-inner intro-inner">
    <div class="label-tag">✦ Who We Are</div>
    <h2 class="section-heading">THE PROGRAMMERS</h2>
    <p class="intro-text">
      We are a group of Grade 12 Computer Programming students consisting of 10 students from <strong>Tagum National Trade School</strong>,
      currently completing our immersion at the <strong>City Government of Tagum — IT DEPARTMENT</strong>.
      Over the course of one month, we were tasked to design, develop, and deploy <strong>MAMS
      (Medical Assistance Monitoring System)</strong> — a platform built to help the Aksyon Agad Team
      manage and monitor medical assistance requests more efficiently and effectively.
    </p>
    <p class="intro-text">
      What started as a school requirement became something we are genuinely proud of.
      This is not just a system — it is a reflection of our teamwork, late nights, countless revisions,
      and the guidance of the people who believed in us. We hope that this system serves its purpose
      and leaves a lasting impact on the community it was built for.
    </p>
    <div class="intro-tags">
      <span class="intro-tag">🎓 Grade 12 — ICT Track</span>
      <span class="intro-tag">💻 Computer Programming</span>
      <span class="intro-tag">🏛️ City Government of Tagum</span>
      <span class="intro-tag">📅 Batch 2; 2026 Immersionists</span>
    </div>
  </div>
</div>

    <!-- PHOTO GRID -->
    <div class="section photo-section">
      <div class="section-inner">
        <div class="label-tag">✦ The Team</div>
        <h2 class="section-heading">Meet the People</h2>
        <div class="photo-grid">
          <div
            v-for="(member, index) in members"
            :key="index"
            class="photo-card"
            :style="{ animationDelay: index * 0.08 + 's' }"
          >
            <div class="photo-wrapper">
              <img :src="member.photo" :alt="member.name" class="photo-img" @error="onImgError($event)" />
              <div class="photo-overlay">
                <div class="photo-role">{{ member.role }}</div>
              </div>
            </div>
            <div class="photo-info">
              <div class="photo-name">{{ member.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MEMBER DEDICATIONS -->
    <div class="section member-dedication-section">
      <div class="section-inner">
        <div class="label-tag">✦ From The Team</div>
        <h2 class="section-heading">Their Words</h2>

        <div class="masonry-grid">
          <!-- LEFT COLUMN: indexes 0,2,4,6,8 -->
          <div class="masonry-col">
            <div
              v-for="(member, index) in leftColumn"
              :key="'left-' + index"
              class="member-dedication-card"
            >
              <div class="member-dedi-header">
                <img :src="member.photo" :alt="member.name" class="member-dedi-photo" @error="onImgError($event)" />
                <div class="member-dedi-meta">
                  <div class="member-dedi-name">{{ member.name }}</div>
                  <div class="member-dedi-role">{{ member.role }}</div>
                </div>
              </div>
              <p class="member-dedi-text">{{ member.dedication }}</p>
            </div>
          </div>

          <!-- RIGHT COLUMN: indexes 1,3,5,7,9 -->
          <div class="masonry-col">
            <div
              v-for="(member, index) in rightColumn"
              :key="'right-' + index"
              class="member-dedication-card"
            >
              <div class="member-dedi-header">
                <img :src="member.photo" :alt="member.name" class="member-dedi-photo" @error="onImgError($event)" />
                <div class="member-dedi-meta">
                  <div class="member-dedi-name">{{ member.name }}</div>
                  <div class="member-dedi-role">{{ member.role }}</div>
                </div>
              </div>
              <p class="member-dedi-text">{{ member.dedication }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- THANK YOU SECTION -->
    <div class="section thankyou-section">
      <div class="section-inner">
        <div class="label-tag light">✦ Gratitude</div>
        <h2 class="section-heading light">Thank You</h2>
        <div class="thankyou-body">
          <p class="thankyou-text">
            We sincerely thank Sir Briones for his patience, guidance, and unwavering support throughout our immersion journey, teaching us not only how to develop MAMS effectively but also important lessons about perseverance, professionalism, and creating user-friendly systems. We are also grateful to Sir Jugz, who patiently assisted us through every change, never complained, and helped us learn new programming languages along the way. Our thanks also go to Ma’am Justy, Ma’am Alex, Sir Danielle, and all the workers in the Command Center for their kindness, support, and encouragement, which motivated us to keep striving every day. Finally, we are thankful for the opportunity to contribute to a system that helps the Aksyon Agad Team serve the community more efficiently.

          </p>
          <div class="thankyou-divider" />
  <div class="thankyou-signature">— FROM THE TNTS COMPUTER PROGRAMMING immersionists</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const members = ref([
  {
    name: 'KARL LOUIZ REAMBONANZA',
    role: 'BACKEND/FRONTEND/TEAM LEADER',
    dedication: `On behalf of the group, we would like to thank you sa tanan workers sa city hall for the times and advices na gihatag saamoa during sa 1 month immersion namo dinhi 🥹. Hours and days of blood, sweat, and tears (of joy and sadness) has been poured to make this system. Whether silay nag code tibuok, nag assist ra, or tabang outside pud sa system, our team is proud of this system. To sir Briones, sir Jogz, Ma'am Jesty, og kinsa paba among na agian sa CICTMO, salamat kayo sa inyong patience para saamoa og sapag hatag og advice nama gamit namo both sa profession namo and jobs in the future (kung naa pay future HAHA). Unta lang pud ma remember mi ninyo puhon and hopefully pud naa pud moy good memories saamo sad HAHA. We are sincerely grateful for your assistance and the time you have given us during our immersion. To the workers namo gamit aning system, we hope that you will enjoy using this system and will cherish it forever and ever and ever. If naay issues, ayaw lang mi icontact jk ra HAHA pero oy don't hesitate lang di man mi mo maak.`,
    photo: new URL('../assets/karl.jpg', import.meta.url).href
  },
  {
    name: 'STEVINEMANUEL L. MAGKIDONG',
    role: 'FRONTEND',
    dedication: `I am one of the immersionists from Tagum National Trade School and one of the programmers who developed MAMS for the Mayor's Office to support the Aksyon Agad Team in delivering efficient and effective public service, creating a system that streamlines processes and ensures secure, organized, and accessible data for the community. I wholeheartedly dedicate this achievement to Sir Briones for his patience, guidance, unwavering support, and for teaching us the valuable lesson that programmers should build websites and prototypes for idiots I mean that are simple and user-friendly so anyone can easily understand and use them. I also dedicate this work to Sir Jugz, who patiently assisted us every time we said, "Pull na po, Sir," and then suddenly requested changes, never once expressing a complaint and continuously guiding us from the beginning of our immersion journey. Lastly, I extend my heartfelt gratitude to Ma'am Justy and all the workers in the Command Center for their kindness, understanding, and for always treating us with respect and making us feel welcomed and valued.`,
    photo: new URL('../assets/steve.jpg', import.meta.url).href
  },
  {
    name: 'FRANZEN ALTHEA S. ALMENDRAS',
    role: 'FRONTEND',
    dedication: `Being part of the IT Department during our immersion was a meaningful and unforgettable experience for me. At first, everything was challenging, especially learning new tools and developing our system, but through guidance and teamwork, we were able to complete it successfully. I would like to give my sincere thanks to Sir Briones for guiding us, sharing his ideas, teaching us valuable lessons, and encouraging us to continue improving and learning. I am also grateful to our supervisor, Ma'am Jesty, and everyone in the IT Department, including Sir Jugs, Ma'am Alex, Sir JP, and Ma'am Jes, for their support throughout our immersion. I would also like to give special thanks to our team leader, Karl, for his dedication in coding our system, guiding us throughout the process, and stepping up to lead and support the team whenever needed. I would also like to thank my co-immersionists for the cooperation and memories we shared during this journey. This immersion experience will always hold a special place in my heart as one of the most valuable experiences in my senior high school journey.`,
    photo: new URL('../assets/tea.jpg', import.meta.url).href
  },
  {
    name: 'ROSIE MAE B. OCLARIT',
    role: 'FRONTEND',
    dedication: `First of all, I would like to thank the City Government of Tagum for allowing me to experience this milestone. I learned a lot during my 6 weeks working here. I can't fully explain the gratitude I feel, but I will surely cherish all the knowledge I gained and hopefully use it in the near future. Secondly, I would like to express my gratitude to my colleagues or should I call them NCH babies? Being with you guys made the workplace lighter. The laughter, the bond, and the chikas we shared are truly unforgettable. The project became much easier and possible to accomplish with you guys. Leadernim, thank you so much for all of your effort and hardwork. Lastly, I would like to take this opportunity to thank Ma'am Alex. This was quite unexpected but thank you for being one of my motivations to enter in the office and do my tasks. You have inspired me to pursue an IT related course in college. Thank you saurrr muchh ma'am!! 🙂`,
    photo: new URL('../assets/oclar.jpg', import.meta.url).href
  },
  {
    name: 'MA. SOFIA M. MARTOS',
    role: 'FRONTEND',
    dedication: `Hello, I am Ma. Sofia M. Martos, one of the immersionists, and I would like to take this opportunity to thank all the people who are behind this successful system that we have made, because without them we could not have fully created this incredible and useful system. First, I would like to say thank you to Sir Briones, who played a big part in our system. He is the one who guided us throughout the making of our system. We really learned a lot from him, and I can say that he is the best and an incredible man who teaches and guides us very well. I couldn't put into words how blessed, thankful, and grateful we are that you are our supervisor. Thank you, Sir Briones — you are the best! The second person I would like to thank is Sir Jogz, for truly helping and guiding us with endless patience. Thank you, Sir Jogz — we couldn't have been able to finish this without your help. The third person I would like to thank is Ma'am Jesty. Thank you, Ma'am, for being such a wonderful supervisor to us. Lastly, I would like to thank all the employees who work at the Command Center. You truly treated us with kindness from the moment we stepped into that office. We felt welcomed, and you were all so approachable. Thank you to all the employees at the Command Center — we will never forget any of you.`,
    photo: new URL('../assets/martos.jpg', import.meta.url).href
  },
  {
    name: 'AJ ZIV APOSTOL',
    role: 'PRINT FEATURE',
    dedication: `My time at the City Government of Tagum was one of the best parts of this school year. It let me experience what working in a real office is like and collaborate with actual staff. I'm grateful for the experience because it helped me grow and learn a lot.`,
    photo: new URL('../assets/aj.jpg', import.meta.url).href
  },
  {
    name: 'FREDDIE ANGELLA BULADACO',
    role: 'PRINT FEATURE',
    dedication: `4:13 PM
Angela
My experience at the City Government of Tagum was truly the highlight of my school year. It was more than just an opportunity it was a time of growth, learning, and self-discovery. I developed discipline, teamwork, and confidence, and learned to approach every task with purpose. One lesson that will always stay with me is to put myself in the shoes of the users, which changed the way I think and work. I am deeply grateful for this experience, which has left a lasting mark on both my personal and professional journey.`,
    photo: new URL('../assets/angela.jpg', import.meta.url).href
  },
  {
    name: 'BRIAN ESTEBAN',
    role: 'PRINT FEATURE',
    dedication: `My working experience at the City Government of Tagum was a great experience for me. It gave me an experience to work in a real office with actual officemates. Also, our IT head taught us that being a programmer means learning to think like an idiot to see things from a user perspective. It was one of the best experiences I had this school year.`,
    photo: new URL('../assets/brian.jpg', import.meta.url).href
  },
  {
    name: 'ANGEL CAMPION',
    role: 'PRINT FEATURE',
    dedication: `As a work immersion student assigned to the Command Center at ICTCMO - Information and Communications Technology and Computer
Management Office under the City Government of Tagum, I am truly grateful for the opportunity to be part of the Computer Programming team. During my time here, I gained valuable knowledge and hands-on experience that strengthened my understanding of technology and real-world systems. The guidance, patience, and support you shared with us will greatly help me in my future career. I also deeply value the teamwork and the bond we built, which I will always cherish. I love the City Government of Tagum, and I will forever be thankful for the memories and lessons you have given me.`,
    photo: new URL('../assets/angel.jpg', import.meta.url).href
  },
  {
    name: 'Christopher Robin Llena',
    role: 'PRINT FEATURE',
    dedication: `My experience working on the City Government of Tagum was the most memorable thing for this school year. It gave me what it feels like to actually work in a workplace with actual officemates. I also learned the points that really prove what it is to be a programmer, and I'm glad I knew about it.`,
    photo: new URL('../assets/llena.jpg', import.meta.url).href
  },
])

// Even indexes → left column, odd indexes → right column
const leftColumn  = computed(() => members.value.filter((_, i) => i % 2 === 0))
const rightColumn = computed(() => members.value.filter((_, i) => i % 2 !== 0))

const onImgError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x300?text=No+Photo'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

/* ========================
   BASE
======================== */
.about-page {
  background: #f7f5f0;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

/* ========================
   HERO
======================== */
.hero {
  position: relative;
  background: linear-gradient(135deg, #1a6b28 0%, #0d3d16 50%, #1f8f2e 100%);
  padding: 80px 24px 60px;
  text-align: center;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255,255,200,0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 40%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 40px,
    rgba(255,255,255,0.015) 40px,
    rgba(255,255,255,0.015) 41px
  );
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-tag {
  display: inline-block;
  background: rgba(255,255,255,0.12);
  color: #d4f7d4;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
}

.hero-title {
  width: 100%;
  margin-top: -120px;
  margin-bottom: -130px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
}

.logo-main {
  display: block;
}

.trade-group {
  position: absolute;
  top: 30%;
  right: -24px;
  transform: translateY(-30%);
  display: flex;
  align-items: flex-start;
  gap: 2px;
}

.logo-trade {
  width: 40px;
  height: auto;
  display: block;
}

.tm-mark {
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.5px;
  line-height: 1;
  margin-top: 1px;
}
/* ========================
   INTRO SECTION
======================== */
.intro-section {
  background: #ffffff;
  margin-top: 40px;
  border-radius: 16px 16px 0 0;
}

.intro-inner {
  text-align: center;
}

.intro-text {
  font-size: 15px;
  line-height: 2;
  color: #444;
  font-weight: 300;
  max-width: 720px;
  margin: 0 auto 20px;
  text-align: justify;
  text-align-last: center;   /* centers the last line of each paragraph */
}

.intro-text strong {
  font-weight: 600;
  color: #1a6b28;
}

.intro-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.intro-tag {
  background: #f0faf1;
  border: 1px solid rgba(31, 143, 46, 0.2);
  color: #1a6b28;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 6px 14px;
  border-radius: 20px;
}
/* ========================
   SECTIONS
======================== */
.section {
  padding: 64px 24px;
}

.section-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.label-tag {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #1f8f2e;
  margin-bottom: 10px;
}

.label-tag.light {
  color: rgba(255,255,255,0.6);
}

.section-heading {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 36px;
  line-height: 1.15;
}

.section-heading.light {
  color: #ffffff;
}

/* ========================
   PHOTO GRID
======================== */
.photo-section {
  background: #f7f5f0;
  margin-top: 40px;
  border-radius: 16px 16px 0 0;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.photo-card {
  animation: fadeUp 0.5s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.photo-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #ddd;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.photo-wrapper:hover .photo-img {
  transform: scale(1.07);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 80, 25, 0.85) 0%, transparent 60%);
  display: flex;
  align-items: flex-end;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-wrapper:hover .photo-overlay {
  opacity: 1;
}

.photo-role {
  font-size: 11px;
  color: #d4f7d4;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.photo-info {
  padding: 10px 4px 4px;
  text-align: center;
}

.photo-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

/* ========================
   MEMBER DEDICATIONS
======================== */
.member-dedication-section {
  background: #ffffff;
}

.masonry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.masonry-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.member-dedication-card {
  background: #f0faf1;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(31, 143, 46, 0.15);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.member-dedi-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(31, 143, 46, 0.15);
}

.member-dedi-photo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #1f8f2e;
}

.member-dedi-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.member-dedi-role {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #1f8f2e;
  margin-top: 3px;
}

.member-dedi-text {
  font-size: 13px;
  line-height: 1.8;
  color: #0a0a0a;
  text-align: justify;
  font-weight: 300;
  margin: 0;
}

/* ========================
   THANK YOU
======================== */
.thankyou-section {
  background: linear-gradient(135deg, #1a6b28 0%, #0d3d16 60%, #1f8f2e 100%);
  text-align: center;
}

.thankyou-body {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;        /* center the whole block */
}

.thankyou-text {
  font-size: 15px;
  line-height: 2;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 300;
  font-style: normal;
  margin: 0 0 24px;
  text-align: left;          /* paragraphs left-aligned within centered block */
  letter-spacing: 0.2px;
}

.thankyou-signature {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: #7ddf7d;
  font-weight: 700;
}
.thankyou-divider {
  width: 60px;
  height: 2px;
  background: #7ddf7d;
  margin: 24px auto 24px;
  border-radius: 2px;
  opacity: 0.6;
}

/* ========================
   RESPONSIVE
======================== */

@media screen and (max-width: 900px) {
  /* HERO */
  .hero {
    padding: 40px 16px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-title {
    margin-top: -60px;
    margin-bottom: -70px;
    display: flex;
    justify-content: center;
  }

  .logo-wrapper {
    display: inline-flex;
    justify-content: center;
  }

  .logo-main {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    display: block;
  }

  /* PHOTO GRID */
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .photo-name {
    font-size: 11px;
  }

  /* DEDICATION CARDS */
  .masonry-grid {
    grid-template-columns: 1fr;
  }

  .member-dedication-card {
    width: 100%;
    box-sizing: border-box;
  }

  .member-dedi-text {
    text-align: left;        /* justify can look bad on narrow mobile screens */
  }

  /* SECTIONS */
  .section {
    padding: 32px 12px;
  }

  .section-heading {
    font-size: 24px;
    text-align: center;
  }

  .label-tag {
    text-align: center;
    display: block;
  }

  /* INTRO TAGS */
  .intro-tags {
    flex-direction: column;
    align-items: center;
  }

  /* THANK YOU */
  .thankyou-text {
    text-align: left;
    font-size: 13px;
  }
.trade-group {
    right: -14px;
  }

  .logo-trade {
    width: 24px;
  }

  .tm-mark {
    font-size: 7px;
  }

  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .masonry-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 600px) {
  /* HERO */
  .hero {
    padding: 40px 16px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-title {
    margin-top: -60px;
    margin-bottom: -70px;
    display: flex;
    justify-content: center;
  }

  .logo-wrapper {
    display: inline-flex;
    justify-content: center;
  }

  .logo-main {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    display: block;
  }

  /* PHOTO GRID */
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .photo-name {
    font-size: 11px;
  }

  /* DEDICATION CARDS */
  .masonry-grid {
    grid-template-columns: 1fr;
  }

  .member-dedication-card {
    width: 100%;
    box-sizing: border-box;
  }

  .member-dedi-text {
    text-align: left;        /* justify can look bad on narrow mobile screens */
  }

  /* SECTIONS */
  .section {
    padding: 32px 12px;
  }

  .section-heading {
    font-size: 24px;
    text-align: center;
  }

  .label-tag {
    text-align: center;
    display: block;
  }

  /* INTRO TAGS */
  .intro-tags {
    flex-direction: column;
    align-items: center;
  }

  /* THANK YOU */
  .thankyou-text {
    text-align: left;
    font-size: 13px;
  }
.trade-group {
    right: -14px;
  }

  .logo-trade {
    width: 24px;
  }

  .tm-mark {
    font-size: 7px;
  }
}

@media screen and (max-width: 480px) {
  /* HERO */
  .hero {
    padding: 40px 16px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-title {
    margin-top: -60px;
    margin-bottom: -70px;
    display: flex;
    justify-content: center;
  }

  .logo-wrapper {
    display: inline-flex;
    justify-content: center;
  }

  .logo-main {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    display: block;
  }

  /* PHOTO GRID */
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .photo-name {
    font-size: 11px;
  }

  /* DEDICATION CARDS */
  .masonry-grid {
    grid-template-columns: 1fr;
  }

  .member-dedication-card {
    width: 100%;
    box-sizing: border-box;
  }

  .member-dedi-text {
    text-align: left;        /* justify can look bad on narrow mobile screens */
  }

  /* SECTIONS */
  .section {
    padding: 32px 12px;
  }

  .section-heading {
    font-size: 24px;
    text-align: center;
  }

  .label-tag {
    text-align: center;
    display: block;
  }

  /* INTRO TAGS */
  .intro-tags {
    flex-direction: column;
    align-items: center;
  }

  /* THANK YOU */
  .thankyou-text {
    text-align: left;
    font-size: 13px;
  }
.trade-group {
    right: -14px;
  }

  .logo-trade {
    width: 24px;
  }

  .tm-mark {
    font-size: 7px;
  }
}

@media screen and (max-width: 380px) {
  .trade-group {
    right: -10px;
  }

  .logo-trade {
    width: 18px;
  }

  .tm-mark {
    font-size: 6px;
  }
}
</style>