/**
 * data.js — Carga de datos mock y helpers de presentación
 */

const Data = (() => {
  // Cache
  let _events  = null;
  let _artists = null;
  let _venues  = null;

  // ─── Load ─────────────────────────────────────────────────
  async function loadAll() {
    const base = getBase();
    const [eventsRes, artistsRes, venuesRes] = await Promise.all([
      fetch(`${base}/data/events.json`),
      fetch(`${base}/data/artists.json`),
      fetch(`${base}/data/venues.json`),
    ]);
    _events  = await eventsRes.json();
    _artists = await artistsRes.json();
    _venues  = await venuesRes.json();

    // Merge admin-created events
    const adminEvs = Store.adminEvents.get();
    if (adminEvs.length) {
      // Replace or add
      adminEvs.forEach(ae => {
        const idx = _events.findIndex(e => e.id === ae.id);
        if (idx >= 0) _events[idx] = ae;
        else _events.unshift(ae);
      });
    }

    return { events: _events, artists: _artists, venues: _venues };
  }

  // Detect base path (works on GitHub Pages and locally)
  function getBase() {
    const path = window.location.pathname;
    // If we're in /admin/, go up one level
    if (path.includes('/admin/')) return '..';
    return '.';
  }

  // ─── Events ───────────────────────────────────────────────
  function getEvents()                  { return _events || []; }
  function getEvent(id)                 { return (_events || []).find(e => e.id === id); }
  function getUpcomingEvents()          { return (_events || []).filter(e => e.status === 'published' && isUpcoming(e.date)); }
  function getPastEvents()              { return (_events || []).filter(e => e.status === 'past' || !isUpcoming(e.date)); }
  function getFeaturedEvent()           { return (_events || []).find(e => e.featured && e.status === 'published'); }
  function getEventsByVenue(venueId)    { return (_events || []).filter(e => e.venue_id === venueId); }
  function getEventsByArtist(artistId)  { return (_events || []).filter(e => e.artist_ids.includes(artistId) || e.supporting_artist_ids.includes(artistId)); }

  // ─── Artists ──────────────────────────────────────────────
  function getArtists()          { return _artists || []; }
  function getArtist(id)         { return (_artists || []).find(a => a.id === id); }
  function getArtistsByIds(ids)  { return (_artists || []).filter(a => ids.includes(a.id)); }

  // ─── Venues ───────────────────────────────────────────────
  function getVenues()    { return _venues || []; }
  function getVenue(id)   { return (_venues || []).find(v => v.id === id); }

  // ─── Date helpers ──────────────────────────────────────────
  function isUpcoming(dateStr) {
    return new Date(dateStr) > new Date();
  }

  function formatDate(dateStr, opts = {}) {
    const date = new Date(dateStr);
    const defaults = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', { ...defaults, ...opts });
  }

  function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2,'0');
    const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    return { day, month: months[d.getMonth()], year: d.getFullYear() };
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function getCountdownParts(dateStr) {
    const diff = new Date(dateStr) - new Date();
    if (diff <= 0) return null;
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }

  // ─── Calendar helpers ─────────────────────────────────────
  function getGoogleCalendarUrl(event, venue) {
    const start = new Date(event.date).toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    const end   = new Date(new Date(event.date).getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text:   `${event.title} — ${event.subtitle || ''}`,
      dates:  `${start}/${end}`,
      details: event.description_short || '',
      location: venue ? `${venue.name}, ${venue.address}` : '',
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }

  function getICSContent(event, venue) {
    const formatICS = d => new Date(d).toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    const start = formatICS(event.date);
    const end   = formatICS(new Date(new Date(event.date).getTime() + 3*60*60*1000));
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ESCENA//Demo//ES',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.description_short||'').replace(/\n/g,'\\n')}`,
      `LOCATION:${venue ? venue.name + ', ' + venue.address : ''}`,
      `UID:${event.id}@escena.demo`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  // ─── Price helpers ─────────────────────────────────────────
  function getMinPrice(event) {
    const types = event.ticket_types || [];
    const avail = types.filter(t => t.available > 0);
    if (!avail.length) return null;
    return Math.min(...avail.map(t => t.price));
  }

  function formatPrice(n) {
    return n % 1 === 0 ? `${n}€` : `${n.toFixed(2)}€`;
  }

  // ─── Misc ──────────────────────────────────────────────────
  function generateOrderId() {
    return 'ESC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
  }

  function getURLParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  // ─── HTML helpers ──────────────────────────────────────────
  function renderEventCard(event, venues, artists) {
    const venue   = venues.find(v => v.id === event.venue_id) || {};
    const dt      = formatDateShort(event.date);
    const minPrice = getMinPrice(event);
    const isFav   = Store.favorites.has(event.id);
    const isPast  = !isUpcoming(event.date) || event.status === 'past';

    return `
      <a href="${getBase()}/event.html?id=${event.id}" class="event-card${isPast ? ' event-card--past' : ''}">
        <div class="event-card__image">
          <img src="${event.cover_image}" alt="${event.title}" loading="lazy">
          <div class="event-card__image-overlay"></div>
          <div class="event-card__status">
            ${isPast
              ? '<span class="badge badge--status-past">Pasado</span>'
              : event.ticket_types.every(t => t.available === 0)
                ? '<span class="badge badge--sold-out">Agotado</span>'
                : ''
            }
          </div>
        </div>
        <div class="event-card__body">
          <div class="event-card__date">${dt.day} ${dt.month} ${dt.year}</div>
          <div class="event-card__title">${event.title}</div>
          <div class="event-card__subtitle">${event.subtitle || ''}</div>
          <div class="event-card__meta">
            <span class="event-card__venue">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              ${venue.name || ''} · ${venue.city || ''}
            </span>
            ${minPrice !== null
              ? `<span class="event-card__price">desde ${formatPrice(minPrice)} <span>/ entrada</span></span>`
              : `<span class="event-card__price" style="color:var(--danger)">Agotado</span>`
            }
          </div>
          <div class="event-card__genres">
            ${(event.genres || []).slice(0,3).map(g => `<span class="badge badge--genre">${g}</span>`).join('')}
          </div>
        </div>
      </a>`;
  }

  return {
    loadAll,
    getBase,
    getEvents, getEvent, getUpcomingEvents, getPastEvents, getFeaturedEvent,
    getEventsByVenue, getEventsByArtist,
    getArtists, getArtist, getArtistsByIds,
    getVenues, getVenue,
    isUpcoming, formatDate, formatDateShort, formatTime,
    getCountdownParts, getGoogleCalendarUrl, getICSContent,
    getMinPrice, formatPrice,
    generateOrderId, getURLParam,
    renderEventCard,
  };
})();

window.Data = Data;
