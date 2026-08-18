'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Menu, MoveRight, Phone, Play, Star, X, Zap } from 'lucide-react'
import { ABOUT_VIDEO_URL, SECOND_VIDEO_URL, clientPlaceholders, contact, images, packages, programs, services, testimonials, trainerSlides } from '@/lib/fitness-data'

function Button({ children, secondary = false, className = '' }: { children: React.ReactNode; secondary?: boolean; className?: string }) {
  return <a href="/book-session" className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-[1.25rem_0.35rem_1.25rem_0.35rem] px-5 text-[11px] font-bold tracking-[0.15em] transition-transform hover:-translate-y-0.5 ${secondary ? 'border border-white/25 text-white hover:border-[#e85d2a] hover:text-[#e85d2a]' : 'bg-[#e85d2a] text-white hover:bg-[#c94a20]'} ${className}`}>{children}<ArrowUpRight size={16} /></a>
}

function TrainerSlideshow() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % trainerSlides.length), 4200)
    return () => window.clearInterval(timer)
  }, [])
  return <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] sm:aspect-[3/4] lg:aspect-[4/5] lg:max-w-[620px]">
    <div className="absolute -inset-5 rounded-[2.5rem_0.75rem_2.5rem_0.75rem] bg-[#e85d2a]/10 blur-3xl" />
    {trainerSlides.map((src, index) => <img key={src} src={src} alt={`Pappu Kumar training photo ${index + 1}`} className={`absolute inset-0 h-full w-full rounded-[2.5rem_0.75rem_2.5rem_0.75rem] object-contain object-[50%_center] transition-all duration-1000 ${index === active ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'}`} />)}
    <div className="absolute inset-0 rounded-[2.5rem_0.75rem_2.5rem_0.75rem] bg-gradient-to-t from-[#171412]/90 via-transparent to-transparent" />
    <div className="absolute bottom-7 left-5 border-l-2 border-[#e85d2a] pl-4"><p className="text-xs font-bold tracking-widest">02+ YEARS</p><p className="mt-1 text-[10px] tracking-widest text-white/55">OF DISCIPLINED COACHING</p></div>
    <div className="absolute bottom-7 right-5 flex gap-2" aria-label="Trainer slideshow"><span className="sr-only">Trainer photos</span>{trainerSlides.map((_, index) => <button key={index} aria-label={`Show trainer photo ${index + 1}`} onClick={() => setActive(index)} className={`h-1.5 transition-all ${index === active ? 'w-8 bg-[#e85d2a]' : 'w-1.5 bg-white/50'}`} />)}</div>
  </div>
}

function AboutVideo() {
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setReducedMotion(motionQuery.matches)
    updateMotion()
    motionQuery.addEventListener('change', updateMotion)
    const section = document.getElementById('about')
    if (!section) return () => motionQuery.removeEventListener('change', updateMotion)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '200px 0px', threshold: 0.01 })
    observer.observe(section)
    return () => { observer.disconnect(); motionQuery.removeEventListener('change', updateMotion) }
  }, [])
  const canPlay = Boolean(ABOUT_VIDEO_URL.trim()) && !failed && !reducedMotion
  return <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
    <img src={images.strength} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${canPlay ? 'opacity-0' : 'opacity-100'}`} />
    {canPlay && visible && <video autoPlay muted loop playsInline preload="none" poster={images.strength} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" src={ABOUT_VIDEO_URL} />}
    <div className="absolute inset-0 bg-[#f5efe7]/78" />
  </div>
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const links = ['About', 'Services', 'Transformations', 'Packages', 'Testimonials', 'Contact']
  return <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#24201d]/90 backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
      <a href="#home" className="leading-none"><span className="block text-lg font-black tracking-[-0.04em] text-white">PM <span className="text-[#e85d2a]">FITNESS</span> COACH</span><span className="mt-1 block text-[8px] font-bold tracking-[0.28em] text-white/45">PERSONAL TRAINER & FITNESS COACH</span></a>
      <nav className="hidden items-center gap-6 lg:flex">{links.map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="text-[10px] font-bold tracking-[0.15em] text-white/65 transition-colors hover:text-white">{link}</a>)}<Button>BOOK A SESSION</Button></nav>
      <button aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)} className="p-2 text-white lg:hidden">{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav className="border-t border-white/10 bg-[#24201d] px-5 py-5 lg:hidden">{links.map((link) => <a onClick={() => setOpen(false)} key={link} href={`#${link.toLowerCase()}`} className="block border-b border-white/10 py-4 text-sm font-bold tracking-widest text-white/75">{link}</a>)}<Button className="mt-5 w-full">BOOK A SESSION</Button></nav>}
  </header>
}

function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) { return <div className="mb-12"><p className="mb-4 flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] text-[#e85d2a]"><span className="h-px w-8 bg-[#e85d2a]" />{eyebrow}</p><h2 className={`max-w-3xl text-balance text-4xl font-black uppercase leading-[0.92] tracking-[-0.04em] md:text-6xl ${light ? 'text-white' : 'text-[#111]'}`}>{title}</h2></div> }

export default function Page() {
  return <main className="overflow-hidden bg-[#f5efe7] text-[#111]">
    <Navbar />
    <section id="home" className="relative min-h-[740px] bg-[#24201d] pt-20 text-white lg:min-h-[850px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(232,93,42,.18),transparent_32%)]" />
      <div className="mx-auto grid min-h-[660px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-20">
        <div className="relative z-10"><p className="mb-5 text-[11px] font-bold tracking-[0.35em] text-[#e85d2a]">WELCOME TO</p><h1 className="max-w-xl text-6xl font-black uppercase leading-[.86] tracking-[-0.06em] sm:text-8xl">PM FITNESS <span className="text-[#e85d2a]">COACH</span></h1><p className="mt-7 text-sm font-semibold text-white/70">Pappu Kumar <span className="mx-2 text-[#e85d2a]">|</span> Graduate Fitness Trainer</p><h2 className="mt-7 max-w-lg text-2xl font-bold leading-tight sm:text-3xl">Train Smart. Get Strong. <span className="text-[#e85d2a]">Transform Yourself.</span></h2><p className="mt-5 max-w-md text-sm leading-7 text-white/55">Personalized training, structured workouts and nutrition guidance designed to help you achieve sustainable fitness results.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button>BOOK YOUR SESSION</Button><a href="#transformations" className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/20 px-5 text-[11px] font-bold tracking-[0.15em] text-white transition-colors hover:border-white">VIEW TRANSFORMATIONS <Play size={14} fill="currentColor" /></a></div><div className="mt-12 grid max-w-lg grid-cols-2 gap-y-4 text-[10px] font-bold tracking-[0.16em] text-white/55 sm:grid-cols-5 sm:gap-2">{['Personal Training', 'Fat Loss', 'Muscle Gain', 'Strength', 'Nutrition'].map((x) => <span key={x} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#e85d2a]" />{x}</span>)}</div></div>
        <TrainerSlideshow />
      </div>
    </section>

    <section id="about" className="relative overflow-hidden bg-[#f5efe7] px-5 py-24 lg:px-8 lg:py-32"><AboutVideo /><div className="relative mx-auto max-w-7xl"><div className="max-w-4xl"><SectionTitle eyebrow="ABOUT YOUR COACH" title="Meet Your Coach – Pappu Kumar" /><p className="max-w-2xl text-base leading-8 text-[#555]">I am an Advanced Personal Trainer with a passion for helping people achieve their dream physique and a healthy lifestyle. With years of experience and continuous learning, I create customized workout and nutrition plans that deliver real results.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{['Advanced Personal Trainer', 'Customized Workout & Nutrition Plans', 'Safe & Effective Training', 'Fat Loss & Muscle Gain Guidance', 'Personalized Fitness Approach', '100+ Happy Clients'].map((x) => <p key={x} className="flex items-center gap-3 text-xs font-bold"><Check size={16} className="text-[#e85d2a]" />{x}</p>)}</div><div className="mt-10 grid max-w-xl grid-cols-2 gap-3"><div className="rounded-xl bg-[#b94d22] p-4 text-white"><b className="block text-3xl font-black">2+</b><span className="text-[9px] font-bold tracking-widest text-white/75">YEARS EXPERIENCE</span></div><div className="rounded-xl bg-[#b94d22] p-4 text-white"><b className="block text-3xl font-black">100+</b><span className="text-[9px] font-bold tracking-widest text-white/75">CLIENTS TRAINED</span></div></div></div></div></section>

    <section aria-label="Training in motion" className="relative overflow-hidden bg-[#111] px-5 py-14 lg:px-8 lg:py-20"><video autoPlay muted loop playsInline preload="metadata" className="mx-auto aspect-[16/7] w-full max-w-7xl object-cover opacity-85" src={SECOND_VIDEO_URL} onError={(event) => { event.currentTarget.poster = images.strength }} /><div className="pointer-events-none absolute inset-0 bg-[#111]/20" /></section>

    <section id="services" className="bg-[#111] px-5 py-24 text-white lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><SectionTitle eyebrow="MY SERVICES" title="Complete Fitness Solutions" light /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{services.map(([num, name, copy]) => <article key={name} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-[#e85d2a] hover:shadow-2xl"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#e85d2a] group-hover:text-white">{num}</span><Zap className="text-[#e85d2a] group-hover:text-white" size={18} /></div><h3 className="mt-7 text-sm font-black uppercase leading-tight tracking-tight">{name}</h3><p className="mt-2 text-xs leading-5 text-white/50 group-hover:text-white/80">{copy.split(' ').slice(0, 7).join(' ')}…</p><MoveRight className="mt-5 text-white/30 transition-transform group-hover:translate-x-2 group-hover:text-white" size={17} /></article>)}</div></div></section>

    <section id="transformations" className="bg-white px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><SectionTitle eyebrow="REAL PEOPLE. REAL PROGRESS." title="Client Transformations" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{clientPlaceholders.map((src, index) => <article key={src} className="overflow-hidden rounded-2xl border border-[#111]/10 bg-[#f5efe7] p-2"><div className="grid grid-cols-2 gap-2"><div><img src={src} alt={`Dummy client transformation ${index + 1} before`} loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" /><p className="mt-2 text-center text-[9px] font-bold tracking-[0.2em] text-[#777]">BEFORE</p></div><div><img src={src} alt={`Dummy client transformation ${index + 1} after`} loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover saturate-125" /><p className="mt-2 text-center text-[9px] font-bold tracking-[0.2em] text-[#b94d22]">AFTER</p></div></div></article>)}</div><p className="mt-7 text-center text-xs text-[#777]">Progress looks different for everyone. The system stays personal.</p></div></section>

    <section className="bg-[#e85d2a] px-5 py-12 text-white lg:px-8"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center sm:grid-cols-4">{[['100+', 'Happy Clients'], ['2000+', 'Training Sessions'], ['2+', 'Years Experience'], ['100%', 'Result Driven']].map(([n, l]) => <div key={l}><b className="block text-4xl font-black tracking-tight">{n}</b><span className="mt-2 block text-[9px] font-bold tracking-[0.2em] text-white/75">{l}</span></div>)}</div></section>

    <section className="bg-[#f5efe7] px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><SectionTitle eyebrow="TRAIN WITH PURPOSE" title="Choose Your Training Focus" /><div className="grid gap-4 md:grid-cols-2">{programs.map(([name, copy], i) => <article key={name} className={`flex min-h-48 flex-col justify-between p-7 ${i === 1 || i === 2 ? 'bg-[#111] text-white' : 'bg-white'}`}><div className="flex items-start justify-between"><h3 className="max-w-xs text-2xl font-black uppercase leading-none">{name}</h3><ArrowUpRight className="text-[#e85d2a]" /></div><p className="max-w-md text-sm leading-6 opacity-60">{copy}</p></article>)}</div></div></section>

    <section id="packages" className="bg-[#111] px-5 py-24 text-white lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><SectionTitle eyebrow="TRAINING PACKAGES" title="Invest In Your Strongest Self" light /><div className="grid gap-5 lg:grid-cols-3">{packages.map((pkg) => <article key={pkg.label} className={`relative flex flex-col rounded-[2rem_0.75rem_2rem_0.75rem] p-7 backdrop-blur-md shadow-xl ${pkg.featured ? 'bg-[#e85d2a]' : 'border border-white/15 bg-white/[0.06]'}`}>{pkg.featured && <span className="absolute right-5 top-5 bg-white px-3 py-1 text-[9px] font-black tracking-widest text-[#e85d2a]">BEST VALUE</span>}<p className="text-[10px] font-bold tracking-[0.25em] opacity-60">{pkg.label}</p><h3 className="mt-10 text-2xl font-black uppercase">{pkg.name}</h3><p className="mt-5 text-4xl font-black">{pkg.price}<span className="text-sm font-normal opacity-60"> / month</span></p><ul className="my-8 flex-1 space-y-4 border-y border-current/15 py-7">{pkg.features.map((f) => <li key={f} className="flex gap-3 text-sm opacity-80"><Check size={16} />{f}</li>)}</ul><Button secondary={!!pkg.featured} className={pkg.featured ? 'border-white text-white' : ''}>BOOK NOW</Button></article>)}</div></div></section>

    <section id="testimonials" className="bg-white px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><SectionTitle eyebrow="WHAT CLIENTS SAY" title="Built On Trust. Proven In Practice." /><div className="grid gap-5 md:grid-cols-3">{testimonials.map((t) => <article key={t.meta} className="border border-[#111]/10 p-7"><div className="flex gap-1 text-[#e85d2a]">{[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="currentColor" />)}</div><p className="mt-6 text-base font-semibold leading-7">{t.quote}</p><div className="mt-10 border-t border-[#111]/10 pt-4"><p className="text-xs font-black uppercase">{t.name}</p><p className="mt-1 text-[10px] font-bold tracking-widest text-[#e85d2a]">{t.meta}</p></div></article>)}</div></div></section>

    <section id="contact" className="relative bg-[#e85d2a] px-5 py-24 text-white lg:px-8 lg:py-32"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 lg:flex-row lg:items-end"><div><p className="mb-5 text-[10px] font-bold tracking-[0.3em] text-white/70">READY TO TRANSFORM?</p><h2 className="max-w-2xl text-5xl font-black uppercase leading-[.9] tracking-[-0.05em] sm:text-7xl">Your Goal. Your Plan. <span className="text-[#111]">Your Transformation.</span></h2></div><div className="flex flex-col gap-4 text-sm font-bold"><a href={contact.phoneHref} className="flex items-center gap-3"><Phone size={18} />{contact.phone}</a><p className="flex items-center gap-3">Ramgarh, Jharkhand</p><a href={contact.instagramHref} className="flex items-center gap-3"><span className="text-sm font-black">IG</span>{contact.instagram}</a><div className="mt-4 flex flex-wrap gap-3"><a href={contact.phoneHref} className="inline-flex min-h-12 items-center gap-2 bg-[#111] px-5 text-[10px] font-bold tracking-widest">CALL NOW <Phone size={15} /></a><a href={contact.whatsappHref} className="inline-flex min-h-12 items-center gap-2 border border-white/50 px-5 text-[10px] font-bold tracking-widest">CHAT ON WHATSAPP <ArrowUpRight size={15} /></a></div></div></div></section>

    <footer className="bg-[#24201d] px-5 py-12 text-white lg:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xl font-black tracking-[-0.04em]">PM <span className="text-[#e85d2a]">FITNESS</span> COACH</p><p className="mt-2 text-[9px] font-bold tracking-[0.25em] text-white/40">PERSONAL TRAINER & FITNESS COACH</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-bold tracking-widest text-white/55">{['Home','About','Services','Transformations','Packages','Testimonials','Contact'].map(x => <a key={x} href={`#${x.toLowerCase()}`} className="hover:text-white">{x}</a>)}</div><p className="text-[10px] text-white/35">© 2026 PM Fitness Coach. All Rights Reserved.</p></div></footer>
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3"><a aria-label="Chat on WhatsApp" href={contact.whatsappHref} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-lg font-black text-white shadow-xl">W</a><a aria-label="Follow on Instagram" href={contact.instagramHref} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111] text-white shadow-xl"><span className="text-sm font-black">IG</span></a></div>
  </main>
}
