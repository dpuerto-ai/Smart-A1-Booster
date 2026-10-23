/* Level A1 - settings, data and screens. Shared logic lives in engine.js. */
const LEVEL = {
    btn: 'text-xs font-black bg-brand-magenta text-white px-3 py-2 rounded-xl uppercase tracking-wider hover:bg-brand-fuchsia transition',
    id: 'a1',
    code: 'A1',
    lang: 'es',
    prefix: 'pcb_a1_',
    surveyBase: 'https://docs.google.com/forms/d/e/1FAIpQLSfRUQGjKNTtmVrRp1W5c2WGS6AGqiQa1cZQ81ryPdOlTTv9Xw/viewform',
    teacherSurvey: 'https://docs.google.com/forms/d/e/1FAIpQLSf6pLT3VLV6eXo-LcAwcnr0XIfEQ1JThAWI2FER5fPyjM7GvQ/viewform',
    regexAnswers: true,
    theme: {
        vocabAccent: 'brand-magenta',
        ring: 'ring-brand-coral/40',
        cardBorder: '#C21F73',
        cardShadow: '0 20px 35px -8px rgba(194, 31, 115, 0.22), 0 8px 16px -4px rgba(7, 21, 33, 0.08)',
        cardIdleBorder: '#E2E8F0',
        dotActive: 'bg-brand-magenta',
        emptyIcon: 'bg-gray-100 text-gray-400',
        emptyLink: 'text-brand-magenta',
        catHead: 'text-brand-magenta',
        mark: 'bg-brand-sunset/20 text-brand-midnight font-black p-0',
        wordColor: 'text-brand-midnight',
        minFill: '1',
        fillActive: 'h-full bg-gradient-to-r from-brand-coral via-brand-magenta to-brand-sunsetdeep transition-all duration-300',
        fillDone: 'h-full bg-emerald-500 transition-all duration-300',
        okSpan: 'text-emerald-700',
        okIcon: 'fill-emerald-600',
        avatarA: '🎤',
        avatarB: '🌟',
        avA: 'bg-brand-sunset text-white',
        avB: 'bg-brand-magenta text-white',
        nameA: 'text-brand-sunset',
        nameB: 'text-brand-magenta',
        youBg: 'bg-brand-coral',
        speakHover: 'hover:text-brand-coral',
        bubbleText: 'text-brand-midnight',
        chime: [659.25, 830.61, 0.1],
        notes: [523.25, 659.25, 783.99, 1046.5],
        confetti: ['#F42A3A', '#C21F73', '#D94BB4', '#F37A4D', '#10B981', '#FBBF24', '#3B82F6']
    },
    ui: {
        copyTitle: 'Clic para copiar',
        speakLabel: 'Escuchar pronunciación',
        finalExam: 'Examen Final',
        unitWord: 'Unidades',
        keyWords: 'palabras clave',
        emptyTitle: 'No se encontraron términos coincidentes',
        emptyHint: 'Prueba con otra palabra clave o selecciona otra categoría.',
        emptyReset: 'Restablecer búsqueda',
        roleA: 'Rol A',
        roleB: 'Rol B',
        youText: 'TÚ',
        okMsg: '¡Excelente trabajo! Has completado todos los espacios. Revísalos una vez más antes de pasar a Speaking.',
        progress: (filled, total, percent) => `${filled} de ${total} espacios completados (${percent}%)`,
        missingMsg: (missing) => `Faltan ${missing} espacio(s) por responder o corregir. ¡Revísalos!`
    }
};

// Level content (units, vocabulary, templates, speaking cards) lives in data/a1.json and is loaded by loadLevelData() (js/engine.js).

/* Pantallas propias de este nivel: portada, vista del estudiante y panel docente. El resto de la lógica está en engine.js. */

        function renderLanding() {
            if (landingLayoutMode === 'grid') {
                return `
                    <div class="space-y-6">
                        <div class="rounded-3xl bg-gradient-to-r from-brand-coral via-brand-magenta to-brand-sunsetdeep p-8 text-white text-center shadow-xl relative overflow-hidden">
                            <div class="relative z-10 max-w-xl mx-auto">
                                <span class="bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3">
                                    Interchange 5th Edition • Nivel A1
                                </span>
                                <h1 class="text-3xl md:text-5xl font-black uppercase tracking-tight">Progress Check Boosters</h1>
                                <p class="mt-2 text-white text-sm md:text-base font-medium leading-relaxed">
                                    Selecciona una unidad para acceder a las dinámicas guiadas de escritura, speaking y roleplay.
                                </p>
                            </div>
                        </div>

                        <!-- Layout switcher bar -->
                        <div class="flex justify-between items-center px-1">
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">${boosters.length} Unidades Disponibles</span>
                            <div class="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                                <button data-act="setLandingLayoutMode" data-a0="carousel" class="px-3 py-1 rounded-lg text-gray-600 hover:text-brand-midnight transition">Carrusel</button>
                                <button data-act="setLandingLayoutMode" data-a0="grid" class="px-3 py-1 rounded-lg bg-white text-brand-magenta shadow-xs">Cuadrícula</button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${boosters.map(b => `
                                <div data-act="selectBooster" data-a0="${b.id}" class="glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group">
                                    <div class="h-36 overflow-hidden relative">
                                        <img src="${localImg(b.imageUrl)}" data-fallback="${escAttr(b.imageUrl)}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                        <span class="absolute top-3 left-3 bg-brand-midnight backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            ${b.units === "FINAL" ? "Final Quiz" : "Units " + b.units}
                                        </span>
                                    </div>
                                    <div class="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center gap-1.5 mb-1">
                                                <span>${b.badgeEmoji}</span>
                                                <h3 class="font-black text-brand-midnight group-hover:text-brand-magenta transition-colors text-base">${b.title}</h3>
                                            </div>
                                            <p class="text-xs text-gray-500 line-clamp-2">${b.teacher.focus}</p>
                                        </div>
                                        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-brand-coral">
                                            <span>Practicar sesión</span>
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
                    <div class="rounded-3xl bg-gradient-to-r from-brand-coral via-brand-magenta to-brand-sunsetdeep p-8 text-white text-center shadow-xl relative overflow-hidden">
                        <div class="relative z-10 max-w-xl mx-auto">
                            <span class="bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3">
                                Interchange 5th Edition • Nivel A1
                            </span>
                            <h1 class="text-3xl md:text-5xl font-black uppercase tracking-tight">Progress Check Boosters</h1>
                            <p class="mt-2 text-white text-sm md:text-base font-medium leading-relaxed">
                                Desliza o usa las flechas para explorar y practicar cada booster interactivo.
                            </p>
                        </div>
                    </div>

                    <!-- Layout switcher bar -->
                    <div class="flex justify-between items-center px-1">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Unidad ${carouselCurrentIndex + 1} de ${boosters.length}</span>
                        <div class="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                            <button data-act="setLandingLayoutMode" data-a0="carousel" class="px-3 py-1 rounded-lg bg-white text-brand-magenta shadow-xs">Carrusel</button>
                            <button data-act="setLandingLayoutMode" data-a0="grid" class="px-3 py-1 rounded-lg text-gray-600 hover:text-brand-midnight transition">Cuadrícula</button>
                        </div>
                    </div>

                    <!-- Carousel Stage Area -->
                    <div class="relative overflow-hidden py-2" 
                         ontouchstart="carouselTouchStartX = event.touches[0].clientX" 
                         ontouchend="if (carouselTouchStartX - event.changedTouches[0].clientX > 40) navigateCarousel('next'); else if (event.changedTouches[0].clientX - carouselTouchStartX > 40) navigateCarousel('prev');">
                        
                        <!-- Floating Navigation Arrow Prev -->
                        <button data-act="navigateCarousel" data-a0="prev" aria-label="Unidad anterior"
                                class="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-brand-midnight shadow-xl border border-gray-100 flex items-center justify-center font-black text-lg transition-all active:scale-90 hover:scale-105 hover:text-brand-magenta">
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
                                            ${b.units === "FINAL" ? "Final Quiz" : "Units " + b.units}
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
                                        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-brand-magenta">
                                            <span>Entrar</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Floating Navigation Arrow Next -->
                        <button data-act="navigateCarousel" data-a0="next" aria-label="Siguiente unidad"
                                class="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-brand-midnight shadow-xl border border-gray-100 flex items-center justify-center font-black text-lg transition-all active:scale-90 hover:scale-105 hover:text-brand-magenta">
                            ›
                        </button>
                    </div>

                    <!-- Dot Pagination Controls -->
                    <div class="carousel-dot-row flex items-center justify-center gap-1.5 py-1">
                        <span class="carousel-counter" aria-live="polite"></span>
                        ${boosters.map((_, idx) => `
                            <button data-act="navigateCarousel" data-a0="${idx}" aria-label="Ir a unidad ${idx + 1}"
                                    class="carousel-dot ${idx === carouselCurrentIndex ? 'w-6 h-2 rounded-full bg-brand-magenta' : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'} transition-all duration-300"></button>
                        `).join('')}
                    </div>

                    <!-- Active Booster Live Preview Dock -->
                    <div class="glass-shell rounded-3xl p-5 md:p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div class="space-y-1 max-w-xl">
                            <div class="flex items-center gap-2">
                                <span id="carousel-preview-units" class="text-[10px] font-black uppercase tracking-widest text-brand-coral bg-brand-coral/5 px-2.5 py-0.5 rounded-full">
                                    ${activeBooster.units === 'FINAL' ? 'Examen Final' : 'Unidades ' + activeBooster.units}
                                </span>
                                <span id="carousel-preview-vocab-count" class="text-[10px] font-bold text-gray-500 font-mono">
                                    ${totalWords} palabras clave
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
                                    class="flex-1 md:flex-none px-4 py-2.5 rounded-xl border-2 border-brand-magenta text-brand-magenta font-black text-xs uppercase tracking-wider hover:bg-brand-magenta/5 transition active:scale-95 shadow-xs">
                                Vocabulario
                            </button>
                            <button id="carousel-preview-start-btn" data-act="selectBooster" data-a0="${activeBooster.id}" 
                                    class="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-coral via-brand-magenta to-brand-sunsetdeep text-white font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-md active:scale-95 flex items-center justify-center gap-2">
                                Iniciar Booster →
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
                        ← Ver todas las unidades
                    </button>
                    ${!isTeacherAuth ? `
                        <button data-act="activateTeacherMode" class="text-xs font-bold text-brand-magenta bg-brand-magenta/10 hover:bg-brand-magenta/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition">
                            Modo Docente
                        </button>
                    ` : ''}
                </div>

                <!-- Hero Banner -->
                <div class="rounded-3xl bg-gradient-to-r from-brand-coral via-brand-magenta to-brand-sunsetdeep p-6 md:p-8 text-white relative overflow-hidden shadow-xl mb-6">
                    ${heroPhoto(b)}
                    <div class="relative z-10 max-w-xl">
                        <span class="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest inline-block mb-2">
                            ${b.units === "FINAL" ? "Examen Final" : "Unidades " + b.units}
                        </span>
                        <h1 class="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center gap-2">
                            <span>${b.title}</span>
                        </h1>
                        <p class="text-sm md:text-base text-white/90 mt-2 font-medium">${b.teacher.focus}</p>
                    </div>
                </div>

                <!-- Accordion Steps -->
                <div class="space-y-4">
                    
                    <!-- PASO 0: DIAGNÓSTICO -->
                    <div data-step="0" ${activeStudentStep === 0 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="0" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-sunset text-white flex items-center justify-center font-black text-sm">0</span>
                                <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-sunset">Paso 0: Diagnóstico Previo</h3>
                            </div>
                            <span class="text-gray-400 font-black">${activeStudentStep === 0 ? '▲' : '▼'}</span>
                        </button>
                        <div class="step-accordion-grid">
                            <div class="overflow-hidden">
                                <div class="p-5 pt-0 border-t border-gray-100">
                                    <p class="text-xs text-gray-500 mb-3 font-semibold">Marca los temas que quieres reforzar en esta sesión:</p>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                        ${b.student.diagOptions.map((opt, optIdx) => `
                                            <button data-act="toggleDiagTopic" data-a0="${optIdx}" class="p-3 text-left rounded-xl border text-xs font-bold transition flex items-center justify-between ${selectedDiagTopics.has(opt) ? 'bg-brand-sunset/15 border-brand-sunset text-brand-sunset shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600'}">
                                                <span>${opt}</span>
                                                <span>${selectedDiagTopics.has(opt) ? '✓' : '+'}</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                    <button data-act="setActiveStep" data-a0="1" class="w-full bg-brand-sunset text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-md">
                                        Continuar al Paso 1: Escritura →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PASO 1: ESCRITURA -->
                    <div data-step="1" ${activeStudentStep === 1 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="1" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-magenta text-white flex items-center justify-center font-black text-sm">1</span>
                                <div>
                                    <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-magenta">Paso 1: Escritura Guiada</h3>
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
                                            <button data-act="setStep1Mode" data-a0="template" class="tw-step1-tab ${step1Mode === 'template' ? 'active' : ''}">Plantilla</button>
                                            <button data-act="setStep1Mode" data-a0="free" class="tw-step1-tab ${step1Mode === 'free' ? 'active' : ''}">Escritura Libre</button>
                                        </div>
                                        <button data-act="openVocabModal" data-a0="${b.id}" class="text-xs font-black bg-brand-magenta text-white px-3 py-2 rounded-xl uppercase tracking-wider hover:bg-brand-fuchsia transition">
                                            Vocabulario
                                        </button>
                                    </div>

                                    ${step1Mode === 'template' ? `
                                        <!-- Real-time Progress Bar -->
                                        <div class="mb-4 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                                            <div class="flex items-center justify-between text-xs font-bold text-gray-600 mb-2">
                                                <span id="template-progress-label">0 de 0 espacios completados (0%)</span>
                                                <span id="template-progress-badge" class="hidden items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    <svg viewBox="0 0 512 512" class="w-3 h-3 fill-emerald-600 inline"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg> ¡Listo para Speaking!
                                                </span>
                                            </div>
                                            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div id="template-progress-fill" class="h-full bg-gradient-to-r from-brand-coral via-brand-magenta to-brand-sunsetdeep transition-all duration-300" style="width: 0%"></div>
                                            </div>
                                        </div>

                                        <div id="step1-template-container" class="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm md:text-base leading-loose text-left text-gray-800 mb-4">
                                            ${parseTemplate(b.student.step1Template)}
                                        </div>
                                    ` : `
                                        <div class="mb-4">
                                            <p class="text-xs text-gray-600 font-semibold mb-2">${b.student.freeWritePrompt}</p>
                                            <textarea id="freewrite-textarea" class="freewrite-textarea text-sm" placeholder="Write here..." data-in="wordCount" data-a0="${b.student.freeWriteMin}" data-a1="${b.student.freeWriteMax}"></textarea>
                                            <div id="freewrite-count" class="word-count-badge">0 / ${b.student.freeWriteMin}-${b.student.freeWriteMax} palabras</div>
                                        </div>
                                    `}

                                    <div id="validation-msg" role="status" aria-live="polite" class="hidden mb-4 p-3 rounded-xl bg-gray-100 text-xs"></div>

                                    <div class="flex flex-wrap gap-2 justify-between">
                                        <div class="flex gap-2">
                                            <button data-act="verifyAnswers" class="bg-brand-midnight text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition active:scale-95 shadow-md">Verificar Respuestas</button>
                                            <button data-act="clearAllAnswers" class="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition active:scale-95">Borrar</button>
                                        </div>
                                        <button data-act="setActiveStep" data-a0="2" class="bg-brand-magenta text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition active:scale-95 shadow-md">
                                            Ir a Speaking →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PASO 2: SPEAKING & ROLEPLAY -->
                    <div data-step="2" ${activeStudentStep === 2 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="2" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-coral text-white flex items-center justify-center font-black text-sm">2</span>
                                <div>
                                    <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-coral">Paso 2: Conversación y Roleplay</h3>
                                    <span class="text-[11px] text-gray-500 font-semibold">
                                        ${selectedRoleIndex !== null ? `Rol activo: ${b.student.roles[selectedRoleIndex].name}` : 'Selecciona tu rol para comenzar'}
                                    </span>
                                </div>
                            </div>
                            <span class="text-gray-400 font-black">${activeStudentStep === 2 ? '▲' : '▼'}</span>
                        </button>
                        <div class="step-accordion-grid">
                            <div class="overflow-hidden">
                                <div class="p-5 pt-0 border-t border-gray-100 space-y-5">
                                    
                                    <!-- Turn-Taking Timer Card (A1 Feature) -->
                                    <div class="p-4 bg-brand-coral/5 border border-brand-coral/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-8 h-8 rounded-xl bg-brand-coral text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                                ⏱️
                                            </div>
                                            <div>
                                                <h4 class="text-xs font-black uppercase tracking-wider text-brand-midnight">Temporizador de Turnos</h4>
                                                <p class="text-[11px] text-gray-600 font-medium">90s para plantear tu rol, 60s para la respuesta de tu compañero/a.</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <button data-act="startTurnTimer" data-a0="90" class="px-3 py-1.5 bg-white border border-brand-coral text-brand-coral rounded-xl text-xs font-extrabold hover:bg-brand-coral/10 transition shadow-xs active:scale-95">90s Turno</button>
                                            <button data-act="startTurnTimer" data-a0="60" class="px-3 py-1.5 bg-white border border-brand-magenta text-brand-magenta rounded-xl text-xs font-extrabold hover:bg-brand-fuchsia/10 transition shadow-xs active:scale-95">60s Respuesta</button>
                                            <span id="turn-timer-display" class="font-mono text-sm font-black text-brand-midnight px-2 py-1 bg-white rounded-lg border border-gray-200">00:00</span>
                                        </div>
                                    </div>

                                    <!-- Roleplay Matchup Arena -->
                                    <div class="bg-gray-50 border border-gray-200 rounded-3xl p-4 md:p-5">
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Elige tu Perspectiva:</span>
                                            ${selectedRoleIndex !== null ? `
                                                <button data-act="clearRole" class="text-xs text-brand-coral hover:underline font-bold">Cambiar Rol</button>
                                            ` : ''}
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            ${b.student.roles.map((r, i) => {
                                                const isSelected = selectedRoleIndex === i;
                                                const isPartner = selectedRoleIndex !== null && !isSelected;
                                                return `
                                                    <div role="button" tabindex="0" aria-pressed="${isSelected}" data-act="selectRole" data-a0="${i}" class="p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 ${isSelected ? 'bg-white border-brand-coral shadow-lg ring-2 ring-brand-coral/20' : (isPartner ? 'bg-gray-100/80 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:border-gray-300')}">
                                                        <div class="flex justify-between items-center mb-1">
                                                            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${i === 0 ? 'bg-brand-sunset/15 text-brand-sunset' : 'bg-brand-magenta/15 text-brand-magenta'}">
                                                                ${r.title}
                                                            </span>
                                                            ${isSelected ? '<span class="text-[11px] font-extrabold text-brand-coral">✓ Eres tú</span>' : (isPartner ? '<span class="text-[11px] font-bold text-gray-500">Tu compañero/a</span>' : '')}
                                                        </div>
                                                        <div class="flex items-center gap-2 mt-1">
                                                            <span class="text-xl">${r.avatar || '👤'}</span>
                                                            <h4 class="text-base font-black text-brand-midnight">${r.name}</h4>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>

                                        <!-- Assigned Scenario / Challenge -->
                                        ${selectedRoleIndex !== null && b.student.scenarios && b.student.scenarios.length ? `
                                            <div class="mt-3 p-3 bg-brand-peach/20 border border-brand-peach/50 rounded-2xl flex items-center gap-2.5">
                                                <span class="text-base">🎭</span>
                                                <div class="text-xs">
                                                    <span class="font-bold text-brand-midnight">Tu Reto / Personalidad:</span>
                                                    <span class="text-gray-700 font-medium ml-1">${b.student.scenarios[selectedRoleIndex % b.student.scenarios.length]}</span>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>

                                    <!-- Dialogue Opener -->
                                    <div class="bg-gray-50/70 border border-gray-200 rounded-3xl p-4 md:p-5">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="font-black text-brand-coral uppercase tracking-wider text-[11px]">Diálogo Inicial de Ejemplo:</span>
                                            <span class="text-[11px] text-gray-400">Toca ${ICON_SPEAKER} para escuchar</span>
                                        </div>
                                        ${formatDialogueBubbles(b.student.step2Opener, b.student.roles, selectedRoleIndex)}
                                    </div>

                                    ${renderExpressionsWidget(b)}

                                    <!-- Survival & Useful Phrases -->
                                    <div class="bg-white border border-gray-200 rounded-3xl p-4 md:p-5">
                                        <span class="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2.5">Frases de Supervivencia (Toca para escuchar o copiar):</span>
                                        <div class="flex flex-wrap gap-2">
                                            ${[
                                                "Can you repeat that, please?",
                                                "How do you say that in English?",
                                                "I agree with you!",
                                                "That sounds interesting!",
                                                "What about you?",
                                                "Could you speak a bit slower?"
                                            ].map(ph => `
                                                <button data-say="${escAttr(ph)}" data-act="speakText" oncontextmenu="event.preventDefault(); copyText(this.dataset.say)" class="phrase-chip active:scale-95">
                                                    <span>${ph}</span>
                                                    <span class="text-gray-400 text-[10px]">${ICON_SPEAKER}</span>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <!-- Speaking Cards Chips -->
                                    ${cards.map((card, ci) => `
                                        <div class="border border-brand-peach bg-brand-peach/20 rounded-3xl p-4 md:p-5">
                                            <span class="text-xs font-black uppercase tracking-wider text-brand-midnight block mb-2">Puntos clave para conversar:${cards.length > 1 ? ' (' + (ci + 1) + '/' + cards.length + ')' : ''}</span>
                                            <div class="flex flex-wrap gap-1.5 mb-3">
                                                ${(card.chips || []).map(ch => `
                                                    <button data-say="${escAttr(ch)}" data-act="speakText" class="bg-white border border-brand-peach text-brand-midnight text-xs font-bold px-3 py-1 rounded-full hover:border-brand-sunset transition flex items-center gap-1">
                                                        <span>${ch}</span>
                                                        <span class="text-[9px] text-brand-sunset">${ICON_SPEAKER}</span>
                                                    </button>
                                                `).join('')}
                                            </div>
                                            <div class="space-y-1.5 text-xs text-brand-midnight">
                                                <p class="leading-relaxed"><strong>Task 1:</strong> ${card.t1}</p>
                                                <p class="leading-relaxed"><strong>Task 2:</strong> ${card.t2}</p>
                                            </div>
                                        </div>
                                    `).join('')}

                                    <!-- Turn Questions -->
                                    <div class="space-y-2">
                                        <span class="text-xs font-black uppercase tracking-wider text-gray-700 block">Preguntas de la Actividad:</span>
                                        ${b.student.step2Questions.map((q, idx) => {
                                            const isMyTurn = (selectedRoleIndex !== null) && (idx % 2 === selectedRoleIndex % 2);
                                            return `
                                                <div class="p-3.5 bg-white border rounded-2xl text-xs md:text-sm font-medium flex items-start justify-between gap-3 ${isMyTurn ? 'border-brand-coral bg-brand-coral/[0.02] shadow-sm' : 'border-gray-200'}">
                                                    <div class="flex items-start gap-2.5">
                                                        <span class="text-brand-coral font-bold mt-0.5">•</span>
                                                        <span class="leading-relaxed">${q}</span>
                                                    </div>
                                                    <button data-say="${escAttr(q)}" data-act="speakText" class="text-gray-400 hover:text-brand-coral text-xs shrink-0 transition" aria-label="Escuchar pregunta" title="Escuchar pregunta">${ICON_SPEAKER}</button>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>

                                    <button data-act="setActiveStep" data-a0="3" class="w-full bg-brand-coral text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-md active:scale-95">
                                        Ir al Paso 3: Feedback Final →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PASO 3: FEEDBACK -->
                    <div data-step="3" ${activeStudentStep === 3 ? 'data-active=""' : ''} class="glass-shell rounded-3xl border overflow-hidden">
                        <button data-act="setActiveStep" data-a0="3" class="w-full p-5 flex items-center justify-between text-left">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-brand-fuchsia text-white flex items-center justify-center font-black text-sm">3</span>
                                <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-brand-fuchsia">Paso 3: Autoevaluación y Errores Clave</h3>
                            </div>
                            <span class="text-gray-400 font-black">${activeStudentStep === 3 ? '▲' : '▼'}</span>
                        </button>
                        <div class="step-accordion-grid">
                            <div class="overflow-hidden">
                                <div class="p-5 pt-0 border-t border-gray-100 space-y-4">
                                    ${renderSelfCheck(b)}
                                    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                        <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Errores frecuentes en esta unidad:</h4>
                                        <ul class="list-disc list-inside text-xs text-gray-600 space-y-1 leading-relaxed">
                                            ${(b.student.commonErrors || []).map(err => `<li>${err}</li>`).join('')}
                                        </ul>
                                    </div>

                                    <!-- Feedback Evaluation Survey Card -->
                                    <div class="p-4 rounded-2xl bg-gradient-to-r from-brand-coral/10 via-brand-magenta/10 to-brand-sunset/10 border border-brand-magenta/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-xl bg-brand-magenta text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                                                <svg viewBox="0 0 448 512" class="w-5 h-5 fill-current"><path d="M448 96c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320zM256 160c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0c17.7 0 32 14.3 32 32zm64 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l192 0zM192 352c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0c17.7 0 32 14.3 32 32z"/></svg>
                                            </div>
                                            <div>
                                                <h4 class="text-xs font-black uppercase tracking-wider text-brand-midnight">Tu opinión cuenta</h4>
                                                <p class="text-xs text-gray-500 font-medium">Ayúdanos a mejorar completando una breve encuesta sobre esta sesión.</p>
                                            </div>
                                        </div>
                                        <a href="${surveyUrl()}" target="_blank" rel="noopener noreferrer" class="bg-brand-magenta hover:bg-brand-fuchsia text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1.5">
                                            Evalúa esta actividad ↗
                                        </a>
                                    </div>

                                    <div class="text-center py-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button data-act="setView" data-a0="landing" class="w-full sm:w-auto bg-brand-midnight text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition active:scale-95 shadow-md">
                                            Volver al Catálogo de Unidades
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
            let phaseLabel = 'Diagnóstico';

            if (timeLeft <= totalTime * 0.15) {
                currentPhase = 'feed';
                strokeColor = '#F42A3A';
                phaseLabel = 'Feedback';
            } else if (timeLeft <= totalTime * 0.55) {
                currentPhase = 'speak';
                strokeColor = '#F37A4D';
                phaseLabel = 'Speaking';
            } else if (timeLeft <= totalTime * 0.90) {
                currentPhase = 'write';
                strokeColor = '#C21F73';
                phaseLabel = 'Escritura';
            }

            if (teacherWidgetMinimized) {
                root.innerHTML = `
                    <div class="fixed bottom-5 right-5 z-50">
                        <button data-act="teacherWidgetMin" data-a0="false" 
                                class="teacher-frosted-island text-white px-4 py-2.5 rounded-full flex items-center gap-3 border border-white/20 hover:border-brand-magenta transition-all duration-300 group shadow-2xl active:scale-95">
                            <span class="relative flex h-3 w-3">
                                ${isTimerRunning ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${strokeColor};"></span>` : ''}
                                <span class="relative inline-flex rounded-full h-3 w-3" style="background-color: ${strokeColor};"></span>
                            </span>
                            <div class="flex items-baseline gap-1.5 font-mono">
                                <span class="font-black text-sm text-white">${m}:${s}</span>
                                <span class="text-[9px] uppercase font-bold text-gray-400 group-hover:text-brand-peach transition-colors">${phaseLabel}</span>
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
                            <span class="font-black uppercase tracking-widest text-[10px] text-gray-300">Control Docente · A1</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button data-act="togglePresentationMode" title="Modo Presentación" 
                                    class="text-xs px-2 py-0.5 rounded-md transition ${presentationMode ? 'bg-brand-coral text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/10'}">
                                📺 ${presentationMode ? 'ON' : 'Proyector'}
                            </button>
                            <button data-act="teacherWidgetMin" data-a0="true" title="Minimizar panel" class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition leading-none">
                                ▼
                            </button>
                            <button data-act="logout" title="Cerrar sesión docente" class="text-gray-400 hover:text-brand-coral p-1 rounded-md hover:bg-white/10 transition font-black leading-none">
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
                                    <span class="text-[8px] font-black uppercase tracking-wider text-gray-400">
                                        ${phaseLabel}
                                    </span>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex-1 space-y-2">
                                <div class="flex gap-2">
                                    <button data-act="toggleTimer" 
                                            class="flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${isTimerRunning ? 'bg-black/20 hover:bg-white/30 text-white' : 'bg-gradient-to-r from-brand-coral to-brand-magenta text-white hover:opacity-95'}">
                                        ${isTimerRunning ? '⏸ Pausar' : '▶ Iniciar'}
                                    </button>
                                    <button data-act="resetTimer" title="Reiniciar tiempo" 
                                            class="px-3 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition active:scale-95 text-sm">
                                        ↺
                                    </button>
                                </div>

                                <div class="flex items-center justify-between text-[10px] text-gray-400 bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/5">
                                    <span class="font-bold">Límite Total:</span>
                                    <div class="flex gap-1">
                                        <button data-act="changeTotalTime" data-a0="20" class="px-2 py-0.5 rounded-md font-extrabold transition ${totalTime === 1200 ? 'bg-brand-coral text-white shadow-xs' : 'text-gray-400 hover:text-white'}">20m</button>
                                        <button data-act="changeTotalTime" data-a0="15" class="px-2 py-0.5 rounded-md font-extrabold transition ${totalTime === 900 ? 'bg-brand-coral text-white shadow-xs' : 'text-gray-400 hover:text-white'}">15m</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- One-Click Phase Jump Switcher -->
                        <div>
                            <div class="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">
                                <span>Salto rápido de fase</span>
                                <span class="text-gray-500 font-mono">1-Click Jump</span>
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
                            <span>📝 Encuesta para docentes</span>
                            <span class="text-[10px] text-gray-400">↗</span>
                        </a>
                        <!-- Expandable Unit Lesson Guidance -->
                        ${b ? `
                            <div class="border-t border-white/10 pt-2.5">
                                <button data-act="toggleTeacherInfo" 
                                        class="w-full flex items-center justify-between text-left text-xs text-brand-peach hover:text-white transition py-0.5 font-bold">
                                    <span class="flex items-center gap-1.5">
                                        <span>📋</span> Guía Pedagógica (${b.units === "FINAL" ? "Final" : "U" + b.units})
                                    </span>
                                    <span class="text-[10px] text-gray-400">${teacherWidgetShowInfo ? '▲ Ocultar' : '▼ Ver'}</span>
                                </button>

                                ${teacherWidgetShowInfo ? `
                                    <div class="mt-2.5 bg-black/40 rounded-2xl p-3 text-xs space-y-2 border border-white/5 max-h-48 overflow-y-auto hide-scrollbar">
                                        <div>
                                            <span class="text-[10px] font-black uppercase text-brand-sunset block">Objetivo:</span>
                                            <p class="text-gray-200 font-medium leading-relaxed">${b.teacher.objetivo}</p>
                                        </div>
                                        <div>
                                            <span class="text-[10px] font-black uppercase text-brand-magenta block">Enfoque Gramatical:</span>
                                            <p class="text-gray-300 text-[11px]">${b.teacher.focus}</p>
                                        </div>
                                        <div>
                                            <span class="text-[10px] font-black uppercase text-brand-coral block">Frase Disparadora:</span>
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
