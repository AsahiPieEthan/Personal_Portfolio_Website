import { useEffect, useEffectEvent, useRef, useState } from 'react';
import projects from './projects.json';
import gymImage from '../Gym_First_Project.jpg';
import restaurantImage from '../HQ_Project2.png';
import frierenImage from '../Frieren_project.png';
import './projects-carousel.css';

const images = [gymImage, restaurantImage, frierenImage];
const STEP = 360 / projects.length;
const AUTO_ADVANCE_DELAY = 5000; // Wait five idle seconds before showing the next project.
const wrap = index => ((index % projects.length) + projects.length) % projects.length;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function ProjectArtwork({ project, image }) {
  return (
    <div className={`gallery-artwork${project.purple ? ' gallery-artwork-purple' : ''}`}>
      {image ? <img src={image} alt="" draggable="false" /> : (
        <div className="gallery-placeholder"><span>DM</span><small>DOCUMENT INTELLIGENCE</small></div>
      )}
      <div className="gallery-panel-caption"><span>{project.label}</span><span>↗</span></div>
    </div>
  );
}

export default function Projects() {
  // Rotation is continuous; selection is a whole-number project index.
  const [rotation, setRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const galleryRef = useRef(null);
  const sceneRef = useRef(null);
  const angle = useRef(0);
  const targetAngle = useRef(0);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const frame = useRef(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener('change', update);
    return () => {
      preference.removeEventListener('change', update);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const advanceWhenIdle = useEffectEvent(() => move(1));

  useEffect(() => {
    if (!autoPlay || dragging) return;
    const gallery = galleryRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let hovered = window.matchMedia('(hover: hover)').matches && gallery.matches(':hover');
    let timer;

    // Every scroll or interaction restarts the same timer.
    function schedule() {
      clearTimeout(timer);
      if (!visible || hovered || document.hidden || preference.matches ||
          gesture.current || gallery.contains(document.activeElement)) return;
      timer = setTimeout(() => {
        if (!gesture.current) advanceWhenIdle();
        schedule();
      }, AUTO_ADVANCE_DELAY);
    }
    function enter(event) {
      if (event.pointerType !== 'touch') hovered = true;
      schedule();
    }
    function leave() { hovered = false; schedule(); }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      schedule();
    }, { threshold: [0, 0.35] });
    observer.observe(sceneRef.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('pointerup', schedule);
    window.addEventListener('keydown', schedule);
    document.addEventListener('visibilitychange', schedule);
    preference.addEventListener('change', schedule);
    gallery.addEventListener('pointerenter', enter);
    gallery.addEventListener('pointerleave', leave);
    gallery.addEventListener('pointerdown', schedule);
    gallery.addEventListener('focusin', schedule);
    gallery.addEventListener('focusout', schedule);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('pointerup', schedule);
      window.removeEventListener('keydown', schedule);
      document.removeEventListener('visibilitychange', schedule);
      preference.removeEventListener('change', schedule);
      gallery.removeEventListener('pointerenter', enter);
      gallery.removeEventListener('pointerleave', leave);
      gallery.removeEventListener('pointerdown', schedule);
      gallery.removeEventListener('focusin', schedule);
      gallery.removeEventListener('focusout', schedule);
    };
  }, [autoPlay, dragging]);

  function updateAngle(value) {
    angle.current = value;
    setRotation(value);
  }

  // A damped spring carries release momentum into a precise stopping point.
  function settle(target, velocity = 0) {
    cancelAnimationFrame(frame.current);
    targetAngle.current = target;
    setActiveIndex(wrap(Math.round(-target / STEP)));
    if (reducedMotion.current) {
      updateAngle(target);
      return;
    }
    let previousTime = null;
    function tick(time) {
      const dt = previousTime === null ? 1 / 60 : Math.min((time - previousTime) / 1000, 1 / 30);
      previousTime = time;
      velocity += ((target - angle.current) * 180 - velocity * 26) * dt;
      const next = angle.current + velocity * dt;
      if (Math.abs(next - target) < 0.05 && Math.abs(velocity) < 0.5) {
        updateAngle(target);
        frame.current = null;
        return;
      }
      updateAngle(next);
      frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
  }

  function selectProject(index) {
    const current = -angle.current / STEP;
    const nearestTurn = Math.round((current - index) / projects.length);
    settle(-(index + nearestTurn * projects.length) * STEP);
  }

  function move(direction) {
    // Use the destination so rapid clicks still advance one project each time.
    settle(targetAngle.current - direction * STEP);
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    cancelAnimationFrame(frame.current);
    suppressClick.current = false;
    gesture.current = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY,
      lastX: event.clientX, lastTime: event.timeStamp, velocity: 0,
      startAngle: angle.current, moved: false,
      sensitivity: 180 / event.currentTarget.clientWidth,
    };
  }

  function drag(event) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null; // Leave vertical gestures to page scrolling.
        settle(Math.round(angle.current / STEP) * STEP);
        return;
      }
      if (Math.abs(dx) < 8) return;
      current.moved = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    const elapsed = Math.max(1, event.timeStamp - current.lastTime);
    current.velocity = clamp((event.clientX - current.lastX) * current.sensitivity / elapsed * 1000, -650, 650);
    current.lastX = event.clientX;
    current.lastTime = event.timeStamp;
    updateAngle(current.startAngle + dx * current.sensitivity);
  }

  function endDrag(event, cancelled = false) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const velocity = cancelled || reducedMotion.current || event.timeStamp - current.lastTime > 100 ? 0 : current.velocity;
    if (current.moved || cancelled) {
      const projected = angle.current + clamp(velocity * 0.18, -STEP * 1.3, STEP * 1.3);
      settle(Math.round(projected / STEP) * STEP, velocity);
    } else {
      settle(targetAngle.current);
    }
  }

  function keyboard(event) {
    if (gesture.current) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      selectProject(event.key === 'Home' ? 0 : projects.length - 1);
    }
  }

  const selected = projects[activeIndex];
  return (
    <div ref={galleryRef} className="project-gallery" role="region" aria-roledescription="carousel" aria-label="Project gallery" onKeyDown={keyboard}>
      <div className="gallery-topline"><span>SELECTED WORK / INTERACTIVE GALLERY</span><span>DRAG TO EXPLORE ↔</span></div>
      <div ref={sceneRef} className={`gallery-scene${dragging ? ' is-dragging' : ''}`} tabIndex={0}
        aria-label="Drag to rotate projects, or use the left and right arrow keys" aria-describedby="gallery-help"
        onPointerDown={startDrag} onPointerMove={drag} onPointerUp={event => endDrag(event)}
        onPointerLeave={event => { if (gesture.current && !gesture.current.moved) endDrag(event, true); }}
        onPointerCancel={event => endDrag(event, true)} onLostPointerCapture={event => endDrag(event, true)}>
        <div className="gallery-halo" aria-hidden="true" />
        <div className="gallery-floor" aria-hidden="true" />
        <div className="gallery-orbit">
          {projects.map((project, index) => {
            const degrees = ((index * STEP + rotation + 180) % 360 + 360) % 360 - 180;
            const radians = degrees * Math.PI / 180;
            const depth = (Math.cos(radians) + 1) / 2;
            return (
              <button type="button" key={project.id} className={`gallery-panel${index === activeIndex ? ' is-active' : ''}`}
                tabIndex={-1} aria-label={`Select ${project.title}`} aria-pressed={index === activeIndex}
                style={{ '--orbit-x': Math.sin(radians), '--orbit-z': (Math.cos(radians) - 1) * 0.7,
                  '--panel-yaw': `${clamp(-degrees * 0.48, -65, 65)}deg`, '--panel-opacity': 0.22 + depth * 0.78,
                  zIndex: Math.round(depth * 100) }}
                onClick={() => { if (!suppressClick.current) selectProject(index); }}>
                <span className="gallery-panel-number">{String(index + 1).padStart(2, '0')} / {project.title}</span>
                <ProjectArtwork project={project} image={images[index]} />
                <div className="gallery-reflection" aria-hidden="true"><ProjectArtwork project={project} image={images[index]} /></div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="gallery-controls">
        <button type="button" className="gallery-arrow" aria-label="Previous project" onClick={() => move(-1)}>←</button>
        <div className="gallery-pagination" aria-label="Choose a project">
          {projects.map((project, index) => (
            <button type="button" key={project.id} aria-label={`Show ${project.title}`} aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => selectProject(index)}><span /></button>
          ))}
        </div>
        <button type="button" className="gallery-arrow" aria-label="Next project" onClick={() => move(1)}>→</button>
      </div>
      <button type="button" className="gallery-autoplay" onClick={() => setAutoPlay(enabled => !enabled)}>
        {autoPlay ? 'Pause auto-play' : 'Resume auto-play'}
      </button>
      <article className="gallery-details" aria-labelledby="gallery-project-title">
        <div className="gallery-counter" aria-live={autoPlay ? 'off' : 'polite'} aria-atomic="true">{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} — {selected.title}</div>
        <h3 id="gallery-project-title">{selected.title}</h3>
        <p className="gallery-description">{selected.description}</p>
        <div className="project-meta">{selected.tags.map(tag => <span className="project-tag" key={tag}>{tag}</span>)}</div>
        <div className="gallery-links">
          {selected.repoUrl && selected.repoUrl !== '#' ? <a href={selected.repoUrl} className="btn btn-solid" target="_blank" rel="noopener noreferrer">View GitHub ↗</a> : <span className="gallery-unavailable">Repository coming soon</span>}
          {selected.liveUrl && selected.liveUrl !== '#' && <a href={selected.liveUrl} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
        </div>
      </article>
      <p id="gallery-help" className="gallery-help">Swipe or drag to explore · Use ← → when the gallery is focused</p>
    </div>
  );
}
