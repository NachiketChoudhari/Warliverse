import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DeconstructPage } from '../../pages/DeconstructPage';
import { GeneratorPage } from '../../pages/GeneratorPage';
import { PersonalizationPage } from '../../pages/PersonalizationPage';
import { grammarRules, humanPartPrimitives } from '../../data/grammar';
import { PrimitiveCircle } from '../warli/PrimitiveCircle';
import { PrimitiveLine } from '../warli/PrimitiveLine';
import { PrimitiveTriangle } from '../warli/PrimitiveTriangle';
import { DocumentationStatus } from './DocumentationStatus';
import { PreservationSummary } from './PreservationSummary';
import {
  COMPETITION_STAGES, createInitialCompetitionState, getCompetitionStage,
  handleCompetitionKey, moveCompetitionStage, startCompetition,
} from './competitionState';
import { requestPresentationFullscreen } from './presentation';

const PoseMirrorPage = lazy(() => import('../../pages/PoseMirrorPage').then((module) => ({ default: module.PoseMirrorPage })));

function UnderstandStage() {
  return <div className="space-y-8">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">01 / Understand</p><h2 className="mt-3 font-serif text-4xl">A visual grammar, represented</h2><p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-700">Traditional visual structures can be documented and represented computationally. This studio makes those representations inspectable so software can support preservation and experimentation.</p></div>
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <div className="grid grid-cols-3 gap-3" aria-label="Primitive vocabulary">
        <div className="flex h-32 flex-col items-center justify-center border border-stone-300 bg-[#fbf8ef]"><svg viewBox="0 0 80 60" className="h-16 w-20" aria-hidden="true"><PrimitiveCircle center={{ x: 40, y: 30 }} radius={15} /></svg><span>Circle</span></div>
        <div className="flex h-32 flex-col items-center justify-center border border-stone-300 bg-[#fbf8ef]"><svg viewBox="0 0 80 60" className="h-16 w-20" aria-hidden="true"><PrimitiveTriangle points={['40,10', '20,48', '60,48']} /></svg><span>Triangle</span></div>
        <div className="flex h-32 flex-col items-center justify-center border border-stone-300 bg-[#fbf8ef]"><svg viewBox="0 0 80 60" className="h-16 w-20" aria-hidden="true"><PrimitiveLine start={{ x: 15, y: 45 }} end={{ x: 65, y: 15 }} /></svg><span>Line</span></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-stone-300 p-5"><h3 className="text-xs font-semibold uppercase tracking-widest">Observation</h3><p className="mt-3 text-stone-700">A note recorded from reviewed reference material, with its source and context.</p></div>
        <div className="border border-stone-300 p-5"><h3 className="text-xs font-semibold uppercase tracking-widest">Software rule</h3><p className="mt-3 text-stone-700">An explicit configuration used by this application. It does not become a cultural claim by itself.</p></div>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="border border-stone-300 p-5"><h3 className="font-serif text-xl">Configured human structure</h3><ul className="mt-3 space-y-1 text-sm text-stone-700"><li>Head → {humanPartPrimitives.head}</li><li>Body → {humanPartPrimitives.body}</li><li>Arms → {humanPartPrimitives.leftArm} / {humanPartPrimitives.rightArm}</li><li>Legs → {humanPartPrimitives.leftLeg} / {humanPartPrimitives.rightLeg}</li></ul></div>
      <div className="border border-stone-300 p-5"><h3 className="font-serif text-xl">Motif vocabulary</h3><p className="mt-3 text-sm text-stone-700">Human · Tree · Hut · Animal · Sun</p><p className="mt-2 text-xs text-stone-500">These are configured software motif IDs.</p></div>
      <div className="border border-stone-300 p-5"><h3 className="font-serif text-xl">Composition constraints</h3><ul className="mt-3 space-y-1 text-sm text-stone-700">{grammarRules.map((rule) => <li key={rule.id}>{rule.description}</li>)}</ul></div>
    </div>
    <p className="border-l-2 border-stone-700 pl-4 text-lg">No source-backed grammar rules are currently configured.</p>
  </div>;
}

function PreserveStage() {
  return <div className="space-y-7"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">02 / Preserve</p><h2 className="mt-3 font-serif text-4xl">Keep evidence visible</h2><p className="mt-3 text-stone-700">Observations and software interpretations are tracked separately. The current corpus contains museum catalogue metadata; motif and grammar observations have not yet been recorded.</p></div><DocumentationStatus /><ol className="grid gap-2 sm:grid-cols-5" aria-label="Reference documentation pipeline">{['Source', 'Artwork', 'Observation', 'Grammar Evidence', 'Configured Rule'].map((label, i) => <li key={label} className="flex items-center gap-2 border border-stone-300 p-3"><span className="text-stone-500">{i + 1}</span>{label}</li>)}</ol><div className="rounded-xl border border-dashed border-stone-400 p-6"><p className="font-serif text-xl">Source and artwork metadata are now catalogued.</p><p className="mt-2 text-stone-600">The archive contains no motif observations, grammar observations, measurements, or source-backed rules yet. Candidate institutional documents remain pending review.</p><Link className="mt-4 inline-flex rounded border border-stone-600 px-4 py-2 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2" to="/references">Open Reference Archive</Link></div></div>;
}

export function CompetitionShell() {
  const [state, setState] = useState(createInitialCompetitionState);
  const [fullscreen, setFullscreen] = useState(false);
  const [presentationMessage, setPresentationMessage] = useState('');
  const presentationRef = useRef<HTMLElement>(null);
  const stage = getCompetitionStage(state.stageIndex);

  useEffect(() => {
    if (!state.started) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))) return;
      if (['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) {
        event.preventDefault();
        setState((current) => handleCompetitionKey(current, event.key));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.started]);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === presentationRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  async function togglePresentation() {
    setPresentationMessage('');
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { setPresentationMessage('Unable to exit presentation mode. Use your browser controls.'); }
      return;
    }
    const result = await requestPresentationFullscreen(presentationRef.current);
    if (!result.ok) setPresentationMessage(result.reason === 'unsupported' ? 'Presentation mode is not supported by this browser.' : 'Fullscreen permission was not granted. You can continue in this window.');
  }

  function renderStage() {
    if (!stage) return <div role="alert" className="rounded border border-stone-400 p-5">This presentation step is unavailable. Return to the competition home and restart.</div>;
    switch (stage.id) {
      case 'understand': return <UnderstandStage />;
      case 'preserve': return <PreserveStage />;
      case 'create': return <div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">03 / Create</p><h2 className="mt-2 font-serif text-4xl">Procedural Composition</h2><p className="mt-2 text-stone-700">Explore configured layouts and inspect the generator's grammar trace.</p></div><GeneratorPage /></div>;
      case 'deconstruct': return <div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">04 / Deconstruct</p><h2 className="mt-2 font-serif text-4xl">Structure into representation</h2><p className="mt-2 max-w-3xl text-stone-700">The system represents visual structure rather than simply copying an image.</p><p className="mt-3 text-sm text-stone-600">Composition → Motifs → Primitives → Structural relationships → Reconstruction → New procedural composition</p></div><DeconstructPage /></div>;
      case 'experience': return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">05 / Experience</p><h2 className="mt-2 font-serif text-4xl">Pose Mirror</h2><p className="mt-2 text-stone-700">Camera → Pretrained pose-estimation component → Body landmarks → Normalization → Warli figure structure → SVG rendering</p><p className="text-sm text-stone-600">Camera frames are processed locally by the pose detector and are not uploaded or saved by this application.</p><p className="inline-block border border-stone-400 bg-[#f3eddf] px-3 py-2 text-sm">Demo Mode — deterministic simulated pose. Select Demo Mode below to start the simulated sequence.</p></div><Suspense fallback={<div role="status" className="rounded border border-stone-300 p-8">Loading the local pose demonstration…</div>}><PoseMirrorPage /></Suspense></div>;
      case 'apply': return <div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">06 / Apply</p><h2 className="mt-2 font-serif text-4xl">Personalization Studio</h2><p className="mt-2 text-stone-700">Select a product, generate four variations, compare, preview, and export.</p></div><PersonalizationPage /></div>;
      case 'conclusion': return <div className="space-y-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">07 / Conclusion</p><PreservationSummary /><DocumentationStatus /></div>;
    }
  }

  if (!state.started) return <section aria-label="Competition mode home" className="mx-auto max-w-6xl px-5 py-12 md:py-20">
    <div className="border-y border-stone-400 py-10 md:py-16"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">WARLIVERSE</p><h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight text-stone-900 md:text-7xl">Visual Grammar &amp; Digital Preservation Studio</h1><p className="mt-6 max-w-2xl text-xl text-stone-700">From documented visual structure to computational exploration.</p></div>
    <p className="mt-8 max-w-2xl leading-relaxed text-stone-700">A guided 3–5 minute demonstration of source-aware documentation, structured visual grammar, procedural generation, interaction, and application.</p>
    <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => setState(startCompetition())} className="rounded bg-stone-900 px-5 py-3 text-[#fbf8ef] hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Start 3–5 Minute Demonstration</button><Link to="/" className="rounded border border-stone-600 px-5 py-3 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2">Explore Full Studio</Link></div>
    <div className="mt-12"><DocumentationStatus /></div>
  </section>;

  const currentIndex = stage ? state.stageIndex : 0;
  return <section ref={presentationRef} className="competition-presentation mx-auto min-h-[70vh] max-w-[1500px] px-4 py-5 text-stone-900 sm:px-7 md:px-10" aria-label="Competition presentation">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 pb-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em]">WARLIVERSE · Competition Mode</p><p className="mt-1 text-sm text-stone-600">Use ← → to navigate · Esc for home</p></div><button type="button" onClick={togglePresentation} className="rounded border border-stone-500 px-3 py-2 text-sm hover:bg-stone-100 focus-visible:outline focus-visible:outline-2">{fullscreen ? 'Exit Presentation Mode' : 'Enter Presentation Mode'}</button></header>
    {presentationMessage && <p role="status" className="mb-4 border-l-2 border-stone-700 pl-3 text-sm">{presentationMessage}</p>}
    <div className="mb-6 flex items-center gap-4"><div className="h-1.5 flex-1 overflow-hidden rounded bg-stone-200" role="progressbar" aria-label="Presentation progress" aria-valuemin={1} aria-valuemax={COMPETITION_STAGES.length} aria-valuenow={currentIndex + 1}><div className="h-full bg-stone-800" style={{ width: `${((currentIndex + 1) / COMPETITION_STAGES.length) * 100}%` }} /></div><span className="min-w-max text-sm tabular-nums">{String(currentIndex + 1).padStart(2, '0')} / {String(COMPETITION_STAGES.length).padStart(2, '0')} · {stage?.title ?? 'Unavailable'}</span></div>
    <nav aria-label="Presentation stages" className="mb-7 hidden grid-cols-7 gap-2 md:grid">{COMPETITION_STAGES.map((item, index) => <button key={item.id} type="button" onClick={() => setState({ started: true, stageIndex: index })} aria-current={index === currentIndex ? 'step' : undefined} className={`border px-2 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 ${index === currentIndex ? 'border-stone-900 bg-[#eee7d8]' : 'border-stone-300 hover:bg-stone-100'}`}><span className="block text-xs text-stone-500">{item.number}</span>{item.title}</button>)}</nav>
    <div className="min-h-[50vh]">{renderStage()}</div>
    <footer className="mt-8 flex justify-between border-t border-stone-300 pt-4"><button type="button" onClick={() => setState((current) => moveCompetitionStage(current, -1))} disabled={currentIndex === 0} className="rounded border border-stone-500 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2">Previous</button>{currentIndex === COMPETITION_STAGES.length - 1 ? <button type="button" onClick={() => setState(createInitialCompetitionState())} className="rounded bg-stone-900 px-4 py-2 text-[#fbf8ef] focus-visible:outline focus-visible:outline-2">Return to Competition Home</button> : <button type="button" onClick={() => setState((current) => moveCompetitionStage(current, 1))} className="rounded bg-stone-900 px-4 py-2 text-[#fbf8ef] focus-visible:outline focus-visible:outline-2">Next</button>}</footer>
  </section>;
}
