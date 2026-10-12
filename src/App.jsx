import React, { useEffect, useMemo, useRef, useState } from 'react';

const picks = [
  {
    id: 'radio-garden',
    title: 'A tiny window into every corner of the world',
    site: 'Radio Garden',
    url: 'https://radio.garden/',
    category: 'Culture',
    tag: 'LISTEN · 5 MIN',
    description:
      'Spin the globe and tune in to thousands of live radio stations broadcasting right now.',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'A glowing night sky above a mountain range',
    color: 'violet',
    featured: true,
  },
  {
    id: 'atlas-obscura',
    title: 'The world’s most curious places',
    site: 'Atlas Obscura',
    url: 'https://www.atlasobscura.com/',
    category: 'Places',
    tag: 'WANDER · 8 MIN',
    description:
      'A guide to the world’s hidden wonders, from a sunken forest to a library in a phone booth.',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'Turquoise waves rolling onto a quiet shore',
    color: 'blue',
  },
  {
    id: 'nasa-apod',
    title: 'The universe, one day at a time',
    site: 'NASA Astronomy Picture of the Day',
    url: 'https://apod.nasa.gov/apod/astropix.html',
    category: 'Science',
    tag: 'LOOK UP · 3 MIN',
    description:
      'One extraordinary image from space, with a little context from the astronomers who love it.',
    image:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'A bright nebula glowing in deep space',
    color: 'space',
  },
  {
    id: 'the-pudding',
    title: 'An explorable guide to the songs of your life',
    site: 'The Pudding',
    url: 'https://pudding.cool/',
    category: 'Culture',
    tag: 'EXPLORE · 12 MIN',
    description:
      'Visual essays that make you see culture, data, and everyday life in a whole new way.',
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'A musician singing into a microphone under stage lights',
    color: 'pink',
  },
  {
    id: 'are-na',
    title: 'A quieter kind of inspiration',
    site: 'Are.na',
    url: 'https://www.are.na/',
    category: 'Design',
    tag: 'COLLECT · 6 MIN',
    description:
      'A thoughtful place to save and connect the images, ideas, and links that stay with you.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'A sunlit creative studio with plants and a desk',
    color: 'green',
  },
  {
    id: 'longreads',
    title: 'Stories worth getting comfortable for',
    site: 'Longreads',
    url: 'https://longreads.com/',
    category: 'Reading',
    tag: 'READ · 15 MIN',
    description:
      'Beautifully told true stories and reported essays, handpicked by people who love to read.',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'A warmly lit library lined with books',
    color: 'orange',
  },
  {
    id: 'radiooooo',
    title: 'Travel through time with one song',
    site: 'Radiooooo',
    url: 'https://radiooooo.com/',
    category: 'Music',
    tag: 'LISTEN · 4 MIN',
    description:
      'Pick a country and a decade. The musical time machine takes care of the rest.',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'A collection of records and music equipment',
    color: 'yellow',
  },
  {
    id: 'open-culture',
    title: 'A free front-row seat to the arts',
    site: 'Open Culture',
    url: 'https://www.openculture.com/',
    category: 'Learning',
    tag: 'DISCOVER · 7 MIN',
    description:
      'Find free courses, audiobooks, films, and ideas from some of the world’s best institutions.',
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'A concert crowd beneath a wash of colorful lights',
    color: 'purple',
  },
];

const categories = ['For you', 'Design', 'Science', 'Places', 'Culture', 'Reading', 'Music'];
const categorySearchTerms = {
  Design: 'graphic design',
  Science: 'science',
  Places: 'landmarks and notable places',
  Culture: 'culture',
  Reading: 'literature',
  Music: 'music',
};

function normalizeAttribute(value) {
  return value.trim().toLocaleLowerCase();
}

const ignoredWikipediaAttributePrefixes = [
  'all articles',
  'all wikipedia',
  'articles with',
  'articles containing',
  'articles using',
  'articles that',
  'articles needing',
  'articles lacking',
  'pages with',
  'cs1 ',
  'short description',
  'coordinates on wikidata',
  'use dmy dates',
  'use mdy dates',
  'webarchive template',
  'commons category',
  'pages using gadget',
  'wikipedia neutral point of view disputes',
];
const ignoredWikipediaAttributePhrases = ['needing translation', 'neutral point of view disputes'];

function isUsableAttribute(value) {
  const normalized = value.toLocaleLowerCase();
  return !ignoredWikipediaAttributePrefixes.some((prefix) => normalized.startsWith(prefix)) &&
    !ignoredWikipediaAttributePhrases.some((phrase) => normalized.includes(phrase));
}

function getWikipediaAttributes(page, category) {
  const categories = (page.categories || [])
    .map(({ title }) => title.replace(/^Category:/i, '').trim())
    .filter((label) => label && isUsableAttribute(label));
  const values = [...(category ? [category] : []), ...categories];
  return values.filter((label, index) =>
    values.findIndex((value) => normalizeAttribute(value) === normalizeAttribute(label)) === index,
  );
}

function getAttributes(item) {
  const values = item.attributes?.length
    ? item.attributes
    : item.api && item.category === 'Discovery'
      ? []
      : [item.category];
  return values
    .filter(isUsableAttribute)
    .map((label) => ({ label, key: normalizeAttribute(label) }));
}

async function fetchDiscovery(category, search, previousImage, bannedAttributes) {
  const searchTerm = search.trim() || categorySearchTerms[category] || '';
  const params = new URLSearchParams({
    action: 'query',
    generator: searchTerm ? 'search' : 'random',
    prop: 'pageimages|extracts|info|categories',
    inprop: 'url',
    pithumbsize: '1200',
    exintro: '1',
    explaintext: '1',
    exchars: '500',
    format: 'json',
    origin: '*',
  });
  params.set('cllimit', '20');

  if (searchTerm) {
    params.set('gsrnamespace', '0');
    params.set('gsrlimit', '10');
    params.set('gsrsearch', searchTerm);
  } else {
    params.set('grnnamespace', '0');
    params.set('grnlimit', '10');
  }

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!response.ok) {
    throw new Error(`Wikipedia returned an error (${response.status}).`);
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.info || 'Wikipedia could not find a discovery.');
  }

  const pages = Object.values(result.query?.pages || {});
  const pageCategory = category === 'For you' ? null : category;
  const allowedPages = pages.filter((page) => {
    const attributes = getWikipediaAttributes(page, pageCategory);
    return attributes.length > 0 && !attributes.some((attribute) =>
      bannedAttributes.some((blocked) => blocked.key === normalizeAttribute(attribute)),
    );
  });
  if (!allowedPages.length) {
    throw new Error('No matching articles with unblocked topics were found. Remove a blocked topic or try another category.');
  }

  const pagesWithNewImages = allowedPages.filter(
    (candidate) => candidate.thumbnail?.source && candidate.thumbnail.source !== previousImage,
  );
  const pagePool = pagesWithNewImages.length ? pagesWithNewImages : allowedPages;
  const page = pagePool[Math.floor(Math.random() * pagePool.length)];
  const fallbackImages = picks
    .map((pick) => pick.image)
    .filter((image) => image !== previousImage);
  const fallbackImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  const image = page.thumbnail?.source !== previousImage
    ? page.thumbnail?.source || fallbackImage
    : fallbackImage;
  const attributes = getWikipediaAttributes(page, pageCategory);

  return {
    id: `wikipedia-${page.pageid}`,
    title: page.title,
    site: 'Wikipedia',
    url: page.fullurl,
    category: pageCategory || attributes[0],
    attributes,
    tag: 'WIKIPEDIA · FRESH FIND',
    description: page.extract || `Follow the trail and learn more about ${page.title}.`,
    image,
    imageAlt: image === page.thumbnail?.source
      ? `Image for ${page.title}`
      : `A visual for ${page.title}`,
    color: picks.find((pick) => pick.category === category)?.color || 'violet',
    api: true,
  };
}

function Icon({ name, size = 20, fill = 'none' }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill,
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></>,
    bookmark: <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    arrow: <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    right: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem('elsewhere-saved') || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readDiscoveries() {
  try {
    const value = JSON.parse(localStorage.getItem('elsewhere-discoveries') || '[]');
    return Array.isArray(value)
      ? value.filter((item) =>
        item &&
        Array.isArray(item.attributes) &&
        item.attributes.some((attribute) => typeof attribute === 'string' && isUsableAttribute(attribute)),
      )
      : [];
  } catch {
    return [];
  }
}

function readBannedAttributes() {
  try {
    const value = JSON.parse(localStorage.getItem('elsewhere-banned-attributes') || '[]');
    return Array.isArray(value)
      ? value.filter((item) => item && typeof item.label === 'string' && typeof item.key === 'string')
      : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [category, setCategory] = useState('For you');
  const [currentId, setCurrentId] = useState(picks[0].id);
  const [saved, setSaved] = useState(readSaved);
  const [discoveries, setDiscoveries] = useState(readDiscoveries);
  const [bannedAttributes, setBannedAttributes] = useState(readBannedAttributes);
  const [search, setSearch] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [stumbleCount, setStumbleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const searchInput = useRef(null);

  useEffect(() => {
    localStorage.setItem('elsewhere-saved', JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem('elsewhere-discoveries', JSON.stringify(discoveries));
  }, [discoveries]);

  useEffect(() => {
    localStorage.setItem('elsewhere-banned-attributes', JSON.stringify(bannedAttributes));
  }, [bannedAttributes]);

  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const filteredPicks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...discoveries, ...picks].filter((pick) => {
      const matchesCategory = showSaved || category === 'For you' || pick.category === category;
      const matchesSaved = !showSaved || saved.includes(pick.id);
      const matchesBanned = !getAttributes(pick).some((attribute) =>
        bannedAttributes.some((blocked) => blocked.key === attribute.key),
      );
      const matchesSearch =
        !query ||
        `${pick.title} ${pick.site} ${pick.category} ${pick.description}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSaved && matchesBanned && matchesSearch;
    });
  }, [bannedAttributes, category, discoveries, saved, search, showSaved]);

  const current = filteredPicks.find((pick) => pick.id === currentId) || filteredPicks[0];
  const supportingPicks = filteredPicks.filter((pick) => pick.id !== current?.id).slice(0, 3);

  async function stumble() {
    setIsLoading(true);
    setApiError('');
    setShowSaved(false);
    try {
      const discovery = await fetchDiscovery(category, search, current?.image, bannedAttributes);
      setSearch('');
      setDiscoveries((items) => [
        discovery,
        ...items.filter((item) => item.id !== discovery.id),
      ]);
      setCurrentId(discovery.id);
      setStumbleCount((count) => count + 1);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while finding a discovery.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSaved(id) {
    setSaved((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  }

  function blockAttribute(attribute) {
    setBannedAttributes((items) =>
      items.some((item) => item.key === attribute.key) ? items : [...items, attribute],
    );
    if (normalizeAttribute(category) === attribute.key) {
      setCategory('For you');
    }
    setShowSaved(false);
  }

  function unblockAttribute(key) {
    setBannedAttributes((items) => items.filter((item) => item.key !== key));
  }

  function selectCategory(nextCategory) {
    setCategory(nextCategory);
    setShowSaved(false);
    setSearch('');
  }

  function openSaved() {
    setShowSaved((isShowing) => !isShowing);
    setSearch('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => selectCategory('For you')} aria-label="Elsewhere home">
          <span className="brand-mark"><Icon name="spark" size={22} /></span>
          <span>elsewhere<span className="brand-period">.</span></span>
        </a>

        <div className="side-section">
          <p className="side-label">YOUR LITTLE CORNER</p>
          <button
            className={`nav-link ${!showSaved ? 'active' : ''}`}
            onClick={() => { setShowSaved(false); setCategory('For you'); }}
          >
            <Icon name="spark" size={19} /> <span>For you</span>
          </button>
          <button className={`nav-link ${showSaved ? 'active' : ''}`} onClick={openSaved}>
            <Icon name="bookmark" size={19} fill={showSaved ? 'currentColor' : 'none'} />
            <span>Saved for later</span>
            {saved.length > 0 && <span className="saved-count">{saved.length}</span>}
          </button>
        </div>

        <div className="side-section explore-section">
          <p className="side-label">FOLLOW A FEELING</p>
          {categories.slice(1).map((item, index) => (
            <button
              key={item}
              className={`nav-link category-link ${category === item && !showSaved ? 'active' : ''}`}
              onClick={() => selectCategory(item)}
              disabled={bannedAttributes.some((attribute) => attribute.key === normalizeAttribute(item))}
              title={bannedAttributes.some((attribute) => attribute.key === normalizeAttribute(item)) ? `${item} is blocked. Remove it from Blocked Topics to browse.` : undefined}
            >
              <span className={`category-dot dot-${index}`} />
              <span>{item}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-spark">✳</span>
            <p>The internet is still a wonderful place.</p>
            <span className="note-caption">Go find your corner of it.</span>
          </div>
          <span className="sidebar-footer">MADE FOR THE CURIOUS <span>✳</span></span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>DISCOVER</span><span className="breadcrumb-slash">/</span><span>{showSaved ? 'SAVED' : category.toUpperCase()}</span></div>
          <label className="search-box">
            <Icon name="search" size={18} />
            <input
              ref={searchInput}
              type="search"
              placeholder="Search the rabbit hole..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search websites"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <Icon name="close" size={15} />
              </button>
            )}
            {!search && <kbd>⌘ K</kbd>}
          </label>
          <button
            className={`top-saved ${showSaved ? 'selected' : ''}`}
            onClick={openSaved}
            aria-label="Toggle saved links"
          >
            <Icon name="bookmark" size={19} fill={showSaved ? 'currentColor' : 'none'} />
            <span>{saved.length}</span>
          </button>
          <div className="avatar" aria-label="Your profile">J</div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow"><span className="eyebrow-star">✳</span> A GOOD DAY TO GET LOST</p>
              <h1>{showSaved ? <>Your little <span>collection.</span></> : <>Find your next <span>rabbit hole.</span></>}</h1>
              <p className="welcome-subtitle">
                {showSaved
                  ? 'All the good things you tucked away for another day.'
                  : 'Less scrolling, more stumbling. There’s something out there with your name on it.'}
              </p>
            </div>
            <div className="stumble-note"><span>✳</span> YOUR DAILY DETOUR</div>
          </section>

          <section className="filter-row" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                className={`filter-chip ${category === item && !showSaved ? 'chosen' : ''}`}
                key={item}
                onClick={() => selectCategory(item)}
                disabled={item !== 'For you' && bannedAttributes.some((attribute) => attribute.key === normalizeAttribute(item))}
                title={item !== 'For you' && bannedAttributes.some((attribute) => attribute.key === normalizeAttribute(item)) ? `${item} is blocked. Remove it from Blocked Topics to browse.` : undefined}
              >
                {item === 'For you' && <Icon name="spark" size={15} />}
                {item}
              </button>
            ))}
          </section>

          <section className="blocked-topics" aria-label="Blocked topics">
            <span className="blocked-label">BLOCKED TOPICS</span>
            {bannedAttributes.length ? bannedAttributes.map((attribute) => (
              <span className="blocked-chip" key={attribute.key}>
                {attribute.label}
                <button
                  onClick={() => unblockAttribute(attribute.key)}
                  aria-label={`Unblock ${attribute.label}`}
                  title={`Unblock ${attribute.label}`}
                >
                  <Icon name="close" size={12} />
                </button>
              </span>
            )) : <span className="blocked-empty">Click a topic on a discovery to hide it from your feed.</span>}
          </section>

          {apiError && (
            <div className="api-error" role="alert">
              <span>{apiError}</span>
              <button onClick={stumble} disabled={isLoading}>Try again</button>
            </div>
          )}

          {!current ? (
            <section className="empty-state">
              <span className="empty-icon"><Icon name={showSaved ? 'bookmark' : 'search'} size={24} /></span>
              <h2>{showSaved ? 'Nothing tucked away just yet.' : 'No rabbit holes found.'}</h2>
              <p>{showSaved ? 'When a discovery catches your eye, save it for another day.' : 'Try another search or choose a different feeling.'}</p>
              {showSaved && <button className="text-action" onClick={openSaved}>Back to discovering <Icon name="right" size={16} /></button>}
            </section>
          ) : (
            <>
              <section className="feature-card" aria-label="Featured discovery">
                <div className={`feature-art art-${current.color}`}>
                  <img src={current.image} alt={current.imageAlt} />
                  <div className="art-overlay" />
                  <div className="feature-topline">
                    <span className="pick-badge"><span /> {current.api ? 'FRESH FROM WIKIPEDIA' : 'A LITTLE GEM'}</span>
                    <button
                      className={`save-button ${saved.includes(current.id) ? 'is-saved' : ''}`}
                      onClick={() => toggleSaved(current.id)}
                      aria-label={saved.includes(current.id) ? 'Remove from saved' : 'Save for later'}
                      title={saved.includes(current.id) ? 'Remove from saved' : 'Save for later'}
                    >
                      <Icon name="bookmark" size={18} fill={saved.includes(current.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="feature-copy">
                    <span className="feature-tag">{current.tag}</span>
                    <div className="feature-attributes" aria-label="Block a topic">
                      {getAttributes(current).slice(0, 3).map((attribute) => (
                        <button
                          key={attribute.key}
                          onClick={() => blockAttribute(attribute)}
                          disabled={bannedAttributes.some((item) => item.key === attribute.key)}
                          title={`Hide future discoveries tagged ${attribute.label}`}
                        >
                          {attribute.label}
                        </button>
                      ))}
                    </div>
                    <h2>{current.title}</h2>
                    <p>{current.description}</p>
                    <div className="feature-actions">
                      <a className="visit-button" href={current.url} target="_blank" rel="noreferrer">
                        Take me there <Icon name="arrow" size={17} />
                      </a>
                      <span className="byline"><span className="byline-icon"><Icon name="globe" size={15} /></span> Found on {current.site}</span>
                    </div>
                  </div>
                  <span className="image-credit">A WINDOW TO SOMEWHERE ELSE</span>
                </div>
                <div className="feature-foot">
                  <span><span className="foot-dot" /> {current.api ? 'LIVE DISCOVERY FROM WIKIPEDIA' : 'HANDPICKED FOR THE CURIOUS'}</span>
                  <span>{current.api ? 'A NEW RABBIT HOLE, JUST FOR YOU.' : 'NO ALGORITHM. JUST GOOD FINDS.'}</span>
                </div>
              </section>

              <section className="next-up">
                <div className="next-up-heading">
                  <div>
                    <h3>{showSaved ? 'The ones you saved' : 'If you’ve got a minute...'}</h3>
                    <p>{showSaved ? 'A few more little gems from your collection.' : 'A few more places worth getting lost in.'}</p>
                  </div>
                  <button className="stumble-button" onClick={stumble} disabled={isLoading}>
                    <Icon name="spark" size={17} /> {isLoading ? 'Finding a rabbit hole...' : 'Stumble into something else'} <Icon name="right" size={16} />
                  </button>
                </div>
                {supportingPicks.length > 0 ? (
                  <div className="mini-grid">
                    {supportingPicks.map((pick) => (
                      <article className="mini-card" key={pick.id}>
                        <button className={`mini-image mini-${pick.color}`} onClick={() => setCurrentId(pick.id)} aria-label={`Discover ${pick.site}`}>
                          <img src={pick.image} alt="" />
                          <span className="mini-image-arrow"><Icon name="arrow" size={15} /></span>
                        </button>
                        <div className="mini-info">
                          <div className="mini-meta">
                            {getAttributes(pick)[0] ? (
                              <button
                                className="mini-attribute"
                                onClick={() => blockAttribute(getAttributes(pick)[0])}
                                title={`Hide future discoveries tagged ${getAttributes(pick)[0].label}`}
                              >
                                {getAttributes(pick)[0].label.toUpperCase()}
                              </button>
                            ) : <span>{pick.category.toUpperCase()}</span>}
                            <span><i>·</i> {pick.tag.split(' · ')[1]}</span>
                          </div>
                          <h4>{pick.title}</h4>
                          <div className="mini-bottom">
                            <a href={pick.url} target="_blank" rel="noreferrer">{pick.site} <Icon name="arrow" size={12} /></a>
                            <button
                              className={`mini-save ${saved.includes(pick.id) ? 'is-saved' : ''}`}
                              onClick={() => toggleSaved(pick.id)}
                              aria-label={saved.includes(pick.id) ? `Remove ${pick.site} from saved` : `Save ${pick.site}`}
                            >
                              <Icon name="bookmark" size={16} fill={saved.includes(pick.id) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="all-caught-up">That’s everything for now. <button onClick={stumble}>Find another gem <Icon name="right" size={14} /></button></div>
                )}
              </section>
              {stumbleCount > 0 && <span className="stumble-counter">You’ve taken {stumbleCount} {stumbleCount === 1 ? 'detour' : 'detours'} today. Nice.</span>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
