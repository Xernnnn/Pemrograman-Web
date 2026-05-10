// Paksa browser selalu mulai dari paling atas saat di-refresh
if (history.scrollRestoration) { history.scrollRestoration = 'manual'; }
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    // Animasi Muncul Bawah (Reveal) & Muncul Samping (Reveal-side)
    const observerOptions = { threshold: 0.15 };
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); } 
            else { entry.target.classList.remove('active'); }
        });
    }, observerOptions);

    // GANTI BARIS INI: Tambahkan '.reveal-side' ke dalam list yang diobservasi
    const animatedElements = document.querySelectorAll('.reveal, .reveal-side');
    animatedElements.forEach(el => scrollObserver.observe(el));
});

// === LOGIKA SPLIT OVERLAY MENU ===
const menuToggle = document.getElementById('menuToggle');
const fullscreenMenu = document.getElementById('fullscreenMenu');

if (menuToggle && fullscreenMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        fullscreenMenu.classList.toggle('active');
        if(fullscreenMenu.classList.contains('active')) { document.body.style.overflow = 'hidden'; } 
        else { document.body.style.overflow = 'auto'; }
    });
}

// === VANILLA JS NATIVE MOMENTUM SCROLL (LERP) ===
let currentScroll = window.scrollY; 
let targetScroll = window.scrollY;  
const ease = 0.08; 

window.addEventListener('wheel', (e) => {
    e.preventDefault(); 
    targetScroll += e.deltaY * 1.5; 
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = Math.max(0, targetScroll);
    targetScroll = Math.min(maxScroll, targetScroll);
}, { passive: false });

function smoothScrollPhysics() {
    currentScroll += (targetScroll - currentScroll) * ease;
    window.scrollTo(0, currentScroll);
    requestAnimationFrame(smoothScrollPhysics);
}
smoothScrollPhysics();

// === LOGIKA TEXT FILL PROFILE (ABOUT ME) ===
const aboutText = document.getElementById('aboutText');
if (aboutText) {
    const textContent = aboutText.innerText;
    aboutText.innerHTML = ''; 
    
    textContent.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        span.classList.add('char');
        aboutText.appendChild(span);
    });

    const spans = aboutText.querySelectorAll('.char');

    function fillLettersOnScroll() {
        const rect = aboutText.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const startPoint = windowHeight * 0.8;
        const endPoint = windowHeight * 0.4;
        let progress = (startPoint - rect.top) / (startPoint - endPoint);
        progress = Math.max(0, Math.min(1, progress)); 
        const fillIndex = Math.floor(progress * spans.length);
        
        spans.forEach((span, index) => {
            if (index < fillIndex) { span.style.color = '#1A1A1A'; } 
            else { span.style.color = 'rgba(26, 26, 26, 0.15)'; }
        });
    }
    window.addEventListener('scroll', fillLettersOnScroll);
    fillLettersOnScroll(); 
}

// === LOGIKA ANIMASI CIRCULAR BERLAPIS ===
const circleWrapper = document.getElementById('circleWrapper');
const circles = document.querySelectorAll('.circle');
const circleText = document.getElementById('circleText');

if (circleWrapper && circles.length === 4) {
    function animateLayersOnScroll() {
        const rect = circleWrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top <= windowHeight && rect.bottom >= 0) {
            let maxScroll = rect.height - windowHeight;
            let scrolled = -rect.top;
            let progress = Math.max(0, Math.min(scrolled / maxScroll, 1));

            const calculateRadius = (startPoint, currentProgress) => {
                let p = Math.max(0, (currentProgress - startPoint) * 2.5);
                return Math.pow(p, 3) * 150; 
            };

            circles.forEach((circle, index) => {
                let startPoints = [0.0, 0.15, 0.30, 0.45];
                let radius = calculateRadius(startPoints[index], progress);
                circle.style.clipPath = `circle(${radius}% at 50% 50%)`;
                circle.style.webkitClipPath = `circle(${radius}% at 50% 50%)`;
            });

            if (progress > 0.20) {
                circleText.classList.add('visible');
                circleText.style.color = "#FAFAFA"; 
            } else {
                circleText.classList.remove('visible');
            }
        }
    }
    window.addEventListener('scroll', animateLayersOnScroll);
    animateLayersOnScroll();
}




function splitTextIntoChars(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText;
    el.innerHTML = ''; // Kosongkan elemen asli
    
    text.split('').forEach(char => {
        const span = document.createElement('span');
        if (char === ' ') {
            span.innerHTML = '&nbsp;'; // Menjaga spasi agar tidak hilang
            span.classList.add('cta-space');
        } else {
            span.innerText = char;
            span.classList.add('cta-char');
        }
        el.appendChild(span);
    });
}

// Jalankan fungsi pecah huruf untuk kedua baris teks
splitTextIntoChars('ctaText1');
splitTextIntoChars('ctaText2');

// === LOGIKA FINAL CTA (CLEAN & FOOLPROOF) ===
window.addEventListener('scroll', () => {
    const section = document.getElementById('finalCta');
    if (!section) return;

    const words = section.querySelectorAll('.word');
    const btn = section.querySelector('.btn-discuss');

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    let progress = Math.abs(rect.top) / (rect.height - windowHeight);
    progress = Math.max(0, Math.min(1, progress));

    const triggerIndex = Math.floor(progress * words.length * 1.5); 
    words.forEach((word, index) => {
        if (index < triggerIndex) word.classList.add('lit');
        else word.classList.remove('lit');
    });

    // Hapus pemanggilan gallery yang bikin error
    if (progress > 0.6) {
        if(btn) btn.classList.add('active');
    } else {
        if(btn) btn.classList.remove('active');
    }
});

// === MATCHA DUST PARTICLE EFFECT (CANVAS) ===
function initMatchaDust() {
    const canvas = document.getElementById('matchaDustCanvas');
    if (!canvas) return; // Mencegah error jika canvas tidak ada di halaman
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Konfigurasi Partikel
    const matchaColor = '122, 139, 79'; // Warna #7A8B4F dari aksen Anda
    const darkDustColor = '26, 26, 26';  // Warna #1A1A1A
    
    function resizeCanvas() {
        // Menyesuaikan ukuran canvas dengan parent element
        width = canvas.parentElement.offsetWidth || window.innerWidth;
        height = canvas.parentElement.offsetHeight || window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        createParticles();
    }
    
    function createParticles() {
        particles = [];
        // Menentukan kepadatan partikel (semakin kecil pembagi, semakin padat bubuknya)
        const particleDensity = Math.floor((width * height) / 4500); 
        
        for (let i = 0; i < particleDensity; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.2 + 0.3, // Ukuran mikroskopis (0.3px - 1.5px)
                opacity: Math.random() * 0.6 + 0.1, // Transparansi bervariasi
                speedX: (Math.random() * 0.3) - 0.15, // Gerakan lambat horizontal
                speedY: (Math.random() * 0.3) - 0.15, // Gerakan lambat vertikal
                isMatcha: Math.random() > 0.4 // 60% warna matcha, 40% warna gelap
            });
        }
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            
            if (p.isMatcha) {
                ctx.fillStyle = `rgba(${matchaColor}, ${p.opacity})`;
            } else {
                ctx.fillStyle = `rgba(${darkDustColor}, ${p.opacity})`;
            }
            
            ctx.fill();
            
            // Perbarui posisi untuk efek melayang
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Logika "Wrap Around" agar partikel tidak pernah habis
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    // Inisialisasi
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();
}

// Jalankan fungsi setelah seluruh DOM dimuat (cocok dengan struktur script.js Anda)
document.addEventListener('DOMContentLoaded', initMatchaDust);

// === LOGIKA TIMELINE LINE SCROLL (MATCHA LINE) ===
const processSection = document.getElementById('workingProcess');
const processLineFill = document.getElementById('processLineFill');

if (processSection && processLineFill) {
    function animateTimelineLine() {
        const rect = processSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Titik awal garis bergerak (saat bagian atas section mencapai tengah layar)
        const triggerPoint = windowHeight / 2; 
        
        // Jarak yang sudah di-scroll di dalam section tersebut
        const scrolledDistance = triggerPoint - rect.top;
        
        // Menghitung persentase scroll dari total tinggi section
        let progress = scrolledDistance / rect.height;
        
        // Kunci progress agar tidak kurang dari 0 dan tidak lebih dari 1 (100%)
        progress = Math.max(0, Math.min(1, progress));
        
        // Aplikasikan persentase ke dalam CSS height garis matcha
        processLineFill.style.height = `${progress * 100}%`;
    }

    // Jalankan fungsi saat di-scroll
    window.addEventListener('scroll', animateTimelineLine);
    // Jalankan sekali saat halaman dimuat agar garis langsung menyesuaikan posisi
    animateTimelineLine(); 
}



// === LOGIKA PARALLAX 7 FOTO ASIMETRIS ===
const galleryNarrativeSection = document.querySelector('.gallery-narrative-section');
const floatImages = document.querySelectorAll('.float-img');

if (galleryNarrativeSection && floatImages.length >= 7) {
    function animateSevenImages() {
        const rect = galleryNarrativeSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const scrollDistance = -rect.top;
        const maxScroll = galleryNarrativeSection.offsetHeight - windowHeight;
        
        let progress = scrollDistance / maxScroll;
        progress = Math.max(0, Math.min(1, progress));

        // Masing-masing gambar ditarik dengan kecepatan (multipliers) unik
        floatImages[0].style.transform = `translateY(-${progress * 300}vh)`; // Tercepat
        floatImages[1].style.transform = `translateY(-${progress * 240}vh)`;
        floatImages[2].style.transform = `translateY(-${progress * 280}vh)`;
        floatImages[3].style.transform = `translateY(-${progress * 210}vh)`;
        floatImages[4].style.transform = `translateY(-${progress * 260}vh)`;
        floatImages[5].style.transform = `translateY(-${progress * 190}vh)`;
        floatImages[6].style.transform = `translateY(-${progress * 230}vh)`; // Terlambat
    }

    window.addEventListener('scroll', animateSevenImages);
    animateSevenImages();
}

// === LOGIKA CUSTOM VIDEO PLAYER (MOTION GALLERY) ===
const videoWrappers = document.querySelectorAll('.video-wrapper');

if (videoWrappers.length > 0) {
    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        
        wrapper.addEventListener('click', () => {
            // Jika video sedang pause, jalankan
            if (video.paused) {
                // Pause semua video lain yang sedang jalan agar tidak tabrakan suaranya
                document.querySelectorAll('.video-wrapper video').forEach(v => {
                    if(v !== video) {
                        v.pause();
                        v.parentElement.classList.remove('is-playing');
                    }
                });

                video.play();
                wrapper.classList.add('is-playing');
            } 
            // Jika diklik saat sedang jalan, pause video
            else {
                video.pause();
                wrapper.classList.remove('is-playing');
            }
        });

        // Tampilkan tombol play kembali jika video selesai (reach the end)
        video.addEventListener('ended', () => {
            wrapper.classList.remove('is-playing');
        });
    });
}

// === LOGIKA LIGHTBOX GALLERY (FULLSCREEN IMAGE) ===
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryImages = document.querySelectorAll('.gallery-card .card-image-box img, .marquee-item img');
if (lightboxModal && galleryImages.length > 0) {
    // 1. Fungsi saat foto di galeri diklik
    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src; // Ambil gambar yang diklik
            lightboxModal.classList.add('active'); // Tampilkan modal
            document.body.style.overflow = 'hidden'; // Kunci scroll halaman belakang
        });
    });

    // 2. Fungsi untuk menutup Lightbox
    const closeLightbox = () => {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Buka kembali scroll halaman
        
        // Bersihkan src setelah animasi selesai agar tidak ada sisa gambar
        setTimeout(() => { lightboxImg.src = ''; }, 400);
    };

    // 3. Pemicu penutupan Lightbox
    lightboxClose.addEventListener('click', closeLightbox); // Klik tombol X
    
    // Klik di luar area gambar juga akan menutup Lightbox
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });

    // Tekan tombol ESC di keyboard untuk menutup
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });
}