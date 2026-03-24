window.addEventListener("load", () => {
    // ------------------------------------------------------------------------
    // 1. SETUP: GSAP aur Lenis (Smooth Scroll) - PERFORMANCE OPTIMIZED
    // ------------------------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        smooth: true,
        smoothTouch: false, // IMPORTANT: Let mobile use its own native smooth scroll
        touchMultiplier: 2, // Makes mobile swiping feel faster and more responsive
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
    gsap.ticker.lagSmoothing(0);


    // ------------------------------------------------------------------------
    // 2. AUDIO ELEMENTS & RIPPLE EFFECT
    // ------------------------------------------------------------------------
    const hoverSound = document.getElementById('hover-sound');
    const clickSound = document.getElementById('click-sound');
    if(hoverSound) hoverSound.volume = 0.1;
    if(clickSound) clickSound.volume = 0.2;

    const interactiveElements = document.querySelectorAll('a, button, .grid-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (hoverSound) { hoverSound.currentTime = 0; hoverSound.play().catch(()=>{}); }
        });
        el.addEventListener('click', () => {
            if (clickSound) { clickSound.currentTime = 0; clickSound.play().catch(()=>{}); }
        });
    });

    const rippleButtons = document.querySelectorAll('.btn-glow, .social-btn, .submit-btn, .reel-control-btn');
    rippleButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x - size / 2}px`;
            ripple.style.top = `${y - size / 2}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });


    // ------------------------------------------------------------------------
    // 3. CUSTOM MAGNETIC CURSOR
    // ------------------------------------------------------------------------
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorFollower = document.querySelector('.cursor-follower');
    if (cursorDot && cursorFollower) {
        let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        });
        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(cursorFollower, { x: followerX, y: followerY });
        });

        const clickables = document.querySelectorAll('a, button, .grid-item, .tilt-card, .slider-handle, .orbit-node-wrapper');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursorFollower, { scale: 2.5, backgroundColor: "rgba(8, 217, 214, 0.1)", borderColor: "rgba(255, 46, 99, 0.8)", duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursorFollower, { scale: 1, backgroundColor: "transparent", borderColor: "var(--accent-cyan)", duration: 0.3 });
            });
        });
    }


    // ------------------------------------------------------------------------
    // 4. SCENE 1: THE OPENING SCENE (CINEMATIC HERO)
    // ------------------------------------------------------------------------
    const isMobile = window.innerWidth < 768; // Mobile & Tablet check

    const openingTl = gsap.timeline({ paused: true });

    // Initial State Setup (Lighter for mobile to save GPU)
    gsap.set(".line-calm", { opacity: 0, y: isMobile ? 30 : 50 });
    gsap.set(".line-impact", { 
        opacity: 0, 
        scale: isMobile ? 0.9 : 0.7, 
        filter: isMobile ? "blur(5px)" : "blur(20px)" 
    });
    gsap.set(".hero-cta-container, .cinematic-scroll-indicator", { opacity: 0, y: 20 });

    // --- PRELOADER COMPLETION HOOK ---
    const preloaderTl = gsap.timeline({
        onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
            ScrollTrigger.refresh(); 
            openingTl.play(); 
        }
    });
    preloaderTl.to(".preloader-text", { opacity: 1, duration: 1 })
               .to(".loading-bar", { width: "100%", duration: 1.5 })
               .to(".preloader", { y: "-100vh", duration: 1, ease: "power4.inOut", delay: 0.2 });

    // --- THE DIRECTOR's CUT (Hero Animation Sequence) ---
    
    // PHASE 1: The Calm Entry (Faster on mobile)
    openingTl.to(".line-calm", { opacity: 1, y: 0, duration: isMobile ? 1.2 : 2, ease: "power2.out" })
             .to({}, { duration: isMobile ? 0.2 : 0.6 }); 

    // PHASE 2 & 3: The Impact Build-Up & Drop
    openingTl.to(".line-impact", { 
                opacity: 1, 
                scale: isMobile ? 1.05 : 1.1, 
                filter: "blur(0px)", 
                duration: isMobile ? 0.5 : 0.8, 
                ease: "power3.inOut" 
             })
             .add("impact-moment")
             .to(".line-impact", { scale: 1, duration: 0.2, ease: "power4.out" }, "impact-moment")
             
             // Quick Glitch Effect (Lighter on mobile)
             .to(".line-impact", { 
                 skewX: isMobile ? 5 : 10, 
                 textShadow: isMobile ? "-2px 0 red, 2px 0 cyan" : "-5px 0 red, 5px 0 cyan", 
                 duration: 0.05, yoyo: true, repeat: isMobile ? 1 : 3 
             }, "impact-moment")
             
             // Camera Shake (Minimized on mobile to prevent layout shift)
             .to(".hero-content-wrapper", { 
                 x: isMobile ? "-1px" : "-2px", 
                 y: isMobile ? "1px" : "2px", 
                 duration: 0.05, yoyo: true, repeat: isMobile ? 2 : 4 
             }, "impact-moment")
             
             // Cinematic Flash Cuts
             .to(".frame-red", { opacity: 0.8, duration: 0.05, yoyo: true, repeat: 1 }, "impact-moment")
             .to(".frame-cyan", { opacity: 0.6, duration: 0.05, delay: 0.1, yoyo: true, repeat: 1 }, "impact-moment")
             .to(".frame-white", { opacity: 0.9, duration: 0.05, delay: 0.2, yoyo: true, repeat: 1 }, "impact-moment")

             // Fade in UI Elements
             .to([".hero-cta-container", ".cinematic-scroll-indicator"], { opacity: 1, y: 0, duration: isMobile ? 0.6 : 1, stagger: 0.2, ease: "power2.out" });

    // --- INTERACTION: Mouse Parallax & Magnetic Button (DESKTOP ONLY) ---
    const heroSection = document.querySelector('.hero-cinematic-section');
    const heroTiltTarget = document.getElementById('hero-tilt-target');
    const heroOrb = document.querySelector('.hero-interactive-orb');
    const magBtn = document.querySelector('.magnetic-btn');

    // ONLY initialize mouse listeners if NOT on mobile/tablet
    if (!isMobile) {
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                gsap.to(heroOrb, { left: e.clientX, top: e.clientY, duration: 0.6, ease: "power2.out" });
                
                const xAxis = (window.innerWidth / 2 - e.clientX) / 40;
                const yAxis = (window.innerHeight / 2 - e.clientY) / 40;
                gsap.to(heroTiltTarget, { rotationY: xAxis, rotationX: yAxis, duration: 1, ease: "power1.out" });
            });
            
            heroSection.addEventListener('mouseleave', () => {
                gsap.to(heroTiltTarget, { rotationY: 0, rotationX: 0, duration: 1 });
                gsap.to(heroOrb, { left: "50%", top: "50%", duration: 1 });
            });
        }

        if(magBtn) {
            magBtn.addEventListener('mousemove', (e) => {
                const rect = magBtn.getBoundingClientRect();
                const hx = e.clientX - rect.left - rect.width / 2;
                const hy = e.clientY - rect.top - rect.height / 2;
                gsap.to(magBtn, { x: hx * 0.2, y: hy * 0.2, duration: 0.3, ease: "power2.out" });
                gsap.to(".btn-text", { x: hx * 0.1, y: hy * 0.1, duration: 0.3 }); 
            });
            magBtn.addEventListener('mouseleave', () => {
                gsap.to(magBtn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
                gsap.to(".btn-text", { x: 0, y: 0, duration: 0.5 });
            });
        }
    }

    // --- SCROLL BLENDING: Seamless exit into Scene 2 ---
    gsap.to('.hero-content-wrapper', {
        y: -150,          
        opacity: 0,       
        scale: 0.9,       
        filter: isMobile ? "blur(5px)" : "blur(15px)", // Reduce scroll blur cost on mobile
        scrollTrigger: {
            trigger: '.hero-cinematic-section',
            start: "top top",
            end: "bottom top", 
            scrub: 1 
        }
    });


    // ------------------------------------------------------------------------
    // 5. SCENE 2: THE CINEMATIC TRAILER (ABOUT SECTION) - MOBILE OPTIMIZED
    // ------------------------------------------------------------------------
    const trailerSection = document.querySelector('.cinematic-trailer-section');
    
    if(trailerSection) {
        const isMobileDevice = window.innerWidth < 768; // Device check

        const trailerTl = gsap.timeline({
            scrollTrigger: {
                trigger: trailerSection,
                start: "top top", 
                // Mobile pe scroll distance kam kiya taaki jaldi aur smooth scroll ho
                end: isMobileDevice ? "+=1500" : "+=4000",    
                pin: true,        
                scrub: 1          
            }
        });

        // PHASE 1: Calm Intro (Faster stagger on mobile)
        trailerTl.fromTo(".calm-text", 
            { opacity: 0, y: isMobileDevice ? 15 : 30 }, 
            { opacity: 1, y: 0, stagger: isMobileDevice ? 0.4 : 0.8, duration: isMobileDevice ? 1 : 2, ease: "power2.out" }
        )
        .to(".calm-text", { opacity: 0, y: isMobileDevice ? -15 : -30, stagger: 0.2, duration: 1, delay: isMobileDevice ? 0.5 : 1 }, "+=0.5");

        // PHASE 2: Build Up (Opacity & Translate instead of deep Z-axis flying on mobile)
        if (isMobileDevice) {
            trailerTl.to(".float-vid-card", { opacity: 0.6, y: -10, stagger: 0.3, duration: 1 }, "<")
                     .to(".float-code", { opacity: 0.1, y: -20, stagger: 0.2, duration: 1 }, "<");
        } else {
            trailerTl.to(".float-vid-card", { opacity: 1, y: -20, stagger: 0.5, duration: 2 }, "<")
                     .to(".float-code", { opacity: 0.3, y: -50, stagger: 0.2, duration: 2 }, "<");
        }

        // PHASE 3: Impact (No heavy blur on mobile to save GPU, pure scale & opacity)
        trailerTl.fromTo(".impact-text", 
            { scale: isMobileDevice ? 0.8 : 0.6, opacity: 0, filter: isMobileDevice ? "blur(0px)" : "blur(20px)" }, 
            { scale: isMobileDevice ? 1 : 1.1, opacity: 1, filter: "blur(0px)", duration: isMobileDevice ? 1 : 1.5, ease: "power3.inOut" }, "+=0.2"
        )
        .to(".impact-text", { scale: 1, duration: 0.2, ease: "power4.out" })
        .fromTo(".impact-glow-burst", 
            { opacity: 0, scale: isMobileDevice ? 0.8 : 0.5 }, 
            { opacity: isMobileDevice ? 0.5 : 1, scale: isMobileDevice ? 1 : 1.5, duration: 0.3 }, "<"
        )
        .to(".impact-glow-burst", { opacity: 0, duration: 0.5 }) 
        .to(".impact-text", { opacity: 0, scale: isMobileDevice ? 1 : 1.05, filter: isMobileDevice ? "blur(0px)" : "blur(10px)", duration: 1, delay: isMobileDevice ? 0.5 : 1 });

        // PHASE 4: Immersive Reveal & Smooth Exit
        trailerTl.to(".float-vid-card, .float-code", { opacity: 0, duration: 0.5 }, "<");
        
        trailerTl.to(".phase-4-immersive", { opacity: 1, pointerEvents: "all", duration: 1 })
                 .fromTo(".tl-item", 
                    { x: isMobileDevice ? -15 : -30 }, 
                    { x: 0, opacity: 1, stagger: isMobileDevice ? 0.3 : 0.5, duration: 1, ease: "power2.out" }, "<"
                 )
                 .to(".tl-dot", { background: "#08d9d6", boxShadow: "0 0 15px #08d9d6", stagger: isMobileDevice ? 0.3 : 0.5, duration: 0.5 }, "<")
                 .to(".phase-4-immersive", { opacity: 0, scale: isMobileDevice ? 1 : 0.95, filter: isMobileDevice ? "blur(0px)" : "blur(20px)", duration: 1.5, delay: isMobileDevice ? 0.5 : 1 });


        // Mouse Movement Parallax Setup (DISABLED ON MOBILE)
        if (!isMobileDevice) {
            trailerSection.addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.clientX) / 50;
                const yAxis = (window.innerHeight / 2 - e.clientY) / 50;
                
                gsap.to('.layer-bg', { x: xAxis, y: yAxis, duration: 1 });
                gsap.to('.layer-mid', { x: xAxis * -1.5, y: yAxis * -1.5, duration: 1 });
            });
        }

        // Hover Play Logic for Floating Videos
        const floatVids = document.querySelectorAll('.float-vid-card');
        floatVids.forEach(card => {
            const vid = card.querySelector('video');
            if (vid) {
                card.addEventListener('mouseenter', () => vid.play());
                card.addEventListener('mouseleave', () => vid.pause());
            }
        });
    }

    // ------------------------------------------------------------------------
    // 6. SCENE 3: THE ARSENAL REACTOR (Energy Orbit & Modal Logic)
    // ------------------------------------------------------------------------
    const isMobileDevice = window.innerWidth < 768; // Check if mobile

    gsap.fromTo(".reactor-container", 
        { scale: isMobileDevice ? 0.9 : 0.5, opacity: 0, filter: isMobileDevice ? "blur(5px)" : "blur(30px)" },
        { 
            scale: 1, opacity: 1, filter: "blur(0px)", duration: 2, 
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".arsenal-reactor-section",
                start: "top 75%", 
                end: "center center",
                scrub: 1
            }
        }
    );

    const orbitSystem = document.querySelector('.orbit-system-container');
    const skillNodes = document.querySelectorAll('.skill-node');
    
    if (orbitSystem) {
        let orbitAnimation, counterOrbitAnimation;

        // Apply constant rotation animations ONLY on Desktop
        if (!isMobileDevice) {
            orbitAnimation = gsap.to(orbitSystem, {
                rotation: 360, duration: 40, repeat: -1, ease: "none"
            });

            counterOrbitAnimation = gsap.to(skillNodes, {
                rotation: -360, duration: 40, repeat: -1, ease: "none"
            });
        }

        const skillData = {
            editing: {
                title: "Video Editing",
                desc: "Crafting narrative flow with precision cuts, seamless transitions, and cinematic pacing that hooks the audience from frame one.",
                tools: "Premiere Pro",
                vid: "items/Ajit Edit.mp4"
            },
            motion: {
                title: "Motion Design",
                desc: "Breathing life into pixels. Designing high-end visual effects, dynamic typography, and fluid particle simulations.",
                tools: "After Effects",
                vid: "items/DeathNote 3.mp4"
            },
            color: {
                title: "Color Grading",
                desc: "Engineering visual emotion. Transforming raw log footage into rich, cinematic color palettes that tell a story.",
                tools: "DaVinci Resolve",
                vid: "items/lv_0_20241009115123.mp4"
            },
            logic: {
                title: "Creative Logic",
                desc: "Writing complex JavaScript engines to drive scroll animations, interactive physics, and smooth web experiences.",
                tools: "JS, GSAP, Lenis",
                vid: "items/Fiverr.mp4"
            },
            design: {
                title: "UI Architecture",
                desc: "Building immersive interfaces using modern CSS, glassmorphism, and responsive grid structures for a flawless look.",
                tools: "HTML5, CSS3",
                vid: "items/Sarnath.mp4"
            }
        };

        const nodeWrappers = document.querySelectorAll('.orbit-node-wrapper');
        const reactorModal = document.querySelector('.reactor-modal');
        const closeModalBtn = document.querySelector('.close-reactor-btn');
        
        nodeWrappers.forEach(wrapper => {
            if (!isMobileDevice) {
                wrapper.addEventListener('mouseenter', () => {
                    if(orbitAnimation) orbitAnimation.pause();
                    if(counterOrbitAnimation) counterOrbitAnimation.pause();
                    if(typeof hoverSound !== 'undefined' && hoverSound) { hoverSound.currentTime = 0; hoverSound.play().catch(()=>{}); }
                });
                
                wrapper.addEventListener('mouseleave', () => {
                    if(orbitAnimation) orbitAnimation.play();
                    if(counterOrbitAnimation) counterOrbitAnimation.play();
                });
            }

            wrapper.addEventListener('click', () => {
                if(typeof clickSound !== 'undefined' && clickSound) { clickSound.currentTime = 0; clickSound.play().catch(()=>{}); }
                
                const skillKey = wrapper.getAttribute('data-skill');
                const data = skillData[skillKey];

                if(data && reactorModal) {
                    document.getElementById('reactor-title').innerText = data.title;
                    document.getElementById('reactor-desc').innerText = data.desc;
                    document.getElementById('reactor-tools').innerText = data.tools;
                    document.getElementById('reactor-video-player').src = data.vid;
                    
                    reactorModal.classList.add('active');
                    // Prevent background scroll when full-screen modal is open on mobile
                    if(isMobileDevice) document.body.style.overflow = 'hidden'; 
                    gsap.to('.cursor-follower', { scale: 0, opacity: 0, duration: 0.3 }); 
                }
            });
        });

        const closeReactorModal = () => {
            if(reactorModal) reactorModal.classList.remove('active');
            if(isMobileDevice) document.body.style.overflow = ''; // Restore background scroll
            setTimeout(() => {
                const vidPlayer = document.getElementById('reactor-video-player');
                if(vidPlayer) vidPlayer.src = ""; 
            }, 500);
            gsap.to('.cursor-follower', { scale: 1, opacity: 1, duration: 0.3 }); 
        };

        if(closeModalBtn) closeModalBtn.addEventListener('click', closeReactorModal);
        if(reactorModal) reactorModal.addEventListener('click', (e) => {
            if(e.target === reactorModal || e.target.classList.contains('reactor-modal-backdrop')) {
                closeReactorModal();
            }
        });

        const reactorContainer = document.querySelector('.reactor-container');
        if (!isMobileDevice) {
            document.addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.clientX) / 80;
                const yAxis = (window.innerHeight / 2 - e.clientY) / 80;
                if(reactorContainer) gsap.to(reactorContainer, { x: xAxis, y: yAxis, duration: 1, ease: "power1.out" });
            });
        }
    }

    // ------------------------------------------------------------------------
    // 7. SCENE 4: PORTFOLIO SHOWCASE (Responsive Hover & Modal)
    // ------------------------------------------------------------------------
    gsap.utils.toArray('.grid-item').forEach((item) => {
        gsap.from(item, { scrollTrigger: { trigger: item, start: "top 85%" }, y: 60, opacity: 0, duration: 0.8 });
    });

    const portfolioModal = document.querySelector('.portfolio-modal');
    const portfolioModalContent = document.querySelector('.portfolio-modal .modal-content');
    const closePortfolioModalBtn = document.querySelector('.portfolio-modal .modal-close');

    // Detect if device supports physical mouse hover (Desktop vs Mobile)
    const canHover = window.matchMedia('(hover: hover)').matches;

    document.querySelectorAll('.grid-item').forEach(item => {
        const video = item.querySelector('.hover-video');
        if(video) {
            if (canHover) {
                // DESKTOP: Play on hover, pause on leave
                item.addEventListener('mouseenter', () => video.play().catch(()=>{}));
                item.addEventListener('mouseleave', () => video.pause());
            } else {
                // MOBILE/TABLET: Autoplay muted thumbnails in the background
                video.muted = true;
                video.setAttribute('playsinline', '');
                // Thoda delay deke play karenge taaki lag na ho
                setTimeout(() => video.play().catch(()=>{}), 500); 
            }
            
            // BOTH: Tap/Click to open immersive modal
            item.addEventListener('click', () => {
                const src = video.getAttribute('src');
                if(portfolioModalContent) {
                    // Inject video with controls for the modal
                    portfolioModalContent.innerHTML = `<video src="${src}" controls autoplay playsinline></video>`;
                }
                
                if(portfolioModal) portfolioModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock background scrolling
                
                gsap.fromTo(portfolioModalContent, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)" });
                gsap.to('.cursor-follower', { scale: 0, opacity: 0, duration: 0.3 }); 
            });
        }
    });

    const closePortfolioModal = () => {
        gsap.to(portfolioModalContent, { 
            scale: 0.9, opacity: 0, duration: 0.3, 
            onComplete: () => {
                if(portfolioModal) portfolioModal.classList.remove('active');
                if(portfolioModalContent) portfolioModalContent.innerHTML = ''; 
                document.body.style.overflow = ''; // Unlock background scrolling
                gsap.to('.cursor-follower', { scale: 1, opacity: 1, duration: 0.3 }); 
            }
        });
    };
    
    if(closePortfolioModalBtn) closePortfolioModalBtn.addEventListener('click', closePortfolioModal);
    if(portfolioModal) portfolioModal.addEventListener('click', (e) => { 
        // Close if user clicks outside the video
        if (e.target === portfolioModal) closePortfolioModal(); 
    });

    
    // ------------------------------------------------------------------------
    // 8. SCENE 5: THE CINEMATIC WORKSPACE (PROCESS SECTION NLE SIMULATION)
    // ------------------------------------------------------------------------
    const workspaceSection = document.querySelector('.cinematic-workspace-section');
    
    if(workspaceSection) {
        const isMobileDevice = window.innerWidth < 768;

        if (!isMobileDevice) {
            // ==========================================
            // DESKTOP: Heavy Pinned Horizontal Scrubbing
            // ==========================================
            const wpTl = gsap.timeline({
                scrollTrigger: { trigger: workspaceSection, start: "top top", end: "+=4000", pin: true, scrub: 1 }
            });

            wpTl.to('.timeline-tracks-mover', { x: "-400vw", ease: "none", duration: 4 }, 0);
            wpTl.to({}, {
                duration: 4,
                onUpdate: function() {
                    const progress = this.progress(); 
                    const seconds = Math.floor(progress * 60);
                    const frames = Math.floor((progress * 60 * 24) % 24);
                    const tcDisplay = document.querySelector('.timecode-display');
                    if(tcDisplay) tcDisplay.innerText = `00:00:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
                    
                    document.querySelectorAll('.nle-clip').forEach(clip => {
                        const rect = clip.getBoundingClientRect();
                        const playheadX = window.innerWidth / 2; 
                        if (rect.left < playheadX && rect.right > playheadX) {
                            clip.classList.add('active-clip');
                        } else {
                            clip.classList.remove('active-clip');
                        }
                    });
                }
            }, 0);

            // Phase changes (1 to 4)
            wpTl.to('.layer-raw', { opacity: 0, duration: 0.1 }, 1);
            wpTl.to('.layer-cut', { opacity: 1, duration: 0.1 }, 1);
            wpTl.to('.step-raw', { opacity: 0.3 }, 1);
            wpTl.to('.step-raw .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 1);
            wpTl.to('.step-cut', { opacity: 1 }, 1);
            wpTl.to('.step-cut .step-num', { color: "#08d9d6", textShadow: "0 0 10px #08d9d6" }, 1);

            wpTl.to('.layer-cut', { opacity: 0, duration: 0.3 }, 2);
            wpTl.to('.layer-color', { opacity: 1, duration: 0.3 }, 2);
            wpTl.to('.step-cut', { opacity: 0.3 }, 2);
            wpTl.to('.step-cut .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 2);
            wpTl.to('.step-color', { opacity: 1 }, 2);
            wpTl.to('.step-color .step-num', { color: "#08d9d6", textShadow: "0 0 10px #08d9d6" }, 2);

            wpTl.to('.layer-color', { opacity: 0, duration: 0.3 }, 3);
            wpTl.to('.layer-final', { opacity: 1, duration: 0.3 }, 3);
            wpTl.to('.step-color', { opacity: 0.3 }, 3);
            wpTl.to('.step-color .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 3);
            wpTl.to('.step-final', { opacity: 1 }, 3);
            wpTl.to('.step-final .step-num', { color: "#ff2e63", textShadow: "0 0 10px #ff2e63" }, 3); 

            // Climax
            wpTl.to('.workspace-container', { opacity: 0, filter: "blur(20px)", scale: 0.95, duration: 0.5 }, 3.8);
            wpTl.fromTo('.final-process-climax', 
                { opacity: 0, scale: 0.8, pointerEvents: "none" }, 
                { opacity: 1, scale: 1, duration: 0.5, pointerEvents: "all" }, 3.8
            );

        } else {
            // ==========================================
            // MOBILE: Vertical Reveal & Smooth Monitor Scrub
            // ==========================================
            
            // 1. Reveal Monitor smoothly
            gsap.from(".preview-monitor-wrapper", {
                scrollTrigger: { trigger: ".preview-monitor-wrapper", start: "top 85%" },
                y: 30, opacity: 0, duration: 0.8, ease: "power2.out"
            });

            // 2. The Process Animation (Tied to scrolling past the steps)
            const mobileProcessTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".process-side-panel", 
                    start: "top 60%", // Starts animating when steps are in view
                    end: "bottom 40%", 
                    scrub: 1
                }
            });

            // Reset Initial States
            gsap.set(".layer-raw", { opacity: 1 });
            gsap.set(".layer-cut, .layer-color, .layer-final", { opacity: 0 });
            gsap.set(".step-item", { opacity: 0.3 });
            gsap.set(".step-raw", { opacity: 1 });

            // Step 1 to 2 (RAW -> CUT)
            mobileProcessTl.to('.layer-raw', { opacity: 0, duration: 1 }, 1)
                           .to('.layer-cut', { opacity: 1, duration: 1 }, 1)
                           .to('.step-raw', { opacity: 0.3 }, 1)
                           .to('.step-cut', { opacity: 1 }, 1)
                           .to('.step-cut .step-num', { color: "#08d9d6", textShadow: "0 0 10px #08d9d6" }, 1);

            // Step 2 to 3 (CUT -> COLOR)
            mobileProcessTl.to('.layer-cut', { opacity: 0, duration: 1 }, 2)
                           .to('.layer-color', { opacity: 1, duration: 1 }, 2)
                           .to('.step-cut', { opacity: 0.3 }, 2)
                           .to('.step-cut .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 2)
                           .to('.step-color', { opacity: 1 }, 2)
                           .to('.step-color .step-num', { color: "#08d9d6", textShadow: "0 0 10px #08d9d6" }, 2);

            // Step 3 to 4 (COLOR -> FINAL)
            mobileProcessTl.to('.layer-color', { opacity: 0, duration: 1 }, 3)
                           .to('.layer-final', { opacity: 1, duration: 1 }, 3)
                           .to('.step-color', { opacity: 0.3 }, 3)
                           .to('.step-color .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 3)
                           .to('.step-final', { opacity: 1 }, 3)
                           .to('.step-final .step-num', { color: "#ff2e63", textShadow: "0 0 10px #ff2e63" }, 3);

            // 3. Slide in the stacked clips
            gsap.from(".nle-clip", {
                scrollTrigger: { trigger: ".workspace-bottom", start: "top 85%" },
                x: -30, opacity: 0, stagger: 0.1, duration: 0.6, ease: "back.out(1.2)"
            });
        }
    }


    // ------------------------------------------------------------------------
    // 9. SCENE 6: SHOWREEL (Pause/Play btn)
    // ------------------------------------------------------------------------
    const mainVideo = document.getElementById('main-showreel');
    if (mainVideo) {
        gsap.to(".showreel-video", { scrollTrigger: { trigger: ".showreel-container", scrub: true }, y: 100, ease: "none" });
        const playPauseBtn = document.getElementById('play-pause-btn');
        const playStatus = document.getElementById('play-status');
        if(playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (mainVideo.paused) { mainVideo.play(); playStatus.innerText = "PAUSE"; } 
                else { mainVideo.pause(); playStatus.innerText = "PLAY"; }
            });
        }
    }


    // ------------------------------------------------------------------------
    // 10. SCENE 7: THE TRANSMISSION (CINEMATIC CONTACT SEQUENCE)
    // ------------------------------------------------------------------------
    const transmissionSection = document.querySelector('.cinematic-transmission-section');
    
    if (transmissionSection) {
        // Scroll Animation (Fade in smoothly when scrolled to)
        gsap.from(".hook-title, .hook-sub, .comlink-btn", {
            scrollTrigger: { trigger: transmissionSection, start: "top 80%" },
            y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
        });
        gsap.from(".signal-interface", {
            scrollTrigger: { trigger: transmissionSection, start: "top 70%" },
            scale: 0.95, opacity: 0, filter: "blur(10px)", duration: 1.5, ease: "power2.out"
        });

        // Typing Pulse Effect (Micro-interaction)
        const inputs = document.querySelectorAll('.input-wrapper input, .input-wrapper textarea');
        inputs.forEach(input => {
            input.addEventListener('keydown', () => {
                input.classList.remove('input-pulse');
                void input.offsetWidth; // Trigger reflow
                input.classList.add('input-pulse');
            });
        });

        // The Submit Experience Timeline
        const form = document.getElementById('cinematic-transmission-form');
        const overlay = document.querySelector('.transmission-overlay');
        const btnText = document.querySelector('.transmit-btn-text');
        const isMobileDevice = window.innerWidth < 768; // Device check for performance

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault(); 

                if(typeof clickSound !== 'undefined' && clickSound) { clickSound.currentTime = 0; clickSound.play().catch(()=>{}); }

                const submitTl = gsap.timeline();

                btnText.innerHTML = "TRANSMITTING...";
                
                submitTl.to(form, { opacity: 0, duration: 0.4, ease: "power2.inOut" })
                        .call(() => overlay.classList.add('active'))
                        
                        .to(".line-1", { opacity: 1, y: -10, duration: 0.4, ease: "power2.out" }) 
                        .to(".line-1", { opacity: 0.3, duration: 0.2 }, "+=0.8") 
                        
                        .to(".line-2", { opacity: 1, y: -10, duration: 0.4, ease: "power2.out" }, "-=0.2") 
                        .to(".line-2", { opacity: 0.3, duration: 0.2 }, "+=0.8") 
                        
                        // MOBILE OPTIMIZATION: Remove heavy blur filter, rely on scale & opacity
                        .fromTo(".line-3", 
                            { opacity: 0, scale: 0.8, filter: isMobileDevice ? "blur(0px)" : "blur(20px)" }, 
                            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "back.out(1.5)" }
                        ) 

                        .to(overlay, { opacity: 0, duration: 0.8, delay: 2, ease: "power2.inOut" })
                        .call(() => {
                            overlay.classList.remove('active');
                            form.reset(); 
                            btnText.innerHTML = "INITIATE TRANSMISSION";
                            gsap.set([".line-1", ".line-2", ".line-3"], { opacity: 0, y: 0, scale: 1, filter: "blur(0px)" });
                        })
                        .to(form, { opacity: 1, duration: 0.4 });
            });
        }
    }
    // ------------------------------------------------------------------------
    // 11. SMART SKIP BUTTON LOGIC (CINEMATIC TIMELINE)
    // ------------------------------------------------------------------------
    const skipBtn = document.getElementById('skip-timeline-btn');
    const processSection = document.getElementById('scene-process'); // Timeline Section
    const nextSection = document.getElementById('scene-6'); // The Showreel Section

    if (skipBtn && processSection && nextSection) {
        
        // 1. Appearance & Auto-Hide Logic using ScrollTrigger
        ScrollTrigger.create({
            trigger: processSection,
            start: "top 20%", // Appears slightly after entering
            end: "70% center", // Auto-hides when 70% of the timeline is scrolled
            onEnter: () => gsap.to(skipBtn, { opacity: 1, y: 0, pointerEvents: "all", duration: 0.6, ease: "power3.out" }),
            onLeave: () => gsap.to(skipBtn, { opacity: 0, y: 30, pointerEvents: "none", duration: 0.4, ease: "power2.in" }),
            onEnterBack: () => gsap.to(skipBtn, { opacity: 1, y: 0, pointerEvents: "all", duration: 0.6, ease: "power3.out" }),
            onLeaveBack: () => gsap.to(skipBtn, { opacity: 0, y: 30, pointerEvents: "none", duration: 0.4, ease: "power2.in" })
        });

        // 2. Premium Click & Scroll Logic
        skipBtn.addEventListener('click', (e) => {
            // Audio Feedback
            if(typeof clickSound !== 'undefined' && clickSound) {
                clickSound.currentTime = 0; 
                clickSound.play().catch(()=>{});
            }
            
            // Standard Ripple Effect
            const rect = skipBtn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x - size / 2}px`;
            ripple.style.top = `${y - size / 2}px`;
            skipBtn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            // Cinematic Lenis Scroll
            lenis.scrollTo(nextSection, {
                duration: 2.5, // Slow, dramatic glide to the next scene
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
            
            // Hide button instantly to avoid awkward hovering during auto-scroll
            gsap.to(skipBtn, { opacity: 0, y: 30, pointerEvents: "none", duration: 0.4 });
        });

        // 3. Hover Scale & Custom Cursor Sync
        skipBtn.addEventListener('mouseenter', () => {
            gsap.to(skipBtn, { scale: 1.08, duration: 0.4, ease: "back.out(1.5)" });
            
            // Expand Custom Cursor
            const cursorFollower = document.querySelector('.cursor-follower');
            if(cursorFollower) {
                gsap.to(cursorFollower, { scale: 2.5, backgroundColor: "rgba(8, 217, 214, 0.1)", borderColor: "rgba(255, 46, 99, 0.8)", duration: 0.3 });
            }
            // Hover Sound
            if(typeof hoverSound !== 'undefined' && hoverSound) {
                hoverSound.currentTime = 0; 
                hoverSound.play().catch(()=>{});
            }
        });

        skipBtn.addEventListener('mouseleave', () => {
            gsap.to(skipBtn, { scale: 1, duration: 0.4, ease: "power2.out" });
            
            // Reset Custom Cursor
            const cursorFollower = document.querySelector('.cursor-follower');
            if(cursorFollower) {
                gsap.to(cursorFollower, { scale: 1, backgroundColor: "transparent", borderColor: "var(--accent-cyan)", duration: 0.3 });
            }
        });
    }


    // ------------------------------------------------------------------------
    // 12. SCENE 8: THE NETWORK (CINEMATIC EXIT PANEL)
    // ------------------------------------------------------------------------
    const exitSection = document.querySelector('.cinematic-exit-panel');
    
    if(exitSection) {
        // 1. Entry Animations
        gsap.from(".exit-title", {
            scrollTrigger: { trigger: exitSection, start: "top 85%" },
            y: 50, opacity: 0, duration: 1, ease: "power3.out"
        });

        // Staggered pop-in for cards
        gsap.from(".network-card", {
            scrollTrigger: { trigger: exitSection, start: "top 75%" },
            y: 80, opacity: 0, scale: 0.8, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)"
        });

        // Fade in copyright
        gsap.from(".exit-copyright", {
            scrollTrigger: { trigger: exitSection, start: "top 90%" },
            opacity: 0, duration: 2, delay: 1
        });

        // 2. Cursor, Sound & Ripple logic for Network Cards
        const networkCards = document.querySelectorAll('.interactive-network-el');
        
        networkCards.forEach(card => {
            // Ripple & Click Sound
            card.addEventListener('click', function(e) {
                if(typeof clickSound !== 'undefined' && clickSound) {
                    clickSound.currentTime = 0; 
                    clickSound.play().catch(()=>{});
                }
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x - size / 2}px`;
                ripple.style.top = `${y - size / 2}px`;
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });

            // Hover Sound & Cursor Reaction
            card.addEventListener('mouseenter', () => {
                if(typeof hoverSound !== 'undefined' && hoverSound) {
                    hoverSound.currentTime = 0; 
                    hoverSound.play().catch(()=>{});
                }
                const cursorFollower = document.querySelector('.cursor-follower');
                if(cursorFollower) {
                    gsap.to(cursorFollower, { scale: 2.5, backgroundColor: "rgba(8, 217, 214, 0.1)", borderColor: "var(--accent-cyan)", duration: 0.3 });
                }
            });

            card.addEventListener('mouseleave', () => {
                const cursorFollower = document.querySelector('.cursor-follower');
                if(cursorFollower) {
                    gsap.to(cursorFollower, { scale: 1, backgroundColor: "transparent", borderColor: "var(--accent-cyan)", duration: 0.3 });
                }
            });
        });
    }


    
    // Global Background Drift (Ensures deep motion across whole site)
    gsap.to('.global-ambient-canvas', {
        backgroundPosition: "50% 100%", 
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.5 }
    });
});