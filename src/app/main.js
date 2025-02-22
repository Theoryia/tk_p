async function loadProjects() {
    try {
        const response = await fetch('/src/app/data/projects.json');  // Updated path
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

        // Add gif background setup
        if (project.gif) {
            const projectCard = card.querySelector('.project-card');
            
            projectCard.addEventListener('mouseenter', () => {
                projectCard.style.setProperty('--hover-gif', `url(${project.gif})`);
            });
            
            projectCard.addEventListener('mouseleave', () => {
                projectCard.style.removeProperty('--hover-gif');
            });
        }
        
        grid.appendChild(card);
    });
}

async function loadTimeline() {
    try {
        const response = await fetch('/src/app/data/timeline.json');
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
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 2;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const stars = Array(300).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.2 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        brightness: Math.random() * 0.3 + 0.5,
        twinkleSpeed: Math.random() * 0.002 + 0.001,
        glow: Math.random() * 1.2 + 0.3
    }));
    
    let scrollOffset = 0;
    let lastTime = 0;
    
    function animate(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            star.brightness += star.twinkleSpeed;
            if (star.brightness >= 0.8 || star.brightness <= 0.5) {
                star.twinkleSpeed *= -1;
            }
            
            const y = (star.y - scrollOffset * star.speed) % canvas.height;
            
            // Draw base star with increased intensity
            ctx.globalAlpha = star.brightness;
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Enhanced glow effect
            ctx.globalAlpha = star.brightness * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.5})`;
            ctx.beginPath();
            ctx.arc(star.x, y, star.size + star.glow, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('scroll', () => {
        scrollOffset = window.scrollY;
    });
    
    document.body.prepend(canvas);
    requestAnimationFrame(animate);
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
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            ticking = false;
        });
        ticking = true;
    }
});