import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CompetitionModePage } from '../../pages/CompetitionModePage';
import { getDemoPose, getDemoPoseState } from '../../pose/poseUtils';
import { DocumentationStatus } from './DocumentationStatus';
import { getDocumentationStatus } from './documentationCounts';
import { PreservationSummary } from './PreservationSummary';
import {
  COMPETITION_ROUTE, COMPETITION_STAGES, createInitialCompetitionState,
  getCompetitionStage, handleCompetitionKey, moveCompetitionStage, startCompetition,
} from './competitionState';
import { requestPresentationFullscreen } from './presentation';

describe('competition mode', () => {
  it('exposes the competition route', () => expect(COMPETITION_ROUTE).toBe('/competition'));

  it('starts at the competition home with no active stage', () => {
    expect(createInitialCompetitionState()).toEqual({ started: false, stageIndex: 0 });
    expect(renderToStaticMarkup(createElement(MemoryRouter, null, createElement(CompetitionModePage)))).toContain('Start 3–5 Minute Demonstration');
  });

  it('defines the requested seven-stage sequence', () => {
    expect(COMPETITION_STAGES.map(({ title }) => title)).toEqual(['Understand', 'Preserve', 'Create', 'Deconstruct', 'Experience', 'Apply', 'Conclusion']);
  });

  it('moves forward to the next stage', () => expect(moveCompetitionStage(startCompetition(), 1).stageIndex).toBe(1));

  it('moves backward to the previous stage', () => {
    expect(moveCompetitionStage({ started: true, stageIndex: 2 }, -1).stageIndex).toBe(1);
  });

  it('supports arrow-key navigation and Escape to home', () => {
    const state = { started: true, stageIndex: 2 };
    expect(handleCompetitionKey(state, 'ArrowRight').stageIndex).toBe(3);
    expect(handleCompetitionKey(state, 'ArrowLeft').stageIndex).toBe(1);
    expect(handleCompetitionKey(state, 'Escape')).toEqual(createInitialCompetitionState());
  });

  it('rejects invalid stage indices safely', () => {
    expect(getCompetitionStage(-1)).toBeNull();
    expect(getCompetitionStage(99)).toBeNull();
    expect(moveCompetitionStage({ started: true, stageIndex: 99 }, 1)).toEqual(createInitialCompetitionState());
  });

  it('calculates the current documentation status', () => {
    expect(getDocumentationStatus()).toEqual({ referenceRecords: 0, sourceBackedRules: 0, rulesPendingDocumentation: 4 });
    expect(renderToStaticMarkup(createElement(DocumentationStatus))).toContain('Rules pending documentation');
  });

  it('reports the intentional zero-reference archive state', () => {
    expect(getDocumentationStatus().referenceRecords).toBe(0);
    expect(renderToStaticMarkup(createElement(DocumentationStatus))).toContain('>0</dd>');
  });

  it('reports zero source-backed rules without adding evidence', () => {
    expect(getDocumentationStatus().sourceBackedRules).toBe(0);
  });

  it('keeps demo poses deterministic for the existing pose-to-figure fallback', () => {
    expect(getDemoPose(12)).toEqual(getDemoPose(12));
    expect(getDemoPoseState(0)).toBe('Idle');
    expect(getDemoPoseState(45)).toBe('Walking');
    expect(Object.keys(getDemoPose(0))).toContain('nose');
  });

  it('renders a source-aware conclusion without claiming completed validation', () => {
    const html = renderToStaticMarkup(createElement(PreservationSummary));
    expect(html).toContain('Source-aware');
    expect(html).toContain('Rule-based');
    expect(html).toContain('The current archive contains no source records yet.');
    expect(html).toContain('Cultural validation is not complete.');
  });

  it('handles unsupported fullscreen gracefully', async () => {
    await expect(requestPresentationFullscreen({})).resolves.toEqual({ ok: false, reason: 'unsupported' });
  });

  it('handles denied fullscreen gracefully', async () => {
    await expect(requestPresentationFullscreen({ requestFullscreen: async () => { throw new Error('denied'); } })).resolves.toEqual({ ok: false, reason: 'denied' });
  });
});
