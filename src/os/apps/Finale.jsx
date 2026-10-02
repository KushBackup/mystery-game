import React from 'react';
import { Section, Hold, Btn } from '../ui';
import { Face } from '../art/Portrait';
import { narrate } from '../../data/packs/index.js';
import { ROLE_INFO } from '../../lib/engine/roles.js';
import { lookLine } from '../dossier';
import { sfxFanfare, sfxGlitch, sfxSting } from '../sfx';
import { useStage, useStageSounds } from './stage';

/**
 * The special edition: the whole evening, told back once it is over.
 *
 * Three beats on every phone at once. The headline (who won), then the
 * Killers' faces, then the rest: your own night, how each night really went
 * (who the Killers chose, who struck, how they rigged it, any frame, every
 * firewall), and every guest's secret role. The night-by-night account is
 * `game.finaleStory`, which the host only writes when there is a winner
 * (host.js `finaleOf`), so none of it can reach a phone mid-game.
 */

const BEATS = { show: 0, killers: 2.6, story: 5 };

/** Rank order for the cast list: Killers, then the special roles, then the Faithful. */
const ORDER = { killer: 0, doctor: 1, detective: 2, faithful: 3 };

export default function Finale({ ctx, onPaper }) {
  const { game, pack, players, nameOf, traits, me } = ctx;
  const beat = useStage(game.revealAt, BEATS);
  const stage = beat === 'full' ? 'story' : beat;
  useStageSounds(stage, { show: game.winner === 'faithful' ? sfxFanfare : sfxGlitch, killers: sfxSting });
  if (stage === 'hold') return <Hold label="STOP THE PRESSES…" />;

  const reached = (s) => Object.keys(BEATS).indexOf(stage) >= Object.keys(BEATS).indexOf(s);
  const faithfulWin = game.winner === 'faithful';
  const roles = game.finaleRoles ?? {};
  const story = game.finaleStory ?? {};
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const killers = Object.keys(roles).filter((p) => roles[p] === 'killer');
  const cast = Object.keys(roles)
    .filter((p) => byId[p])
    .sort((a, b) => (ORDER[roles[a]] - ORDER[roles[b]]) || nameOf(a).localeCompare(nameOf(b)));
  const myRole = roles[me.pid];
  const myTeamWon = myRole ? (ROLE_INFO[myRole]?.team === 'killers') !== faithfulWin : null;
  const face = (pid, size = 36, extra = {}) => <Face traits={traits} pid={pid} size={size} ghost={byId[pid]?.status !== 'alive'} {...extra} />;

  return (
    <div className="pb-10">
      <div className="os-paper mx-3 mt-4 p-4 text-center os-pop">
        <p className="os-label text-[12px] text-os-steel">THE GOA TIMES · SPECIAL EDITION</p>
        <p className="os-arcade text-[30px] leading-tight mt-3" style={{ color: faithfulWin ? '#186a26' : 'var(--color-os-red)' }}>{faithfulWin ? 'FAITHFUL WIN' : 'KILLERS WIN'}</p>
        {narrate(pack, faithfulWin ? 'finaleFaithful' : 'finaleKillers').map((l, i) => <p key={i} className="text-[17px] mt-2" style={{ fontFamily: 'Georgia, serif' }}>{l}</p>)}
      </div>

      {reached('killers') && (
        <Section head={`The Killers · ${killers.length}`} className="os-rise">
          <div className="os-group os-group--dark !p-3">
            <div className="flex flex-wrap justify-center gap-4">
              {killers.map((p, i) => (
                <div key={p} className="text-center w-[88px] os-pop" style={{ animationDelay: `${i * 300}ms` }}>
                  <div className="inline-block relative">
                    {face(p, 68, { round: true, className: 'os-face--killer' })}
                  </div>
                  <p className="text-[16px] font-bold mt-2 truncate">{nameOf(p)}</p>
                  <p className="text-[12px] text-os-chrome leading-tight mt-0.5">{killerFate(byId[p])}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {reached('story') && (
        <div className="os-rise">
          {myRole && (
            <div className={`mx-3 mt-5 rounded-xl p-4 ${myTeamWon ? 'os-finale-me--won' : 'os-finale-me--lost'}`}>
              <div className="flex items-center gap-3">
                {face(me.pid, 52, { round: true })}
                <div className="min-w-0">
                  <p className="os-label text-[11px] opacity-80">YOUR NIGHT</p>
                  <p className="text-[19px] font-bold leading-tight">You were {article(ROLE_INFO[myRole]?.label)} {ROLE_INFO[myRole]?.label}.</p>
                  <p className="text-[15px] mt-0.5 opacity-90">{myTeamWon ? 'Your team won.' : 'Your team lost.'} {selfFate(byId[me.pid])}</p>
                </div>
              </div>
            </div>
          )}

          <HowItHappened ctx={ctx} story={story} roles={roles} face={face} />

          <Section head="Everyone, unmasked" foot="Faces are drawn from what each guest answered at the door.">
            <div className="os-group os-group--dark !p-2">
              <div className="grid grid-cols-3 gap-y-3 gap-x-1">
                {cast.map((p) => (
                  <div key={p} className="text-center px-1">
                    <div className="inline-block">{face(p, 46, { round: true })}</div>
                    <p className="text-[14px] mt-1 truncate">{nameOf(p)}{p === me.pid ? ' (you)' : ''}</p>
                    <p className={`text-[11px] font-bold tracking-wide ${roles[p] === 'killer' ? 'text-os-red' : roles[p] === 'faithful' ? 'text-os-chrome' : 'text-os-sea'}`}>{(ROLE_INFO[roles[p]]?.label ?? '').toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {onPaper && (
            <div className="px-4 mt-6">
              <Btn tone="dark" onClick={onPaper}>Read the morning-after paper</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const article = (label = '') => (/^[AEIOU]/i.test(label) ? 'an' : 'a');

function killerFate(p) {
  if (!p) return '';
  if (p.status === 'alive') return 'Walked free';
  if (p.status === 'vanished') return 'Went home';
  if (p.cause === 'banished') return `Voted out, day ${p.diedCycle}`;
  if (p.cause === 'deep') return `Taken by the deep, day ${p.diedCycle}`;
  return 'Caught';
}

function selfFate(p) {
  if (!p || p.status === 'alive') return 'You made it to the end.';
  if (p.cause === 'banished') return `The group voted you out on day ${p.diedCycle}.`;
  if (p.cause === 'murdered') return `Your score was rigged on day ${p.diedCycle}.`;
  if (p.cause === 'deep') return `The deep took you on day ${p.diedCycle}.`;
  return '';
}

/**
 * Night by night: what the Killers did in the dark (finaleStory.nights), then
 * what the room saw (each morning's board and each vote, from game.news).
 */
function HowItHappened({ ctx, story, roles, face }) {
  const { game, nameOf, traits } = ctx;
  const nights = story.nights ?? {};
  const news = game.news ?? [];
  const days = [...new Set([...Object.keys(nights).map(Number), ...news.map((n) => n.cycle).filter(Boolean)])].sort((a, b) => a - b);
  if (!days.length) return null;
  const who = (pid) => <b className="text-white">{nameOf(pid)}</b>;

  const chapters = days.map((c) => {
    const n = nights[c];
    const dawn = news.find((e) => e.kind === 'dawn' && e.cycle === c);
    const votes = news.filter((e) => e.kind === 'banish' && e.cycle === c && !e.endgame);
    const items = [];
    if (n) {
      if (n.recruit) {
        items.push({ k: 'r', icon: n.recruit, tone: 'killer', text: <>A Killer had gone home. The Killers called {who(n.recruit)} with an offer. {dawn?.recruited ? 'They said yes.' : 'They said no.'}</> });
      } else if (n.victim) {
        items.push({ k: 'v', icon: n.victim, tone: 'killer', text: <>The Killers chose {who(n.victim)}.{n.rig === 'under' ? ' Rig: just below last place, to look like a bad run.' : ' Rig: straight to zero.'}</> });
      }
      if (n.hand) {
        const look = lookLine(traits?.[n.hand]);
        items.push({ k: 'h', icon: n.hand, tone: 'killer', text: <>{who(n.hand)} did the hacking. That night’s photos described them{look ? `: ${look}` : ''}.</> });
      }
      if (n.frame) items.push({ k: 'f', icon: n.frame, tone: 'killer', text: <>They framed {who(n.frame)}: one photo fit them instead.</> });
      const target = n.victim ?? n.recruit;
      if (target && (n.protectedList ?? []).includes(target)) {
        items.push({ k: 'p', icon: target, tone: 'good', text: <>A Doctor’s firewall was on {who(target)}.</> });
      }
    }
    if (dawn) {
      const taken = dawn.taken ?? dawn.victims?.[0];
      if (taken && dawn.cause === 'deep') items.push({ k: 'd', icon: taken, tone: 'dead', text: <>The rig bounced, so the deep took the lowest honest score: {who(taken)}{roles[taken] === 'killer' ? ', a Killer' : ''}.</> });
      else if (taken) items.push({ k: 'd', icon: taken, tone: 'dead', text: <>Morning: {who(taken)} was taken off the bottom of the board.</> });
      else items.push({ k: 'd', tone: 'quiet', text: <>Morning: nobody was taken.</> });
    }
    for (const v of votes) {
      items.push(v.pid
        ? { k: `b${v.ballot}`, icon: v.pid, tone: v.team === 'killers' ? 'good' : 'dead', text: <>The group logged out {who(v.pid)}. {v.team === 'killers' ? 'A Killer. Right call.' : 'Innocent.'}</> }
        : { k: `b${v.ballot}`, tone: 'quiet', text: <>The group couldn’t agree. Nobody was logged out.</> });
    }
    return { c, items };
  });

  const endgame = news.filter((e) => e.kind === 'banish' && e.endgame);
  if (endgame.length) {
    chapters.push({
      c: 'end',
      items: endgame.map((v, i) => (v.pid
        ? { k: `e${i}`, icon: v.pid, tone: v.team === 'killers' ? 'good' : 'dead', text: <>Final vote {i + 1}: {who(v.pid)}. {v.team === 'killers' ? 'A Killer.' : 'Innocent.'}</> }
        : { k: `e${i}`, tone: 'quiet', text: <>Final vote {i + 1}: nobody.</> })),
    });
  }

  return (
    <Section head="How it happened">
      <div className="os-group os-group--dark !p-0">
        {chapters.map(({ c, items }) => (
          <div key={c} className="os-tl">
            <p className="os-tl__day">{c === 'end' ? 'Endgame' : `Night ${c} · Day ${c}`}</p>
            {items.map((it) => (
              <div key={it.k} className={`os-tl__item os-tl__item--${it.tone}`}>
                <span className="os-tl__dot">{it.icon ? face(it.icon, 26, { round: true }) : null}</span>
                <p className="text-[15px] leading-snug text-os-foam">{it.text}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}
