(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const year = new Date().getFullYear();
  $('#year').textContent = year;

  // Mobile nav
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('#navMenu a').forEach(a => a.addEventListener('click', ()=> navMenu.classList.remove('open')));

  // Back to top
  const toTop = $('#toTop');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 600) toTop.classList.add('show'); else toTop.classList.remove('show');
  });
  toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Produtos
  const cards = $('#cardsCortes');
  const makeCard = (p) => {
    const el = document.createElement('article');
    el.className = 'card card-product';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.titulo}" loading="lazy">
      <div class="card-product__body">
        <span class="card-product__tag">${p.tipo.toUpperCase()}</span>
        <h3 class="card-product__title">${p.titulo}</h3>
        <div class="card-product__price">${p.preco}</div>
        <div class="card-product__cta">
          <a class="btn btn--ghost" href="https://wa.me/5599999999999?text=Tenho%20interesse%20em%20${encodeURIComponent(p.titulo)}" target="_blank" rel="noopener">Pedir</a>
          <button class="btn" data-like>❤️</button>
        </div>
      </div>
    `;
    el.querySelector('[data-like]').addEventListener('click', (e)=>{
      e.currentTarget.textContent = '❤️+1';
      setTimeout(()=> e.currentTarget.textContent = '❤️', 1200);
    });
    return el;
  };

  const renderProdutos = (filtro='todos') => {
    cards.innerHTML = '';
    const arr = window.SITE_DATA.produtos.filter(p => filtro==='todos' || p.tipo===filtro);
    arr.forEach(p => cards.appendChild(makeCard(p)));
  };
  renderProdutos();

  // Filtros
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    renderProdutos(ch.dataset.filter);
  }));

  // Ofertas
  const offers = $('#offers');
  window.SITE_DATA.ofertas.forEach(o => {
    const el = document.createElement('article');
    el.className = 'offer';
    el.innerHTML = `
      <img src="${o.img}" alt="${o.titulo}" loading="lazy">
      <div>
        <h3 style="margin:0">${o.titulo}</h3>
        <div class="card-product__price">${o.preco}</div>
        <p class="muted" style="margin:.25rem 0 0">${o.obs || ''}</p>
      </div>
    `;
    offers.appendChild(el);
  });

  // Galeria
  const gallery = $('#gallery');
  window.SITE_DATA.galeria.forEach(src => {
    const a = document.createElement('a');
    a.href = src; a.target = '_blank'; a.rel = 'noopener';
    a.className = 'gallery__item';
    a.innerHTML = `<img src="${src}" alt="Foto do açougue ou corte" loading="lazy">`;
    gallery.appendChild(a);
  });

  // Depoimentos
  const testimonials = $('#testimonials');
  window.SITE_DATA.depoimentos.forEach(d => {
    const el = document.createElement('figure');
    el.className = 'testimonial';
    el.innerHTML = `
      <blockquote>“${d.texto}”</blockquote>
      <figcaption class="testimonial__author">
        <span class="avatar" aria-hidden="true">${d.iniciais}</span>
        <div><strong>${d.nome}</strong><div class="muted">Cliente</div></div>
      </figcaption>
    `;
    testimonials.appendChild(el);
  });

  // Contato (validação simples + mailto fallback)
  const form = $('#contactForm');
  const feedback = $('#formFeedback');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if(!data.nome || !data.telefone || !data.mensagem){
      feedback.textContent = 'Preencha todos os campos.';
      feedback.style.color = '#b81e1e';
      return;
    }
    const subject = `Contato pelo site — ${data.nome}`;
    const body = `Nome: ${data.nome}%0AWhatsApp: ${data.telefone}%0AMensagem:%0A${encodeURIComponent(data.mensagem)}`;
    window.location.href = `mailto:contato@acougue500classea.com.br?subject=${encodeURIComponent(subject)}&body=${body}`;
    feedback.textContent = 'Abrindo seu e-mail…';
    feedback.style.color = 'inherit';
    form.reset();
  });

  // Contador animado (apenas efeito visual)
  const inView = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom >= 0;
  };
  const animateCounts = () => {
    $$('.stats__num').forEach(el => {
      if(el.dataset.done) return;
      if(inView(el)){
        el.dataset.done = '1';
        const end = parseInt(el.dataset.count || el.textContent.replace(/\D/g,'')) || 0;
        let cur = 0;
        const step = Math.ceil(end / 40);
        const tick = () => {
          cur += step;
          if(cur >= end){ el.textContent = String(end); }
          else { el.textContent = String(cur); requestAnimationFrame(tick); }
        };
        requestAnimationFrame(tick);
      }
    });
  };
  document.addEventListener('scroll', animateCounts);
  animateCounts();
})();