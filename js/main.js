/* ── Скрипт 1: toggle-панели (раскрытие по кнопке Показать ── */
(function () {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle]');
    if (!btn) return;

    const panel = document.getElementById(btn.dataset.toggle);
    if (!panel) return;

    const isOpen = panel.classList.toggle('is-open');

    btn.setAttribute('aria-expanded', String(isOpen));
    btn.textContent = isOpen ? 'Скрыть' : 'Показать';
  });
})();




/* ── Скрипт 2: модалка карточек курсов ── */
/* Схема данных: «нет атрибута/элемента = нет поля». */

(function () {
  const modal = document.getElementById('course-modal');
  if (!modal) return;

  const slots = modal.querySelectorAll('[data-field]');
  let lastFocused = null;

  /* -------- Сбор данных из карточки -------- */
  function readCard(card) {
    const q = (sel) => card.querySelector(sel);
    const img = q('.course_trip_card__logo');
    const tplText    = q('template.card-modal-source');
    const tplSpeaker = q('template.card-modal-speaker');

    // CTA: приоритет data-cta-status → (есть href ? open : none)
    const ctaStatus = card.dataset.ctaStatus
      || (card.dataset.ctaHref ? 'open' : 'none');

    return {
      // видимые элементы карточки
      image:   img?.getAttribute('src') || '',
      alt:     img?.getAttribute('alt') || '',
      top:     q('.course_trip_card__top')?.textContent.trim() || '',
      eyebrow: q('.course_trip_card__eyebrow')?.textContent.trim() || '',
      title:   q('.course_trip_card__title')?.textContent.trim() || '',
      note:    q('.course_trip_card__note')?.textContent.trim() || '',

      // текст модалки: <template> → fallback на тизер карточки
      textNode: tplText ? tplText.content.cloneNode(true) : null,
      text:     q('.course_trip_card__text')?.textContent.trim() || '',

      // спикер: <template> → fallback на data-speaker
      speakerNode: tplSpeaker ? tplSpeaker.content.cloneNode(true) : null,
      speaker:     card.dataset.speaker || '',

      // CTA
      ctaStatus,
      ctaHref: card.dataset.ctaHref || '',
      ctaText: card.dataset.ctaText || '',
    };
  }

  /* -------- CTA (обрабатывается один раз, до цикла) -------- */
  function fillCta(data) {
    const btn    = modal.querySelector('[data-field="cta"]');
    const closed = modal.querySelector('[data-field="cta-closed"]');

    if (btn)    btn.hidden = true;
    if (closed) closed.hidden = true;

    if (data.ctaStatus === 'open' && btn) {
      btn.hidden = false;
      btn.setAttribute('href', data.ctaHref);
      btn.textContent = data.ctaText || 'Записаться';
    } else if (data.ctaStatus === 'closed' && closed) {
      closed.hidden = false;
      closed.textContent = data.ctaText || 'Запись закрыта';
    }
  }

  /* -------- Раскладка по слотам -------- */
  function fillModal(data) {
    // CTA — отдельно
    fillCta(data);

    slots.forEach((el) => {
      const key = el.dataset.field;

      // CTA уже обработали
      if (key === 'cta' || key === 'cta-closed') return;

      // Картинка
      if (key === 'image') {
        el.src = data.image;
        el.alt = data.alt;
        el.hidden = !data.image;
        return;
      }

      // Полный текст: template → fallback на тизер
      if (key === 'text') {
        el.replaceChildren();
        if (data.textNode) {
          el.appendChild(data.textNode);
          el.hidden = false;
        } else if (data.text) {
          el.textContent = data.text;
          el.hidden = false;
        } else {
          el.hidden = true;
        }
        return;
      }

      // Спикер: template → fallback на data-speaker
      if (key === 'speaker') {
        el.replaceChildren();
        if (data.speakerNode) {
          el.appendChild(data.speakerNode);
          el.hidden = false;
        } else if (data.speaker) {
          el.textContent = data.speaker;
          el.hidden = false;
        } else {
          el.hidden = true;
        }
        return;
      }

      // Остальные текстовые поля: есть значение → показать, нет → скрыть
      const value = data[key] ?? '';
      el.textContent = value;
      el.hidden = !value;
    });
  }

  /* -------- Открытие / закрытие -------- */
  function openModal(card, opener) {
    lastFocused = opener || null;
    fillModal(readCard(card));

    // компенсация скроллбара
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbar + 'px';

    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal__close')?.focus();

    opener?.setAttribute('aria-expanded', 'true');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';

    lastFocused?.setAttribute('aria-expanded', 'false');
    lastFocused?.focus();
    lastFocused = null;
  }

  /* -------- Делегирование -------- */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal]');
    if (opener) {
      const card = opener.closest('.course_trip_card');
      if (card) openModal(card, opener);
      return;
    }
    if (e.target.closest('[data-modal-close]')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();