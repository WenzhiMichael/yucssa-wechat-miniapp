// Static design review only: render the current WXML/WXSS with sample data.
// This preview does not authenticate users or send requests to any service.
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const mini = path.join(root, 'miniprogram')
const { getLocalizedData } = require(path.join(mini, 'data/localizedData.js'))
const { getMessages, localizeProfile } = require(path.join(mini, 'utils/i18n.js'))
function makeFixtures(language) {
  const mock = getLocalizedData(language), ui = getMessages(language)
  const profile = localizeProfile({ nickName: '体验同学', memberCode: 'PREVIEW', verificationStatus: 'preview', avatarUrl: '', membershipLevel: '体验预览', joinedLabel: '界面体验', faculty: 'York University', bio: '当前为体验模式，可查看页面与操作，尚未验证 York 邮箱。' }, language)
  const base = { ui, language }
  return {
    home: { ...base, profile, profileInitial: profile.nickName.slice(0, 1), walletStatusText: ui.home.comingSoon, events: mock.events.slice(0, 3), featuredMerchants: mock.merchants.slice(0, 2), categoryDockItems: mock.categories.map(c => ({ ...c, name: c.shortName, label: c.name })) },
    merchantList: { ...base, categories: mock.categories, selectedCategoryId: 'all', sections: mock.categories.map(c => ({ ...c, merchants: mock.merchants.filter(m => m.categoryId === c.id) })), pageTitle: ui.nav.merchantList },
    services: { ...base, ...mock }, contact: { ...base, ...mock },
    profile: { ...base, ...mock, profile, profileInitial: profile.nickName.slice(0, 1), verificationTitle: ui.profile.previewTitle, verificationCopy: ui.profile.previewCopy, verificationBadgeText: ui.profile.previewBadge },
    merchantDetail: { ...base, merchant: mock.merchants[1], relatedMerchants: mock.merchants.filter(m => m.categoryId === 'food' && m.id !== '002').slice(0, 2) },
    login: { ...base, verificationEmailInput: '', verificationCodeInput: '', verificationStatus: 'idle', verificationHint: ui.login.initialHint, isSendingCode: false, isVerifyingCode: false, canUseProfile: true, hasAuthorizedProfile: false, canPreview: true }
  }
}
function parse(source) {
  const tree = { children: [] }, stack = [tree]
  for (const token of source.match(/<!--[\s\S]*?-->|<\/?[\w:-]+\b[^>]*>|[^<]+/g) || []) {
    if (token.startsWith('<!--')) continue
    if (token.startsWith('</')) { stack.pop(); continue }
    if (!token.startsWith('<')) { stack.at(-1).children.push({ text: token }); continue }
    const tag = token.match(/^<([\w:-]+)/)[1], attrs = {}
    const body = token.slice(tag.length + 1).replace(/\/?>(\s*)$/, '')
    for (const match of body.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) attrs[match[1]] = match[2] ?? ''
    const node = { tag, attrs, children: [] }
    stack.at(-1).children.push(node)
    if (!token.endsWith('/>')) stack.push(node)
  }
  return tree
}
function expr(value, data) { return Function('data', `with(data) { return (${value}) }`)(data) }
function evalBinding(value, data) { return expr(value.replace(/^\{\{|\}\}$/g, ''), data) }
function escape(s) { return String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;') }
function interpolate(value, data) { return escape(value.replace(/\{\{([\s\S]*?)\}\}/g, (_, e) => expr(e, data) ?? '')) }
function renderChildren(children, data) {
  let output = '', branch = false
  for (const node of children) {
    if (node.text !== undefined) { output += interpolate(node.text, data); continue }
    const a = node.attrs
    if ('wx:if' in a) { branch = Boolean(evalBinding(a['wx:if'], data)); if (!branch) continue }
    else if ('wx:else' in a) { if (branch) continue; branch = true }
    else if ('wx:elif' in a) { if (branch || !evalBinding(a['wx:elif'], data)) continue; branch = true }
    else branch = false
    output += renderNode(node, data)
  }
  return output
}
function renderNode(node, data) {
  const a = node.attrs
  if (a['wx:for']) return evalBinding(a['wx:for'], data).map((item, index) => renderNode({ ...node, attrs: { ...a, 'wx:for': null } }, { ...data, [a['wx:for-item'] || 'item']: item, [a['wx:for-index'] || 'index']: index })).join('')
  if (node.tag === 'block') return renderChildren(node.children, data)
  if (node.tag === 'official-account') return ''
  const tag = { view: 'div', text: 'span', image: 'img' }[node.tag] || node.tag
  let attrs = ''
  for (const [key, value] of Object.entries(a)) {
    if (key.startsWith('wx:') || ['mode','placeholder-class','bindinput','loading','type'].includes(key)) continue
    if (key === 'bindtap') { attrs += ` data-handler="${escape(value)}"`; continue }
    if (key === 'disabled') { if (evalBinding(value, data)) attrs += ' disabled'; continue }
    let content = value
    if (key === 'src') {
      content = content.replace(/\{\{([\s\S]*?)\}\}/g, (_, e) => expr(e, data) ?? '')
      if (content.startsWith('/assets/')) content = 'data:image/png;base64,' + fs.readFileSync(path.join(mini, content)).toString('base64')
      attrs += ` src="${escape(content)}"`; continue
    }
    attrs += ` ${key}="${interpolate(content, data)}"`
  }
  if (tag === 'button') attrs += ' type="button"'
  if (tag === 'input' || tag === 'img') return `<${tag}${attrs}>`
  return `<${tag}${attrs}>${renderChildren(node.children, data)}</${tag}>`
}
function css(name, width = 390) {
  let source = fs.readFileSync(path.join(mini, 'app.wxss'), 'utf8') + '\n' + fs.readFileSync(path.join(mini, `pages/${name}/${name}.wxss`), 'utf8')
  source = source.replace(/(?<![-\w.])page(?![-\w])/g, 'body').replace(/(\d+(?:\.\d+)?)rpx/g, (_, n) => `${Number(n) * width / 750}px`).replace(/(?<![-\w.])image(?![-\w])/g, 'img')
  return source + '\nbody{margin:0}[hidden]{display:none!important}img{object-fit:contain}button{border:none;cursor:pointer}input{outline:none;font-family:inherit}button:disabled{cursor:default}.home-dock{padding-bottom:16px}.toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);padding:12px 18px;background:#292326;color:white;border-radius:12px;font-size:13px;z-index:100;width:max-content;max-width:85%;text-align:center}'
}
const actionScript = `document.addEventListener('click',e=>{const b=e.target.closest('[data-handler]');if(!b)return;const h=b.dataset.handler;if(h==='toggleLanguage'){parent.postMessage({toggleLanguage:true},'*');return}if(h==='openMerchant'){parent.postMessage({page:'merchantDetail:'+b.dataset.id},'*');return}if(h==='openCategoryDock'){parent.postMessage({page:'merchantList:'+b.dataset.id},'*');return}const routes={openMerchants:'merchantList',openServices:'services',openProfile:'profile',openContact:'contact',openMerchantDirectory:'merchantList',openMerchant:'merchantDetail',openCategoryDock:'merchantList',handlePreviewLogin:'home'};if(routes[h]){parent.postMessage({page:routes[h]},'*');return}if(h==='selectCategory'){parent.postMessage({page:b.dataset.id==='all'?'merchantList':'merchantList:'+b.dataset.id},'*');return}const t=document.createElement('div');t.className='toast';t.textContent=parent.previewLanguage==='en'?(h==='handleWalletPlaceholder'?'Apple Wallet is coming soon':'Design preview. Use the mini program for actual actions.'):(h==='handleWalletPlaceholder'?'Apple Wallet 即将支持':'设计预览 · 实际操作请在小程序中完成');document.body.append(t);setTimeout(()=>t.remove(),2200)});`
const namesByLanguage = { zh: getMessages('zh').nav, en: getMessages('en').nav }
const names = namesByLanguage.zh
const allDocs = {}
for (const language of ['zh', 'en']) {
  const fixtures = makeFixtures(language), mock = getLocalizedData(language), docs = {}
  function makeDoc(page, data) {
    const html = renderChildren(parse(fs.readFileSync(path.join(mini, `pages/${page}/${page}.wxml`), 'utf8')).children, data)
    return `<!doctype html><html lang="${language === 'en' ? 'en' : 'zh-CN'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css(page)}</style><body>${html}<script>${actionScript}</script></body></html>`
  }
  for (const [name, data] of Object.entries(fixtures)) docs[name] = makeDoc(name, data)
  for (const merchant of mock.merchants) docs['merchantDetail:' + merchant.id] = makeDoc('merchantDetail', { ui: getMessages(language), language, merchant, relatedMerchants: mock.merchants.filter(m => m.categoryId === merchant.categoryId && m.id !== merchant.id).slice(0, 2) })
  for (const category of mock.categories) docs['merchantList:' + category.id] = makeDoc('merchantList', { ...fixtures.merchantList, selectedCategoryId: category.id, sections: fixtures.merchantList.sections.filter(s => s.id === category.id) })
  allDocs[language] = docs
}
const output = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YUCSSA · 设计预览</title><style>
*{box-sizing:border-box}body{margin:0;background:#eeeae5;color:#292326;font-family:'Avenir Next','PingFang SC',sans-serif}.board{padding:36px 44px 40px;max-width:1540px;margin:auto}.masthead{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:30px}.brand{font-size:15px;letter-spacing:3px;font-weight:700;color:#821e3c}.masthead h1{font-size:30px;margin:12px 0 10px;font-weight:600}.masthead p{font-size:13px;color:#82777c;margin:0;line-height:1.6}.swatches{display:flex;gap:12px;flex-shrink:0}.swatch{display:flex;align-items:center;gap:8px;font-size:11px;color:#82777c}.swatch i{display:block;width:28px;height:28px;border-radius:9px;border:1px solid #ddd4d5}.screens{display:flex;gap:28px;justify-content:center;align-items:start}.screen{width:390px;min-width:390px}.screen-label{display:flex;justify-content:space-between;font-size:13px;margin-bottom:12px;font-weight:600}.screen-label span{color:#a2969c;font-size:11px;font-weight:400}.phone{position:relative;width:390px;border-radius:36px;background:#f7f5f2;box-shadow:0 12px 40px #49313c12;border:1px solid #d6ced0;overflow:hidden}.status{height:40px;padding:15px 24px 0;font-size:12px;font-weight:600;display:flex;justify-content:space-between}.native-bar{height:45px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;font-size:13px;font-weight:600}.native-bar button{border:0;background:none;color:#82777c;font-size:20px;cursor:pointer}.capsule{border:1px solid #e1d9dc;background:#fff;border-radius:20px;padding:3px 10px;font-size:14px;letter-spacing:5px}iframe{display:block;width:390px;height:690px;border:0;background:#f7f5f2}.home-indicator{position:absolute;bottom:6px;left:143px;width:104px;height:4px;background:#292326;border-radius:4px;pointer-events:none}.nav{display:flex;gap:9px;flex-wrap:wrap;margin-top:25px;justify-content:center}.nav button{border:1px solid #d8cdd1;border-radius:12px;padding:10px 16px;background:#fff8;color:#66595f;cursor:pointer;font:inherit;font-size:12px}.nav button.active{background:#821e3c;color:#fff;border-color:#821e3c}.foot{text-align:center;font-size:11px;color:#94878e;margin-top:18px}@media(max-width:1250px){.screens{justify-content:start;overflow-x:auto;padding-bottom:20px}.swatches{display:none}.board{padding:24px}}@media(max-width:450px){.board{padding:20px 12px}.masthead h1{font-size:24px}}
</style></head><body><main class="board"><header class="masthead"><div><div class="brand">YUCSSA / CAMPUS HUB</div><h1>你的校园，更多可能。</h1><p>学联品牌 · 清楚的会员入口 · 一眼可见的学生福利</p></div><div class="swatches"><div class="swatch"><i style="background:#821e3c"></i>学联酒红</div><div class="swatch"><i style="background:#f7f5f2"></i>暖白</div><div class="swatch"><i style="background:#f3dfbe"></i>香槟金</div></div></header><section class="screens">${['home','merchantList','services'].map((n,i)=>`<article class="screen"><div class="screen-label" id="label-${i}">${names[n]}<span>0${i+1} / YUCSSA</span></div><div class="phone"><div class="status"><span>9:41</span><span>••• ▰</span></div><div class="native-bar"><button aria-label="返回首页" onclick="showPage('home',${i})">‹</button><span id="title-${i}">${names[n]}</span><span class="capsule">••• ◉</span></div><iframe title="${names[n]}" id="frame-${i}"></iframe><div class="home-indicator"></div></div></article>`).join('')}</section><nav class="nav">${Object.entries(names).map(([n,t])=>`<button data-page="${n}" onclick="showPage('${n}',0)">${t}</button>`).join('')}</nav><p class="foot">设计预览使用示例资料；可点击页面内入口，实际身份验证与核销请在小程序中完成。</p></main><script>const allDocs=${JSON.stringify(allDocs).replaceAll('<','\\u003c')};const namesByLanguage=${JSON.stringify(namesByLanguage)};let language=localStorage.getItem('yucssa.preview.language')==='en'?'en':'zh';let docs=allDocs[language];let names=namesByLanguage[language];window.previewLanguage=language;const currentPages=['home','merchantList','services'];function showPage(name,i){currentPages[i]=name;document.getElementById('frame-'+i).srcdoc=docs[name];document.getElementById('title-'+i).textContent=names[name.split(':')[0]];document.getElementById('label-'+i).innerHTML=names[name.split(':')[0]]+'<span>0'+(i+1)+' / YUCSSA</span>';if(i===0)document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name))}function changeLanguage(){language=language==='zh'?'en':'zh';localStorage.setItem('yucssa.preview.language',language);window.previewLanguage=language;docs=allDocs[language];names=namesByLanguage[language];currentPages.forEach((n,i)=>showPage(n,i));document.querySelectorAll('[data-page]').forEach(b=>b.textContent=names[b.dataset.page]);document.querySelector('.masthead h1').textContent=language==='en'?'Your campus. More possibilities.':'你的校园，更多可能。';document.querySelector('.masthead p').textContent=language==='en'?'Your association · Your membership · Your student benefits':'学联品牌 · 清楚的会员入口 · 一眼可见的学生福利';document.querySelector('.foot').textContent=language==='en'?'Design preview with sample data. Use the mini program for verification and redemption.':'设计预览使用示例资料；可点击页面内入口，实际身份验证与核销请在小程序中完成。';document.querySelectorAll('.swatch').forEach((s,i)=>s.lastChild.textContent=(language==='en'?['Burgundy','Warm white','Champagne']:['学联酒红','暖白','香槟金'])[i])}currentPages.forEach((n,i)=>showPage(n,i));if(language==='en'){language='zh';changeLanguage()}window.addEventListener('message',e=>{if(e.origin!==location.origin)return;const i=[0,1,2].find(i=>document.getElementById('frame-'+i).contentWindow===e.source);if(i!==undefined&&e.data?.toggleLanguage){changeLanguage();return}if(i!==undefined&&Object.hasOwn(docs,e.data?.page))showPage(e.data.page,i)})</script></body></html>`
fs.writeFileSync(path.join(root, 'design/preview.html'), output)
console.log('Created design/preview.html from seven mini program pages.')
