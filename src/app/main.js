async function loadProjects() {
    try {
        const response = await fetch('../app/data/projects.json');  // Updated path
        const data = await response.json();
        renderProjects(data.projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    const template = document.getElementById('project-card-template');

    projects.forEach(project => {
        const card = template.content.cloneNode(true);
        
        // Set content
        card.querySelector('h3').textContent = project.title;
        card.querySelector('p').textContent = project.description;
        
        // Set tech stack
        const techStack = card.querySelector('.tech-stack');
        project.techStack.forEach(tech => {
            const span = document.createElement('span');
            span.textContent = tech;
            techStack.appendChild(span);
        });
        
        // Handle GitHub link
        const githubLink = card.querySelector('.project-links a');
        if (!project.githubLink) {
            githubLink.classList.add('disabled');
            githubLink.removeAttribute('href');
            githubLink.style.pointerEvents = 'none';
        } else {
            githubLink.href = project.githubLink;
        }

        // Set gif background immediately and always visible
        if (project.gif) {
            const projectCard = card.querySelector('.project-card');
            projectCard.style.setProperty('--hover-gif', `url(${project.gif})`);
        }
        
        grid.appendChild(card);
    });
}

async function loadTimeline() {
    try {
        const response = await fetch('../app/data/timeline.json');  // Updated path
        const data = await response.json();
        renderTimeline(data.events);
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}

function renderTimeline(events) {
    const timeline = document.querySelector('.timeline-wrapper');
    
    events.forEach(event => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const content = document.createElement('div');
        content.className = 'timeline-content';
        
        if (event.image) {
            content.addEventListener('mouseenter', () => {
                content.style.setProperty('--hover-image', `url(${event.image})`);
            });
            
            content.addEventListener('mouseleave', () => {
                content.style.removeProperty('--hover-image');
            });
        }
        
        content.innerHTML = `
            <div class="timeline-year">${event.year}</div>
            <h3 class="timeline-title">${event.title}</h3>
            <p class="timeline-description">${event.description}</p>
        `;
        
        item.appendChild(content);
        timeline.appendChild(item);
    });

    // Add intersection observer for fade-in effect
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}

function initCanvas() {
    const canvas = document.createElement('canvas');
    canvas.className = 'starfield';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    // Create two sets of stars
    const backgroundStars = Array(200).fill().map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1 + 0.1, // Smaller background stars
        brightness: Math.random() * 0.3 + 0.3,
        twinkleSpeed: Math.random() * 0.001 + 0.0005
    }));

    const parallaxStars = Array(100).fill().map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.2 + 0.2,
        speed: Math.random() * 0.15 + 0.05,
        brightness: Math.random() * 0.3 + 0.5,
        twinkleSpeed: Math.random() * 0.002 + 0.001
    }));

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scrollY = window.scrollY;
        
        // Draw background stars (no parallax)
        backgroundStars.forEach(star => {
            star.brightness += star.twinkleSpeed;
            if (star.brightness >= 0.6 || star.brightness <= 0.3) {
                star.twinkleSpeed *= -1;
            }
            
            ctx.globalAlpha = star.brightness;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw parallax stars
        parallaxStars.forEach(star => {
            star.brightness += star.twinkleSpeed;
            if (star.brightness >= 0.8 || star.brightness <= 0.5) {
                star.twinkleSpeed *= -1;
            }
            
            let y = (star.y - (scrollY * star.speed)) % canvas.height;
            if (y < 0) y += canvas.height;
            
            ctx.globalAlpha = star.brightness;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(drawStars);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawStars();
}

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    initCanvas();
    loadTimeline();

    // Comment out existing about triggers
    /*
    const aboutTriggers = document.querySelectorAll('.about-trigger');
    aboutTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const section = trigger.parentElement;
            section.classList.toggle('active');
        });
    });
    */
});

// Replace existing scroll listener with this:
let lastScrollY = window.scrollY;
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const header = document.querySelector('header');
            
            // Only apply hide/show behavior on mobile
            if (window.innerWidth <= 768) {
                // Add minimum scroll threshold
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scrolling down - hide header
                    header.classList.add('nav-hidden');
                } else {
                    // Scrolling up - show header
                    header.classList.remove('nav-hidden');
                }
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        });
        ticking = true;
    }
});