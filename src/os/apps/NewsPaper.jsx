import React, { useState } from 'react';
import { AppFrame, Btn } from '../ui';
import Glyph from '../icons/Glyph';
import NewsArt from '../art/NewsArt';
import { useStack } from '../nav';
import { markSeen, useSeen } from '../seen';
import { editionLabel, tickerLines } from '../news';

/**
 * The paper: what News shows whenever there is no reveal to play.
 *
 *   Top      the masthead, a crawl of the day's headlines, the lead story, a
 *            "just in" from the room, and the next few stories.
 *   The Room the room's own events (each morning's board, each vote), printed
 *            as articles.
 *   Panjim   the authored world stories, grouped by day.
 *
 * Tap a headline for the article. What the paper holds, and when, is decided in
 * news.js; this file only lays it out. A blue dot is a story you have not
 * opened; the home-screen badge (PhoneOS) is a separate, coarser mark.
 */

const TABS = [['top', 'Top'], ['room', 'The Room'], ['world', 'Panjim']];
const asList = (v) => (Array.isArray(v) ? v : []);

export default function NewsPaper({ ctx, onBack, backLabel, onBoard }) {
  const { game, gid, pack, news } = ctx;
  const [tab, setTab] = useState('top');
  const { top: openId, dir, push, pop } = useStack();
  const read = asList(useSeen(`${gid}.newsread`, []));
  const story = openId ? news.all.find((s) => s.id === openId) : null;

  const open = (s) => {
    if (!read.includes(s.id)) markSeen(`${gid}.newsread`, [...read, s.id]);
    push(s.id);
  };
  const unread = (list) => list.some((s) => !read.includes(s.id));

  if (story) {
    const siblings = news.all.filter((s) => s.section === story.section && s.id !== story.id).slice(0, 3);
    return (
      <AppFrame title={story.outlet.name} onBack={pop} backLabel={TABS.find(([k]) => k === tab)?.[1] ?? 'Paper'} tone="dark" paper enter={dir === 'push' ? 'push' : undefined}>
        <Article s={story} />
        {siblings.length > 0 && (
          <div className="os-news pb-8">
            <p className="os-news__head">More {story.section === 'room' ? 'from the room' : 'in Panjim'}</p>
            <StoryList stories={siblings} read={read} onOpen={open} />
          </div>
        )}
      </AppFrame>
    );
  }

  const lead = news.world.find((s) => s.lead) ?? news.room[0] ?? null;
  const justIn = news.room[0] && news.room[0].id !== lead?.id && news.room[0].day === game.cycle ? news.room[0] : null;
  const rest = news.world.filter((s) => s.id !== lead?.id);
  const days = [...new Set(news.world.map((s) => s.day))];

  return (
    <AppFrame title="News" onBack={onBack} backLabel={backLabel} tone="dark" paper enter={dir === 'pop' ? 'pop' : undefined}>
      <div className="os-news">
        <Masthead game={game} />
        <div className="os-seg-wrap">
          <div className="os-seg" role="tablist" aria-label="Sections">
            {TABS.map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
                {label}
                {key !== 'top' && unread(key === 'room' ? news.room : news.world) && <i className="os-seg__dot" aria-label="Unread stories" />}
              </button>
            ))}
          </div>
        </div>

        {tab === 'top' && (
          <>
            <Ticker lines={tickerLines(game, pack)} />
            {justIn && (
              <button type="button" className="os-justin" onClick={() => open(justIn)}>
                <span className="os-justin__tag">FROM THE ROOM</span>
                <span className="os-justin__head">{justIn.head}</span>
                <Glyph name="forward" size={11} />
              </button>
            )}
            {lead && <Lead s={lead} read={read.includes(lead.id)} onOpen={() => open(lead)} />}
            {rest.length > 0 && (
              <>
                <p className="os-news__head">Also in the paper</p>
                <StoryList stories={rest.slice(0, 4)} read={read} onOpen={open} />
                {rest.length > 4 && <div className="px-3 pt-3"><Btn tone="grey" small onClick={() => setTab('world')}>All {news.world.length} stories from Panjim</Btn></div>}
              </>
            )}
            {onBoard && <div className="px-3 pt-4"><Btn tone="dark" onClick={onBoard}><Glyph name="trophy" size={14} /> Latest board · day {game.board.cycle}</Btn></div>}
          </>
        )}

        {tab === 'room' && (
          news.room.length === 0 ? (
            <Quiet title="Nothing from the room yet" line="Each morning’s board and each vote are printed here. The first posts the morning after the first night." />
          ) : (
            <>
              <p className="os-news__head">Every morning, every vote</p>
              <StoryList stories={news.room} read={read} onOpen={open} />
              {onBoard && <div className="px-3 pt-4"><Btn tone="dark" onClick={onBoard}><Glyph name="trophy" size={14} /> Latest board · day {game.board.cycle}</Btn></div>}
            </>
          )
        )}

        {tab === 'world' && (
          news.world.length === 0 ? (
            <Quiet title="No stories" line="This story pack has no world news." />
          ) : (
            days.map((d) => (
              <div key={d}>
                <p className="os-news__head">{d === 99 ? 'The morning after' : d === 0 ? 'Before the first morning' : `Day ${d}`}</p>
                <StoryList stories={news.world.filter((s) => s.day === d)} read={read} onOpen={open} />
              </div>
            ))
          )
        )}
        <div className="h-8" />
      </div>
    </AppFrame>
  );
}

function Masthead({ game }) {
  return (
    <header className="os-news__mast">
      <p className="os-news__kick">PANJIM EDITION · {editionLabel(game)}</p>
      <h2 className="os-news__title">The Deep Times</h2>
      <p className="os-news__tag">All the news that sinks</p>
    </header>
  );
}

/** The crawl. It only moves for people who have not asked for less motion (os.css). */
function Ticker({ lines }) {
  if (!lines.length) return null;
  return (
    <div className="os-ticker" role="marquee" aria-label="Headlines">
      <span className="os-ticker__chip">WIRE</span>
      <div className="os-ticker__view">
        <div className="os-ticker__track" style={{ '--os-ticker-s': `${Math.max(24, lines.length * 6)}s` }}>
          {[...lines, ...lines].map((t, i) => <span key={i} className="os-ticker__item" aria-hidden={i >= lines.length}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function Lead({ s, read, onOpen }) {
  return (
    <button type="button" className="os-lead" onClick={onOpen}>
      <span className="os-lead__art"><NewsArt scene={s.art} /></span>
      <span className="os-lead__text">
        <Kicker s={s} read={read} />
        <span className="os-lead__head">{s.head}</span>
        <span className="os-lead__dek">{s.dek}</span>
        <span className="os-story__meta">{s.outlet.name} · {s.time}</span>
      </span>
    </button>
  );
}

function Kicker({ s, read }) {
  return (
    <span className={`os-story__kicker ${s.live ? 'os-story__kicker--live' : ''}`}>
      {!read && <i className="os-story__dot" aria-label="Unread" />}
      {s.kicker}
    </span>
  );
}

function StoryList({ stories, read, onOpen }) {
  return (
    <div className="os-storylist">
      {stories.map((s) => (
        <button key={s.id} type="button" className="os-story" onClick={() => onOpen(s)}>
          <span className="os-story__text">
            <Kicker s={s} read={read.includes(s.id)} />
            <span className="os-story__headline">{s.head}</span>
            <span className="os-story__meta">{s.outlet.name} · {s.time}</span>
          </span>
          <span className="os-story__thumb"><NewsArt scene={s.art} /></span>
        </button>
      ))}
    </div>
  );
}

function Quiet({ title, line }) {
  return (
    <div className="px-8 pt-12 text-center os-news__quiet">
      <div className="inline-grid place-items-center w-14 h-14 rounded-full border-2 border-os-steel/40 text-os-steel"><Glyph name="whale" size={30} /></div>
      <p className="os-news__kick mt-4">{title.toUpperCase()}</p>
      <p className="os-news__dek mt-2">{line}</p>
    </div>
  );
}

function Article({ s }) {
  return (
    <article className={`os-news os-article ${s.live ? '' : 'os-article--cap'}`}>
      <div className="os-article__top">
        <p className={`os-story__kicker ${s.live ? 'os-story__kicker--live' : ''}`}>{s.kicker} · {s.outlet.tag}</p>
        <h2 className="os-article__head">{s.head}</h2>
        <p className="os-article__dek">{s.dek}</p>
        <p className="os-article__by">
          <b>{s.by}</b>
          <span>{s.live ? `Day ${s.day}` : s.day === 0 ? 'Before the first morning' : s.day === 99 ? 'The morning after' : `Day ${s.day}`} · {s.time}</span>
        </p>
      </div>
      <figure className="os-article__fig">
        <div className="os-article__art"><NewsArt scene={s.art} label={s.cap} /></div>
        {s.cap && <figcaption>{s.cap}</figcaption>}
      </figure>
      <div className="os-article__body os-selectable">
        {s.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  );
}
