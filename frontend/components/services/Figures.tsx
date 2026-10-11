'use client';

import { useState } from 'react';
import type { MatrixItem, OpsNode, ProcessAfter, ProcessBefore } from '@/lib/types';

export function PriorityMatrix({ items }: { items: MatrixItem[] }) {
  const [sel, setSel] = useState(items[0]?.code ?? '');
  if (!items.length) return null;
  const current = items.find((m) => m.code === sel) || items[0];
  return (
    <figure className="col min0" style={{ flex: '1 1 420px', margin: 0, gap: 14 }}>
      <div className="mono-xs flex-wrap" style={{ justifyContent: 'space-between', gap: 12 }}>
        <span>PRIORITY MATRIX — SELECT AN ITEM</span>
        <span>FIG. 01</span>
      </div>
      <div className="matrix">
        <div aria-hidden="true" className="matrix__ax-v" />
        <div aria-hidden="true" className="matrix__ax-h" />
        <span aria-hidden="true" className="matrix__q" style={{ left: 14, top: 12 }}>PRIORITIZE</span>
        <span aria-hidden="true" className="matrix__q" style={{ right: 14, top: 12 }}>PLAN</span>
        <span aria-hidden="true" className="matrix__q" style={{ left: 14, bottom: 12 }}>IF CAPACITY</span>
        <span aria-hidden="true" className="matrix__q" style={{ right: 14, bottom: 12 }}>QUESTION</span>
        <div role="group" aria-label="Illustrative initiatives">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              className="matrix__pt"
              onClick={() => setSel(m.code)}
              aria-pressed={m.code === current.code}
              aria-label={`Initiative ${m.code}`}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              {m.code}
            </button>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="mono-xs" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>↑ IMPACT</span>
        <span>EFFORT →</span>
      </div>
      <div aria-live="polite" className="note-dark">
        <span className="mono-xs" style={{ color: 'var(--gold)' }}>
          INITIATIVE {current.code}
        </span>
        <span style={{ fontSize: 16, lineHeight: 1.5 }}>{current.note}</span>
      </div>
      <figcaption className="mono-xs">ILLUSTRATIVE — ABSTRACT ITEMS, NOT CLIENT DATA</figcaption>
    </figure>
  );
}

export function WorkflowFigure({ nodes }: { nodes: OpsNode[] }) {
  const [sel, setSel] = useState(Math.min(1, Math.max(0, nodes.length - 1)));
  if (!nodes.length) return null;
  const cur = nodes[Math.min(sel, nodes.length - 1)];
  return (
    <figure className="col min0" style={{ flex: '1.2 1 460px', margin: 0, border: '1px solid var(--line-2)', padding: 'clamp(24px,3vw,40px)', background: 'var(--paper)', gap: 28 }}>
      <div className="mono-xs" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>WORKFLOW — CURRENT STATE</span>
        <span>FIG. 02</span>
      </div>
      <div className="flex-wrap" style={{ alignItems: 'stretch', gap: '12px 0' }}>
        {nodes.map((n, i) => (
          <div key={n.id} style={{ flex: '1 1 110px', display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <button type="button" className="ops-node" onClick={() => setSel(i)} aria-pressed={i === sel}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--bronze)' }}>{n.code}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{n.label}</span>
            </button>
            <span aria-hidden="true" style={{ width: 14, height: 1, background: 'var(--ink)', flex: 'none', opacity: i === nodes.length - 1 ? 0 : 1 }} />
          </div>
        ))}
      </div>
      <div aria-live="polite" className="col" style={{ gap: 6, padding: 16, border: '1px dashed var(--gold-deep)', background: '#fff' }}>
        <span className="mono-xs" style={{ color: 'var(--bronze)' }}>
          EXAMINING — {cur.code} · {cur.label.toUpperCase()}
        </span>
        <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text)' }}>{cur.note}</span>
      </div>
      <p className="small">Select a stage to examine where work may be constrained.</p>
      <figcaption className="mono-xs" style={{ letterSpacing: '0.08em', borderTop: '1px solid rgba(23,36,43,.12)', paddingTop: 14 }}>
        ILLUSTRATIVE SCHEMATIC — NOT CLIENT DATA
      </figcaption>
    </figure>
  );
}

export function BeforeAfter({ before, after }: { before: ProcessBefore[]; after: ProcessAfter[] }) {
  if (!before.length && !after.length) return null;
  return (
    <figure className="flex-wrap" style={{ margin: 0, border: '1px solid var(--line-2)', background: '#fff' }}>
      <div className="col min0" style={{ flex: '1 1 380px', padding: 'clamp(24px,3vw,40px)', borderRight: '1px solid rgba(23,36,43,.12)', gap: 22 }}>
        <span className="mono-xs">BEFORE — ACCUMULATED</span>
        <div className="col" style={{ gap: 10 }}>
          {before.map((b) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: `min(${b.indent || 0}px, 12vw)` }}>
              <span style={{ padding: '10px 14px', border: '1px solid var(--line-strong)', fontSize: 14, color: 'var(--text)', background: 'var(--paper)' }}>{b.label}</span>
              {b.note && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--bronze)' }}>{b.note}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="col min0" style={{ flex: '1 1 380px', padding: 'clamp(24px,3vw,40px)', gap: 22, background: 'var(--paper)' }}>
        <span className="mono-xs">AFTER — DESIGNED</span>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {after.map((a, i) => (
            <li key={a.id} className="pa-step">
              <span className="pa-dot">{i + 1}</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{a.label}</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>{a.owner}</span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mono-xs" style={{ flex: '1 1 100%', padding: '14px clamp(24px,3vw,40px)', borderTop: '1px solid rgba(23,36,43,.12)', letterSpacing: '0.08em' }}>
        ABSTRACT BEFORE-AND-AFTER SCHEMATIC — LABELS ARE ILLUSTRATIVE
      </figcaption>
    </figure>
  );
}
