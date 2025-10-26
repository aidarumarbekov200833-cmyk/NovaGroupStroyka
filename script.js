// Прелоадер
const preloader = document.getElementById('preloader');
const percentElement = document.getElementById('loading-percent');
const progressBar = document.getElementById('loading-progress');
const duration = 3500;
const intervalTime = 50;
let currentStep = 0;
const totalSteps = duration / intervalTime;

const loadingTexts = [
    "Инициализация системы...",
    "Загрузка ресурсов...",
    "Подготовка контента...",
    "Оптимизация изображений...",
    "Почти готово...",
    "Запуск приложения..."
];

function updatePreloader() {
    currentStep++;
    const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
    
    percentElement.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    
    if (percent % 17 === 0) {
        const textIndex = Math.min(Math.floor(percent / 17), loadingTexts.length - 1);
        document.querySelector('.preloader__text').textContent = loadingTexts[textIndex];
    }
    
    if (percent < 100) {
        setTimeout(updatePreloader, intervalTime);
    } else {
        setTimeout(() => {
            preloader.classList.add('hidden');
            initAllFunctions();
        }, 500);
    }
}

// Инициализация всех функций
function initAllFunctions() {
    initScrollAnimations();
    initCustomCursorVideo();
    initMobileMenu();
    initSmoothScroll();
    initServicesScroll();
    initModal();
}

// Плавный скролл
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Скролл для услуг (ОБНОВЛЕНО)
function initServicesScroll() {
    const servicesContainer = document.getElementById('services-horizontal');
    const scrollProgress = document.getElementById('scroll-progress');
    const scrollHint = document.getElementById('scroll-hint');
    const servicesBgText = document.getElementById('services-bg-text');
    const endIndicator = document.getElementById('end-indicator');
    const nextSection = document.getElementById('skills'); // Секция, к которой переходим

    if (!servicesContainer || !nextSection) return;

    // *** ИЗМЕНЕНИЕ: Добавленный код для смены текста подсказки ***
    function updateHintText() {
        if (scrollHint) {
            // Используем matchMedia для проверки медиа-запроса (тот же, что в CSS)
            if (window.matchMedia("(max-width: 768px)").matches) {
                scrollHint.textContent = "Проведите пальцем для прокрутки →";
            } else {
                scrollHint.textContent = "Используйте колесико мыши для прокрутки →";
            }
        }
    }

    updateHintText(); // Устанавливаем правильный текст при загрузке
    window.addEventListener('resize', updateHintText); // Обновляем текст при изменении размера окна
    // *** КОНЕЦ ИЗМЕНЕНИЯ ***

    let isDragging = false;
    let startX;
    let scrollLeft;
    let isScrollingVertically = false; // Флаг для предотвращения многократной прокрутки

    function updateServicesScrollUI() {
        const scrollLeft = servicesContainer.scrollLeft;
        const maxScroll = servicesContainer.scrollWidth - servicesContainer.clientWidth;
        const scrollPercentage = maxScroll > 0 ? (scrollLeft / maxScroll) : 0;
        
        if (scrollProgress) {
            scrollProgress.style.width = `${scrollPercentage * 100}%`;
        }

        if (servicesBgText) {
            const letters = servicesBgText.querySelectorAll('span');
            const totalLettersToAnimate = letters.length;
            
            letters.forEach((letter, index) => {
                const letterThreshold = (index / totalLettersToAnimate);
                if (scrollPercentage >= letterThreshold) {
                    letter.classList.add('revealed');
                } else {
                    letter.classList.remove('revealed');
                }
            });
        }
        
        if (scrollHint) {
            if (scrollPercentage < 0.95) {
                scrollHint.classList.add('services__hint--show');
            } else {
                scrollHint.classList.remove('services__hint--show');
            }
        }

        if (endIndicator) {
            if (scrollPercentage > 0.8) {
                endIndicator.classList.add('show');
            } else {
                endIndicator.classList.remove('show');
            }
        }
    }

    servicesContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        servicesContainer.classList.add('grabbing');
        startX = e.pageX - servicesContainer.offsetLeft;
        scrollLeft = servicesContainer.scrollLeft;
    });

    servicesContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        servicesContainer.classList.remove('grabbing');
    });

    servicesContainer.addEventListener('mouseup', () => {
        isDragging = false;
        servicesContainer.classList.remove('grabbing');
    });

    servicesContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - servicesContainer.offsetLeft;
        const walk = (x - startX) * 2;
        servicesContainer.scrollLeft = scrollLeft - walk;
    });

    servicesContainer.addEventListener('wheel', (e) => {
        const maxScroll = servicesContainer.scrollWidth - servicesContainer.clientWidth;
        const atEnd = servicesContainer.scrollLeft >= (maxScroll - 5); // 5px буфер
        const atStart = servicesContainer.scrollLeft <= 5; // 5px буфер

        if (e.deltaY > 0) { // Прокрутка вниз/вправо
            if (!atEnd) {
                // Если не в конце, скроллим горизонтально
                e.preventDefault();
                servicesContainer.scrollLeft += e.deltaY * 2;
            } else if (!isScrollingVertically) {
                // Если в конце, скроллим страницу вниз к следующей секции
                isScrollingVertically = true;
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = nextSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Сбрасываем флаг после завершения анимации прокрутки
                setTimeout(() => { isScrollingVertically = false; }, 800);
            }
            // Если isScrollingVertically = true, ничего не делаем, даем завершиться прокрутке
        } else { // Прокрутка вверх/влево (e.deltaY < 0)
            if (!atStart) {
                // Если не в начале, скроллим горизонтально
                e.preventDefault();
                servicesContainer.scrollLeft += e.deltaY * 2;
            }
            // Если в начале (atStart), не отменяем e.preventDefault(),
            // позволяя странице прокрутиться вверх естественным образом.
        }
    });

    servicesContainer.addEventListener('scroll', updateServicesScrollUI);
    updateServicesScrollUI();
}

// Анимации при скролле
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    const sectionTitles = document.querySelectorAll('.section__title');
    const sectionSubtitles = document.querySelectorAll('.section__subtitle');
    const serviceCards = document.querySelectorAll('.service-card');
    const skillItems = document.querySelectorAll('.skill');
    const benefitBlocks = document.querySelectorAll('.benefit');
    const statItems = document.querySelectorAll('.stat');
    const waterImage = document.querySelector('.projects__image');
    const contactForm = document.querySelector('.contact__form');
    const header = document.querySelector('.header');
    
    let lastScrollTop = 0;
    let isCountingStarted = false;
    let isSkillsAnimationStarted = false;

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
            rect.bottom >= 0
        );
    }
    
    function activateAnimations() {
        sections.forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('active');
            }
        });
        
        sectionTitles.forEach(title => {
            if (isElementInViewport(title)) {
                title.classList.add('active');
            }
        });

        sectionSubtitles.forEach(subtitle => {
            if (isElementInViewport(subtitle)) {
                subtitle.classList.add('active');
            }
        });
        
        serviceCards.forEach((card, index) => {
            const servicesSection = document.getElementById('services');
            if (servicesSection && isElementInViewport(servicesSection) && !card.classList.contains('active')) {
                setTimeout(() => {
                    card.classList.add('active');
                }, index * 200);
            }
        });
        
        if (!isSkillsAnimationStarted) {
            const skillsSection = document.getElementById('skills');
            if (skillsSection && isElementInViewport(skillsSection)) {
                isSkillsAnimationStarted = true;
                animateSkills();
            }
        }
        
        benefitBlocks.forEach((block, index) => {
            if (isElementInViewport(block)) {
                setTimeout(() => {
                    block.classList.add('active');
                }, index * 250);
            }
        });
        
        statItems.forEach((item, index) => {
            if (isElementInViewport(item)) {
                setTimeout(() => {
                    item.classList.add('active');
                }, index * 300);
            }
        });
        
        if (waterImage && isElementInViewport(waterImage)) {
            waterImage.classList.add('active');
        }
        
        if (contactForm && isElementInViewport(contactForm)) {
            contactForm.classList.add('active');
        }
        
        if (!isCountingStarted) {
            const aboutSection = document.getElementById('about');
            if (aboutSection && isElementInViewport(aboutSection)) {
                isCountingStarted = true;
                animateNumbers();
            }
        }
    }

    function animateSkills() {
        const skillItems = document.querySelectorAll('.skill');
        
        skillItems.forEach((item, index) => {
            const percentElement = item.querySelector('.skill__percent');
            const progressBar = item.querySelector('.skill__bar');
            const target = parseInt(percentElement.getAttribute('data-target'));
            
            let current = 1;
            const duration = 2000;
            const startTime = Date.now();
            
            function updateSkill() {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                current = Math.floor(1 + (target - 1) * progress);
                
                percentElement.textContent = current + '%';
                progressBar.style.width = current + '%';
                
                if (progress < 1) {
                    requestAnimationFrame(updateSkill);
                } else {
                    percentElement.textContent = target + '%';
                    progressBar.style.width = target + '%';
                }
            }
            
            setTimeout(() => {
                item.classList.add('active');
                updateSkill();
            }, index * 300);
        });
    }
    
    function handleHeaderScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        lastScrollTop = scrollTop;
    }

    function animateNumbers() {
        const counters = document.querySelectorAll('.stat__number');
        const targets = [12, 347, 98, 24];
        const duration = 2000;
        const startTime = Date.now();
        
        function updateAllCounters() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            counters.forEach((counter, index) => {
                const target = targets[index];
                let count;
                
                if (index === 2) {
                    count = Math.floor(1 + (target - 1) * progress);
                    counter.textContent = count + '%';
                } else {
                    count = Math.floor(1 + (target - 1) * progress);
                    counter.textContent = count;
                }
                
                counter.classList.add('counting');
                setTimeout(() => counter.classList.remove('counting'), 100);
            });
            
            if (progress < 1) {
                requestAnimationFrame(updateAllCounters);
            } else {
                counters.forEach((counter, index) => {
                    const target = targets[index];
                    counter.textContent = target + (index === 2 ? '%' : '');
                });
            }
        }
        
        counters.forEach((counter, index) => {
            counter.textContent = '1' + (index === 2 ? '%' : '');
            statItems[index].classList.add('active');
        });
        
        requestAnimationFrame(updateAllCounters);
    }
    
    window.addEventListener('scroll', () => {
        activateAnimations();
        handleHeaderScroll();
    });
    
    window.addEventListener('resize', activateAnimations);
    
    activateAnimations();
}

// Кастомный курсор для видео
function initCustomCursorVideo() {
    const cursor = document.getElementById('custom-cursor');
    const container = document.getElementById('video-container');
    const video = document.getElementById('main-video');
    
    if (!cursor || !container || !video) return;

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    container.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--visible');
    });
    
    container.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--visible');
    });
    
    container.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            cursor.classList.add('is-playing');
        } else {
            video.pause();
            cursor.classList.remove('is-playing');
        }
    });
    
    video.addEventListener('ended', () => {
        cursor.classList.remove('is-playing');
    });
}

// Мобильное меню
function initMobileMenu() {
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');

    burgerBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('mobile-menu--open');
        burgerBtn.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--open') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('mobile-menu--open');
            burgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        const header = document.querySelector('.header');
        if (!header.contains(e.target) && mobileMenu.classList.contains('mobile-menu--open')) {
            mobileMenu.classList.remove('mobile-menu--open');
            burgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Модальное окно
function initModal() {
    const contactForm = document.getElementById('contact-form');
    const modal = document.getElementById('success-modal');
    const modalClose = document.getElementById('modal-close');

    if (!contactForm || !modal) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        setTimeout(() => {
            modal.classList.add('modal--show');
            contactForm.reset();
        }, 500);
    });

    modalClose.addEventListener('click', () => {
        modal.classList.remove('modal--show');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('modal--show');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal--show')) {
            modal.classList.remove('modal--show');
        }
    });
}

// Анимация печатающего текста
const textToType = "с любовью к деталям и вниманием к клиенту.";
let i = 0;
const speed = 50;

function typeWriter() {
    const output = document.getElementById("typed-output");
    if (!output) return;

    if (i < textToType.length) {
        output.innerHTML += textToType.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
    }
}

// Запуск всего
window.addEventListener('load', () => {
    updatePreloader();
    typeWriter();
});

const header = document.querySelector('.header');