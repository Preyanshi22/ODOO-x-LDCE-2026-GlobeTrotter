import { Bookmark, Heart, MessageCircle, MoreHorizontal, Search, Share2, SlidersHorizontal, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button, IconButton } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
import { useApp } from '../../context/AppContext';

export function CommunityPage() {
  const { posts, toggleLike, addPost, addToast, profile } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Latest');
  const [modalOpen, setModalOpen] = useState(false);

  const [storyForm, setStoryForm] = useState({
    destination: '',
    tripName: 'Custom Story',
    body: '',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  });

  const visible = useMemo(
    () =>
      posts
        .filter((post) => `${post.user} ${post.destination} ${post.body}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => (filter === 'Popular' ? b.likes - a.likes : 0)),
    [posts, query, filter]
  );

  const handleShareStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.destination || !storyForm.body) return;

    addPost({
      user: `${profile?.firstName ?? 'Traveller'} ${profile?.lastName ?? ''}`.trim(),
      avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      destination: storyForm.destination,
      tripName: storyForm.tripName,
      body: storyForm.body,
      image: storyForm.image,
    });

    setStoryForm({
      destination: '',
      tripName: 'Custom Story',
      body: '',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    });
    setModalOpen(false);
  };

  return (
    <div className="community-page">
      <div className="community-intro">
        <div>
          <span className="eyebrow">The shared map</span>
          <h1>Stories from<br /><em>out there.</em></h1>
          <p className="lede">Borrow a little inspiration from people who are already out wandering.</p>
        </div>
        <div className="community-orbit">
          <span>✦</span>
          <small>12,480<br />travellers</small>
        </div>
      </div>

      <div className="community-toolbar">
        <label className="inline-search">
          <Search size={16} />
          <input placeholder="Search stories, places, people..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="filter-pills">
          <button className={filter === 'Latest' ? 'active' : ''} onClick={() => setFilter('Latest')}>Latest</button>
          <button className={filter === 'Popular' ? 'active' : ''} onClick={() => setFilter('Popular')}>Popular</button>
          <button><SlidersHorizontal size={14} /> Filters</button>
        </div>
      </div>

      <div className="community-layout">
        <main className="feed">
          {visible.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-head">
                <SafeImage src={post.avatar} alt="" className="post-avatar" />
                <div>
                  <strong>{post.user}</strong>
                  <span>{post.createdAt} <i>·</i> {post.destination}</span>
                </div>
                <IconButton label="More post actions"><MoreHorizontal size={18} /></IconButton>
              </div>
              <div className="post-body">
                <Badge tone="blue">{post.tripName}</Badge>
                <p>{post.body}</p>
              </div>
              <SafeImage src={post.image} alt={`Travel moment from ${post.destination}`} className="post-image" />
              <div className="post-actions">
                <button className={post.liked ? 'liked' : ''} onClick={() => toggleLike(post.id)}>
                  <Heart size={17} fill={post.liked ? 'currentColor' : 'none'} /> {post.likes}
                </button>
                <button onClick={() => addToast('Comments coming soon!', 'info')}>
                  <MessageCircle size={17} /> {post.comments}
                </button>
                <button onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('Post link copied.', 'success');
                }}>
                  <Share2 size={17} /> Share
                </button>
                <button className="save-action" onClick={() => addToast('Saved to your collection.', 'success')}>
                  <Bookmark size={17} />
                </button>
              </div>
            </article>
          ))}
        </main>

        <aside className="community-aside">
          <div className="card community-cta">
            <span className="eyebrow light">Your turn</span>
            <h2>Every trip has a story worth sharing.</h2>
            <p>Share a favorite moment, a hidden gem, or the view you can’t stop thinking about.</p>
            <button className="button button-light" onClick={() => setModalOpen(true)}>
              Share a story <Plus size={15} />
            </button>
          </div>

          <div className="card community-people">
            <div className="section-heading">
              <h3>People to follow</h3>
              <button className="text-link">See all</button>
            </div>
            {posts.slice(0, 3).map((post) => (
              <div className="person-row" key={post.user}>
                <SafeImage src={post.avatar} alt="" />
                <span>
                  <strong>{post.user}</strong>
                  <small>{post.destination}</small>
                </span>
                <button onClick={() => addToast(`Following ${post.user}`, 'success')}>Follow</button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Share Story Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Share Your Travel Story</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleShareStory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Destination *</label>
                <input
                  required
                  placeholder="e.g. Kyoto, Japan"
                  value={storyForm.destination}
                  onChange={(e) => setStoryForm({ ...storyForm, destination: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Story Title / Trip Name</label>
                <input
                  placeholder="e.g. Morning Walk in Arashiyama"
                  value={storyForm.tripName}
                  onChange={(e) => setStoryForm({ ...storyForm, tripName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Story Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell the community what made this moment unforgettable..."
                  value={storyForm.body}
                  onChange={(e) => setStoryForm({ ...storyForm, body: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Photo Image URL</label>
                <input
                  placeholder="Paste image URL or use default"
                  value={storyForm.image}
                  onChange={(e) => setStoryForm({ ...storyForm, image: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit">Publish Story</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
