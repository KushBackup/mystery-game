import React, { useState } from 'react';
import { AppFrame, Section, Group, Cell, Btn } from '../ui';
import Glyph from '../icons/Glyph';
import AppIcon from '../icons/AppIcon';
import HelpSketch from '../art/HelpSketch';
import { sfxTap } from '../sfx';
import { HELP_HERO, HELP_SECTIONS, HELP_TOPICS, HELP_NOW } from '../../data/helpCopy';

/**
 * Help: every rule of the game in short sentences, with a doodle for each.
 *
 * The one app a guest opens to be *told* how the game works (the Night app
 * explains only the night). It reads the same on every phone: nothing in it
 * depends on the guest's role or status, only on the public phase, which
 * tags the step of the day the room is in ("Now"). Words live in
 * data/helpCopy.js; the drawings in art/HelpSketch.jsx.
 *
 * Navigation is a small stack. A row or a "Read next" link pushes a page;
 * Next swaps the page for the following one (reading on, like a booklet), so
 * Back always returns to where the guest came from, never through every page.
 */

const BY_ID = Object.fromEntries(HELP_TOPICS.map((t) => [t.id, t]));

/** `**word**` → bold. Nothing else is parsed. */
function rich(text) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

/** The small rounded colour tile in front of each row, as in iOS 6 Settings. */
const Tile = ({ glyph, tone }) => (
  <span className={`os-helptile os-helptile--${tone}`}><Glyph name={glyph} size={17} /></span>
);

const NowTag = () => <span className="os-helpnow">Now</span>;

export default function HelpApp({ ctx, onClose }) {
  const nowId = HELP_NOW[ctx.game?.phase] ?? null;
  const [nav, setNav] = useState({ stack: [], dir: null });
  const push = (id) => setNav((s) => ({ stack: [...s.stack, id], dir: 'push' }));
  const swap = (id) => setNav((s) => ({ stack: [...s.stack.slice(0, -1), id], dir: 'push' }));
  const pop = () => setNav((s) => ({ stack: s.stack.slice(0, -1), dir: 'pop' }));

  const id = nav.stack[nav.stack.length - 1];
  const topic = id ? BY_ID[id] : null;
  if (topic) {
    const prev = nav.stack.length > 1 ? BY_ID[nav.stack[nav.stack.length - 2]] : null;
    return <TopicPage key={`${id}:${nav.stack.length}`} topic={topic} backLabel={prev?.title ?? 'Help'} onBack={pop} onLink={push} onNext={swap} enter={nav.dir} isNow={nowId === id} />;
  }

  return (
    <AppFrame title="Help" onBack={onClose} light enter={nav.dir === 'pop' ? 'pop' : undefined}>
      <div className="os-helppaper os-helphero">
        <HelpSketch id="hero" label="Night, then day: guests in a room, one of them secretly a Killer." />
        <h2 className="os-helphero__title">{HELP_HERO.title}</h2>
        <ol className="os-helphero__steps">
          {HELP_HERO.lines.map((l, i) => (
            <li key={l}><span className="os-helphero__n">{i + 1}</span><span>{rich(l)}</span></li>
          ))}
        </ol>
        <Btn className="mt-4" onClick={() => push(HELP_TOPICS[0].id)}>{HELP_HERO.cta}</Btn>
      </div>

      {HELP_SECTIONS.map((s) => (
        <Section key={s.head} head={s.head} foot={s.foot}>
          <Group>
            {s.topics.map((t) => (
              <Cell
                key={t.id}
                icon={<Tile glyph={t.glyph} tone={t.tone} />}
                title={t.title}
                sub={t.sub}
                value={nowId === t.id ? <NowTag /> : null}
                chevron
                onClick={() => push(t.id)}
              />
            ))}
          </Group>
        </Section>
      ))}
      <div className="h-8" />
    </AppFrame>
  );
}

function TopicPage({ topic: t, backLabel, onBack, onLink, onNext, enter, isNow }) {
  const at = HELP_TOPICS.indexOf(t);
  const next = HELP_TOPICS[at + 1] ?? null;
  return (
    <AppFrame title={t.title} onBack={onBack} backLabel={backLabel} light enter={enter}>
      {t.sketch && (
        <div className="os-helppaper os-helppaper--sketch">
          <HelpSketch id={t.sketch} />
        </div>
      )}

      <div className="os-helphead">
        <span className={`os-helptile os-helptile--lg os-helptile--${t.tone}`}><Glyph name={t.glyph} size={24} /></span>
        <div className="min-w-0">
          {(t.kicker || isNow) && (
            <p className="os-helphead__kicker">
              {t.kicker}
              {isNow && <NowTag />}
            </p>
          )}
          <h2 className="os-helphead__title">{t.title}</h2>
        </div>
      </div>

      {t.apps && (
        <Section>
          <Group>
            {t.apps.map(([icon, name, line]) => (
              <Cell key={icon} icon={<AppIcon name={icon} size={32} />} title={name} sub={line} />
            ))}
          </Group>
        </Section>
      )}

      {t.terms && (
        <dl className="os-helpterms">
          {t.terms.map(([term, def]) => (
            <div key={term} className="os-helpterms__row">
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      )}

      {t.qa && (
        <dl className="os-helpterms os-helpterms--qa">
          {t.qa.map(([q, a]) => (
            <div key={q} className="os-helpterms__row">
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      )}

      {t.lines && (
        <ul className="os-helplines">
          {t.lines.map((l) => <li key={l}>{rich(l)}</li>)}
        </ul>
      )}

      {t.tip && (
        <p className="os-helptip">
          <span className="os-helptip__tag">Tip</span>
          {t.tip}
        </p>
      )}

      {t.links && (
        <Section head="Read more">
          <Group>
            {t.links.map((lid) => {
              const l = BY_ID[lid];
              return <Cell key={lid} icon={<Tile glyph={l.glyph} tone={l.tone} />} title={l.title} sub={l.sub} chevron onClick={() => onLink(lid)} />;
            })}
          </Group>
        </Section>
      )}

      <div className="px-[10px] pt-6 pb-8">
        {next ? (
          <button type="button" className="os-helpnext" onClick={() => { sfxTap(); onNext(next.id); }}>
            <span className="os-helpnext__label">Next</span>
            <span className="os-helpnext__title">{next.title}</span>
            <Glyph name="forward" size={14} />
          </button>
        ) : (
          <Btn tone="grey" onClick={onBack}>Back to Help</Btn>
        )}
      </div>
    </AppFrame>
  );
}
