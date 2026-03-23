window.addEventListener("load", () => {
    // ------------------------------------------------------------------------
    // 1. SETUP: GSAP aur Lenis (Smooth Scroll)
    // ------------------------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        smooth: true,
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
    const openingTl = gsap.timeline({ paused: true });

    // Initial State Setup
    gsap.set(".line-calm", { opacity: 0, y: 50 });
    gsap.set(".line-impact", { opacity: 0, scale: 0.7, filter: "blur(20px)" });
    gsap.set(".hero-cta-container, .cinematic-scroll-indicator", { opacity: 0, y: 20 });

    // --- PRELOADER COMPLETION HOOK ---
    const preloaderTl = gsap.timeline({
        onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
            ScrollTrigger.refresh(); 
            openingTl.play(); // Action starts!
        }
    });
    preloaderTl.to(".preloader-text", { opacity: 1, duration: 1 })
               .to(".loading-bar", { width: "100%", duration: 1.5 })
               .to(".preloader", { y: "-100vh", duration: 1, ease: "power4.inOut", delay: 0.2 });

    // --- THE DIRECTOR's CUT (Hero Animation Sequence) ---
    
    // PHASE 1: The Calm Entry (Slow, deliberate)
    openingTl.to(".line-calm", { opacity: 1, y: 0, duration: 2, ease: "power2.out" })
             // Brief suspenseful pause
             .to({}, { duration: 0.6 }); 

    // PHASE 2 & 3: The Impact Build-Up & Drop
    openingTl.to(".line-impact", { 
                opacity: 1, scale: 1.1, filter: "blur(0px)", 
                duration: 0.8, ease: "power3.inOut" 
             })
             // The SNAP (1.1 to 1.0) synced with flashes & shake
             .add("impact-moment")
             .to(".line-impact", { scale: 1, duration: 0.2, ease: "power4.out" }, "impact-moment")
             
             // Quick Glitch Effect on text
             .to(".line-impact", { skewX: 10, textShadow: "-5px 0 red, 5px 0 cyan", duration: 0.05, yoyo: true, repeat: 3 }, "impact-moment")
             
             // Camera Shake (Subtle hit on the wrapper)
             .to(".hero-content-wrapper", { x: "-2px", y: "2px", duration: 0.05, yoyo: true, repeat: 4 }, "impact-moment")
             
             // Cinematic Flash Cuts (Red -> Cyan -> White flash)
             .to(".frame-red", { opacity: 0.8, duration: 0.05, yoyo: true, repeat: 1 }, "impact-moment")
             .to(".frame-cyan", { opacity: 0.6, duration: 0.05, delay: 0.1, yoyo: true, repeat: 1 }, "impact-moment")
             .to(".frame-white", { opacity: 0.9, duration: 0.05, delay: 0.2, yoyo: true, repeat: 1 }, "impact-moment")

             // Fade in UI Elements
             .to([".hero-cta-container", ".cinematic-scroll-indicator"], { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" });

    // --- INTERACTION: Mouse Parallax & Magnetic Button ---
    const heroSection = document.querySelector('.hero-cinematic-section');
    const heroTiltTarget = document.getElementById('hero-tilt-target');
    const heroOrb = document.querySelector('.hero-interactive-orb');
    const magBtn = document.querySelector('.magnetic-btn');

    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            // 1. Interactive Light Orb follows cursor slowly
            gsap.to(heroOrb, { left: e.clientX, top: e.clientY, duration: 0.6, ease: "power2.out" });
            
            // 2. 3D Tilt of the text
            const xAxis = (window.innerWidth / 2 - e.clientX) / 40;
            const yAxis = (window.innerHeight / 2 - e.clientY) / 40;
            gsap.to(heroTiltTarget, { rotationY: xAxis, rotationX: yAxis, duration: 1, ease: "power1.out" });
        });
        
        heroSection.addEventListener('mouseleave', () => {
            gsap.to(heroTiltTarget, { rotationY: 0, rotationX: 0, duration: 1 });
            gsap.to(heroOrb, { left: "50%", top: "50%", duration: 1 });
        });
    }

    // Magnetic Button Logic
    if(magBtn) {
        magBtn.addEventListener('mousemove', (e) => {
            const rect = magBtn.getBoundingClientRect();
            const hx = e.clientX - rect.left - rect.width / 2;
            const hy = e.clientY - rect.top - rect.height / 2;
            // Pull button towards cursor (20% of distance)
            gsap.to(magBtn, { x: hx * 0.2, y: hy * 0.2, duration: 0.3, ease: "power2.out" });
            gsap.to(".btn-text", { x: hx * 0.1, y: hy * 0.1, duration: 0.3 }); // Parallax text inside btn
        });
        magBtn.addEventListener('mouseleave', () => {
            gsap.to(magBtn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            gsap.to(".btn-text", { x: 0, y: 0, duration: 0.5 });
        });
    }

    // --- SCROLL BLENDING: Seamless exit into Scene 2 ---
    gsap.to('.hero-content-wrapper', {
        y: -150,          // Move up
        opacity: 0,       // Fade out
        scale: 0.9,       // Shrink slightly
        filter: "blur(15px)", // Lose focus
        scrollTrigger: {
            trigger: '.hero-cinematic-section',
            start: "top top",
            end: "bottom top", // Fully faded by the time hero section leaves screen
            scrub: 1 // Tied directly to scroll speed
        }
    });


    // ------------------------------------------------------------------------
    // 5. SCENE 2: THE CINEMATIC TRAILER (ABOUT SECTION) - RESTORED!
    // ------------------------------------------------------------------------
    const trailerSection = document.querySelector('.cinematic-trailer-section');
    
    if(trailerSection) {
        const trailerTl = gsap.timeline({
            scrollTrigger: {
                trigger: trailerSection,
                start: "top top", 
                end: "+=4000",    
                pin: true,        
                scrub: 1          
            }
        });

        // PHASE 1: Calm Intro
        trailerTl.fromTo(".calm-text", 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, stagger: 0.8, duration: 2, ease: "power2.out" }
        )
        .to(".calm-text", { opacity: 0, y: -30, stagger: 0.2, duration: 1, delay: 1 }, "+=1");

        // PHASE 2: Build Up
        trailerTl.to(".float-vid-card", { opacity: 1, y: -20, stagger: 0.5, duration: 2 }, "<")
                 .to(".float-code", { opacity: 0.3, y: -50, stagger: 0.2, duration: 2 }, "<");

        // PHASE 3: Impact
        trailerTl.fromTo(".impact-text", 
            { scale: 0.6, opacity: 0, filter: "blur(20px)" }, 
            { scale: 1.1, opacity: 1, filter: "blur(0px)", duration: 1.5, ease: "power3.inOut" }, "+=0.5"
        )
        .to(".impact-text", { scale: 1, duration: 0.2, ease: "power4.out" })
        .fromTo(".impact-glow-burst", 
            { opacity: 0, scale: 0.5 }, 
            { opacity: 1, scale: 1.5, duration: 0.3 }, "<"
        )
        .to(".impact-glow-burst", { opacity: 0, duration: 1 }) 
        .to(".impact-text", { opacity: 0, scale: 1.05, filter: "blur(10px)", duration: 1, delay: 1 });

        // PHASE 4: Immersive Reveal & Smooth Exit
        trailerTl.to(".float-vid-card, .float-code", { opacity: 0, duration: 1 }, "<");
        
        trailerTl.to(".phase-4-immersive", { opacity: 1, pointerEvents: "all", duration: 1 })
                 .fromTo(".tl-item", 
                    { x: -30 }, 
                    { x: 0, opacity: 1, stagger: 0.5, duration: 1, ease: "power2.out" }, "<"
                 )
                 .to(".tl-dot", { background: "#08d9d6", boxShadow: "0 0 15px #08d9d6", stagger: 0.5, duration: 0.5 }, "<")
                 .to(".phase-4-immersive", { opacity: 0, scale: 0.95, filter: "blur(20px)", duration: 2, delay: 1 });


        // Mouse Movement Parallax Setup 
        trailerSection.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.clientX) / 50;
            const yAxis = (window.innerHeight / 2 - e.clientY) / 50;
            
            gsap.to('.layer-bg', { x: xAxis, y: yAxis, duration: 1 });
            gsap.to('.layer-mid', { x: xAxis * -1.5, y: yAxis * -1.5, duration: 1 });
        });

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
    gsap.fromTo(".reactor-container", 
        { scale: 0.5, opacity: 0, filter: "blur(30px)" },
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
        const orbitAnimation = gsap.to(orbitSystem, {
            rotation: 360, duration: 40, repeat: -1, ease: "none"
        });

        const counterOrbitAnimation = gsap.to(skillNodes, {
            rotation: -360, duration: 40, repeat: -1, ease: "none"
        });

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
            wrapper.addEventListener('mouseenter', () => {
                orbitAnimation.pause();
                counterOrbitAnimation.pause();
                if(hoverSound) { hoverSound.currentTime = 0; hoverSound.play().catch(()=>{}); }
            });
            
            wrapper.addEventListener('mouseleave', () => {
                orbitAnimation.play();
                counterOrbitAnimation.play();
            });

            wrapper.addEventListener('click', () => {
                if(clickSound) { clickSound.currentTime = 0; clickSound.play().catch(()=>{}); }
                
                const skillKey = wrapper.getAttribute('data-skill');
                const data = skillData[skillKey];

                if(data && reactorModal) {
                    document.getElementById('reactor-title').innerText = data.title;
                    document.getElementById('reactor-desc').innerText = data.desc;
                    document.getElementById('reactor-tools').innerText = data.tools;
                    document.getElementById('reactor-video-player').src = data.vid;
                    
                    reactorModal.classList.add('active');
                    gsap.to('.cursor-follower', { scale: 0, opacity: 0, duration: 0.3 }); 
                }
            });
        });

        const closeReactorModal = () => {
            if(reactorModal) reactorModal.classList.remove('active');
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
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.clientX) / 80;
            const yAxis = (window.innerHeight / 2 - e.clientY) / 80;
            if(reactorContainer) gsap.to(reactorContainer, { x: xAxis, y: yAxis, duration: 1, ease: "power1.out" });
        });
    }

    // ------------------------------------------------------------------------
    // 7. SCENE 4: PORTFOLIO SHOWCASE (Hover Video & Fullscreen Modal)
    // ------------------------------------------------------------------------
    gsap.utils.toArray('.grid-item').forEach((item) => {
        gsap.from(item, { scrollTrigger: { trigger: item, start: "top 85%" }, y: 60, opacity: 0, duration: 0.8 });
    });

    const portfolioModal = document.querySelector('.portfolio-modal');
    const portfolioModalContent = document.querySelector('.portfolio-modal .modal-content');
    const closePortfolioModalBtn = document.querySelector('.portfolio-modal .modal-close');

    document.querySelectorAll('.grid-item').forEach(item => {
        const video = item.querySelector('.hover-video');
        if(video) {
            item.addEventListener('mouseenter', () => video.play());
            item.addEventListener('mouseleave', () => video.pause());
            
            item.addEventListener('click', () => {
                const src = video.getAttribute('src');
                if(portfolioModalContent) {
                    portfolioModalContent.innerHTML = `<video src="${src}" controls autoplay playsinline></video>`;
                }
                if(portfolioModal) portfolioModal.classList.add('active');
                gsap.fromTo(portfolioModalContent, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 });
                gsap.to('.cursor-follower', { scale: 0, opacity: 0, duration: 0.3 }); 
            });
        }
    });

    const closePortfolioModal = () => {
        gsap.to(portfolioModalContent, { 
            scale: 0.8, opacity: 0, duration: 0.4, 
            onComplete: () => {
                if(portfolioModal) portfolioModal.classList.remove('active');
                if(portfolioModalContent) portfolioModalContent.innerHTML = ''; 
                gsap.to('.cursor-follower', { scale: 1, opacity: 1, duration: 0.3 }); 
            }
        });
    };
    
    if(closePortfolioModalBtn) closePortfolioModalBtn.addEventListener('click', closePortfolioModal);
    if(portfolioModal) portfolioModal.addEventListener('click', (e) => { if (e.target === portfolioModal) closePortfolioModal(); });


    // ------------------------------------------------------------------------
    // 8. SCENE 5: THE CINEMATIC WORKSPACE (PROCESS SECTION NLE SIMULATION)
    // ------------------------------------------------------------------------
    const workspaceSection = document.querySelector('.cinematic-workspace-section');
    
    if(workspaceSection) {
        const wpTl = gsap.timeline({
            scrollTrigger: {
                trigger: workspaceSection,
                start: "top top",
                end: "+=4000", 
                pin: true,
                scrub: 1
            }
        });

        // 1. Move Timeline Tracks Horizontally 
        wpTl.to('.timeline-tracks-mover', { x: "-400vw", ease: "none", duration: 4 }, 0);

        // 2. Dynamic Timecode Update
        wpTl.to({}, {
            duration: 4,
            onUpdate: function() {
                const progress = this.progress(); // 0 to 1
                const seconds = Math.floor(progress * 60);
                const frames = Math.floor((progress * 60 * 24) % 24);
                const tcDisplay = document.querySelector('.timecode-display');
                if(tcDisplay) tcDisplay.innerText = `00:00:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
                
                // Real-time Clip Active State (Highlights clip under playhead)
                document.querySelectorAll('.nle-clip').forEach(clip => {
                    const rect = clip.getBoundingClientRect();
                    const playheadX = window.innerWidth / 2; // Center of screen
                    if (rect.left < playheadX && rect.right > playheadX) {
                        clip.classList.add('active-clip');
                    } else {
                        clip.classList.remove('active-clip');
                    }
                });
            }
        }, 0);

        // PHASE 1 to 2: RAW -> CUT (Time: 1)
        wpTl.to('.layer-raw', { opacity: 0, duration: 0.1 }, 1);
        wpTl.to('.layer-cut', { opacity: 1, duration: 0.1 }, 1);
        wpTl.to('.step-raw', { opacity: 0.3 }, 1);
        wpTl.to('.step-raw .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 1);
        wpTl.to('.step-cut', { opacity: 1 }, 1);
        wpTl.to('.step-cut .step-num', { color: "#08d9d6", textShadow: "0 0 10px #08d9d6" }, 1);

        // PHASE 2 to 3: CUT -> COLOR GRADE (Time: 2)
        wpTl.to('.layer-cut', { opacity: 0, duration: 0.3 }, 2);
        wpTl.to('.layer-color', { opacity: 1, duration: 0.3 }, 2);
        wpTl.to('.step-cut', { opacity: 0.3 }, 2);
        wpTl.to('.step-cut .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 2);
        wpTl.to('.step-color', { opacity: 1 }, 2);
        wpTl.to('.step-color .step-num', { color: "#08d9d6", textShadow: "0 0 10px #08d9d6" }, 2);

        // PHASE 3 to 4: COLOR -> FINAL MASTER (Time: 3)
        wpTl.to('.layer-color', { opacity: 0, duration: 0.3 }, 3);
        wpTl.to('.layer-final', { opacity: 1, duration: 0.3 }, 3);
        wpTl.to('.step-color', { opacity: 0.3 }, 3);
        wpTl.to('.step-color .step-num', { color: "rgba(255,255,255,0.2)", textShadow: "none" }, 3);
        wpTl.to('.step-final', { opacity: 1 }, 3);
        wpTl.to('.step-final .step-num', { color: "#ff2e63", textShadow: "0 0 10px #ff2e63" }, 3); 

        // THE CLIMAX MOMENT (Time: 3.8 to 4)
        wpTl.to('.workspace-container', { opacity: 0, filter: "blur(20px)", scale: 0.95, duration: 0.5 }, 3.8);
        wpTl.fromTo('.final-process-climax', 
            { opacity: 0, scale: 0.8, pointerEvents: "none" }, 
            { opacity: 1, scale: 1, duration: 0.5, pointerEvents: "all" }, 3.8
        );
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

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault(); // Stop normal submission

                if(clickSound) { clickSound.currentTime = 0; clickSound.play().catch(()=>{}); }

                // Create a GSAP Timeline for the sequence
                const submitTl = gsap.timeline();

                // STEP 1: Button changes
                btnText.innerHTML = "TRANSMITTING...";
                
                // STEP 2: Form fades out, Overlay fades in
                submitTl.to(form, { opacity: 0, duration: 0.5, ease: "power2.inOut" })
                        .call(() => overlay.classList.add('active'))
                        
                        // STEP 3 & 4: Sequence the text
                        .to(".line-1", { opacity: 1, y: -10, duration: 0.5, ease: "power2.out" }) // Connecting...
                        .to(".line-1", { opacity: 0.3, duration: 0.3 }, "+=1") // Dim it
                        
                        .to(".line-2", { opacity: 1, y: -10, duration: 0.5, ease: "power2.out" }, "-=0.2") // Signal Locked
                        .to(".line-2", { opacity: 0.3, duration: 0.3 }, "+=1") // Dim it
                        
                        .fromTo(".line-3", 
                            { opacity: 0, scale: 0.5, filter: "blur(20px)" }, 
                            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "back.out(1.7, 0.3)" }
                        ) // TRANSMISSION RECEIVED Boom!

                        // STEP 5: Hold success screen, then reset
                        .to(overlay, { opacity: 0, duration: 1, delay: 2.5, ease: "power2.inOut" })
                        .call(() => {
                            overlay.classList.remove('active');
                            form.reset(); // Clear inputs
                            btnText.innerHTML = "INITIATE TRANSMISSION";
                            // Reset text states for next time
                            gsap.set([".line-1", ".line-2", ".line-3"], { opacity: 0, y: 0, scale: 1, filter: "blur(0px)" });
                        })
                        .to(form, { opacity: 1, duration: 0.5 });
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