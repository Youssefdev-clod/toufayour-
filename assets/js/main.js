document.addEventListener('DOMContentLoaded', () => {
  AOS.init();

  const MAD = new Intl.NumberFormat('fr-MA',{style:'currency',currency:'MAD'});
  let priceNum = 120;
  let WA_NUMBER = '2126XXXXXXXX'; // sera mis à jour depuis content.json
  let tfContent = null;

  // === Galerie depuis data/gallery.json ===
  function initGallery(data) {
    const hero = document.getElementById('hero');
    const thumbsContainer = document.getElementById('thumbs');

    hero.src = data.hero || 'images/1.jpg';
    thumbsContainer.innerHTML = '';

    (data.images || []).forEach((src, index) => {
      const btn = document.createElement('button');
      btn.className = 'thumb';
      if (index === 0) btn.setAttribute('aria-current','true');

      btn.innerHTML = `<img src="${src}" alt="Mini ${index+1}" loading="lazy">`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.thumb').forEach(b=>b.removeAttribute('aria-current'));
        btn.setAttribute('aria-current','true');
        hero.src = src;
      });

      thumbsContainer.appendChild(btn);
    });
  }

  fetch('data/gallery.json')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(initGallery)
    .catch(err => console.error('Erreur chargement gallery.json', err));

  // === Panier ===
  const state = { qty:1, cart: JSON.parse(localStorage.getItem('tf_cart')||'[]') };

  function setQty(v){
    state.qty=Math.max(1,v);
    document.getElementById('qv').textContent=state.qty;
  }
  const plusBtn = document.getElementById('plus');
  const minusBtn = document.getElementById('minus');
  if (plusBtn) plusBtn.onclick = ()=>setQty(state.qty+1);
  if (minusBtn) minusBtn.onclick = ()=>setQty(state.qty-1);

  function saveCart(){ localStorage.setItem('tf_cart', JSON.stringify(state.cart)); }

  function renderCart(){
    const list = document.getElementById('list');
    if (!list) return;
    list.innerHTML='';
    let total=0, count=0;
    if(state.cart.length===0){
      const li=document.createElement('li'); li.className='row';
      li.innerHTML = `<span style="color:#b8aca3">${i18n.lang==='ar'?'سلتك فارغة.':'Votre panier est vide.'}</span>`;
      list.appendChild(li);
    }else{
      for(const it of state.cart){
        const li=document.createElement('li'); li.className='row';
        li.innerHTML = `
          <div>
            <div>${it.title}</div>
            <div class="t2">${MAD.format(it.price)} × ${it.qty}</div>
          </div>
          <div>
            <strong>${MAD.format(it.price*it.qty)}</strong>
            <button title="-" style="border:0;background:transparent;margin-left:8px;cursor:pointer;color:#ffd7a0" onclick="upd('${it.id}',-1)">−</button>
            <button title="+" style="border:0;background:transparent;cursor:pointer;color:#ffd7a0" onclick="upd('${it.id}',+1)">+</button>
            <button title="x" style="border:0;background:transparent;cursor:pointer;color:#ff9f9f" onclick="delIt('${it.id}')">🗑️</button>
          </div>`;
        list.appendChild(li);
        total+=it.price*it.qty; count+=it.qty;
      }
    }
    const icEl = document.getElementById('ic');
    const totalEl = document.getElementById('total');
    if (icEl) icEl.textContent = count;
    if (totalEl) totalEl.textContent = MAD.format(total);
  }

  function add(){
    const id='TF-BOX-001';
    const title = i18n.lang==='ar'
      ? 'علبة « يد فاطمة » — تشكيلة 12 قطعة'
      : 'Coffret « Main de Fatma » — Assortiment de 12 pièces';
    const i = state.cart.findIndex(x=>x.id===id);
    if(i>-1) state.cart[i].qty += state.qty;
    else state.cart.push({id,title,price:priceNum,qty:state.qty});
    saveCart(); renderCart();
    const lbl = document.getElementById('addLbl');
    if (!lbl) return;
    lbl.textContent = i18n.lang==='ar'?'✓ تمت الإضافة!':'✓ Ajouté !';
    setTimeout(()=>lbl.textContent=i18n.lang==='ar'?'أضف إلى السلة':'Ajouter au panier',1200);
  }

  function upd(id,d){
    const i=state.cart.findIndex(x=>x.id===id); if(i<0)return;
    state.cart[i].qty+=d;
    if(state.cart[i].qty<1) state.cart.splice(i,1);
    saveCart(); renderCart();
  }

  function delIt(id){
    const i=state.cart.findIndex(x=>x.id===id); if(i<0)return;
    state.cart.splice(i,1);
    saveCart(); renderCart();
  }

  window.upd = upd;
  window.delIt = delIt;

  const addBtn = document.getElementById('add');
  if (addBtn) addBtn.onclick = add;

  // === Modal commande ===
  const modal = document.getElementById('modal');
  const mBody = document.getElementById('mBody');

  function buildSummary(){
    let total=0, html='<ul style="list-style:none;margin:0;padding:0 0 10px 0">';
    for(const it of state.cart){
      const line = it.price*it.qty; total+=line;
      html+=`<li style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed rgba(255,255,255,.15)">
        <span>${it.title} × ${it.qty}</span><strong>${MAD.format(line)}</strong></li>`;
    }
    html+=`</ul><div style="display:flex;justify-content:space-between;font-weight:900;border-top:2px solid rgba(255,255,255,.15);padding-top:8px">
      <span>${i18n.lang==='ar'?'الإجمالي':'Total'}</span><span>${MAD.format(total)}</span></div>`;
    return html;
  }

  function openModal(){
    if(!state.cart.length){
      alert(i18n.lang==='ar'?'سلتك فارغة.':'Votre panier est vide.');
      return;
    }
    if (!modal || !mBody) return;
    mBody.innerHTML = buildSummary();
    modal.style.display='flex';
    document.body.style.overflow='hidden';
  }

  function closeModal(){
    if (!modal) return;
    modal.style.display='none';
    document.body.style.overflow='';
  }

  const checkoutBtn = document.getElementById('checkout');
  const waBtn = document.getElementById('waBtn');
  const mClose = document.getElementById('mClose');

  if (checkoutBtn) checkoutBtn.onclick = openModal;
  if (waBtn) waBtn.onclick = openModal;
  if (mClose) mClose.onclick = closeModal;

  function buildWAText(){
    const cart = state.cart;
    const L = i18n.lang==='ar';
    const header = L
      ? 'مرحبًا، أود تأكيد الطلب التالي:'
      : 'Bonjour, je souhaite confirmer la commande suivante :';
    const lines = cart.map(it=>`- ${it.title} × ${it.qty} = ${MAD.format(it.price*it.qty)}`);
    const total = MAD.format(cart.reduce((s,i)=>s+i.price*i.qty,0));
    const fName = (document.getElementById('fName')?.value || '').trim();
    const fPhone= (document.getElementById('fPhone')?.value || '').trim();
    const fCity = (document.getElementById('fCity')?.value || '').trim();
    const fNote = (document.getElementById('fNote')?.value || '').trim();
    const info = L
      ? `\nالاسم: ${fName}\nالهاتف: ${fPhone}\nالمدينة: ${fCity}${fNote?'\nملاحظة: '+fNote:''}`
      : `\nNom: ${fName}\nTéléphone: ${fPhone}\nVille: ${fCity}${fNote?'\nRemarque: '+fNote:''}`;
    const totalLine = L ? `الإجمالي: ${total}` : `Total : ${total}`;
    return [header, ...lines, totalLine, info, L?'\nشكرًا لكم 🌸':'\nMerci 🌸'].join('\n');
  }

  function sendWA(){
    const form = document.getElementById('clientForm');
    if(form && !form.reportValidity()) return;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWAText())}`;
    window.open(url,'_blank','noopener');
  }

  const mWA = document.getElementById('mWA');
  if (mWA) mWA.onclick = sendWA;

  const mConfirm = document.getElementById('mConfirm');
  if (mConfirm) {
    mConfirm.onclick = ()=>{
      const form = document.getElementById('clientForm');
      if(form && !form.reportValidity()) return;
      alert(i18n.lang==='ar'?'✅ تم حفظ تفاصيل الطلب محليًا.':'✅ Commande enregistrée localement.');
      const orders = JSON.parse(localStorage.getItem('tf_orders')||'[]');
      orders.push({
        items:state.cart,
        client:{
          name:document.getElementById('fName')?.value || '',
          phone:document.getElementById('fPhone')?.value || '',
          city:document.getElementById('fCity')?.value || '',
          note:document.getElementById('fNote')?.value || ''
        },
        date:new Date().toISOString()
      });
      localStorage.setItem('tf_orders', JSON.stringify(orders));
      state.cart=[]; saveCart(); renderCart(); closeModal();
    };
  }

  // Bouton WA flottant + bouton haut de page
  const waQuick = document.getElementById('waQuick');
  if (waQuick) {
    waQuick.addEventListener('click', (e)=>{
      e.preventDefault();
      openModal();
    });
  }

  const upBtn = document.getElementById('upBtn');
  window.addEventListener('scroll', ()=>{
    if (!upBtn) return;
    upBtn.style.display = window.scrollY>200?'block':'none';
  });
  if (upBtn) {
    upBtn.onclick = ()=>window.scrollTo({top:0,behavior:'smooth'});
  }

  // === i18n + content.json ===
  const i18n = {
    lang: localStorage.getItem('lang') || 'fr',
    set(lang){
      this.lang = lang;
      localStorage.setItem('lang', lang);
      const ar = (lang === 'ar');
      const l = lang; // 'fr' ou 'ar'

      document.documentElement.lang = ar ? 'ar' : 'fr';
      document.documentElement.dir  = ar ? 'rtl' : 'ltr';
      const langBtn = document.getElementById('langBtn');
      if (langBtn) langBtn.textContent = ar ? 'Français' : 'العربية';

      const c = tfContent;

      // Header
      const sloganText =
        c && c.header && c.header[l] && c.header[l].slogan
          ? c.header[l].slogan
          : (ar
              ? 'صناعة مغربية بجودة عالية — المالكة: غزلان'
              : 'Artisanat marocain de qualité — Propriétaire : Ghizlane');
      const sloganEl = document.getElementById('slogan');
      if (sloganEl) sloganEl.textContent = sloganText;

      // Badge
      const badgeEl = document.getElementById('badge');
      if (badgeEl) badgeEl.textContent = ar ? 'جديد' : 'Nouveau';

      // Produit principal
      const prod = c && c.product && c.product[l] ? c.product[l] : null;
      const baseProd = {
        title: ar ? 'علبة « يد فاطمة » — تشكيلة 12 قطعة' : 'Coffret « Main de Fatma » — Assortiment de 12 pièces',
        ref:   ar ? 'المرجع: TF-BOX-001' : 'Référence : TF-BOX-001',
        desc:  ar
          ? 'اكتشف علبة مستوحاة من الفن المغربي: 12 قطعة شوكولاتة فاخرة على شكل يد فاطمة، محشوة باللوز والفستق والكراميل والغاناش بالفواكه. مثالية كهدية للمناسبات الخاصة.'
          : 'Découvrez un coffret artisanal inspiré de l’art marocain : 12 pièces de chocolat fin en forme de la main de Fatma, fourrées aux amandes, pistaches, caramel et ganache fruitée. Idéal comme cadeau pour les occasions spéciales.',
        w: ar ? 'الوزن: 250 غ'      : 'Poids : 250 g',
        f: ar ? 'الكمية: 12 قطعة'   : 'Format : 12 pièces',
        s: ar ? 'مدة الصلاحية: 10 أيام' : 'Conservation : 10 jours',
        p: ar ? 'التغليف: هدية'    : 'Emballage : Cadeau'
      };

      const titleEl = document.getElementById('title');
      const refEl   = document.getElementById('ref');
      const descEl  = document.getElementById('desc');
      const wEl = document.getElementById('w');
      const fEl = document.getElementById('f');
      const sEl = document.getElementById('s');
      const pEl = document.getElementById('p');

      if (titleEl) titleEl.textContent = (prod && prod.title) || baseProd.title;
      if (refEl)   refEl.textContent   = (prod && prod.ref)   || baseProd.ref;
      if (descEl)  descEl.textContent  = (prod && prod.desc)  || baseProd.desc;
      if (wEl)     wEl.textContent     = (prod && prod.w)     || baseProd.w;
      if (fEl)     fEl.textContent     = (prod && prod.f)     || baseProd.f;
      if (sEl)     sEl.textContent     = (prod && prod.s)     || baseProd.s;
      if (pEl)     pEl.textContent     = (prod && prod.p)     || baseProd.p;

      // Prix
      const newPrice = c && c.product && typeof c.product.price === 'number'
        ? c.product.price
        : 120;
      priceNum = newPrice;
      const priceEl = document.getElementById('price');
      if (priceEl) priceEl.textContent = MAD.format(priceNum);

      // Navigation
      const navCatEl = document.getElementById('navCat');
      const navAboutEl = document.getElementById('navAbout');
      const navContactEl = document.getElementById('navContact');
      const catalogueTitleEl = document.getElementById('catalogue');

      if (navCatEl) navCatEl.textContent   = ar ? 'الكتالوج' : 'Catalogue';
      if (navAboutEl) navAboutEl.textContent = ar ? 'من نحن'   : 'À propos';
      if (navContactEl) navContactEl.textContent = ar ? 'اتصل بنا' : 'Contact';
      if (catalogueTitleEl) catalogueTitleEl.textContent  = ar ? 'الكتالوج' : 'Catalogue';

      // Catalogue
      const cat = c && Array.isArray(c.catalog) ? c.catalog : null;
      function setCard(idx, titleId, descId, defFR, defAR){
        const item = cat && cat[idx] && cat[idx][l] ? cat[idx][l] : null;
        const def = ar ? defAR : defFR;
        const tEl = document.getElementById(titleId);
        const dEl = document.getElementById(descId);
        if (tEl) tEl.textContent = (item && item.title) || def[0];
        if (dEl) dEl.textContent  = (item && item.desc)  || def[1];
      }

      setCard(0, 'c1', 'c1d',
        ['Coffret Toufayour','Chocolat artisanal marocain aux saveurs uniques.'],
        ['علبة Toufayour','شوكولاتة مغربية حرفية بنكهات مميزة.']
      );
      setCard(1, 'c2', 'c2d',
        ['Collection Spéciale','Un mélange harmonieux de tradition et raffinement.'],
        ['تشكيلة خاصة','مزيج متناغم من الأصالة والرقي.']
      );
      setCard(2, 'c3', 'c3d',
        ['Édition Royale','Chocolat fin inspiré de l’art marocain traditionnel.'],
        ['إصدار ملكي','شوكولاتة فاخرة مستوحاة من الفن المغربي.']
      );

      // Panier labels
      const cartTitleEl = document.getElementById('cartTitle');
      const itemsLblEl = document.getElementById('itemsLbl');
      const totalLblEl = document.getElementById('totalLbl');
      const checkoutLblEl = document.getElementById('checkoutLbl');
      const addLblEl = document.getElementById('addLbl');
      const waLblEl = document.getElementById('waLbl');
      const noteEl = document.getElementById('note');

      if (cartTitleEl) cartTitleEl.textContent   = ar ? 'سلتك' : 'Votre Panier';
      if (itemsLblEl && itemsLblEl.firstChild) itemsLblEl.firstChild.textContent = ar ? 'العناصر : ' : 'Articles : ';
      if (totalLblEl) totalLblEl.textContent    = ar ? 'الإجمالي' : 'Total';
      if (checkoutLblEl) checkoutLblEl.textContent = ar ? 'أكمل الطلب' : 'Commander';
      if (addLblEl) addLblEl.textContent      = ar ? 'أضف إلى السلة' : 'Ajouter au panier';
      if (waLblEl) waLblEl.textContent       = ar ? 'أرسل عبر واتساب' : 'Commander via WhatsApp';
      if (noteEl) noteEl.textContent        = ar
        ? 'السعر شامل الضريبة · الدفع عند الاستلام متاح داخل المغرب'
        : 'TVA incluse · Paiement à la livraison disponible au Maroc';

      // Contact global (tél / WA / email / adresse)
      const contactGlobal = c && c.contact ? c.contact : null;
      const contactLoc    = contactGlobal && contactGlobal[l] ? contactGlobal[l] : null;

      const intro =
        (contactLoc && contactLoc.intro)
        || (ar
              ? 'التوصيل للمدن الرئيسية في المغرب. تواصل معنا للتأكد من التوفر في مدينتك.'
              : 'Livraison dans les villes principales du Maroc. Contactez-nous pour confirmer la disponibilité dans votre ville.');
      const ctEl = document.getElementById('ct');
      const ctxEl = document.getElementById('ctx');
      if (ctEl) ctEl.textContent   = ar ? 'التواصل والتوصيل' : 'Contact & Livraison';
      if (ctxEl) ctxEl.textContent  = intro;

      const address =
        (contactLoc && contactLoc.address)
        || (ar ? 'مراكش، المغرب' : 'Marrakech, Maroc');
      const adrEl = document.getElementById('adr');
      if (adrEl) adrEl.textContent  = address;

      // Labels contact
      const phlEl = document.getElementById('phl');
      const walEl = document.getElementById('wal');
      const emlEl = document.getElementById('eml');
      const adlEl = document.getElementById('adl');

      if (phlEl) phlEl.textContent  = ar ? 'هاتف:'   : 'Téléphone :';
      if (walEl) walEl.textContent  = ar ? 'واتساب:' : 'WhatsApp :';
      if (emlEl) emlEl.textContent  = ar ? 'البريد:' : 'Email :';
      if (adlEl) adlEl.textContent  = ar ? 'العنوان:' : 'Adresse :';

      // Numéro & email
      const phone     = contactGlobal && contactGlobal.phone     ? contactGlobal.phone     : '+212 6X XXX XXXX';
      const phoneRaw  = contactGlobal && contactGlobal.phone_raw ? contactGlobal.phone_raw : '2126XXXXXXXX';
      const email     = contactGlobal && contactGlobal.email     ? contactGlobal.email     : 'contact@toufayour.ma';

      WA_NUMBER = phoneRaw;

      const phoneLink = document.getElementById('phoneLink');
      const phoneText = document.getElementById('phoneText');
      if (phoneText) phoneText.textContent = phone;
      if (phoneLink) phoneLink.href = 'tel:' + phone.replace(/\s+/g,'');

      const waLink = document.getElementById('waLink');
      const waText = document.getElementById('waText');
      if (waText) waText.textContent = phone;
      if (waLink) waLink.href = 'https://wa.me/' + phoneRaw;

      const mailLink  = document.getElementById('mailLink');
      const mailLink2 = document.getElementById('mailLink2');
      if (mailLink)  { mailLink.textContent = email;  mailLink.href = 'mailto:' + email; }
      if (mailLink2) { mailLink2.textContent = email; mailLink2.href = 'mailto:' + email; }

      // À propos
      const aboutText =
        c && c.about && c.about[l]
          ? c.about[l]
          : (ar
              ? 'توفايور شوكولات علامة مغربية حرفية. نمزج المكونات الراقية (لوز، فستق، عسل) في ابتكارات مستوحاة من الفن المغربي. كل علبة تُحضّر بعناية لتكون هدية أصيلة.'
              : 'Toufayour Chocolate est une maison artisanale marocaine. Nous sublimons les ingrédients nobles (amandes, pistaches, miel) dans des créations inspirées de l’art marocain. Chaque coffret est façonné avec soin pour offrir un cadeau authentique.');
      const aboutEl = document.getElementById('aboutText');
      if (aboutEl) aboutEl.textContent = aboutText;

      // Footer
      const rightsEl = document.getElementById('rights');
      if (rightsEl) rightsEl.textContent = ar ? 'كل الحقوق محفوظة' : 'Tous droits réservés';

      // Modal & form
      const mTitleEl = document.getElementById('mTitle');
      const fNameLbl = document.getElementById('fNameLbl');
      const fPhoneLbl= document.getElementById('fPhoneLbl');
      const fCityLbl = document.getElementById('fCityLbl');
      const fNoteLbl = document.getElementById('fNoteLbl');
      const mConfirmLbl= document.getElementById('mConfirmLbl');
      const mWALbl = document.getElementById('mWALbl');

      if (mTitleEl) mTitleEl.textContent    = ar ? 'تأكيد الطلب' : 'Confirmation de commande';
      if (fNameLbl) fNameLbl.textContent  = ar ? 'الاسم الكامل' : 'Nom complet';
      if (fPhoneLbl) fPhoneLbl.textContent = ar ? 'الهاتف'       : 'Téléphone';
      if (fCityLbl) fCityLbl.textContent  = ar ? 'المدينة'      : 'Ville';
      if (fNoteLbl) fNoteLbl.textContent  = ar ? 'ملاحظة (اختياري)' : 'Remarque (optionnel)';
      if (mConfirmLbl) mConfirmLbl.textContent = ar ? 'تأكيد' : 'Confirmer';
      if (mWALbl) mWALbl.textContent      = ar ? 'إرسال عبر واتساب' : 'Envoyer via WhatsApp';
    }
  };

  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.onclick = () =>
      i18n.set(i18n.lang === 'fr' ? 'ar' : 'fr');
  }

  // Initialisation rapide (avant content.json)
  i18n.set(localStorage.getItem('lang') || 'fr');

  // Charger content.json puis ré-appliquer i18n
  fetch('data/content.json')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      tfContent = data;
      i18n.set(i18n.lang);
    })
    .catch(() => {
      console.warn('Impossible de charger content.json (on garde les textes par défaut).');
    });

  // Année + panier + compteur promo
  const yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();
  renderCart();

  (function(){
    const el = document.getElementById('promoSmall');
    if (!el) return;
    let s = 3600;
    setInterval(()=>{
      if (s < 0) return;
      el.textContent =
        (i18n.lang==='ar' ? 'ينتهي بعد ' : 'Offre se termine dans ') +
        Math.max(0,Math.floor(s/60)) +
        (i18n.lang==='ar' ? ' دقيقة' : ' min');
      s--;
    },1000);
  })();
});
  