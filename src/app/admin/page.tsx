'use client';

import { usePrivy } from '@privy-io/react-auth';
import { isAuthorizedAdmin } from '@/lib/admin';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminData, handleApproveSubmission, handleRejectSubmission, handleUpdateCard, handleDeleteCard, handleMarkCardVerified, handleClearCardEdits, handleAIDataSync, handleSavePuterSync, handleAddCard } from '@/app/actions';
import { CryptoCard, CardSubmission } from '@/lib/data';
import { getMetadataForCard } from '@/lib/categories';
import { Loader2, CheckCircle2, XCircle, LayoutDashboard, CreditCard, Inbox, Edit3, Trash2, ArrowLeft, MessageSquarePlus, Sparkles, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const router = useRouter();
  
  const [cards, setCards] = useState<CryptoCard[]>([]);
  const [submissions, setSubmissions] = useState<CardSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submissions' | 'cards' | 'edits'>('submissions');
  const [editingCard, setEditingCard] = useState<CryptoCard | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated || !isAuthorizedAdmin(user?.wallet?.address)) {
      router.replace('/'); // Stealth mode: Redirect unauthorized users immediately
      return;
    }

    const loadData = async () => {
      try {
        const token = await getAccessToken();
        const data = await fetchAdminData(token);
        setCards(data.cards);
        setSubmissions(data.submissions);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [ready, authenticated, user, router]);

  if (!ready || isLoading || !authenticated || !isAuthorizedAdmin(user?.wallet?.address)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 font-black text-lg tracking-tight">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              Stealth Dashboard
            </div>
          </div>
          <div className="flex bg-muted rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'submissions' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Inbox className="w-4 h-4" /> Submissions
              {submissions.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{submissions.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'cards' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <CreditCard className="w-4 h-4" /> Manage Cards
            </button>
            <button 
              onClick={() => setActiveTab('edits')}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'edits' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MessageSquarePlus className="w-4 h-4" /> Suggested Edits
              {cards.filter(c => c.fee_details?.pending_edits?.length > 0).length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{cards.filter(c => c.fee_details?.pending_edits?.length > 0).length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black mb-6">Pending Submissions</h2>
            {submissions.length === 0 ? (
              <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center text-muted-foreground font-medium">
                No pending submissions to review.
              </div>
            ) : (
              <div className="grid gap-4">
                {submissions.map(sub => (
                  <div key={sub.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="font-bold text-lg mb-1">{sub.name}</div>
                      <a href={sub.website_url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline font-medium">
                        {sub.website_url}
                      </a>
                      <div className="text-xs text-muted-foreground mt-2">
                        Submitted: {new Date(sub.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <form action={async (fd) => {
                        setProcessingId(sub.id);
                        const token = await getAccessToken();
                        fd.append('privy_token', token || '');
                        fd.append('caller_wallet', user.wallet!.address);
                        fd.append('submission_id', sub.id);
                        await handleApproveSubmission(fd);
                        setSubmissions(s => s.filter(x => x.id !== sub.id));
                        setProcessingId(null);
                      }}>
                        <button type="submit" disabled={processingId === sub.id} className="bg-green-500/10 text-green-600 hover:bg-green-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                          {processingId === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                        </button>
                      </form>
                      <form action={async (fd) => {
                        setProcessingId(sub.id);
                        const token = await getAccessToken();
                        fd.append('privy_token', token || '');
                        fd.append('caller_wallet', user.wallet!.address);
                        fd.append('submission_id', sub.id);
                        await handleRejectSubmission(fd);
                        setSubmissions(s => s.filter(x => x.id !== sub.id));
                        setProcessingId(null);
                      }}>
                        <button type="submit" disabled={processingId === sub.id} className="bg-red-500/10 text-red-600 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                          {processingId === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MANAGE CARDS TAB */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Manage Directory</h2>
              {!editingCard && !isAddingCard && (
                <button onClick={() => setIsAddingCard(true)} className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90">
                  <PlusCircle className="w-5 h-5" /> Add New Card
                </button>
              )}
            </div>
            
            {(editingCard || isAddingCard) ? (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {editingCard ? <><Edit3 className="w-5 h-5 text-primary" /> Editing: {editingCard.name}</> : <><PlusCircle className="w-5 h-5 text-primary" /> Add New Card</>}
                  </h3>
                  <button onClick={() => { setEditingCard(null); setIsAddingCard(false); }} className="text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
                
                <form action={async (fd) => {
                  setProcessingId(editingCard ? editingCard.id : 'add-new');
                  const token = await getAccessToken();
                  fd.append('privy_token', token || '');
                  fd.append('caller_wallet', user.wallet!.address);
                  if (editingCard) fd.append('card_id', editingCard.id);
                  
                  const res = editingCard ? await handleUpdateCard(fd) : await handleAddCard(fd);
                  if (res.success) {
                    try {
                      const token = await getAccessToken();
                      const freshData = await fetchAdminData(token);
                      setCards(freshData.cards);
                    } catch (e) { console.error(e) }
                    setEditingCard(null);
                    setIsAddingCard(false);
                  } else {
                    alert(res.error);
                  }
                  setProcessingId(null);
                }} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Card Name</label>
                      <input type="text" name="name" defaultValue={editingCard?.name || ''} required className="w-full bg-background border border-border rounded-xl px-4 py-2 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Trust Score (1-10)</label>
                      <input type="number" step="0.1" name="editor_trust_score" defaultValue={editingCard?.editor_trust_score || 50} required className="w-full bg-background border border-border rounded-xl px-4 py-2 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Cashback Rate</label>
                      <input type="text" name="cashback_rate" defaultValue={editingCard?.cashback_rate || ''} className="w-full bg-background border border-border rounded-xl px-4 py-2 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Monthly Fees</label>
                      <input type="text" name="monthly_fees" defaultValue={editingCard?.monthly_fees || ''} className="w-full bg-background border border-border rounded-xl px-4 py-2 font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Logo URL</label>
                    <input type="text" name="logo_url" defaultValue={editingCard?.logo_url || ''} placeholder="https://example.com/logo.png" className="w-full bg-background border border-border rounded-xl px-4 py-2 font-medium" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Supported Networks (Comma-separated)</label>
                    <input type="text" name="supported_networks" defaultValue={editingCard?.supported_networks?.join(', ') || ''} placeholder="Ethereum, Polygon, Solana" className="w-full bg-background border border-border rounded-xl px-4 py-2 font-medium" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Region Tag</label>
                      <select name="region" defaultValue={editingCard ? (editingCard.fee_details?.region || getMetadataForCard(editingCard.name).region) : 'Global'} className="w-full bg-background border border-border rounded-xl px-4 py-3 font-medium">
                        <option value="Global">Global</option>
                        <option value="Europe & UK">Europe & UK</option>
                        <option value="Emerging Markets">Emerging Markets</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">KYC Tag</label>
                      <select name="kyc" defaultValue={editingCard ? (editingCard.fee_details?.kyc || getMetadataForCard(editingCard.name).kyc) : 'Standard KYC'} className="w-full bg-background border border-border rounded-xl px-4 py-3 font-medium">
                        <option value="Standard KYC">Standard KYC</option>
                        <option value="Low/No KYC">Low/No KYC</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={processingId === (editingCard ? editingCard.id : 'add-new')} className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity">
                      {processingId === (editingCard ? editingCard.id : 'add-new') ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Changes
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid gap-4">
                {cards.map(card => (
                  <div key={card.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      {card.logo_url && <img src={card.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />}
                      <div>
                        <div className="font-bold">{card.name}</div>
                        <div className="text-sm text-muted-foreground">Score: {card.editor_trust_score} | {card.cashback_rate} Cashback</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={async () => {
                          setProcessingId(`ai-${card.id}`);
                          try {
                            const { puter } = await import('@heyputer/puter.js');
                            const response = await puter.ai.chat(
                              `You are a highly analytical crypto researcher. Your goal is to return a JSON object with the latest data for the "${card.name}" crypto card.
Official Website: ${card.website_url || 'Not provided'}

CRITICAL RULES:
1. Do NOT claim a card is discontinued, dead, or inactive unless you have absolute, explicit proof. If data is simply scarce, write "Data limited".
2. Structure: { "cashback_rate": "string (e.g. 'Up to 4% BTC')", "monthly_fees": "string", "description": "string (briefly explain rewards, limits)" }. 
3. Return raw JSON only.`,
                              { model: 'x-ai/grok-4.3' }
                            );
                            const rawContent = response?.message?.content;
                            if (!rawContent) throw new Error("Empty response from Puter AI");
                            const textContent = String(rawContent);

                            const fd = new FormData();
                            const token = await getAccessToken();
                            fd.append('privy_token', token || '');
                            fd.append('caller_wallet', user.wallet!.address);
                            fd.append('card_id', card.id);
                            fd.append('ai_text', textContent);
                            const saveRes = await handleSavePuterSync(fd);
                            if (!saveRes.success) throw new Error("Save error: " + saveRes.error + "\nAI Text: " + textContent.slice(0, 100));
                            
                            const freshData = await fetchAdminData(token);
                            setCards(freshData.cards);
                            setActiveTab('edits'); // switch to edits tab so they see it
                          } catch (err: any) {
                            console.error("Puter AI error:", err);
                            alert(`Puter AI Sync failed: ${err.message || 'Unknown error'}`);
                          }
                          setProcessingId(null);
                        }}
                        disabled={processingId === `ai-${card.id}`} 
                        className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                      >
                        {processingId === `ai-${card.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Sync
                      </button>
                      <button 
                        onClick={() => setEditingCard(card)}
                        className="bg-muted text-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <form action={async (fd) => {
                        if (!confirm('Permanently delete this card?')) return;
                        setProcessingId(card.id);
                        const token = await getAccessToken();
                        fd.append('privy_token', token || '');
                        fd.append('caller_wallet', user.wallet!.address);
                        fd.append('card_id', card.id);
                        await handleDeleteCard(fd);
                        setCards(c => c.filter(x => x.id !== card.id));
                        setProcessingId(null);
                      }}>
                        <button type="submit" disabled={processingId === card.id} className="bg-red-500/10 text-red-600 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                          {processingId === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUGGESTED EDITS TAB */}
        {activeTab === 'edits' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black mb-6">Suggested Edits</h2>
            {cards.filter(c => c.fee_details?.pending_edits?.length > 0).length === 0 ? (
              <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center text-muted-foreground font-medium">
                No pending edits from the community.
              </div>
            ) : (
              <div className="grid gap-6">
                {cards.filter(c => c.fee_details?.pending_edits?.length > 0).map(card => (
                  <div key={card.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                      {card.logo_url && <img src={card.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />}
                      <div className="font-bold text-lg">{card.name}</div>
                    </div>
                    <div className="space-y-4 mb-6">
                      {card.fee_details?.pending_edits.map((edit: any) => (
                        <div key={edit.id} className="bg-muted/50 p-4 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            Suggested by <span className="font-mono">{edit.suggested_by.slice(0,6)}...{edit.suggested_by.slice(-4)}</span> on {new Date(edit.date).toLocaleDateString()}
                          </div>
                          <p className="font-medium">{edit.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <form action={async (fd) => {
                        setProcessingId(card.id);
                        const token = await getAccessToken();
                        fd.append('privy_token', token || '');
                        fd.append('caller_wallet', user!.wallet!.address);
                        fd.append('card_id', card.id);
                        await handleMarkCardVerified(fd);
                        const freshData = await fetchAdminData(token);
                        setCards(freshData.cards);
                        setProcessingId(null);
                      }}>
                        <button type="submit" disabled={processingId === card.id} className="bg-green-500/10 text-green-600 hover:bg-green-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                          {processingId === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Mark Verified & Clear
                        </button>
                      </form>
                      <form action={async (fd) => {
                        setProcessingId(`clear-${card.id}`);
                        const token = await getAccessToken();
                        fd.append('privy_token', token || '');
                        fd.append('caller_wallet', user!.wallet!.address);
                        fd.append('card_id', card.id);
                        await handleClearCardEdits(fd);
                        const freshData = await fetchAdminData(token);
                        setCards(freshData.cards);
                        setProcessingId(null);
                      }}>
                        <button type="submit" disabled={processingId === `clear-${card.id}`} className="bg-red-500/10 text-red-600 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                          {processingId === `clear-${card.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject & Clear
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
