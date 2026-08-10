'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import './landing.css';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MM6: any;
  }
}

export default function LandingPage() {
  useEffect(() => {
    // Clear any stale GSAP state from a previous mount
    gsap.killTweensOf('*');
    document.querySelectorAll('.slide-in').forEach((el) => {
      (el as HTMLElement).style.opacity = '';
      (el as HTMLElement).style.visibility = '';
      (el as HTMLElement).style.transform = '';
    });

    // Handle body styles that can't be in CSS (to avoid affecting other pages)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.fontFamily = "Georgia, 'Times New Roman', serif";
    document.body.style.background = '#2A2318';
    document.body.style.color = '#2A2318';

    // Track RAF for cleanup
    let _rafId = 0;

    // ── CREATEORG ARCHITECTURE ANIMATION ──
    (function() {
      const CREATE_CMD = '/mastermind:createorg --name dev-team --auto "Build and ship features end-to-end"';
      const BOSS_EDGES = ['eg-la','eg-lc','eg-lt','eg-lr','eg-ld'];
      const PEER_EDGES = ['eg-ac','eg-ct','eg-tr','eg-rd'];
      const NODES      = ['gn-lead','gn-arch','gn-code','gn-test','gn-rev','gn-devops'];
      const CARDS      = ['cc-lead','cc-arch','cc-code','cc-test','cc-rev','cc-devops'];
      const RUN_LINES  = [
        { cls:'running', t:'[Engineering Lead] Spawning dev team · 5 specialists online' },
        { cls:'running', t:'[Architect] Reading spec... generating architecture.md' },
        { cls:'done',    t:'[Architect] ✓ architecture.md committed · 847 tokens' },
        { cls:'running', t:'[Senior Developer] Implementing auth/jwt-refresh.ts...' },
        { cls:'running', t:'[QA Engineer] Writing tests for token rotation logic...' },
        { cls:'done',    t:'[QA Engineer] ✓ 18 tests · 94% coverage · 0 failures' },
        { cls:'running', t:'[Senior Developer] Opening PR #47: feat/jwt-refresh' },
        { cls:'running', t:'[Code Reviewer] Scanning PR · OWASP check · style review' },
        { cls:'done',    t:'[Code Reviewer] ✓ Approved · 2 inline suggestions added' },
        { cls:'running', t:'[DevOps Automator] CI passed · deploying to production...' },
        { cls:'done',    t:'[DevOps Automator] ✓ Deployed · health check OK · 0 errors' },
        { cls:'final',   t:'✓ Sprint complete · 1 feature · 18 tests · PR merged · 4m 22s' },
      ];

      function setPhase(id: string) {
        document.querySelectorAll('.corg-phase').forEach(function(p){ p.classList.remove('cp-active'); });
        const el = document.getElementById(id);
        if (el) el.classList.add('cp-active');
      }

      function showEl(el: HTMLElement) { el.style.display = el.classList.contains('corg-footer') ? 'flex' : 'block'; }

      let busy = false;

      function reset() {
        busy = false;
        const cmdEl = document.getElementById('corgCmdBody');
        const runBody = document.getElementById('corgRunBody');
        if (cmdEl) cmdEl.textContent = '';
        if (runBody) runBody.innerHTML = '';
        gsap.set('#corgCursor', { opacity: 1 });
        CARDS.forEach(function(id){
          const el = document.getElementById(id);
          if (el) { el.style.display = 'none'; gsap.set(el, { opacity: 0, x: 22 }); }
        });
        ['#corgRunFeed','#corgEvent','#corgFooter'].forEach(function(sel){
          const el = document.querySelector(sel);
          if (el) { (el as HTMLElement).style.display = 'none'; gsap.set(el, { opacity: 0 }); }
        });
        gsap.set('#corgRipple', { opacity: 0 });
        gsap.set(['#cp-r1','#cp-r2'], { opacity: 0, scale: 1 });
        NODES.forEach(function(id){ gsap.set('#' + id, { opacity: 0, y: 6 }); });
        const edgeData: Record<string, number> = { 'eg-la':220,'eg-lc':220,'eg-lt':200,'eg-lr':220,'eg-ld':220,'eg-ac':80,'eg-ct':65,'eg-tr':65,'eg-rd':80 };
        Object.keys(edgeData).forEach(function(id){
          const p = document.getElementById(id);
          if (p) gsap.set(p, { strokeDasharray: edgeData[id], strokeDashoffset: edgeData[id] });
        });
        document.querySelectorAll('.corg-phase').forEach(function(p){ p.classList.remove('cp-active'); });
      }

      function start() {
        if (busy) return;
        busy = true;
        reset();
        const tl = gsap.timeline({ onComplete: function(){ busy = false; } });
        tl.call(function(){ setPhase('cp-01'); });
        const cmdEl = document.getElementById('corgCmdBody');
        const n = { v: 0 };
        tl.to(n, { v: CREATE_CMD.length, duration: CREATE_CMD.length * 0.026, ease: 'none',
          onUpdate: function(){ if(cmdEl) cmdEl.textContent = CREATE_CMD.slice(0, Math.floor(n.v)); }
        });
        tl.to('#corgCursor', { opacity: 0, duration: 0.15 }, '+=0.4');
        tl.call(function(){ setPhase('cp-02'); }, undefined, '+=0.1');
        tl.to('#gn-lead', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        tl.to(NODES.slice(1).map(function(id){ return '#'+id; }), { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.1');
        tl.call(function(){ setPhase('cp-03'); }, undefined, '+=0.1');
        tl.to(BOSS_EDGES.map(function(id){ return '#'+id; }), { strokeDashoffset: 0, duration: 0.5, stagger: 0.1, ease: 'power2.inOut' });
        tl.to(PEER_EDGES.map(function(id){ return '#'+id; }), { strokeDashoffset: 0, duration: 0.38, stagger: 0.1, ease: 'power2.inOut' }, '-=0.15');
        CARDS.forEach(function(id, i){
          const el = document.getElementById(id);
          if (!el) return;
          tl.call(function(){ showEl(el!); }, undefined, '+=' + (i === 0 ? 0.05 : 0.12));
          tl.to(el, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, '<');
        });
        tl.call(function(){ setPhase('cp-04'); }, undefined, '+=0.3');
        const feedEl = document.getElementById('corgRunFeed');
        const runBodyEl = document.getElementById('corgRunBody');
        if (feedEl) { tl.call(function(){ showEl(feedEl!); }, undefined, '+=0.05'); tl.to(feedEl, { opacity: 1, duration: 0.4 }, '<'); }
        RUN_LINES.forEach(function(line, i){
          tl.call(function(){
            if (!runBodyEl) return;
            const div = document.createElement('div');
            div.className = 'corg-run-line ' + line.cls;
            div.textContent = line.t;
            runBodyEl.appendChild(div);
            gsap.from(div, { opacity: 0, y: 4, duration: 0.3, ease: 'power2.out' });
          }, undefined, '+=' + (i === 0 ? 0.1 : 0.45));
        });
        const evtEl = document.getElementById('corgEvent');
        if (evtEl) { tl.call(function(){ showEl(evtEl!); }, undefined, '+=0.4'); tl.to(evtEl, { opacity: 1, duration: 0.4 }, '<'); }
        tl.to('#corgRipple', { opacity: 1, duration: 0.2 }, '<+0.1');
        tl.to('#corgRipple', { opacity: 0, duration: 0.5 });
        tl.to('#cp-r1', { opacity: 1, scale: 2.6, transformOrigin: '240px 46px', duration: 0.2, ease: 'power1.out' }, '-=0.3');
        tl.to('#cp-r1', { opacity: 0, scale: 3.4, duration: 0.6, ease: 'power2.out' }, '-=0.05');
        tl.to('#cp-r2', { opacity: 0.8, scale: 2.8, transformOrigin: '240px 46px', duration: 0.2, ease: 'power1.out' }, '-=0.7');
        tl.to('#cp-r2', { opacity: 0, scale: 4, duration: 0.8, ease: 'power2.out' }, '-=0.05');
        const footerEl = document.getElementById('corgFooter');
        if (footerEl) { tl.call(function(){ showEl(footerEl!); }, undefined, '+=0.3'); tl.to(footerEl, { opacity: 1, duration: 0.35 }, '<'); }
      }

      const sec = document.getElementById('slide-devteam');
      if (sec) {
        const snapWr = document.getElementById('snapWrap');
        const io = new IntersectionObserver(function(entries){
          entries.forEach(function(e){ if (e.isIntersecting) { io.disconnect(); setTimeout(start, 300); } });
        }, { threshold: 0.05, root: snapWr });
        io.observe(sec);
      }
      const btn = document.getElementById('corgReplayBtn');
      if (btn) btn.addEventListener('click', start);
    })();

    // ── SELF-RUNNING PATROL LOOP ANIMATION ──
    (function() {
      let busy = false;
      let timerInterval: ReturnType<typeof setInterval> | null = null;

      function activateBeat(n: number) {
        const el = document.getElementById('lb' + n);
        if (el) el.classList.add('lb-on');
      }

      function start() {
        if (busy) return;
        busy = true;
        if (timerInterval) clearInterval(timerInterval);
        [1,2,3,4].forEach(function(n){
          const el = document.getElementById('lb' + n);
          if (el) { el.classList.remove('lb-on'); gsap.set(el, { opacity: 0, y: 12 }); }
        });
        ['lbi1','lbi2','lbi3'].forEach(function(id){ const e = document.getElementById(id); if(e) gsap.set(e,{opacity:0,x:-8}); });
        ['lbw1','lbw2','lbw3','lbw4','lbw5','lbw6'].forEach(function(id){ const e = document.getElementById(id); if(e) gsap.set(e,{opacity:0,x:-6}); });
        const lbTg = document.getElementById('lbTg');
        const loopFooter = document.getElementById('loopFooter');
        const timerEl = document.getElementById('loopTimer');
        if (lbTg) gsap.set(lbTg, { opacity:0, y:8 });
        if (loopFooter) gsap.set(loopFooter, { opacity:0 });
        if (timerEl) timerEl.textContent = '59:47';

        const tl = gsap.timeline({ onComplete: function(){
          busy = false;
          let secs = 59*60+47;
          timerInterval = setInterval(function(){
            secs = Math.max(0, secs - 1);
            const m = Math.floor(secs/60), s = secs%60;
            if (timerEl) timerEl.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
            if (secs === 0) clearInterval(timerInterval!);
          }, 80);
        }});

        tl.to('#lb1', { opacity:1, y:0, duration:0.55, ease:'power3.out' });
        tl.call(function(){ activateBeat(1); });
        const clockEl = document.getElementById('lbClock');
        ['14:00:01','14:00:02','14:00:03'].forEach(function(t, i){
          tl.call(function(){ if(clockEl) clockEl.textContent = t; }, undefined, '+=' + (i===0?0.35:0.22));
        });
        tl.call(function(){ if(clockEl) clockEl.textContent = '14:00:00 → ✓'; });
        tl.to('#lb2', { opacity:1, y:0, duration:0.5, ease:'power3.out' }, '+=0.25');
        tl.call(function(){ activateBeat(2); });
        tl.to([document.getElementById('lbi1'),document.getElementById('lbi2'),document.getElementById('lbi3')].filter(Boolean), { opacity:1, x:0, duration:0.35, stagger:0.18, ease:'power2.out' }, '+=0.1');
        tl.to('#lb3', { opacity:1, y:0, duration:0.5, ease:'power3.out' }, '+=0.3');
        tl.call(function(){ activateBeat(3); });
        tl.to([document.getElementById('lbw1'),document.getElementById('lbw2'),document.getElementById('lbw3')].filter(Boolean), { opacity:1, x:0, duration:0.3, stagger:0.2, ease:'power2.out' }, '+=0.1');
        tl.to([document.getElementById('lbw4'),document.getElementById('lbw5'),document.getElementById('lbw6')].filter(Boolean), { opacity:1, x:0, duration:0.3, stagger:0.2, ease:'power2.out' }, '+=0.35');
        tl.to('#lb4', { opacity:1, y:0, duration:0.5, ease:'power3.out' }, '+=0.3');
        tl.call(function(){ activateBeat(4); });
        if (lbTg) tl.to(lbTg, { opacity:1, y:0, duration:0.55, ease:'back.out(1.4)' }, '+=0.2');
        if (loopFooter) tl.to(loopFooter, { opacity:1, duration:0.4 }, '+=0.4');
      }

      const sec = document.getElementById('slide-patrol');
      if (sec) {
        const snapWr = document.getElementById('snapWrap');
        const io = new IntersectionObserver(function(entries){
          entries.forEach(function(e){ if (e.isIntersecting) { io.disconnect(); setTimeout(start, 200); } });
        }, { threshold: 0.05, root: snapWr });
        io.observe(sec);
      }
      const btn = document.getElementById('loopReplayBtn');
      if (btn) btn.addEventListener('click', function(){ busy = false; start(); });
    })();

    // ── CONTENT SQUAD ORG ANIMATION ──
    (function() {
      let busy = false;
      const CARDS = ['cs1','cs2','cs3','cs4'];
      const WORK  = ['csw1','csw2','csw3','csw4','csw5','csw6','csw7'];

      function activate(id: string) {
        const el = document.getElementById(id);
        if (el) el.classList.add('lb-on');
      }

      function start() {
        if (busy) return;
        busy = true;
        CARDS.forEach(function(id){
          const el = document.getElementById(id);
          if (el) { el.classList.remove('lb-on'); gsap.set(el, { opacity:0, y:12 }); }
        });
        WORK.forEach(function(id){ const e = document.getElementById(id); if(e) gsap.set(e,{opacity:0,x:-6}); });
        const csTg = document.getElementById('csTg');
        const csFooter = document.getElementById('csFooter');
        if (csTg) gsap.set(csTg, { opacity:0, y:8 });
        if (csFooter) gsap.set(csFooter, { opacity:0 });

        const tl = gsap.timeline({ onComplete: function(){ busy = false; } });
        tl.to('#cs1', { opacity:1, y:0, duration:0.5, ease:'power3.out' });
        tl.call(function(){ activate('cs1'); });
        tl.to([document.getElementById('csw1'),document.getElementById('csw2')].filter(Boolean), { opacity:1, x:0, duration:0.3, stagger:0.3, ease:'power2.out' }, '+=0.1');
        tl.to('#cs2', { opacity:1, y:0, duration:0.5, ease:'power3.out' }, '+=0.35');
        tl.call(function(){ activate('cs2'); });
        tl.to([document.getElementById('csw3'),document.getElementById('csw4'),document.getElementById('csw5')].filter(Boolean), { opacity:1, x:0, duration:0.3, stagger:0.25, ease:'power2.out' }, '+=0.1');
        tl.to('#cs3', { opacity:1, y:0, duration:0.5, ease:'power3.out' }, '+=0.35');
        tl.call(function(){ activate('cs3'); });
        tl.to([document.getElementById('csw6'),document.getElementById('csw7')].filter(Boolean), { opacity:1, x:0, duration:0.3, stagger:0.3, ease:'power2.out' }, '+=0.1');
        tl.to('#cs4', { opacity:1, y:0, duration:0.5, ease:'power3.out' }, '+=0.3');
        tl.call(function(){ activate('cs4'); });
        if (csTg) tl.to(csTg, { opacity:1, y:0, duration:0.55, ease:'back.out(1.4)' }, '+=0.2');
        if (csFooter) tl.to(csFooter, { opacity:1, duration:0.4 }, '+=0.3');
      }

      const sec = document.getElementById('slide-squad');
      if (sec) {
        const snapWr = document.getElementById('snapWrap');
        const io = new IntersectionObserver(function(entries){
          entries.forEach(function(e){ if (e.isIntersecting) { io.disconnect(); setTimeout(start, 200); } });
        }, { threshold: 0.05, root: snapWr });
        io.observe(sec);
      }
      const btn = document.getElementById('csReplayBtn');
      if (btn) btn.addEventListener('click', function(){ busy = false; start(); });
    })();

    // ── MAIN ANIMATION ENGINE ──
    (function () {
      'use strict';

      const C = {
        gold:   '#C8A97E',
        goldW:  '#D4A84A',
        cyan:   '#4A9BAF',
        green:  '#3D8B5E',
        amber:  '#E8943A',
        white:  '#FAF7F0',
        dim:    'rgba(250,247,240,0.35)',
      };

      const snapWrap = document.getElementById('snapWrap');
      const slides   = Array.from(document.querySelectorAll('.slide'));

      // ── 1. CANVAS PARTICLE SYSTEM ──
      (function initParticles() {
        const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let W: number, H: number, particles: Array<{x:number;y:number;vx:number;vy:number;size:number;opacity:number;color:string}>;
        let running = true;
        const COUNT = 55, LINK_DIST = 140;
        const COLORS = [C.gold, C.cyan, C.white, C.goldW];

        function resize() {
          W = canvas!.width  = canvas!.offsetWidth;
          H = canvas!.height = canvas!.offsetHeight;
        }
        function mkP() {
          return { x: Math.random()*W, y: Math.random()*H,
                   vx:(Math.random()-0.5)*0.35, vy:(Math.random()-0.5)*0.35,
                   size: Math.random()*1.6+0.4, opacity: Math.random()*0.55+0.15,
                   color: COLORS[Math.floor(Math.random()*COLORS.length)] };
        }
        function init() { resize(); particles = Array.from({length:COUNT}, mkP); }
        function tick() {
          if (!running) return;
          ctx.clearRect(0, 0, W, H);
          for (let i = 0; i < COUNT; i++) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill();
            for (let j = i+1; j < COUNT; j++) {
              const q = particles[j];
              const dx = p.x-q.x, dy = p.y-q.y, d = Math.sqrt(dx*dx+dy*dy);
              if (d < LINK_DIST) {
                ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
                ctx.strokeStyle = C.gold; ctx.globalAlpha = (1-d/LINK_DIST)*0.18;
                ctx.lineWidth = 0.6; ctx.stroke();
              }
            }
          }
          ctx.globalAlpha = 1;
          _rafId = requestAnimationFrame(tick);
        }
        const heroSlide = document.getElementById('slide-hero');
        if (heroSlide) {
          new IntersectionObserver(function(entries){
            running = entries[0].isIntersecting;
            if (running) tick();
          }, { threshold: 0.1, root: snapWrap }).observe(heroSlide);
        }
        window.addEventListener('resize', resize);
        init(); tick();
      })();

      // ── 2. READING BAR ──
      snapWrap && snapWrap.addEventListener('scroll', function(){
        const bar = document.getElementById('rbar');
        if (!bar) return;
        const pct = (snapWrap!.scrollTop / (snapWrap!.scrollHeight - snapWrap!.clientHeight)) * 100;
        bar.style.width = pct + '%';
      }, { passive: true });

      // ── 3. MISSION BAR + LABEL ──
      const SLIDE_LABELS = [
        'INITIALIZING', 'PLATFORM', 'ORG MODEL', 'DEV TEAM',
        'PATROL', 'CONTENT', 'COMPANY', 'LAUNCH'
      ];
      (function initMissionBar() {
        const segments = document.querySelectorAll('.mission-segment');
        const labelEl  = document.getElementById('missionLabel');
        let lastIdx  = -1;

        function updateBar(idx: number) {
          if (idx === lastIdx) return;
          lastIdx = idx;
          segments.forEach(function(seg, i) {
            seg.classList.remove('active', 'passed');
            if (i < idx) seg.classList.add('passed');
            else if (i === idx) seg.classList.add('active');
          });
          if (labelEl) labelEl.textContent = SLIDE_LABELS[idx] || '';
        }

        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && e.intersectionRatio >= 0.5) {
              updateBar(slides.indexOf(e.target as Element));
            }
          });
        }, { threshold: 0.5, root: snapWrap });
        slides.forEach(function(s){ io.observe(s); });
      })();

      // ── 4. XP BAR ──
      (function initXP() {
        const xpBar   = document.getElementById('xpBar');
        const xpLevel = document.getElementById('xpLevel');
        if (!xpBar || !xpLevel) return;
        const total = slides.length || 8;
        let curLevel = 0;
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && e.intersectionRatio >= 0.5) {
              const idx = slides.indexOf(e.target as Element);
              const pct = (idx / (total - 1)) * 100;
              xpBar!.style.width = pct + '%';
              if (idx !== curLevel) {
                curLevel = idx;
                xpLevel!.textContent = 'LVL ' + (idx + 1);
                gsap.from(xpLevel, { scale: 1.35, duration: 0.3, ease: 'back.out(2)' });
              }
            }
          });
        }, { threshold: 0.5, root: snapWrap });
        slides.forEach(function(s){ io.observe(s); });
      })();

      // ── 5. ACHIEVEMENT TOAST ──
      const achievementQueue: Array<{title:string;desc:string;icon:string}> = [];
      let toastVisible = false;

      function showAchievement(title: string, desc: string, icon: string) {
        achievementQueue.push({ title: title, desc: desc, icon: icon || '★' });
        if (!toastVisible) drainToastQueue();
      }

      function drainToastQueue() {
        if (!achievementQueue.length) { toastVisible = false; return; }
        toastVisible = true;
        const item = achievementQueue.shift()!;
        const toast = document.createElement('div');
        toast.innerHTML =
          '<span style="font-size:18px;flex-shrink:0">' + item.icon + '</span>' +
          '<div><div style="color:' + C.goldW + ';font-weight:700;letter-spacing:0.1em;margin-bottom:2px;font-family:var(--mono);font-size:9px;">' + item.title + '</div>' +
          '<div style="color:' + C.dim + ';font-family:var(--mono);font-size:9px;">' + item.desc + '</div></div>';
        Object.assign(toast.style, {
          position:'fixed', right:'24px', bottom:'80px', zIndex:'9999',
          display:'flex', alignItems:'center', gap:'12px',
          background:'rgba(20,16,10,0.92)', border:'1px solid ' + C.goldW,
          borderRadius:'8px', padding:'12px 18px', pointerEvents:'none',
          transform:'translateX(120%)', opacity:'0',
        });
        document.body.appendChild(toast);
        gsap.to(toast, { x: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' });
        setTimeout(function(){
          gsap.to(toast, { x: 120, opacity: 0, duration: 0.35, ease: 'power2.in',
            onComplete: function(){ toast.remove(); drainToastQueue(); }
          });
        }, 3500);
      }

      const ACHIEVEMENTS: Record<string, {title:string;desc:string;icon:string}> = {
        'slide-hero':     { title: 'INITIALIZED',       desc: 'System boot complete',           icon: '⚡' },
        'slide-platform': { title: 'PLATFORM UNLOCKED',  desc: '89 agent roles ready',           icon: '🛡' },
        'slide-company':  { title: 'ORG ASSEMBLED',      desc: 'Every department loaded',         icon: '🏛' },
        'slide-close':    { title: 'MISSION READY',       desc: 'Your autonomous company awaits', icon: '🚀' },
      };
      const achievedSlides = new Set<string>();
      const ioAch = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            const id = (e.target as Element).id;
            if (ACHIEVEMENTS[id] && !achievedSlides.has(id)) {
              achievedSlides.add(id);
              const a = ACHIEVEMENTS[id];
              setTimeout(function(){ showAchievement(a.title, a.desc, a.icon); }, 800);
            }
          }
        });
      }, { threshold: 0.5, root: snapWrap });
      slides.forEach(function(s){ ioAch.observe(s); });

      // ── 6. GLITCH ──
      function applyGlitch(element: Element) {
        if (!element) return;
        const tl = gsap.timeline();
        tl.to(element, { x: 4, duration: 0.05 })
          .to(element, { x: -4, duration: 0.05 })
          .to(element, { x: 2, duration: 0.05 })
          .to(element, { x: 0, duration: 0.05 })
          .to(element, { skewX: 1, duration: 0.04 }, '-=0.1')
          .to(element, { skewX: -1, duration: 0.04 })
          .to(element, { skewX: 0, duration: 0.04 });
      }
      const heroH1 = document.querySelector('#slide-hero h1');
      if (heroH1) {
        const heroOn = { v: false };
        const gioHero = new IntersectionObserver(function(entries){ heroOn.v = entries[0].isIntersecting; }, { threshold: 0.5, root: snapWrap });
        const heroSlide2 = document.getElementById('slide-hero');
        if (heroSlide2) gioHero.observe(heroSlide2);
        setInterval(function(){ if (heroOn.v) applyGlitch(heroH1!); }, 6000);
      }

      // ── 7. COUNTER ANIMATIONS ──
      function animateCounter(el: Element, target: number, suffix: string, duration: number) {
        if (!el) return;
        suffix = suffix || ''; duration = duration || 1.8;
        const obj = { val: 0 };
        gsap.to(obj, { val: target, duration: duration, ease: 'power2.out',
          onUpdate: function(){ el.textContent = Math.floor(obj.val) + suffix; },
          onComplete: function(){ el.textContent = target + suffix; }
        });
      }
      function animateTypewriter(el: Element, text: string, speed: number) {
        if (!el) return;
        speed = speed || 80;
        let i = 0; el.textContent = '';
        const iv = setInterval(function(){
          el.textContent += text[i]; i++;
          if (i >= text.length) clearInterval(iv);
        }, speed);
      }
      function animateCountdown(el: Element, from: number, to: number, prefix: string, duration: number) {
        if (!el) return;
        prefix = prefix || ''; duration = duration || 1.5;
        const obj = { val: from };
        gsap.to(obj, { val: to, duration: duration, ease: 'power2.out',
          onUpdate: function(){ el.textContent = prefix + Math.floor(obj.val).toLocaleString(); },
          onComplete: function(){ el.textContent = prefix + to; }
        });
      }

      // ── 8. COMPANY COUNTERS ──
      (function initCompanyCounters() {
        const sec = document.getElementById('slide-company');
        if (!sec) return;
        let fired = false;
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && !fired) {
              fired = true;
              const el230 = sec!.querySelector('[data-count="230"]');
              const el247 = sec!.querySelector('[data-count="247"]');
              const el0   = sec!.querySelector('[data-count="0"]');
              const el1   = sec!.querySelector('[data-count="1"]');
              if (el230) animateCounter(el230, 230, '+', 1.8);
              if (el247) animateTypewriter(el247, '24/7', 120);
              if (el0)   animateCountdown(el0, 999000, 0, '$', 1.5);
              if (el1)   { gsap.fromTo(el1, { scale:0.5, opacity:0 }, { scale:1, opacity:1, duration:0.6, ease:'back.out(2)' }); el1.textContent = '1'; }
            }
          });
        }, { threshold: 0.3, root: snapWrap });
        io.observe(sec);
      })();

      // ── 9. SCAN REVEAL ──
      function scanReveal(el: HTMLElement, delay: number) {
        if (!el) return;
        delay = delay || 0;
        const W2 = el.offsetWidth || 400;
        el.style.position = 'relative';
        el.style.clipPath  = 'inset(0 100% 0 0)';
        const line = document.createElement('div');
        Object.assign(line.style, {
          position:'absolute', top:'0', left:'0',
          width:'2px', height:'100%',
          background:'linear-gradient(180deg,' + C.goldW + ' 0%,' + C.cyan + ' 100%)',
          boxShadow:'0 0 8px ' + C.goldW,
          zIndex:'10', opacity:'0',
        });
        el.appendChild(line);
        const dur = Math.max(W2/400, 0.4);
        const tl = gsap.timeline({ delay: delay });
        tl.set(line, { opacity: 1 })
          .to(line, { x: W2, duration: dur, ease: 'none' })
          .to(el, { clipPath: 'inset(0 0% 0 0)', duration: dur, ease: 'none' }, '<')
          .to(line, { opacity: 0, duration: 0.15 })
          .call(function(){ line.remove(); });
      }

      // ── 10. SLIDE DOTS ──
      (function initDots() {
        const dotsContainer = document.getElementById('slideDots');
        if (!dotsContainer) return;
        slides.forEach(function(slide, i) {
          const dot = document.createElement('button');
          dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          dot.onclick = function(){ snapWrap!.scrollTo({ top: (slide as HTMLElement).offsetTop, behavior: 'smooth' }); };
          dotsContainer!.appendChild(dot);
        });
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && e.intersectionRatio >= 0.5) {
              const idx = slides.indexOf(e.target as Element);
              document.querySelectorAll('.slide-dot').forEach(function(d, i){ d.classList.toggle('active', i === idx); });
            }
          });
        }, { threshold: 0.5, root: snapWrap });
        slides.forEach(function(s){ io.observe(s); });
      })();

      // ── 11. SLIDE-IN REVEAL ──
      (function initSlideIn() {
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting) {
              const els = (e.target as Element).querySelectorAll('.slide-in');
              if (els.length) {
                gsap.set(els, { y: 32, autoAlpha: 0 });
                gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'expo.out' });
              }
            }
          });
        }, { threshold: 0.4, root: snapWrap });
        slides.forEach(function(s){ io.observe(s); });
      })();

      // ── 12. SMOOTH NAV LINKS ──
      document.querySelectorAll('a[href^="#"]').forEach(function(a) {
        a.addEventListener('click', function(e) {
          const target = document.querySelector((a as HTMLAnchorElement).getAttribute('href')!);
          if (target) { e.preventDefault(); snapWrap!.scrollTo({ top: (target as HTMLElement).offsetTop, behavior: 'smooth' }); }
        });
      });

      // ── 13. STATUS PULSE ──
      (function initStatusPulse() {
        const badge = document.getElementById('sysBadge');
        if (!badge) return;
        function pulseNormal() {
          gsap.to(badge, { opacity: 1, duration: 1, ease: 'sine.inOut',
            onComplete: function(){ gsap.to(badge, { opacity: 0.5, duration: 1, ease: 'sine.inOut', onComplete: pulseNormal }); }
          });
        }
        pulseNormal();
      })();

      // ── 15. PLATFORM CARDS (flip deploy) ──
      (function initPlatformCards() {
        const sec = document.getElementById('slide-platform');
        if (!sec) return;
        let fired = false;
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && !fired) {
              fired = true;
              const cards = sec!.querySelectorAll('.cap-card');
              cards.forEach(function(card, i) {
                gsap.set(card, { rotateY: 90, opacity: 0, transformPerspective: 800 });
                gsap.to(card, {
                  rotateY: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: i * 0.12,
                  onComplete: function() {
                    const stamp = document.createElement('div');
                    stamp.textContent = 'ASSET ONLINE';
                    Object.assign(stamp.style, { position:'absolute', top:'8px', left:'10px', fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'0.12em', color:C.green, fontWeight:'700', opacity:'0' });
                    (card as HTMLElement).style.position = 'relative'; card.appendChild(stamp);
                    gsap.to(stamp, { opacity: 1, duration: 0.3 });
                    const ping = document.createElement('div');
                    Object.assign(ping.style, { position:'absolute', inset:'-1px', border:'2px solid '+C.green, borderRadius:getComputedStyle(card as Element).borderRadius, pointerEvents:'none', opacity:'0' });
                    card.appendChild(ping);
                    gsap.fromTo(ping, { opacity:0.6 }, { opacity:0, duration:0.8, ease:'power2.out', onComplete:function(){ ping.remove(); } });
                  }
                });
              });
            }
          });
        }, { threshold: 0.3, root: snapWrap });
        io.observe(sec);
      })();

      // ── 16. COMPANY ROSTER ──
      (function initCompanyRoster() {
        const sec = document.getElementById('slide-company');
        if (!sec) return;
        let fired = false;
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && !fired) {
              fired = true;
              const h2 = sec!.querySelector('h2');
              if (h2) scanReveal(h2 as HTMLElement, 0);
              const roleCards = sec!.querySelectorAll('.org-role');
              roleCards.forEach(function(card, i) {
                gsap.set(card, { filter:'blur(4px)', opacity:0.3 });
                gsap.to(card, { filter:'blur(0px)', opacity:1, duration:0.25, ease:'power2.out', delay:0.3 + i*0.1,
                  onComplete: function() {
                    const flash = document.createElement('div');
                    flash.textContent = 'ONLINE';
                    Object.assign(flash.style, { position:'absolute', top:'6px', right:'8px', fontFamily:'var(--mono)', fontSize:'9px', color:C.green, fontWeight:'700', letterSpacing:'0.1em' });
                    (card as HTMLElement).style.position = 'relative'; card.appendChild(flash);
                    gsap.to(flash, { opacity:0, duration:0.6, delay:0.8, onComplete:function(){ flash.remove(); } });
                  }
                });
              });
            }
          });
        }, { threshold: 0.3, root: snapWrap });
        io.observe(sec);
      })();

      // ── 17. MISSION LAUNCH (close slide) ──
      (function initMissionLaunch() {
        const sec = document.getElementById('slide-close');
        if (!sec) return;
        let statusFired = false;
        const statusEl = document.getElementById('cmdStatus');
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && !statusFired) {
              statusFired = true;
              if (statusEl) { statusEl.textContent = ''; animateTypewriter(statusEl, 'COMMANDER: READY TO DEPLOY', 55); }
            }
          });
        }, { threshold: 0.4, root: snapWrap });
        io.observe(sec);
      })();

      // ── 18. TERMINAL (hero terminal typewriter) ──
      (function initTerminal() {
        const termEl = document.getElementById('term-output');
        if (!termEl) return;
        const lines = [
          { type:'prompt',  text:'/mastermind:createorg --name ai-intel-pod --auto \\' },
          { type:'prompt2', text:'  "Track the AI competitive landscape weekly"' },
          { type:'out',     text:'✓ Org created · 5 roles defined · cycle: per-run' },
          { type:'out2',    text:'  Boss: Intelligence Director · roles: Scout → Analyst → Comparator → Reporter' },
          { type:'dim',     text:'' },
          { type:'prompt',  text:'/mastermind:runorg --org ai-intel-pod \\' },
          { type:'prompt2', text:'  "target AI consultancies undercutting at $250K+"' },
          { type:'gold',    text:'→ Director: assigning 5 competitors to research queue...' },
          { type:'gold',    text:'→ Spawning: 5 research agents in parallel...' },
          { type:'gold',    text:'→ Profiles: Markovate · Lumenalta · Turing · Albert.ai · Conversica' },
          { type:'gold',    text:'→ Comparator: generating positioning matrix...' },
          { type:'gold',    text:'→ Reporter: building HTML landscape report...' },
          { type:'out',     text:'✓ Round 3 complete · 5 profiles · 1 matrix · 89KB report' },
          { type:'dim',     text:'' },
          { type:'prompt',  text:'/mastermind:review --tillend' },
          { type:'gold',    text:'→ Reviewing 23 files changed since last checkpoint...' },
          { type:'gold',    text:'→ Security: 0 hardcoded secrets · 0 CVEs · 2 suggestions' },
          { type:'gold',    text:'→ Coverage: 94% · 2 untested edge cases flagged' },
          { type:'gold',    text:'→ Memory: 847 facts indexed to local SQLite store' },
          { type:'out',     text:'✓ Review complete · 4 PRs ready · report saved to docs/' },
          { type:'dim',     text:'' },
          { type:'prompt',  text:'/mastermind:orgs' },
          { type:'gold',    text:'→ ai-intel-pod  [active]  last: 2m ago  next: per-run' },
          { type:'gold',    text:'→ dev-team      [active]  last: 4m ago  next: per-run' },
          { type:'gold',    text:'→ content-squad [stopped]' },
          { type:'dim',     text:'' },
          { type:'prompt',  text:'/mastermind:build --auto "add JWT refresh token rotation"' },
          { type:'gold',    text:'→ spec → pseudocode → tests → implementation → review...' },
          { type:'out',     text:'✓ Feature complete · 12 tests passing · PR #47 opened' },
          { type:'dim',     text:'' },
          { type:'out',     text:'✓ All systems nominal · 89 agent roles · 24/7' },
        ];
        let lineIdx = 0, charIdx = 0;
        const termBody = termEl.parentElement;

        function getClass(type: string) {
          if (type === 'prompt' || type === 'prompt2') return 't-prompt';
          if (type === 'out'    || type === 'out2')    return 't-out';
          if (type === 'gold')                          return 't-gold';
          return 't-dim';
        }
        function buildOutput() {
          let html = '';
          for (let i = 0; i < lineIdx; i++) {
            const l = lines[i];
            const pre = l.type==='prompt'?'$ ':l.type==='prompt2'?'  ':'';
            html += '<span class="' + getClass(l.type) + '">' + (pre + l.text) + '</span>\n';
          }
          if (lineIdx < lines.length) {
            const l2 = lines[lineIdx];
            const pre2 = l2.type==='prompt'?'$ ':l2.type==='prompt2'?'  ':'';
            html += '<span class="' + getClass(l2.type) + '">' + (pre2 + l2.text).slice(0, charIdx) + '</span>';
          }
          return html;
        }
        function typeChar() {
          if (lineIdx >= lines.length) return;
          const line = lines[lineIdx];
          const pre  = line.type==='prompt'?'$ ':line.type==='prompt2'?'  ':'';
          const text = pre + line.text;
          if (charIdx < text.length) {
            termEl!.innerHTML = buildOutput() + '<span class="t-cursor"></span>';
            if (termBody) termBody.scrollTop = termBody.scrollHeight;
            charIdx++;
            setTimeout(typeChar, line.type==='prompt'||line.type==='prompt2' ? 26 : 12);
          } else {
            lineIdx++; charIdx = 0;
            if (termBody) termBody.scrollTop = termBody.scrollHeight;
            setTimeout(typeChar, line.type==='dim' ? 60 : line.type==='prompt2' ? 80 : 160);
          }
        }
        setTimeout(typeChar, 800);
      })();

      // ── 19. AGENT COUNTER ROLL ──
      (function initAgentCounter() {
        const counterEl = document.getElementById('agentCounter');
        if (!counterEl) return;
        let current = 0;
        const targets  = [0, 45, 87, 120, 168, 195, 218, 230];
        const io = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && e.intersectionRatio >= 0.5) {
              const idx = slides.indexOf(e.target as Element);
              const target = targets[Math.min(idx, targets.length-1)] || 0;
              if (target !== current) {
                current = target;
                const obj = { v: parseFloat(counterEl!.textContent || '0') || 0 };
                gsap.to(obj, { v: target, duration: 0.8, ease: 'power2.out',
                  onUpdate: function(){ counterEl!.textContent = String(Math.floor(obj.v)); },
                  onComplete: function(){ counterEl!.textContent = String(target); }
                });
              }
            }
          });
        }, { threshold: 0.5, root: snapWrap });
        slides.forEach(function(s){ io.observe(s); });
      })();

      // ── EXPOSE ──
      window.MM6 = { showAchievement: showAchievement, applyGlitch: applyGlitch, animateCounter: animateCounter, animateTypewriter: animateTypewriter, scanReveal: scanReveal };

      // ── INJECT STYLES ──
      (function(){
        if (document.getElementById('mm6-styles')) return;
        const style = document.createElement('style');
        style.id = 'mm6-styles';
        style.textContent = '@keyframes blink {0%,100%{opacity:1}50%{opacity:0.2}} .glitch-active{color-scheme:dark}';
        document.head.appendChild(style);
      })();

    })();

    return () => {
      // Kill all GSAP tweens so stale autoAlpha/transform don't persist on re-mount
      gsap.killTweensOf('*');
      // Reset slide-in elements to natural state
      document.querySelectorAll('.slide-in').forEach((el) => {
        (el as HTMLElement).style.opacity = '';
        (el as HTMLElement).style.visibility = '';
        (el as HTMLElement).style.transform = '';
      });
      // Restore body styles
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.fontFamily = '';
      document.body.style.background = '';
      document.body.style.color = '';
      // Cancel particle animation RAF
      cancelAnimationFrame(_rafId);
    };
  }, []);

  return (
    <>
      {/* MISSION BAR (8 segments) */}
      <div className="mission-bar" id="missionBar">
        <div className="mission-segment" data-slide="0"></div>
        <div className="mission-segment" data-slide="1"></div>
        <div className="mission-segment" data-slide="2"></div>
        <div className="mission-segment" data-slide="3"></div>
        <div className="mission-segment" data-slide="4"></div>
        <div className="mission-segment" data-slide="5"></div>
        <div className="mission-segment" data-slide="6"></div>
        <div className="mission-segment" data-slide="7"></div>
      </div>
      <div className="mission-label-bar" id="missionLabel">INITIALIZING</div>

      {/* SYSTEM STATUS BADGE */}
      <div className="system-status">
        <div className="status-dot" id="sysBadge"></div>
        <span className="status-text">SYSTEM ACTIVE</span>
      </div>

      <div className="reading-bar" id="rbar"></div>

      <nav>
        <span className="nav-logo">Monoes</span>
        <div className="nav-links">
          <a href="https://github.com/monoes/monomind/discussions" className="nav-link" target="_blank" rel="noopener noreferrer">Community</a>
          <a href="/product#projects" className="nav-link">Projects</a>
          <a href="/whitepaper" className="nav-link">Whitepaper</a>
          <a href="https://github.com/monoes/monomind" className="nav-link" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href="https://github.com/monoes/monomind" className="nav-cta-link" target="_blank" rel="noopener noreferrer">Get started →</a>
        </div>
      </nav>

      <div id="snapWrap">

        {/* SLIDE 1 · HERO */}
        <section className="slide" id="slide-hero" style={{background:'var(--espresso)'}}>
          <div className="hero-grid"></div>
          <canvas id="heroCanvas" style={{position:'absolute',top:0,left:0,right:0,bottom:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} />
          <div className="tactical-grid"></div>
          <div className="scanlines"></div>
          <div className="hero-inner">
            <div className="hero-cols">
              <div className="slide-in">
                <div className="hero-kicker">
                  <span className="hero-kicker-dot"></span>
                  Open source · MIT License · v2.8.4
                </div>
                <h1 className="hero-headline">
                  Not a copilot.<br />
                  <em>A company.</em>
                </h1>
                <p className="hero-sub">
                  Monomind is the open-source autonomous agent platform that turns a single engineer into a complete organization: engineering, marketing, operations, and sales, all running without a team.
                </p>
                <div className="hero-actions">
                  <a href="https://github.com/monoes/monomind" className="btn-primary" target="_blank" rel="noopener noreferrer">★ Star on GitHub</a>
                  <a href="#slide-close" className="btn-ghost">Need it deployed? →</a>
                </div>
                <div className="github-badge">
                  <span className="star-count">MIT licensed. Forever free.</span>
                </div>
              </div>
              <div className="slide-in">
                <div className="hero-terminal" id="terminal">
                  <div className="terminal-bar">
                    <span className="t-dot red"></span>
                    <span className="t-dot yellow"></span>
                    <span className="t-dot green"></span>
                    <span className="terminal-title">monomind · org &amp; review commands</span>
                  </div>
                  <div className="terminal-body">
                    <pre id="term-output"></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 2 · PLATFORM */}
        <section className="slide" id="slide-platform" style={{background:'var(--espresso)'}}>
          <div className="tactical-grid"></div>
          <div className="scanlines"></div>
          <div className="slide-content">
            <span className="section-label slide-in">What Monomind actually is</span>
            <h2 className="section-h2 slide-in">Your company runs<br /><em>while you sleep.</em></h2>
            <div className="capabilities-grid slide-in">
              <div className="cap-card game-frame">
                <span className="cap-num">01 · Orchestration</span>
                <div className="cap-title">89 specialized agent roles</div>
                <p className="cap-body">Domain experts across engineering, security, architecture, and more, plus fully custom org roles you define. Hierarchical swarms fan out in parallel, not sequential pipelines that bottleneck.</p>
                <div className="cap-code">/mastermind:createorg --name ai-intel-pod --auto \<br />  &quot;Track AI competitive landscape weekly&quot;<br /><span style={{color:'rgba(200,220,200,0.7)'}}>✓ 5 profiles · 1 matrix · 89KB report · 2m 14s</span></div>
              </div>
              <div className="cap-card game-frame">
                <span className="cap-num">02 · Memory</span>
                <div className="cap-title">Local SQLite memory, no cloud vector DB</div>
                <p className="cap-body">Local embeddings, local SQLite storage: every decision, pattern, and correction stored and retrieved on your own machine. A pure-JS HNSW index is available opt-in for larger corpora.</p>
                <div className="cap-code">/mastermind:memory search &quot;auth patterns&quot;<br /><span style={{color:'rgba(200,220,200,0.7)'}}>↳ 12 results · top score 0.97 · 3ms</span></div>
              </div>
              <div className="cap-card game-frame">
                <span className="cap-num">03 · Automation</span>
                <div className="cap-title">29 hooks · 15 workers</div>
                <p className="cap-body">Self-learning hook system that fires on every edit, commit, task, and session. 15 background workers handle security scanning, performance monitoring, and git hygiene continuously.</p>
                <div className="cap-code">/mastermind:review --tillend<br /><span style={{color:'rgba(200,220,200,0.7)'}}>→ 23 files · 0 secrets · 94% coverage</span><br /><span style={{color:'rgba(200,220,200,0.7)'}}>✓ spec → tests → impl → PR #47 · 28s</span></div>
              </div>
              <div className="cap-card game-frame">
                <span className="cap-num">04 · Browser &amp; Social</span>
                <div className="cap-title">Real Chrome automation</div>
                <p className="cap-body">70+ workflow nodes including real CDP-powered browser automation. Post to LinkedIn, generate images, scrape competitors, fill CRMs; all orchestrated from a single workflow definition.</p>
                <div className="cap-code">/monobrowse &quot;scrape competitor pricing page&quot;<br />/mastermind:marketing &quot;publish Q3 launch post&quot;<br /><span style={{color:'rgba(200,220,200,0.7)'}}>✓ Scraped · drafted · scheduled · published</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 3 · ORG MODEL */}
        <section className="slide" id="slide-orgs" style={{background:'var(--espresso)'}}>
          <div className="tactical-grid"></div>
          <div className="scanlines"></div>
          <div className="slide-content">
            <span className="section-label slide-in">The org model</span>
            <h2 className="section-h2 slide-in">Build an org for anything.<br /><em>Set it running. Walk away.</em></h2>
            <p className="slide-in" style={{fontFamily:'var(--sans)',fontSize:'14px',color:'rgba(250,247,240,0.6)',lineHeight:'1.65',maxWidth:'680px',marginBottom:'18px'}}>
              An org is a named team of AI specialists defined with one command. Each has a boss, roles, a shared task board, and an optional schedule. They coordinate autonomously and surface decisions to you only when a human call is needed.
            </p>
            <div className="org-pills slide-in">
              <span className="org-pill">① dev-team · feature development</span>
              <span className="org-pill">② github-patrol · issue monitoring · every 1h</span>
              <span className="org-pill">③ content-squad · blog + social · every monday</span>
            </div>
            <div className="step-grid slide-in">
              <div className="step-col">
                <span className="step-eyebrow">Step 01</span>
                <div className="step-title">Describe in plain English</div>
                <div className="step-body">Write a goal sentence. That&apos;s enough.</div>
                <div className="step-code">/mastermind:createorg --auto<br />&quot;Track AI competitive<br />landscape weekly&quot;</div>
              </div>
              <div className="step-col">
                <span className="step-eyebrow">Step 02</span>
                <div className="step-title">Monomind generates the team</div>
                <div className="step-body">Roles, memory, topology: all defined.</div>
                <div className="step-code">roles: [director, scout,<br />  analyst, comparator,<br />  reporter]</div>
              </div>
              <div className="step-col">
                <span className="step-eyebrow">Step 03</span>
                <div className="step-title">Run it. Walk away.</div>
                <div className="step-body">Org executes on schedule. HIL when needed.</div>
                <div className="step-code done">✓ round-4 complete<br />→ report-round-4.html<br />→ HIL: approve deploy?</div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 4 · DEV-TEAM ANIMATION */}
        <section className="slide" id="slide-devteam" style={{background:'var(--espresso)',justifyContent:'flex-start',paddingTop:'68px'}}>
          <div className="tactical-grid"></div>
          <div className="scanlines"></div>
          <div className="slide-content" style={{paddingTop:0,paddingBottom:'6px'}}>
            <span className="section-label slide-in">Org ① · dev-team</span>
            <h2 className="section-h2 slide-in" style={{fontSize:'clamp(18px,2.2vw,30px)',marginBottom:'8px'}}>Spec it. Build it.<br /><em>Ship it.</em></h2>

            <div className="corg-stage" id="corgStage">
              <div className="corg-phases">
                <span className="corg-phases-label">phase</span>
                <div className="corg-phase" id="cp-01">01 · Create</div>
                <div className="corg-phase" id="cp-02">02 · Spec</div>
                <div className="corg-phase" id="cp-03">03 · Wire</div>
                <div className="corg-phase" id="cp-04">04 · Run</div>
              </div>
              <div className="corg-cmd">
                <span className="corg-cmd-dollar">$</span>
                <span className="corg-cmd-body" id="corgCmdBody"></span><span className="corg-cmd-cur cp-blink" id="corgCursor"></span>
              </div>
              <div className="corg-lower">
                <div className="corg-graph-wrap">
                  <svg viewBox="0 0 460 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="bossGrad2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#C8A97E"/><stop offset="100%" stopColor="#7A5A0E"/>
                      </radialGradient>
                      <marker id="mArr" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
                        <path d="M0,1 L6,3.5 L0,6Z" fill="rgba(200,169,126,0.65)"/>
                      </marker>
                      <marker id="mArrDim" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
                        <path d="M0,1 L5,3 L0,5Z" fill="rgba(200,169,126,0.3)"/>
                      </marker>
                      <filter id="nodeGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    </defs>
                    <path id="eg-la" stroke="rgba(200,169,126,0.55)" strokeWidth="1.5" markerEnd="url(#mArr)" d="M210,68 C185,115  95,140  80,178" strokeDasharray="220" strokeDashoffset="220"/>
                    <path id="eg-lc" stroke="rgba(200,169,126,0.55)" strokeWidth="1.5" markerEnd="url(#mArr)" d="M220,74 C205,150 175,210 165,262" strokeDasharray="220" strokeDashoffset="220"/>
                    <path id="eg-lt" stroke="rgba(200,169,126,0.55)" strokeWidth="1.5" markerEnd="url(#mArr)" d="M240,74 C240,150 240,210 240,262" strokeDasharray="200" strokeDashoffset="200"/>
                    <path id="eg-lr" stroke="rgba(200,169,126,0.55)" strokeWidth="1.5" markerEnd="url(#mArr)" d="M260,74 C275,150 305,210 315,262" strokeDasharray="220" strokeDashoffset="220"/>
                    <path id="eg-ld" stroke="rgba(200,169,126,0.55)" strokeWidth="1.5" markerEnd="url(#mArr)" d="M270,68 C295,115 365,140 380,178" strokeDasharray="220" strokeDashoffset="220"/>
                    <path id="eg-ac" stroke="rgba(200,169,126,0.28)" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#mArrDim)" d="M98,198  C120,238 155,258 162,268"/>
                    <path id="eg-ct" stroke="rgba(200,169,126,0.28)" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#mArrDim)" d="M178,286 C200,300 220,300 228,286"/>
                    <path id="eg-tr" stroke="rgba(200,169,126,0.28)" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#mArrDim)" d="M252,286 C260,300 298,300 310,286"/>
                    <path id="eg-rd" stroke="rgba(200,169,126,0.28)" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#mArrDim)" d="M322,268 C329,258 362,238 382,198"/>
                    <g id="gn-lead" opacity="0">
                      <circle cx="240" cy="46" r="38" fill="rgba(200,169,126,0.07)" stroke="rgba(200,169,126,0.2)" strokeWidth="1"/>
                      <circle cx="240" cy="46" r="28" fill="url(#bossGrad2)" filter="url(#nodeGlow)"/>
                      <text x="240" y="42" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="white" textAnchor="middle" fontWeight="700" letterSpacing="0.06em">ENGINEERING</text>
                      <text x="240" y="53" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="white" textAnchor="middle" fontWeight="700" letterSpacing="0.06em">LEAD</text>
                      <text x="240" y="92" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(200,169,126,0.45)" textAnchor="middle" letterSpacing="0.1em">BOSS</text>
                    </g>
                    <g id="gn-arch" opacity="0">
                      <circle cx="78" cy="190" r="22" fill="rgba(30,24,16,0.85)" stroke="rgba(200,169,126,0.38)" strokeWidth="1.5"/>
                      <text x="78" y="187" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Software</text>
                      <text x="78" y="197" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Architect</text>
                    </g>
                    <g id="gn-code" opacity="0">
                      <circle cx="165" cy="276" r="22" fill="rgba(30,24,16,0.85)" stroke="rgba(200,169,126,0.38)" strokeWidth="1.5"/>
                      <text x="165" y="273" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Senior</text>
                      <text x="165" y="283" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Developer</text>
                    </g>
                    <g id="gn-test" opacity="0">
                      <circle cx="240" cy="276" r="22" fill="rgba(30,24,16,0.85)" stroke="rgba(200,169,126,0.38)" strokeWidth="1.5"/>
                      <text x="240" y="273" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">QA</text>
                      <text x="240" y="283" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Engineer</text>
                    </g>
                    <g id="gn-rev" opacity="0">
                      <circle cx="315" cy="276" r="22" fill="rgba(30,24,16,0.85)" stroke="rgba(200,169,126,0.38)" strokeWidth="1.5"/>
                      <text x="315" y="273" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Code</text>
                      <text x="315" y="283" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Reviewer</text>
                    </g>
                    <g id="gn-devops" opacity="0">
                      <circle cx="382" cy="190" r="22" fill="rgba(30,24,16,0.85)" stroke="rgba(200,169,126,0.38)" strokeWidth="1.5"/>
                      <text x="382" y="187" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">DevOps</text>
                      <text x="382" y="197" fontFamily="system-ui,sans-serif" fontSize="8" fill="rgba(250,247,240,0.9)" textAnchor="middle">Automator</text>
                    </g>
                    <circle id="cp-r1" cx="240" cy="46" r="28" fill="none" stroke="rgba(200,169,126,0.8)" strokeWidth="2" opacity="0"/>
                    <circle id="cp-r2" cx="240" cy="46" r="28" fill="none" stroke="rgba(200,169,126,0.4)" strokeWidth="1.5" opacity="0"/>
                  </svg>
                </div>
                <div className="corg-cards" id="corgCards">
                  <div className="corg-card" id="cc-lead"><span className="corg-card-eyebrow">boss · Engineering Lead</span><div className="corg-card-title">Breaks down the feature goal, assigns work, monitors progress and unblocks.</div><div className="corg-card-tags"><span className="corg-card-tag">planner</span><span className="corg-card-tag">→ sprint.md</span></div></div>
                  <div className="corg-card" id="cc-arch"><span className="corg-card-eyebrow">specialist · Software Architect</span><div className="corg-card-title">Designs schema, interfaces, module boundaries, ADRs. Outputs spec before any code.</div><div className="corg-card-tags"><span className="corg-card-tag">Software Architect</span><span className="corg-card-tag">→ architecture.md</span></div></div>
                  <div className="corg-card" id="cc-code"><span className="corg-card-eyebrow">specialist · Senior Developer</span><div className="corg-card-title">Implements features from spec. TDD-first. Opens PRs. Never ships without tests.</div><div className="corg-card-tags"><span className="corg-card-tag">coder</span><span className="corg-card-tag">→ src/ + PR</span></div></div>
                  <div className="corg-card" id="cc-test"><span className="corg-card-eyebrow">specialist · QA Engineer</span><div className="corg-card-title">Runs full test suite, writes missing tests, catches regressions. Blocks merge if coverage drops.</div><div className="corg-card-tags"><span className="corg-card-tag">tester</span><span className="corg-card-tag">→ test-report.md</span></div></div>
                  <div className="corg-card" id="cc-rev"><span className="corg-card-eyebrow">specialist · Code Reviewer</span><div className="corg-card-title">Security, correctness, style, OWASP scan. Leaves inline comments. Approves or blocks PR.</div><div className="corg-card-tags"><span className="corg-card-tag">reviewer</span><span className="corg-card-tag">→ PR review</span></div></div>
                  <div className="corg-card" id="cc-devops"><span className="corg-card-eyebrow">specialist · DevOps Automator</span><div className="corg-card-title">Triggers CI/CD on merge, monitors deployment, rolls back if health check fails.</div><div className="corg-card-tags"><span className="corg-card-tag">DevOps Automator</span><span className="corg-card-tag">→ deploy log</span></div></div>
                </div>
              </div>
              <div className="corg-run-feed" id="corgRunFeed">
                <div className="corg-run-bar">
                  <div className="corg-run-dot"></div>
                  <span className="corg-run-title">/mastermind:runorg --org dev-team &quot;add JWT refresh token rotation&quot;</span>
                </div>
                <div className="corg-run-body" id="corgRunBody"></div>
              </div>
              <div className="corg-event" id="corgEvent">
                <div className="corg-event-ripple" id="corgRipple"></div>
                ✓ <span style={{color:'rgba(200,169,126,0.8)'}}>org:create</span> → <span style={{color:'rgba(200,169,126,0.8)'}}>org:run</span> → <code>/mastermind:runorg --org dev-team</code>: org will self-loop until stopped
              </div>
              <div className="corg-footer" id="corgFooter">
                <button className="corg-replay-btn" id="corgReplayBtn">↺ replay</button>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 5 · GITHUB-PATROL */}
        <section className="slide" id="slide-patrol" style={{background:'linear-gradient(180deg,var(--espresso) 0%,#1e1a13 100%)'}}>
          <div className="tactical-grid"></div>
          <div className="scanlines"></div>
          <div className="slide-content">
            <span className="section-label slide-in">Always on</span>
            <h2 className="section-h2 slide-in" style={{marginBottom:'16px'}}>Reads GitHub. Ships features.<br /><em>Asks when it matters.</em></h2>
            <div className="loop-cmd-bar slide-in">
              <div><span className="lcd">$</span> /mastermind:createorg --name github-patrol <span className="loop-cmd-schedule">--schedule &quot;every 1h&quot; --hil telegram \</span></div>
              <div style={{paddingLeft:'16px',color:'rgba(250,247,240,0.55)'}}>&quot;Read open GitHub issues every hour, fix bugs, open PRs&quot;</div>
              <div><span className="lcd">$</span> /mastermind:runorg --org github-patrol</div>
            </div>
            <div className="loop-beats slide-in" id="loopBeats">
              <div className="loop-beat">
                <div className="lb-card" id="lb1">
                  <span className="lb-icon">⏰</span>
                  <span className="lb-label">01 · Wake</span>
                  <div className="lb-title">Org wakes on schedule</div>
                  <div className="lb-clock" id="lbClock">14:00:00</div>
                  <div className="lb-clock-sub">scheduled · every 1 hour</div>
                  <span className="lb-cycle-tag" id="lbCycleTag">Cycle 5 of ongoing</span>
                </div>
              </div>
              <div className="loop-beat">
                <div className="lb-card" id="lb2">
                  <span className="lb-icon">🐙</span>
                  <span className="lb-label">02 · Fetch</span>
                  <div className="lb-title">GitHub issues scanned</div>
                  <div className="lb-issues">
                    <div className="lb-issue" id="lbi1"><span className="lb-issue-num">#47</span><span className="lb-issue-type feat">feat</span>dark mode support</div>
                    <div className="lb-issue" id="lbi2"><span className="lb-issue-num">#46</span><span className="lb-issue-type bug">bug</span>auth session timeout</div>
                    <div className="lb-issue" id="lbi3"><span className="lb-issue-num">#45</span><span className="lb-issue-type bug">bug</span>file upload fails &gt;10MB</div>
                  </div>
                </div>
              </div>
              <div className="loop-beat">
                <div className="lb-card" id="lb3">
                  <span className="lb-icon">⚙️</span>
                  <span className="lb-label">03 · Work</span>
                  <div className="lb-title">Agents execute in parallel</div>
                  <div className="lb-work" id="lbWork">
                    <div className="lb-work-line" id="lbw1"><span className="role">[Arch]</span> designing dark mode token system</div>
                    <div className="lb-work-line" id="lbw2"><span className="role">[Dev]</span> fixing session TTL · auth.ts:142</div>
                    <div className="lb-work-line" id="lbw3"><span className="role">[Dev]</span> patching upload limit · api/files.ts</div>
                    <div className="lb-work-line ok" id="lbw4"><span className="role">[QA]</span> ✓ 24 tests pass · 0 failures</div>
                    <div className="lb-work-line ok" id="lbw5"><span className="role">[Rev]</span> ✓ PR #52 #53 approved</div>
                    <div className="lb-work-line ok" id="lbw6"><span className="role">[Ops]</span> ✓ staging deployed · health OK</div>
                  </div>
                </div>
              </div>
              <div className="loop-beat">
                <div className="lb-card" id="lb4">
                  <span className="lb-icon">📱</span>
                  <span className="lb-label">04 · HIL</span>
                  <div className="lb-title">Human-in-the-loop</div>
                  <div className="lb-tg" id="lbTg">
                    <div className="tg-bubble">
                      <div className="tg-header">
                        <div className="tg-avatar">🤖</div>
                        <span className="tg-bot-name">monomind · github-patrol</span>
                      </div>
                      <div className="tg-issue-line"><span className="ok">✅</span>#46 auth timeout: fixed (PR #52)</div>
                      <div className="tg-issue-line"><span className="ok">✅</span>#45 file upload: fixed (PR #53)</div>
                      <div className="tg-issue-line"><span className="pending">⏳</span>#47 dark mode: in review</div>
                      <hr className="tg-divider" />
                      <div className="tg-hil">Approve merging PR #52 and #53 to main?</div>
                      <div className="tg-btns">
                        <div className="tg-btn approve">✅ Approve &amp; merge both</div>
                        <div className="tg-btn">👀 Review diffs first</div>
                        <div className="tg-btn">⏭ Skip this cycle</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="loop-footer slide-in" id="loopFooter">
              <div>
                <div className="loop-timer-label">next cycle in</div>
                <div className="loop-timer" id="loopTimer">59:47</div>
              </div>
              <div className="loop-status" id="loopStatus">↺ github-patrol · cycle 5 complete · 2 PRs awaiting approval</div>
              <button className="loop-replay-btn" id="loopReplayBtn">↺ replay</button>
            </div>
          </div>
        </section>

        {/* SLIDE 6 · CONTENT-SQUAD */}
        <section className="slide" id="slide-squad" style={{background:'linear-gradient(180deg,#1e1a13 0%,var(--espresso) 100%)'}}>
          <div className="tactical-grid"></div>
          <div className="scanlines"></div>
          <div className="slide-content">
            <span className="section-label slide-in">Org ③ · content-squad</span>
            <h2 className="section-h2 slide-in" style={{marginBottom:'16px'}}>Writes the blog.<br /><em>Ships it every Monday.</em></h2>
            <div className="loop-cmd-bar slide-in">
              <div><span className="lcd">$</span> /mastermind:createorg --name content-squad <span className="loop-cmd-schedule">--schedule &quot;every monday 09:00&quot; --hil telegram \</span></div>
              <div style={{paddingLeft:'16px',color:'rgba(250,247,240,0.55)'}}>&quot;Research, write, and publish one blog post + social content weekly&quot;</div>
              <div><span className="lcd">$</span> /mastermind:runorg --org content-squad</div>
            </div>
            <div className="loop-beats slide-in" id="csBeats">
              <div className="loop-beat">
                <div className="lb-card" id="cs1">
                  <span className="lb-icon">📡</span>
                  <span className="lb-label">01 · Research</span>
                  <div className="lb-title">Topics sourced autonomously</div>
                  <div className="lb-work" style={{marginTop:'8px'}}>
                    <div className="lb-work-line" id="csw1"><span className="role">[Scout]</span> scanning Hacker News · arXiv · X</div>
                    <div className="lb-work-line ok" id="csw2"><span className="role">[Scout]</span> ✓ topic: &quot;Autonomous engineering orgs&quot;</div>
                  </div>
                </div>
              </div>
              <div className="loop-beat">
                <div className="lb-card" id="cs2">
                  <span className="lb-icon">✍️</span>
                  <span className="lb-label">02 · Write</span>
                  <div className="lb-title">2,400-word post drafted</div>
                  <div className="lb-work" style={{marginTop:'8px'}}>
                    <div className="lb-work-line" id="csw3"><span className="role">[Writer]</span> drafting outline · 7 sections</div>
                    <div className="lb-work-line" id="csw4"><span className="role">[Writer]</span> writing body · examples · snippets</div>
                    <div className="lb-work-line ok" id="csw5"><span className="role">[Editor]</span> ✓ SEO score 91 · readability A</div>
                  </div>
                </div>
              </div>
              <div className="loop-beat">
                <div className="lb-card" id="cs3">
                  <span className="lb-icon">🖼️</span>
                  <span className="lb-label">03 · Package</span>
                  <div className="lb-title">Images + social copy</div>
                  <div className="lb-work" style={{marginTop:'8px'}}>
                    <div className="lb-work-line" id="csw6"><span className="role">[Design]</span> generating hero image via Gemini</div>
                    <div className="lb-work-line ok" id="csw7"><span className="role">[Social]</span> ✓ LinkedIn + X posts drafted</div>
                  </div>
                </div>
              </div>
              <div className="loop-beat">
                <div className="lb-card" id="cs4">
                  <span className="lb-icon">📱</span>
                  <span className="lb-label">04 · HIL + Publish</span>
                  <div className="lb-title">You approve. Agents publish.</div>
                  <div className="lb-tg" id="csTg" style={{marginTop:'8px'}}>
                    <div className="tg-bubble">
                      <div className="tg-header">
                        <div className="tg-avatar">🤖</div>
                        <span className="tg-bot-name">monomind · content-squad</span>
                      </div>
                      <div className="tg-issue-line"><span className="ok">✅</span>Post ready: &quot;Autonomous engineering orgs&quot;</div>
                      <div className="tg-issue-line"><span className="ok">✅</span>2,412 words · SEO 91 · hero image attached</div>
                      <div className="tg-issue-line"><span className="pending">⏳</span>LinkedIn + X posts queued · awaiting go</div>
                      <hr className="tg-divider" />
                      <div className="tg-hil">Publish to blog and schedule social posts?</div>
                      <div className="tg-btns">
                        <div className="tg-btn approve">🚀 Publish now</div>
                        <div className="tg-btn">✏️ Edit draft first</div>
                        <div className="tg-btn">⏭ Skip this week</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="loop-footer slide-in" id="csFooter" style={{opacity:0}}>
              <div>
                <div className="loop-timer-label">next monday in</div>
                <div className="loop-timer" id="csTimer">6d 14h 52m</div>
              </div>
              <div className="loop-status">↺ content-squad · post queued · social posts awaiting approval</div>
              <button className="loop-replay-btn" id="csReplayBtn">↺ replay</button>
            </div>
          </div>
        </section>

        {/* SLIDE 7 · AUTONOMOUS COMPANY (light slide) */}
        <section className="slide slide-light" id="slide-company" style={{background:'var(--ivory)'}}>
          <div className="slide-content">
            <span className="section-label slide-in">What your autonomous company looks like</span>
            <h2 className="section-h2 slide-in" style={{marginBottom:'10px'}}>Every department.<br /><em>No payroll.</em></h2>
            <div className="org-grid slide-in">
              <div className="org-role"><span className="org-role-icon">⚡</span><span className="org-role-dept">Engineering</span><div className="org-role-title">Senior Developer</div><p className="org-role-sub">Code review, TDD, architecture decisions, dependency updates, CI/CD pipelines.</p><span className="org-role-badge">coder · reviewer · tester</span></div>
              <div className="org-role"><span className="org-role-icon">🛡️</span><span className="org-role-dept">Security</span><div className="org-role-title">Security Architect</div><p className="org-role-sub">OWASP scanning, threat modeling, compliance checks on every commit, automated.</p><span className="org-role-badge">security-architect · auditor</span></div>
              <div className="org-role"><span className="org-role-icon">📈</span><span className="org-role-dept">Marketing</span><div className="org-role-title">Content + SEO Lead</div><p className="org-role-sub">Blog posts, social content, SEO audits, competitive research, ad creative.</p><span className="org-role-badge">content-creator · seo-specialist</span></div>
              <div className="org-role"><span className="org-role-icon">🎯</span><span className="org-role-dept">Sales</span><div className="org-role-title">Outbound Strategist</div><p className="org-role-sub">Lead research, personalized outreach sequences, deal strategy, pipeline analysis.</p><span className="org-role-badge">outbound-strategist · deal-strategist</span></div>
              <div className="org-role"><span className="org-role-icon">🔧</span><span className="org-role-dept">DevOps</span><div className="org-role-title">DevOps Automator</div><p className="org-role-sub">Infrastructure as code, monitoring, incident response, deployment automation.</p><span className="org-role-badge">devops-automator · sre</span></div>
              <div className="org-role"><span className="org-role-icon">📊</span><span className="org-role-dept">Finance</span><div className="org-role-title">Finance Tracker</div><p className="org-role-sub">Budget monitoring, expense categorization, cash flow analysis, forecasting.</p><span className="org-role-badge">finance-tracker · analytics</span></div>
              <div className="org-role"><span className="org-role-icon">🧠</span><span className="org-role-dept">Product</span><div className="org-role-title">Product Manager</div><p className="org-role-sub">Feature prioritization, roadmap planning, competitive analysis, stakeholder docs.</p><span className="org-role-badge">product-manager · researcher</span></div>
              <div className="org-role"><span className="org-role-icon">⚖️</span><span className="org-role-dept">Legal</span><div className="org-role-title">Compliance Checker</div><p className="org-role-sub">ToS drafts, GDPR review, license audits, compliance monitoring across stack.</p><span className="org-role-badge">legal-compliance · auditor</span></div>
            </div>
            <div className="org-summary slide-in">
              <div className="org-stat"><span className="org-stat-num" data-count="89">89</span><span className="org-stat-label">Agent roles</span></div>
              <div className="org-stat"><span className="org-stat-num" data-count="247">24/7</span><span className="org-stat-label">Autonomous execution</span></div>
              <div className="org-stat"><span className="org-stat-num" data-count="0">$0</span><span className="org-stat-label">Payroll</span></div>
              <div className="org-stat"><span className="org-stat-num" data-count="1">1</span><span className="org-stat-label">Developer needed</span></div>
            </div>
          </div>
        </section>

        {/* SLIDE 8 · CLOSING CTA */}
        <section className="slide" id="slide-close" style={{background:'var(--espresso)'}}>
          <div className="tactical-grid"></div>
          <div className="scanlines"></div>
          <div className="slide-content" style={{maxWidth:'760px'}}>
            <h2 className="close-h2 slide-in">Your company can<br />run <em>itself.</em></h2>
            <p className="close-sub slide-in">Start with the open-source platform. Configure the agents for your workflow. Or tell us what you need and we&apos;ll set it up for you.</p>
            <div id="cmdStatus" className="cmd-status" style={{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--signal-green,#3D8B5E)',letterSpacing:'0.12em',marginBottom:'16px',height:'14px'}}></div>
            <div className="close-split slide-in">
              <div className="close-option self" data-mission="ALPHA">
                <span className="close-mission-tag">MISSION ALPHA</span>
                <span className="close-option-label">Self-hosted · Free forever</span>
                <div className="close-option-title">Deploy it yourself</div>
                <p className="close-option-body">MIT licensed. Full source code. Install in minutes. BYOK from zero. No usage caps, no monthly billing, no vendor relationship.</p>
                <a href="https://github.com/monoes/monomind" className="close-option-cta" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
              </div>
              <div className="close-divider"></div>
              <div className="close-option team" data-mission="BRAVO">
                <span className="close-mission-tag">MISSION BRAVO</span>
                <span className="close-option-label">Managed setup · By the core team</span>
                <div className="close-option-title">Have us deploy it</div>
                <p className="close-option-body">The contributors who built Monomind configure it for your specific workflows. You own the deployment. We hand over the keys.</p>
                <a href="mailto:nokhodian@gmail.com?subject=Monomind team deployment" className="close-option-cta">Talk to the team →</a>
              </div>
            </div>
            <div className="oss-row slide-in">
              <span className="oss-label">Open source &amp; owned outright</span>
              <div className="oss-pills">
                <span className="oss-pill">MIT License</span>
                <span className="oss-pill">Self-hostable</span>
                <span className="oss-pill">BYOK from zero</span>
                <span className="oss-pill">No usage caps</span>
                <span className="oss-pill">TypeScript</span>
                <span className="oss-pill">v2.8.4</span>
              </div>
            </div>
          </div>
        </section>

      </div>{/* /#snapWrap */}
    </>
  );
}
