
// Global WebP Support Detection

function canUseWebP() {
  const elem = document.createElement("canvas");
  if (!!(elem.getContext && elem.getContext("2d"))) {
    return elem.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }
  return false;
}
const supportsWebP = canUseWebP(); // ✅ reuse everywhere

// Active Navigation Highlight

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("nav a");
  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});

// Smooth Scroll for Anchor Links

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

// Typewriter Effect in Hero

function typeWriter(element, text, speed = 60) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

const heroTitle = document.querySelector(".hero-text h1");
if (heroTitle) {
  const text = "Hi, I’m Jefrey - Creative Graphic & UI/UX Designer";
  heroTitle.innerHTML = "";
  typeWriter(heroTitle, text, 60);
}

// Testimonials Carousel

const track = document.querySelector(".testimonials-track");
const slides = document.querySelectorAll(".testimonials-track blockquote");

let currentIndex = 0;

// Controls
const container = document.querySelector(".testimonials");
let prevBtn, nextBtn;

// Update slide position
function updateCarousel() {
  const slideWidth = slides[0].getBoundingClientRect().width + 16;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

  // Left button
  if (currentIndex === 0) {
    prevBtn.disabled = true;
    prevBtn.style.background = "#081935ff";
    prevBtn.style.cursor = "not-allowed";
  } else {
    prevBtn.disabled = false;
    prevBtn.style.background = "#1C4D8C";
    prevBtn.style.cursor = "pointer";
  }

  // Right button
  if (currentIndex >= slides.length - 1) {
    nextBtn.disabled = true;
    nextBtn.style.background = "#ccc";
    nextBtn.style.cursor = "not-allowed";
  } else {
    nextBtn.disabled = false;
    nextBtn.style.background = "#1C4D8C";
    nextBtn.style.cursor = "pointer";
  }
}

function nextSlide() {
  if (currentIndex < slides.length - 1) {
    currentIndex++;
    updateCarousel();
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
}

if (container) {
  prevBtn = document.createElement("button");
  nextBtn = document.createElement("button");

  prevBtn.innerText = "⟨";
  nextBtn.innerText = "⟩";

  [prevBtn, nextBtn].forEach(btn => {
    btn.style.background = "#1C4D8C";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.padding = "0.5rem 1rem";
    btn.style.margin = "0 0.5rem";
    btn.style.borderRadius = "5px";
    btn.style.fontSize = "1.2rem";
  });

  const controls = document.createElement("div");
  controls.style.textAlign = "center";
  controls.style.marginTop = "1rem";
  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
  container.appendChild(controls);

  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);

  updateCarousel();
}


// ABOUT SECTION INTERACTIVITY

document.addEventListener("DOMContentLoaded", () => {
  const text = "Graphic Designer & Developer";
  const highlight = document.querySelector(".highlight");
  let i = 0;

  function typeEffect() {
    if (i < text.length) {
      highlight.textContent += text.charAt(i);
      i++;
      setTimeout(typeEffect, 100);
    }
  }

  if (highlight) {
    highlight.textContent = "";
    typeEffect();
  }
});

// PROJECTS MODAL SLIDESHOW

document.addEventListener("DOMContentLoaded", () => {
  const projectCards = document.querySelectorAll(".project-card");
  const modal = document.getElementById("projectModal");

  if (!modal) return;

  const modalImage = document.getElementById("modalImage");
  const closeModal = modal.querySelector(".close");
  const prevBtn = modal.querySelector(".prev");
  const nextBtn = modal.querySelector(".next");

  if (!modalImage || !closeModal || !prevBtn || !nextBtn) return;

  const projectMap = {
    "1_herbal-coffee": { folder: "images/projects/1_herbal-coffee/", prefix: "hc", total: 6 },
    "2_financial-poster": { folder: "images/projects/2_financial-poster/", prefix: "fp", total: 6 },
    "3_photoalbum": { folder: "images/projects/3_photoalbum/", prefix: "pa", total: 6 },
    "4_noor-gourmet": { folder: "images/projects/4_noor-gourmet/", prefix: "ng", total: 6 },
    "5_social-media": { folder: "images/projects/5_social-media/", prefix: "sm", total: 6 },
    "6_logo-designs": { folder: "images/projects/6_logo-designs/", prefix: "ld", total: 6 }
  };

  let currentProject = null;
  let currentIndex = 1;

  function showImage(index) {
    if (!currentProject) return;
    const config = projectMap[currentProject];

    const path = supportsWebP
      ? `${config.folder}${config.prefix}${index}.webp`
      : `${config.folder}${config.prefix}${index}.jpg`;

    modalImage.src = path;
  }

  projectCards.forEach(card => {
    card.addEventListener("click", () => {
      currentProject = card.getAttribute("data-project");
      currentIndex = 1;
      showImage(currentIndex);
      modal.style.display = "flex";
    });
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < projectMap[currentProject].total) {
      currentIndex++;
      showImage(currentIndex);
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 1) {
      currentIndex--;
      showImage(currentIndex);
    }
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal.click();
    if (e.key === "ArrowRight") nextBtn.click();
    if (e.key === "ArrowLeft") prevBtn.click();
  });
});

// CONTACT PAGE ENHANCEMENTS
document.addEventListener("DOMContentLoaded", () => {
  // Only run on contact page
  if (window.location.pathname.includes('05_contact.html') || 
      document.querySelector('.contact-form')) {
    
    // Enhanced Email Copy Functionality
    const emailLink = document.getElementById('emailLink');
    if (emailLink) {
      emailLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = 'apollojudge0@gmail.com';
        
        navigator.clipboard.writeText(email).then(() => {
          const originalText = this.querySelector('span').textContent;
          this.classList.add('copied');
          this.querySelector('span').textContent = 'Copied!';
          
          showToast(`✅ Email copied: ${email}`);
          
          setTimeout(() => {
            this.classList.remove('copied');
            this.querySelector('span').textContent = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy email: ', err);
          showToast('❌ Failed to copy email');
        });
      });
    }

    // UPDATED Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = this.querySelector('input[name="name"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const message = this.querySelector('textarea[name="message"]').value;
        
        if (name && email && message) {
          // Show success message
          const successMessage = document.getElementById('successMessage');
          if (successMessage) {
            successMessage.style.display = 'block';
          }
          
          // Clear the form
          this.reset();
          
          // Hide success message after 5 seconds
          setTimeout(function() {
            if (successMessage) {
              successMessage.style.display = 'none';
            }
          }, 5000);
        } else {
          // Show error toast
          showToast('❌ Please fill in all fields');
        }
      });
    }
    
    // Enhanced contact card animations
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });

    // Form input animations
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    formInputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
      });
    });
  }
});

// Email validation helper (ADD THIS NEW FUNCTION)
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Enhanced Toast Notification (REPLACES EXISTING showToast FUNCTION)
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.innerHTML = message;
  
  // Toast styles
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #1C4D8C, #2680f7)',
    color: 'white',
    padding: '15px 20px',
    borderRadius: '10px',
    fontWeight: '500',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
    zIndex: '10000',
    opacity: '0',
    transform: 'translateX(100px)',
    transition: 'all 0.4s ease',
    maxWidth: '300px',
    wordWrap: 'break-word',
    border: '1px solid rgba(255,255,255,0.2)'
  });
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}


// Scroll reveal animations
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(section => {
    observer.observe(section);
  });
});

// WebP for CSS Backgrounds & Thumbnails
if (supportsWebP) {
  document.body.style.backgroundImage = 'url("images/mainbg.webp")';
  if (document.body.classList.contains("home")) {
    document.body.style.backgroundImage = 'url("images/mainbg2.webp")';
  }

  // Swap project thumbnails
  document.querySelectorAll(".project-card img").forEach(img => {
    if (img.src.endsWith(".jpg")) {
      img.src = img.src.replace(".jpg", ".webp");
    } else if (img.src.endsWith(".png")) {
      img.src = img.src.replace(".png", ".webp");
    }
  });
}
