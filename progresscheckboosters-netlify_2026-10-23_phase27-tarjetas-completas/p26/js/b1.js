/* Level B1 - settings, data and screens. Shared logic lives in engine.js. */
const LEVEL = {
    btn: 'text-xs font-black bg-brand-coral text-white px-3 py-2 rounded-xl uppercase tracking-wider hover:bg-brand-magenta transition',
    id: 'b1',
    code: 'B1',
    lang: 'en',
    prefix: 'pcb_b1_',
    surveyBase: 'https://docs.google.com/forms/d/e/1FAIpQLSfRUQGjKNTtmVrRp1W5c2WGS6AGqiQa1cZQ81ryPdOlTTv9Xw/viewform',
    teacherSurvey: 'https://docs.google.com/forms/d/e/1FAIpQLSf6pLT3VLV6eXo-LcAwcnr0XIfEQ1JThAWI2FER5fPyjM7GvQ/viewform',
    regexAnswers: false,
    theme: {
        vocabAccent: 'brand-coral',
        ring: 'ring-brand-coral/40',
        cardBorder: '#20B15A',
        cardShadow: '0 20px 35px -8px rgba(32, 177, 90, 0.22), 0 8px 16px -4px rgba(11, 111, 69, 0.08)',
        cardIdleBorder: '#E2E8F0',
        dotActive: 'bg-brand-coral',
        emptyIcon: 'bg-brand-rose text-brand-coral',
        emptyLink: 'text-brand-coral',
        catHead: 'text-brand-coral',
        mark: 'bg-brand-sunset/30 text-brand-midnight font-black p-0',
        wordColor: 'text-brand-midnight',
        minFill: '1',
        fillActive: 'h-full bg-gradient-to-r from-brand-coral via-brand-coral to-brand-fuchsiadeep transition-all duration-300',
        fillDone: 'h-full bg-brand-coral transition-all duration-300',
        okSpan: 'text-brand-magenta',
        okIcon: 'fill-brand-coral',
        avatarA: '🗣️',
        avatarB: '💬',
        avA: 'bg-brand-coral text-white',
        avB: 'bg-brand-fuchsia text-white',
        nameA: 'text-brand-coral',
        nameB: 'text-brand-magenta',
        youBg: 'bg-brand-coral',
        speakHover: 'hover:text-brand-coral',
        bubbleText: 'text-brand-midnight',
        chime: [587.33, 739.99, 0.08],
        notes: [493.88, 587.33, 739.99, 987.77],
        confetti: ['#20B15A', '#0E5A2A', '#A8D93B', '#58D0BB', '#10B981', '#F59E0B']
    },
    ui: {
        copyTitle: 'Click to copy',
        speakLabel: 'Listen to pronunciation',
        finalExam: 'Final Exam',
        unitWord: 'Units',
        keyWords: 'key words',
        emptyTitle: 'No matching words found',
        emptyHint: 'Try another keyword or select another category filter.',
        emptyReset: 'Reset Search',
        roleA: 'Role A',
        roleB: 'Role B',
        youText: 'YOU',
        okMsg: 'Fantastic work! All blanks are filled in. Review them once more before speaking.',
        progress: (filled, total, percent) => `${filled} of ${total} spaces completed (${percent}%)`,
        missingMsg: (missing) => `${missing} space(s) remain empty or require revision. Check them!`
    }
};

// Level content (units, vocabulary, templates, speaking cards) lives in data/b1.json and is loaded by loadLevelData() (js/engine.js).

/* Pantallas propias de este nivel: portada, vista del estudiante y panel docente. El resto de la lógica está en engine.js. */

        function renderLanding() {
            if (landingLayoutMode === 'grid') {
                return `
                    <div class="space-y-6">
                        <div class="rounded-3xl bg-gradient-to-r from-brand-coral via-brand-coral to-brand-fuchsiadeep p-8 text-white text-center shadow-xl relative overflow-hidden">
                            <div class="relative z-10 max-w-xl mx-auto">
                                <span class="bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3">
                                    Interchange 5th Edition • Level B1
                                </span>
                                <h1 class="text-3xl md:text-5xl font-black uppercase tracking-tight">Progress Check Boosters</h1>
                                <p class="mt-2 text-white text-sm md:text-base font-medium leading-relaxed">
                                    Select a unit to access guided writing, speaking prompts, and communicative roleplays.
                                </p>
                            </div>
                        </div>

                        <!-- Layout switcher bar -->
                        <div class="flex justify-between items-center px-1">
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">${boosters.length} Available Units</span>
                            <div class="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                                <button data-act="setLandingLayoutMode" data-a0="carousel" class="px-3 py-1 rounded-lg text-gray-600 hover:text-brand-midnight transition">Carousel</button>
                                <button data-act="setLandingLayoutMode" data-a0="grid" class="px-3 py-1 rounded-lg bg-white text-brand-coral shadow-xs">Grid</button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${boosters.map(b => `
                                <div data-act="selectBooster" data-a0="${b.id}" class="glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group">
                                    <div class="h-36 overflow-hidden relative">
                                        <img src="${localImg(b.imageUrl)}" data-fallback="${escAttr(b.imageUrl)}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                        <span class="absolute top-3 left-3 bg-brand-midnight backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            ${b.units === "FINAL" ? "Final Exam" : "Units " + b.units}
                                        </span>
                                    </div>
                                    <div class="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center gap-1.5 mb-1">
                                                <span>${b.badgeEmoji}</span>
                                                <h3 class="font-black text-brand-midnight group-hover:text-brand-coral transition-colors text-base">${b.title}</h3>
                                            </div>
                                            <p class="text-xs text-gray-500 line-clamp-2">${b.teacher.focus}</p>
                                        </div>
                                        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-brand-coral">
                                            <span>Practice Booster</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            const activeBooster = boosters[carouselCurrentIndex] || boosters[0];
            const totalWords = activeBooster.vocabBank.reduce((acc, cat) => acc + cat.words.length, 0);

            return `
                <div class="space-y-6">
                    <div class="rounded-3xl bg-gradient-to-r from-brand-coral via-brand-coral to-brand-fuchsiadeep p-8 text-white text-center shadow-xl relative overflow-hidden">
                        <div class="relative z-10 max-w-xl mx-auto">
                            <span class="bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3">
                                Interchange 5th Edition • Level B1
                            </span>
                            <h1 class="text-3xl md:text-5xl font-black uppercase tracking-tight">Progress Check Boosters</h1>
                            <p class="mt-2 text-white text-sm md:text-base font-medium leading-relaxed">
                                Swipe or use arrow controls to explore and practice each interactive booster session.
                            </p>
                        </div>
                    </div>

                    <!-- Layout switcher bar -->
                    <div class="flex justify-between items-center px-1">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Unit ${carouselCurrentIndex + 1} of ${boosters.length}</span>
                        <div class="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                            <button data-act="setLandingLayoutMode" data-a0="carousel" class="px-3 py-1 rounded-lg bg-white text-brand-coral shadow-xs">Carousel</button>
                            <button data-act="setLandingLayoutMode" data-a0="grid" class="px-3 py-1 rounded-lg text-gray-600 hover:text-brand-midnight transition">Grid</button>
                        </div>
                    </div>

                    <!-- Carousel Stage Area -->
                    <div class="relative overflow-hidden py-2" 
                         ontouchstart="carouselTouchStartX = event.touches[0].clientX" 
                         ontouchend="if (carouselTouchStartX - event.changedTouches[0].clientX > 40) navigateCarousel('next'); else if (event.changedTouches[0].clientX - carouselTouchStartX > 40) navigateCarousel('prev');">
                        
                        <!-- Floating Navigation Arrow Prev -->
                        <button data-act="navigateCarousel" data-a0="prev" aria-label="Previous unit"
                                class="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-brand-midnight shadow-xl border border-gray-100 flex items-center justify-center font-black text-lg transition-all active:scale-90 hover:scale-105 hover:text-brand-coral">
                            ‹
                        </button>

                        <!-- Track of cards -->
                        <div id="carousel-track" class="flex gap-4 items-center transition-transform duration-300 ease-out py-4">
                            ${boosters.map((b, idx) => `
                                <div data-act="carouselCard" data-a0="${idx}" data-a1="${b.id}" 
                                     class="glass-card w-[260px] sm:w-[290px] shrink-0 rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between select-none">
                                    <div class="h-40 overflow-hidden relative">
                                        <img src="${localImg(b.imageUrl)}" data-fallback="${escAttr(b.imageUrl)}" alt="" class="w-full h-full object-cover pointer-events-none">
                                        <span class="absolute top-3 left-3 bg-brand-midnight backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            ${b.units === "FINAL" ? "Final Exam" : "Units " + b.units}
                                        </span>
                                    </div>
                                    <div class="p-4 flex-1 flex flex-col justify-between bg-white">
                                        <div>
                                            <div class="flex items-center gap-1.5 mb-0.5">
                                                <span>${b.badgeEmoji}</span>
                                                <h3 class="font-black text-brand-midnight text-base leading-snug line-clamp-1">${b.title}</h3>
                                            </div>
                                            <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">${b.teacher.focus}</p>
                                        </div>
                                        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-brand-coral">
                                            <span>Enter</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Floating Navigation Arrow Next -->
                        <button data-act="navigateCarousel" data-a0="next" aria-label="Next unit"
                                class="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-brand-midnight shadow-xl border border-gray-100 flex items-center justify-center font-black text-lg transition-all active:scale-90 hover:scale-105 hover:text-brand-coral">
                            ›
                        </button>
                    </div>

                    <!-- Dot Pagination Controls -->
                    <div class="carousel-dot-row flex items-center justify-center gap-1.5 py-1">
                        <span class="carousel-counter" aria-live="polite"></span>
                        ${boosters.map((_, idx) => `
                            <button data-act="navigateCarousel" data-a0="${idx}" aria-label="Go to unit ${idx + 1}"
                                    class="carousel-dot ${idx === carouselCurrentIndex ? 'w-6 h-2 rounded-full bg-brand-coral' : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'} transition-all duration-300"></button>
                        `).join('')}
                    </div>

                    <!-- Active Booster Live Preview Dock -->
                    <div class="glass-shell rounded-3xl p-5 md:p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div class="space-y-1 max-w-xl">
                            <div class="flex items-center gap-2">
                                <span id="carousel-preview-units" class="text-[10px] font-black uppercase tracking-widest text-brand-coral bg-brand-coral/5 px-2.5 py-0.5 rounded-full">
                                    ${activeBooster.units === 'FINAL' ? 'Final Exam' : 'Units ' + activeBooster.units}
                                </span>
                                <span id="carousel-preview-vocab-count" class="text-[10px] font-bold text-gray-500 font-mono">
                                    ${totalWords} key words
                                </span>
                            </div>
                            <h2 id="carousel-preview-title" class="text-xl md:text-2xl font-black text-brand-midnight tracking-tight flex items-center gap-2">
                                <span>${activeBooster.badgeEmoji}</span>
                                <span>${activeBooster.title}</span>
                            </h2>
                            <p id="carousel-preview-focus" class="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
                                ${activeBooster.teacher.focus}
                            </p>
                        </div>
                        <div class="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                            <button id="carousel-preview-vocab-btn" data-act="openVocabDrawer" data-a0="${activeBooster.id}" 
                                    class="flex-1 md:flex-none px-4 py-2.5 rounded-xl border-2 border-brand-coral text-brand-coral font-black text-xs uppercase tracking-wider hover:bg-brand-coral/5 transition active:scale-95 shadow-xs">
                                Vocabulary
                            </button>
                            <button id="carousel-preview-start-btn" data-act="selectBooster" data-a0="${activeBooster.id}" 
                                    class="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-coral via-brand-coral to-brand-fuchsiadeep text-white font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-md active:scale-95 flex items-center justify-center gap-2">
                                Start Booster →
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderStudentView() {
            const b = boosters.find(x => x.id === selectedBooster);
            const cards = speakingCards[b.id] || [];

            return `
                <div class="tw-back-nav flex justify-between items-center mb-4">
                    <button data-act="setView" data-a0="landing" class="text-xs font-bold text-gray-500 hover:text-brand-coral flex items-center gap-1.5 uppercase tracking-wider transition">
                        ← View all units
                    </button>
                    ${!isTeacherAuth ? `
                        <button data-act="activateTeacherMode" class="text-xs font-bold text-brand-coral bg-brand-coral/5 hover:bg-brand-coral/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition">
                            Teacher Access
                        </button>
                    ` : ''}
                </div>

                <!-- Hero Banner -->
                <div class="rounded-3xl bg-gradient-to-r from-brand-coral via-brand-coral to-brand-fuchsiadeep p-6 md:p-8 text-white relative overflow-hidden shadow-xl mb-6">
                    ${heroPhoto(b)}
                    <div class="relative z-10 max-w-xl">
                        <span class="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest inline-block mb-2">
                            ${b.units === "FINAL" ? "Final Exam" : "Units " + b.units}
                        </span>
                        <h1 class="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center gap-2">
                            <span>${b.title}</span>
                        </h1>
                        <p class="text-sm md:text-base text-white/90 mt-2 font-medium">${b.teacher.focus}</p>
                    </div>
                </div>

                <!-- Accordion Steps -->
                <div class="space-y-4">
                    
                    <!-- STEP 0: DIAGNOSTIC -->
                    <div data-step="0" ${activeStudentStep === 0 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="0" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-magenta text-white flex items-center justify-center font-black text-sm">0</span>
                                <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-magenta">Step 0: What do I want to review?</h3>
                            </div>
                            <span class="text-gray-400 font-black">${activeStudentStep === 0 ? '▲' : '▼'}</span>
                        </button>
                        <div class="step-accordion-grid">
                            <div class="overflow-hidden">
                                <div class="p-5 pt-0 border-t border-gray-100">
                                    <p class="text-xs text-gray-500 mb-3 font-semibold">Tick the grammar and communication goals you want to reinforce:</p>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                        ${b.student.diagOptions.map((opt, optIdx) => `
                                            <button data-act="toggleDiagTopic" data-a0="${optIdx}" class="p-3 text-left rounded-xl border text-xs font-bold transition flex items-center justify-between ${selectedDiagTopics.has(opt) ? 'bg-brand-coral/15 border-brand-coral text-brand-midnight shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600'}">
                                                <span>${opt}</span>
                                                <span>${selectedDiagTopics.has(opt) ? '✓' : '+'}</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                    <button data-act="setActiveStep" data-a0="1" class="w-full bg-brand-coral text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-md">
                                        Continue to Step 1: Writing →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 1: GUIDED & FREE WRITING -->
                    <div data-step="1" ${activeStudentStep === 1 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="1" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-coral text-white flex items-center justify-center font-black text-sm">1</span>
                                <div>
                                    <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-coral">Step 1: Writing Practice</h3>
                                    <span class="text-[11px] text-gray-500 font-semibold">${step1Mode === 'template' ? b.student.step1Goal : (b.student.freeWriteMin + '-' + b.student.freeWriteMax + ' words')}</span>
                                </div>
                            </div>
                            <span class="text-gray-400 font-black">${activeStudentStep === 1 ? '▲' : '▼'}</span>
                        </button>
                        <div class="step-accordion-grid">
                            <div class="overflow-hidden">
                                <div class="p-5 pt-0 border-t border-gray-100">
                                    ${missionCard(b, 'ring-brand-peach')}
                                    <div class="flex justify-between items-center mb-4">
                                        <div class="tw-step1-tabs">
                                            <button data-act="setStep1Mode" data-a0="template" class="tw-step1-tab ${step1Mode === 'template' ? 'active' : ''}">Guided Template</button>
                                            <button data-act="setStep1Mode" data-a0="free" class="tw-step1-tab ${step1Mode === 'free' ? 'active' : ''}">Free Writing</button>
                                        </div>
                                        <button data-act="openVocabModal" data-a0="${b.id}" class="text-xs font-black bg-brand-coral text-white px-3 py-2 rounded-xl uppercase tracking-wider hover:bg-brand-magenta transition">
                                            Vocabulary
                                        </button>
                                    </div>

                                    ${step1Mode === 'template' ? `
                                        <!-- Real-time Progress Bar -->
                                        <div class="mb-4 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                                            <div class="flex items-center justify-between text-xs font-bold text-gray-600 mb-2">
                                                <span id="template-progress-label">0 of 0 spaces completed (0%)</span>
                                                <span id="template-progress-badge" class="hidden items-center gap-1 text-[11px] font-black text-brand-coral bg-brand-rose px-2 py-0.5 rounded-full border border-brand-peach">
                                                    <svg viewBox="0 0 512 512" class="w-3 h-3 fill-brand-coral inline"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg> Ready for Speaking!
                                                </span>
                                            </div>
                                            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div id="template-progress-fill" class="h-full bg-gradient-to-r from-brand-coral via-brand-coral to-brand-fuchsiadeep transition-all duration-300" style="width: 0%"></div>
                                            </div>
                                        </div>

                                        <div id="step1-template-container" class="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm md:text-base leading-loose text-left text-gray-800 mb-4">
                                            ${parseTemplate(b.student.step1Template)}
                                        </div>
                                    ` : `
                                        <div class="mb-4">
                                            <p class="text-xs text-gray-600 font-semibold mb-2">${b.student.freeWritePrompt}</p>
                                            <textarea id="freewrite-textarea" class="freewrite-textarea text-sm" placeholder="Write here in English..." data-in="wordCount" data-a0="${b.student.freeWriteMin}" data-a1="${b.student.freeWriteMax}"></textarea>
                                            <div id="freewrite-count" class="word-count-badge">0 / ${b.student.freeWriteMin}-${b.student.freeWriteMax} words</div>
                                            ${b.student.freeWriteNote ? `<p class="text-[11px] text-gray-400 mt-2 text-right">${b.student.freeWriteNote}</p>` : ''}
                                        </div>
                                    `}

                                    <div id="validation-msg" role="status" aria-live="polite" class="hidden mb-4 p-3 rounded-xl bg-gray-100 text-xs"></div>

                                    <div class="flex flex-wrap gap-2 justify-between">
                                        <div class="flex gap-2">
                                            <button data-act="verifyAnswers" class="bg-brand-midnight text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition active:scale-95 shadow-md">Check Answers</button>
                                            <button data-act="clearAllAnswers" class="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition active:scale-95">Clear</button>
                                        </div>
                                        <button data-act="setActiveStep" data-a0="2" class="bg-brand-coral text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition active:scale-95 shadow-md">
                                            Go to Speaking →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 2: SPEAKING & VERSUS ROLEPLAY -->
                    <div data-step="2" ${activeStudentStep === 2 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="2" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-fuchsia text-white flex items-center justify-center font-black text-sm">2</span>
                                <div>
                                    <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-midnight">Step 2: Let's Speak & Roleplay</h3>
                                    <span class="text-[11px] text-gray-500 font-semibold">
                                        ${selectedRoleIndex !== null ? `Active role: ${b.student.roles[selectedRoleIndex].name}` : 'Select your role to begin'}
                                    </span>
                                </div>
                            </div>
                            <span class="text-gray-400 font-black">${activeStudentStep === 2 ? '▲' : '▼'}</span>
                        </button>
                        <div class="step-accordion-grid">
                            <div class="overflow-hidden">
                                <div class="p-5 pt-0 border-t border-gray-100 space-y-5">
                                    
                                    <!-- Turn-Taking Timer Card -->
                                    <div class="p-4 bg-brand-rose border border-brand-peach rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-8 h-8 rounded-xl bg-brand-coral text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                                ⏱️
                                            </div>
                                            <div>
                                                <h4 class="text-xs font-black uppercase tracking-wider text-brand-midnight">Turn-Taking Practice</h4>
                                                <p class="text-[11px] text-gray-600 font-medium">90s to argue your case, 60s for your partner's response.</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <button data-act="startTurnTimer" data-a0="90" class="px-3 py-1.5 bg-white border border-brand-coral text-brand-coral rounded-xl text-xs font-extrabold hover:bg-brand-rose transition shadow-xs active:scale-95">90s Pitch</button>
                                            <button data-act="startTurnTimer" data-a0="60" class="px-3 py-1.5 bg-white border border-brand-magenta text-brand-magenta rounded-xl text-xs font-extrabold hover:bg-brand-rose transition shadow-xs active:scale-95">60s Rebuttal</button>
                                            <span id="turn-timer-display" class="font-mono text-sm font-black text-brand-midnight px-2 py-1 bg-white rounded-lg border border-gray-200">00:00</span>
                                        </div>
                                    </div>

                                    <!-- Versus Roleplay Matchup Arena -->
                                    <div class="bg-gray-50 border border-gray-200 rounded-3xl p-4 md:p-5">
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Choose your perspective:</span>
                                            ${selectedRoleIndex !== null ? `
                                                <button data-act="clearRole" class="text-xs text-brand-coral hover:underline font-bold">Change Role</button>
                                            ` : ''}
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            ${b.student.roles.map((r, i) => {
                                                const isSelected = selectedRoleIndex === i;
                                                const isPartner = selectedRoleIndex !== null && !isSelected;
                                                return `
                                                    <div role="button" tabindex="0" aria-pressed="${isSelected}" data-act="selectRole" data-a0="${i}" class="p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 ${isSelected ? 'bg-white border-brand-coral shadow-lg ring-2 ring-brand-coral/20' : (isPartner ? 'bg-gray-100/80 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:border-gray-300')}">
                                                        <div class="flex justify-between items-center mb-1">
                                                            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${i === 0 ? 'bg-brand-coral/20 text-brand-midnight' : 'bg-brand-sunset/30 text-brand-midnight'}">
                                                                ${r.title}
                                                            </span>
                                                            ${isSelected ? '<span class="text-[11px] font-extrabold text-brand-coral">✓ You</span>' : (isPartner ? '<span class="text-[11px] font-bold text-gray-500">Your Partner</span>' : '')}
                                                        </div>
                                                        <div class="flex items-center gap-2 mt-1">
                                                            <span class="text-xl">${r.avatar || '👤'}</span>
                                                            <h4 class="text-base font-black text-brand-midnight">${r.name}</h4>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>

                                        <!-- Assigned Scenario / Personality Trait -->
                                        ${selectedRoleIndex !== null && b.student.scenarios && b.student.scenarios.length ? `
                                            <div class="mt-3 p-3 bg-brand-peach/20 border border-brand-peach/50 rounded-2xl flex items-center gap-2.5">
                                                <span class="text-base">🎭</span>
                                                <div class="text-xs">
                                                    <span class="font-bold text-brand-midnight">Personality Challenge:</span>
                                                    <span class="text-gray-700 font-medium ml-1">${b.student.scenarios[selectedRoleIndex % b.student.scenarios.length]}</span>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>

                                    <!-- Dialogue Opener -->
                                    <div class="bg-gray-50/70 border border-gray-200 rounded-3xl p-4 md:p-5">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="font-black text-brand-coral uppercase tracking-wider text-[11px]">Sample Conversation Opener:</span>
                                            <span class="text-[11px] text-gray-400">Tap ${ICON_SPEAKER} to listen</span>
                                        </div>
                                        ${formatDialogueBubbles(b.student.step2Opener, b.student.roles, selectedRoleIndex)}
                                    </div>

                                    ${renderExpressionsWidget(b)}

                                    <!-- Survival & Useful Phrases -->
                                    <div class="bg-white border border-gray-200 rounded-3xl p-4 md:p-5">
                                        <span class="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2.5">Survival & Discussion Phrases (Click to pronounce or copy):</span>
                                        <div class="flex flex-wrap gap-2">
                                            ${[
                                                "Can you repeat that, please?",
                                                "How do you say that in English?",
                                                "Could you elaborate on that point?",
                                                "I completely agree with your reasoning!",
                                                "On the other hand...",
                                                "What had happened prior to that?"
                                            ].map(ph => `
                                                <button data-say="${escAttr(ph)}" data-act="speakText" oncontextmenu="event.preventDefault(); copyText(this.dataset.say)" class="phrase-chip active:scale-95">
                                                    <span>${ph}</span>
                                                    <span class="text-gray-400 text-[10px]">${ICON_SPEAKER}</span>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <!-- Speaking Prompt Chips -->
                                    ${cards.map((card, ci) => `
                                        <div class="border border-brand-peach bg-brand-rose rounded-3xl p-4 md:p-5">
                                            <span class="text-xs font-black uppercase tracking-wider text-brand-midnight block mb-2">Key Discussion Points:${cards.length > 1 ? ' (' + (ci + 1) + '/' + cards.length + ')' : ''}</span>
                                            <div class="flex flex-wrap gap-1.5 mb-3">
                                                ${(card.chips || []).map(ch => `
                                                    <button data-say="${escAttr(ch)}" data-act="speakText" class="bg-white border border-brand-peach text-brand-midnight text-xs font-bold px-3 py-1 rounded-full hover:border-brand-coral transition flex items-center gap-1">
                                                        <span>${ch}</span>
                                                        <span class="text-[9px] text-brand-coral">${ICON_SPEAKER}</span>
                                                    </button>
                                                `).join('')}
                                            </div>
                                            <div class="space-y-1.5 text-xs text-brand-midnight">
                                                <p class="leading-relaxed"><strong>Task 1:</strong> ${card.t1}</p>
                                                <p class="leading-relaxed"><strong>Task 2:</strong> ${card.t2}</p>
                                                ${card.chips2 && card.chips2.length ? `
                                                    <div class="flex flex-wrap gap-1 mt-2">
                                                        ${card.chips2.map(c2 => `<span class="bg-white border border-brand-peach text-[10px] font-semibold px-2 py-0.5 rounded-md text-brand-magenta">${c2}</span>`).join('')}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `).join('')}

                                    <!-- Turn Questions -->
                                    <div class="space-y-2">
                                        <span class="text-xs font-black uppercase tracking-wider text-gray-700 block">Activity Questions & Audit Logs:</span>
                                        ${b.student.step2Questions.map((q, idx) => {
                                            const isMyTurn = (selectedRoleIndex !== null) && (idx % 2 === selectedRoleIndex % 2);
                                            return `
                                                <div class="p-3.5 bg-white border rounded-2xl text-xs md:text-sm font-medium flex items-start justify-between gap-3 ${isMyTurn ? 'border-brand-coral bg-brand-coral/[0.03] shadow-sm' : 'border-gray-200'}">
                                                    <div class="flex items-start gap-2.5">
                                                        <span class="text-brand-coral font-bold mt-0.5">•</span>
                                                        <span class="leading-relaxed">${q}</span>
                                                    </div>
                                                    <button data-say="${escAttr(q)}" data-act="speakText" class="text-gray-400 hover:text-brand-coral text-xs shrink-0 transition" aria-label="Listen to question" title="Listen to question">${ICON_SPEAKER}</button>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>

                                    <button data-act="setActiveStep" data-a0="3" class="w-full bg-brand-coral text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-md active:scale-95">
                                        Continue to Step 3: Feedback →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 3: FEEDBACK & COMMON ERRORS -->
                    <div data-step="3" ${activeStudentStep === 3 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="3" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-midnight text-white flex items-center justify-center font-black text-sm">3</span>
                                <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-midnight">Step 3: Self-Check & Common Traps</h3>
                            </div>
                            <span class="text-gray-400 font-black">${activeStudentStep === 3 ? '▲' : '▼'}</span>
                        </button>
                        <div class="step-accordion-grid">
                            <div class="overflow-hidden">
                                <div class="p-5 pt-0 border-t border-gray-100 space-y-4">
                                    ${renderSelfCheck(b)}
                                    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                        <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Common grammatical traps in this unit:</h4>
                                        <ul class="list-disc list-inside text-xs text-gray-600 space-y-1 leading-relaxed">
                                            ${(b.student.commonErrors || []).map(err => `<li>${err}</li>`).join('')}
                                        </ul>
                                    </div>

                                    <!-- Feedback Evaluation Survey Card -->
                                    <div class="p-4 rounded-2xl bg-gradient-to-r from-brand-coral/10 via-brand-magenta/10 to-brand-sunset/10 border border-brand-coral/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-xl bg-brand-coral text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                                                <svg viewBox="0 0 448 512" class="w-5 h-5 fill-current"><path d="M448 96c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320zM256 160c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0c17.7 0 32 14.3 32 32zm64 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l192 0zM192 352c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0c17.7 0 32 14.3 32 32z"/></svg>
                                            </div>
                                            <div>
                                                <h4 class="text-xs font-black uppercase tracking-wider text-brand-midnight">Your Feedback Matters</h4>
                                                <p class="text-xs text-gray-500 font-medium">Help us enhance this booster session by filling out a quick evaluation.</p>
                                            </div>
                                        </div>
                                        <a href="${surveyUrl()}" target="_blank" rel="noopener noreferrer" class="bg-brand-coral hover:bg-brand-magenta text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1.5">
                                            Rate this activity ↗
                                        </a>
                                    </div>

                                    <div class="text-center py-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button data-act="setView" data-a0="landing" class="w-full sm:w-auto bg-brand-midnight text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition active:scale-95 shadow-md">
                                            Return to Unit Catalog
                                        </button>
                                        ${renderClearDataButton()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            `;
        }

        function renderTeacherWidget() {
            const root = document.getElementById('teacher-widget-root');
            if (!root) return;
            if (!isTeacherAuth) {
                root.innerHTML = '';
                return;
            }

            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            const progressRatio = Math.max(0, Math.min(1, timeLeft / totalTime));

            const circleRadius = 38;
            const circleCircumference = 2 * Math.PI * circleRadius;
            const strokeDashoffset = circleCircumference * (1 - progressRatio);

            let currentPhase = 'diag';
            let strokeColor = '#10B981';
            let phaseLabel = 'Diagnostic';

            if (timeLeft <= totalTime * 0.15) {
                currentPhase = 'feed';
                strokeColor = '#EF4444';
                phaseLabel = 'Feedback';
            } else if (timeLeft <= totalTime * 0.55) {
                currentPhase = 'speak';
                strokeColor = '#20B15A';
                phaseLabel = 'Speaking';
            } else if (timeLeft <= totalTime * 0.90) {
                currentPhase = 'write';
                strokeColor = '#A8D93B';
                phaseLabel = 'Writing';
            }

            if (teacherWidgetMinimized) {
                root.innerHTML = `
                    <div class="fixed bottom-5 right-5 z-50">
                        <button data-act="teacherWidgetMin" data-a0="false" 
                                class="teacher-frosted-island text-white px-4 py-2.5 rounded-full flex items-center gap-3 border border-white/20 hover:border-brand-coral transition-all duration-300 group shadow-2xl active:scale-95">
                            <span class="relative flex h-3 w-3">
                                ${isTimerRunning ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${strokeColor};"></span>` : ''}
                                <span class="relative inline-flex rounded-full h-3 w-3" style="background-color: ${strokeColor};"></span>
                            </span>
                            <div class="flex items-baseline gap-1.5 font-mono">
                                <span class="font-black text-sm text-white">${m}:${s}</span>
                                <span class="text-[9px] uppercase font-bold text-gray-300 group-hover:text-brand-peach transition-colors">${phaseLabel}</span>
                            </div>
                            <span class="text-xs text-gray-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5">▲</span>
                        </button>
                    </div>
                `;
                return;
            }

            const b = boosters.find(x => x.id === selectedBooster);

            root.innerHTML = `
                <div class="fixed bottom-5 right-5 z-50 w-[21.5rem] max-w-[92vw] teacher-frosted-island text-white rounded-3xl overflow-hidden font-sans border border-white/15 shadow-2xl">
                    
                    <!-- Top Island Header -->
                    <div class="px-4 py-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" style="background-color: ${strokeColor};"></span>
                            <span class="font-black uppercase tracking-widest text-[10px] text-brand-peach">Teacher Control Panel · B1</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button data-act="togglePresentationMode" title="Presentation Mode" 
                                    class="text-xs px-2 py-0.5 rounded-md transition ${presentationMode ? 'bg-brand-coral text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/10'}">
                                📺 ${presentationMode ? 'ON' : 'Projector'}
                            </button>
                            <button data-act="teacherWidgetMin" data-a0="true" title="Minimize" class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition leading-none">
                                ▼
                            </button>
                            <button data-act="logout" title="Exit Teacher Mode" class="text-gray-400 hover:text-brand-coral p-1 rounded-md hover:bg-white/10 transition font-black leading-none">
                                &times;
                            </button>
                        </div>
                    </div>

                    <div class="p-4 space-y-4">
                        
                        <!-- Circular Halo and Controls Deck -->
                        <div class="flex items-center justify-between gap-3">
                            
                            <!-- SVG Circular Progress Halo -->
                            <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
                                <svg class="w-24 h-24 -rotate-90">
                                    <circle cx="48" cy="48" r="${circleRadius}" stroke="rgba(255,255,255,0.08)" stroke-width="6" fill="transparent" />
                                    <circle cx="48" cy="48" r="${circleRadius}" 
                                            stroke="${strokeColor}" 
                                            stroke-width="6" 
                                            stroke-linecap="round"
                                            stroke-dasharray="${circleCircumference}" 
                                            stroke-dashoffset="${strokeDashoffset}"
                                            style="transition: stroke-dashoffset 1s linear;"
                                            fill="transparent" />
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span class="font-mono text-xl font-black tracking-tight ${timeLeft < 120 ? 'text-brand-coral animate-pulse' : 'text-white'}">
                                        ${m}:${s}
                                    </span>
                                    <span class="text-[8px] font-black uppercase tracking-wider text-gray-300">
                                        ${phaseLabel}
                                    </span>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex-1 space-y-2">
                                <div class="flex gap-2">
                                    <button data-act="toggleTimer" 
                                            class="flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${isTimerRunning ? 'bg-black/20 hover:bg-white/30 text-white' : 'bg-gradient-to-r from-brand-coral to-brand-magenta text-white hover:opacity-95'}">
                                        ${isTimerRunning ? '⏸ Pause' : '▶ Start'}
                                    </button>
                                    <button data-act="resetTimer" title="Reset Timer" 
                                            class="px-3 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition active:scale-95 text-sm">
                                        ↺
                                    </button>
                                </div>

                                <div class="flex items-center justify-between text-[10px] text-gray-300 bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/5">
                                    <span class="font-bold">Total Time:</span>
                                    <div class="flex gap-1">
                                        <button data-act="changeTotalTime" data-a0="20" class="px-2 py-0.5 rounded-md font-extrabold transition ${totalTime === 1200 ? 'bg-brand-coral text-white shadow-xs' : 'text-gray-400 hover:text-white'}">20m</button>
                                        <button data-act="changeTotalTime" data-a0="15" class="px-2 py-0.5 rounded-md font-extrabold transition ${totalTime === 900 ? 'bg-brand-coral text-white shadow-xs' : 'text-gray-400 hover:text-white'}">15m</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 1-Click Phase Switcher -->
                        <div>
                            <div class="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-gray-300 mb-1.5">
                                <span>Quick Phase Jump</span>
                                <span class="text-brand-peach font-mono">1-Click Jump</span>
                            </div>
                            <div class="grid grid-cols-4 gap-1.5">
                                <button data-act="jumpToPhase" data-a0="diag" class="phase-jump-chip ${currentPhase==='diag' ? 'active' : ''}">
                                    0 · Diag
                                </button>
                                <button data-act="jumpToPhase" data-a0="write" class="phase-jump-chip ${currentPhase==='write' ? 'active' : ''}">
                                    1 · Write
                                </button>
                                <button data-act="jumpToPhase" data-a0="speak" class="phase-jump-chip ${currentPhase==='speak' ? 'active' : ''}">
                                    2 · Speak
                                </button>
                                <button data-act="jumpToPhase" data-a0="feed" class="phase-jump-chip ${currentPhase==='feed' ? 'active' : ''}">
                                    3 · Feed
                                </button>
                            </div>
                        </div>

                        <!-- Teacher survey link -->
                        <a href="${LEVEL.teacherSurvey}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between text-xs font-bold text-gray-200 hover:text-white transition py-0.5 border-t border-white/10 pt-2.5">
                            <span>📝 Teacher survey</span>
                            <span class="text-[10px] text-gray-400">↗</span>
                        </a>
                        <!-- Lesson Guidance Expandable -->
                        ${b ? `
                            <div class="border-t border-white/10 pt-2.5">
                                <button data-act="toggleTeacherInfo" 
                                        class="w-full flex items-center justify-between text-left text-xs text-brand-peach hover:text-white transition py-0.5 font-bold">
                                    <span class="flex items-center gap-1.5">
                                        <span>📋</span> Teacher Guide (${b.units === "FINAL" ? "Final" : "U" + b.units})
                                    </span>
                                    <span class="text-[10px] text-gray-400">${teacherWidgetShowInfo ? '▲ Hide' : '▼ View'}</span>
                                </button>

                                ${teacherWidgetShowInfo ? `
                                    <div class="mt-2.5 bg-black/40 rounded-2xl p-3 text-xs space-y-2 border border-white/5 max-h-48 overflow-y-auto hide-scrollbar">
                                        <div>
                                            <span class="text-[10px] font-black uppercase text-brand-sunset block">Goal:</span>
                                            <p class="text-gray-200 font-medium leading-relaxed">${b.teacher.objetivo}</p>
                                        </div>
                                        <div>
                                            <span class="text-[10px] font-black uppercase text-brand-peach block">Grammar Focus:</span>
                                            <p class="text-gray-300 text-[11px]">${b.teacher.focus}</p>
                                        </div>
                                        <div>
                                            <span class="text-[10px] font-black uppercase text-brand-coral block">Conversation Trigger:</span>
                                            <p class="italic text-brand-peach/90 text-[11px]">${b.teacher.interaccion}</p>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}

                    </div>
                </div>
            `;
        }

loadLevelData().then(() => render()).catch(showLoadError);
