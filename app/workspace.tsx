"use client";

import { useEffect, useState, type FormEvent } from "react";

type Package = {
  id: string; title: string; month: string; client_email: string; video_count: number;
  file_name: string; status: string; created_at: string; approved_at: string | null; approved_by: string | null;
};
type Viewer = { email: string; isAdmin: boolean };

const monthLabel = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("fi-FI", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
};
const dateLabel = (value: string) => new Intl.DateTimeFormat("fi-FI", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function Workspace() {
  const [items, setItems] = useState<Package[]>([]);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/packages", { cache: "no-store" });
      const data = await response.json() as { packages: Package[]; viewer: Viewer; error?: string };
      if (!response.ok) throw new Error(data.error || "Työtilaa ei voitu ladata.");
      setItems(data.packages);
      setViewer(data.viewer);
      setSelected(current => current && data.packages.some((item: Package) => item.id === current) ? current : data.packages[0]?.id || null);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Työtilaa ei voitu ladata.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const form = event.currentTarget;
      const response = await fetch("/api/packages", { method: "POST", body: new FormData(form) });
      const data = await response.json() as { id: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Lähetys epäonnistui.");
      form.reset(); setShowForm(false); setSelected(data.id);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lähetys epäonnistui.");
    } finally { setBusy(false); }
  }

  async function approve(item: Package) {
    if (!window.confirm(`Hyväksytkö paketin ”${item.title}” ja sen kaikki ${item.video_count} videota?`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/packages/${encodeURIComponent(item.id)}/approve`, { method: "POST" });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "Hyväksyntä epäonnistui.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hyväksyntä epäonnistui.");
    } finally { setBusy(false); }
  }

  const current = items.find(item => item.id === selected);
  const pending = items.filter(item => item.status === "pending").length;
  const approved = items.filter(item => item.status === "approved").length;
  return <div className="app-shell">
    <aside className="rail">
      <div className="brand">Yhet<span>Puheet!</span></div>
      <div className="rail-label">YHTEINEN TYÖTILA</div>
      <div className="rail-active">Hyväksyntäpaketit</div>
      <div className="rail-footer">Käsikirjoitukset ja videot<br />samassa paketissa.</div>
    </aside>
    <main className="main">
      <header className="top"><div><div className="eyebrow">SISÄLLÖNTUOTANTO</div><h1>Hyväksyntäpaketit</h1><p className="lead">Yksi tiedosto, yksi hyväksyntä koko kuukauden sisällöille.</p></div><div className="identity">{viewer?.email || "Työtila"}</div></header>
      {error && <div className="error" role="alert">{error} <button onClick={() => void load()}>Yritä uudelleen</button></div>}
      {loading ? <div className="card loading">Ladataan paketteja…</div> : <>
        <section className="metrics" aria-label="Tilanne"><div><span>Odottaa hyväksyntää</span><strong>{pending}</strong></div><div><span>Hyväksytty</span><strong>{approved}</strong></div><div><span>Paketteja yhteensä</span><strong>{items.length}</strong></div></section>
        <div className="section-title"><h2>{viewer?.isAdmin ? "Asiakkaiden paketit" : "Sinulle lähetetyt paketit"}</h2>{viewer?.isAdmin && <button className="primary" onClick={() => setShowForm(value => !value)}>{showForm ? "Sulje lomake" : "Lähetä uusi paketti"}</button>}</div>
        {viewer?.isAdmin && showForm && <form className="card upload-form" onSubmit={upload}><div className="form-head"><h3>Uusi hyväksyntäpaketti</h3><p>Kokoa kaikkien videoiden käsikirjoitukset ja videolinkit yhteen PDF-tiedostoon.</p></div><div className="fields"><label>Paketin nimi<input name="title" required placeholder="Esim. Marraskuun 8 videota" maxLength={120} /></label><label>Kuukausi<input name="month" type="month" required defaultValue={new Date().toISOString().slice(0,7)} /></label><label>Asiakkaan sähköposti<input name="clientEmail" type="email" required placeholder="asiakas@yritys.fi" /></label><label>Videoiden määrä<input name="videoCount" type="number" required min="1" max="100" defaultValue="8" /></label><label className="wide">Paketti PDF-tiedostona<input name="file" type="file" accept="application/pdf,.pdf" required /><small>Enintään 20 Mt. Videot lisätään PDF:ään katselulinkkeinä.</small></label></div><button className="primary" disabled={busy}>{busy ? "Tallennetaan…" : "Tallenna paketti"}</button></form>}
        {items.length === 0 ? <div className="card empty"><div className="empty-icon">0</div><h3>{viewer?.isAdmin ? "Ei vielä paketteja" : "Sinulle ei ole vielä lähetetty paketteja"}</h3><p>{viewer?.isAdmin ? "Lähetä ensimmäinen PDF-paketti asiakkaan hyväksyttäväksi." : "Kun YhetPuheet lähettää sisällöt, ne näkyvät tässä."}</p></div> : <div className="workspace-grid"><div className="package-list">{items.map(item => <button key={item.id} className={`package-row ${selected === item.id ? "chosen" : ""}`} onClick={() => setSelected(item.id)}><span className="row-month">{monthLabel(item.month)}</span><strong>{item.title}</strong><span className="row-bottom">{item.video_count} videota <span className={`badge ${item.status}`}>{item.status === "approved" ? "Hyväksytty" : "Odottaa hyväksyntää"}</span></span></button>)}</div>{current && <article className="card detail"><div className="detail-top"><div><div className="eyebrow">{monthLabel(current.month).toUpperCase()}</div><h3>{current.title}</h3></div><span className={`badge ${current.status}`}>{current.status === "approved" ? "Hyväksytty" : "Odottaa hyväksyntää"}</span></div><p className="detail-lead">Koko erä: {current.video_count} videon käsikirjoitukset ja katselulinkit yhdessä tiedostossa.</p><a className="file-link" href={`/api/packages/${encodeURIComponent(current.id)}/file`} target="_blank" rel="noopener noreferrer"><span className="file-mark">PDF</span><span><strong>{current.file_name}</strong><small>Avaa ja tarkista koko paketti</small></span><span aria-hidden="true">↗</span></a><dl className="facts"><div><dt>Asiakas</dt><dd>{current.client_email}</dd></div><div><dt>Lähetetty</dt><dd>{dateLabel(current.created_at)}</dd></div>{current.approved_at && <><div><dt>Hyväksyjä</dt><dd>{current.approved_by}</dd></div><div><dt>Hyväksytty</dt><dd>{dateLabel(current.approved_at)}</dd></div></>}</dl>{!viewer?.isAdmin && current.status === "pending" && <div className="approve-box"><p>Kun olet katsonut kaikki käsikirjoitukset ja videot, hyväksy koko paketti yhdellä kertaa.</p><button className="primary" disabled={busy} onClick={() => void approve(current)}>{busy ? "Tallennetaan…" : `Hyväksy kaikki ${current.video_count} videota`}</button></div>}{current.status === "approved" && <div className="approved-box">Koko paketti on hyväksytty.</div>}</article>}</div>}
      </>}
    </main>
  </div>;
}

