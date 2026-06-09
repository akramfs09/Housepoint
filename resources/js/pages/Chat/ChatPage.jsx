import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import echo from '../../echo';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

// ─── Date Helpers ────────────────────────────────────────────────────────────

const isSameCalendarDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

const getDateLabel = (dateStr) => {
    const msgDate = new Date(dateStr);
    const now = new Date();
    if (isSameCalendarDay(now, msgDate)) return 'Hari ini';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameCalendarDay(yesterday, msgDate)) return 'Kemarin';
    return msgDate.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    if (isSameCalendarDay(now, date))
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameCalendarDay(yesterday, date)) return 'Kemarin';
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays < 7) return date.toLocaleDateString('id-ID', { weekday: 'long' });
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const groupMessagesByDate = (messages) => {
    const groups = [];
    let lastDateStr = null;
    messages.forEach((msg) => {
        const dateStr = new Date(msg.created_at).toDateString();
        if (dateStr !== lastDateStr) {
            groups.push({ type: 'date', label: getDateLabel(msg.created_at), id: `date-${msg.id}` });
            lastDateStr = dateStr;
        }
        groups.push({ type: 'message', ...msg });
    });
    return groups;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const convIdFromUrl = searchParams.get('conversation');

    const [conversations, setConversations]         = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages]                   = useState([]);
    const [newMessage, setNewMessage]               = useState('');
    const [loading, setLoading]                     = useState(true);
    const [search, setSearch]                       = useState('');
    const [debouncedSearch, setDebouncedSearch]     = useState('');
    const [tab, setTab]                             = useState('chat');
    const [stats, setStats]                         = useState({ total: 0, unread: 0, archived: 0 });
    const [openMenuId, setOpenMenuId]               = useState(null);
    const [loadingMessages, setLoadingMessages]     = useState(false);
    const [nextPageUrl, setNextPageUrl]             = useState(null);
    const [loadingMore, setLoadingMore]             = useState(false);

    const [isLoadingArchive, setIsLoadingArchive] = useState(false);

    const chatContainerRef      = useRef(null);
    const isUserAtBottom        = useRef(true);
    const activeConvIdRef       = useRef(null);
    const loadingMoreRef        = useRef(false);
    const prevScrollHeightRef   = useRef(0);
    const textareaRef           = useRef(null);

    // 🆕 Refs untuk nilai terbaru tab & debouncedSearch agar listener global tidak usang
    const tabRef = useRef(tab);
    const debouncedSearchRef = useRef(debouncedSearch);
    useEffect(() => { tabRef.current = tab; }, [tab]);
    useEffect(() => { debouncedSearchRef.current = debouncedSearch; }, [debouncedSearch]);

    // ── Debounce search ────────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // ── Scroll helpers ─────────────────────────────────────────────────────
    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    isUserAtBottom.current = true;
                }
            });
        });
    }, []);

    const updateIsAtBottom = useCallback(() => {
        const el = chatContainerRef.current;
        if (!el) return;
        isUserAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    }, []);

    // ── Load conversations ─────────────────────────────────────────────────
    const loadConversations = useCallback(async (
        searchValue = debouncedSearch,
        currentTab  = tab,
        showGlobalLoader = true
    ) => {
        try {
            const params = { archived: currentTab === 'archive' };
            if (searchValue) params.search = searchValue;
            const { data } = await api.get('/chat/conversations', { params });
            setConversations(data.conversations || []);
            setStats(data.stats || { total: 0, unread: 0, archived: 0 });
        } catch {
            // silent
        } finally {
            if (showGlobalLoader) {
                setLoading(false);
                setIsLoadingArchive(false);
            }
        }
    }, [debouncedSearch, tab]);

    useEffect(() => {
        setLoading(true);
        setIsLoadingArchive(tab === 'archive');
        loadConversations(debouncedSearch, tab, true);
    }, [debouncedSearch, tab]);

    // ── Open conversation from URL param ───────────────────────────────────
    useEffect(() => {
        if (loading || !convIdFromUrl) return;
        const targetConv = conversations.find(c => c.id === parseInt(convIdFromUrl, 10));
        if (targetConv) {
            openConversation(targetConv);
            setSearchParams({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, convIdFromUrl, conversations]);

    // ── Close dropdown on outside click ───────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('[data-dropdown]')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Open conversation ──────────────────────────────────────────────────
    const openConversation = useCallback(async (conv) => {
        activeConvIdRef.current = conv.id;

        setActiveConversation(conv);
        setOpenMenuId(null);
        setLoadingMessages(true);
        setMessages([]);
        setNextPageUrl(null);

        try {
            const { data } = await api.get(`/chat/conversations/${conv.id}/messages`);
            if (activeConvIdRef.current !== conv.id) return;

            let messageList = Array.isArray(data.data) ? data.data : (data || []);
            messageList = [...messageList].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
            setMessages(messageList);
            setNextPageUrl(data.next_page_url || null);

            api.patch(`/chat/conversations/${conv.id}/read`).catch(() => {});
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
            );

            // Refresh sidebar after opening conversation
            await api.get('/chat/conversations', { params: { archived: tab === 'archive' } })
                .then(({ data }) => {
                    setConversations(data.conversations || []);
                    setStats(data.stats || { total: 0, unread: 0, archived: 0 });
                })
                .catch(() => {});

            scrollToBottom();
        } catch (err) {
            if (activeConvIdRef.current === conv.id) {
                toast.error('Gagal memuat pesan.');
            }
        } finally {
            if (activeConvIdRef.current === conv.id) {
                setLoadingMessages(false);
            }
        }
    }, [tab, scrollToBottom]);

    // ── Infinite scroll: load older messages ──────────────────────────────
    const loadOlderMessages = useCallback(async () => {
        if (!nextPageUrl || loadingMoreRef.current) return;

        loadingMoreRef.current = true;
        setLoadingMore(true);
        prevScrollHeightRef.current = chatContainerRef.current?.scrollHeight ?? 0;

        try {
            const { data } = await api.get(nextPageUrl);
            const older = Array.isArray(data.data) ? data.data : (data || []);
            setMessages(prev =>
                [...older, ...prev].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            );
            setNextPageUrl(data.next_page_url || null);

            requestAnimationFrame(() => {
                if (chatContainerRef.current) {
                    const added = chatContainerRef.current.scrollHeight - prevScrollHeightRef.current;
                    chatContainerRef.current.scrollTop = added;
                }
            });
        } catch {
            toast.error('Gagal memuat pesan lama.');
        } finally {
            setLoadingMore(false);
            loadingMoreRef.current = false;
        }
    }, [nextPageUrl]);

    // ── Scroll event handler ───────────────────────────────────────────────
    const handleScroll = useCallback(() => {
        updateIsAtBottom();
        const el = chatContainerRef.current;
        if (el && el.scrollTop <= 60 && nextPageUrl && !loadingMoreRef.current) {
            loadOlderMessages();
        }
    }, [nextPageUrl, loadOlderMessages, updateIsAtBottom]);

    // ── WebSocket: per-conversation channel ───────────────────────────────
    useEffect(() => {
        if (!activeConversation) return;

        const channel = echo.private(`chat.${activeConversation.id}`);

        channel.listen('.message.sent', (msg) => {
            if (msg.user_id === user?.id) return;

            setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });

            setConversations(prev =>
                prev.map(c =>
                    c.id === msg.conversation_id
                        ? { ...c, latest_message: { id: msg.id, body: msg.body, created_at: msg.created_at } }
                        : c
                )
            );

            if (document.hidden) toast.success(`Pesan baru dari ${msg.user_name}`);

            api.patch(`/chat/conversations/${activeConversation.id}/read`).catch(() => {});

            if (isUserAtBottom.current) scrollToBottom();
        });

        channel.listen('.message.read', (evt) => {
            setMessages(prev =>
                prev.map(m => m.id === evt.message_id ? { ...m, read_at: evt.read_at } : m)
            );
        });

        return () => {
            echo.leaveChannel(`chat.${activeConversation.id}`);
        };
    }, [activeConversation, user?.id, scrollToBottom]);

    // ── WebSocket: global new-message notification ─────────────────────────
    useEffect(() => {
        if (!user) return;

        const userChannel = echo.private(`user.${user.id}`);
        userChannel.listen('.new.message', () => {
            // Gunakan nilai terbaru dari ref, bukan state yang mungkin usang
            loadConversations(debouncedSearchRef.current, tabRef.current, false);
        });

        return () => {
            echo.leaveChannel(`user.${user.id}`);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // ── Send message ───────────────────────────────────────────────────────
    const sendMessage = async (e) => {
        e?.preventDefault();
        const body = newMessage.trim();
        if (!body || !activeConversation) return;

        setNewMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const { data } = await api.post(
                `/chat/conversations/${activeConversation.id}/messages`,
                { body }
            );
            setMessages(prev => {
                if (prev.some(m => m.id === data.id)) return prev;
                return [...prev, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });

            scrollToBottom();

            setConversations(prev =>
                prev.map(c =>
                    c.id === activeConversation.id
                        ? { ...c, latest_message: { id: data.id, body: data.body, created_at: data.created_at } }
                        : c
                )
            );
        } catch {
            setNewMessage(body);
            toast.error('Gagal mengirim pesan.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    const handleTextareaChange = (e) => {
        setNewMessage(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    const archiveConversation = async (convId) => {
        try {
            await api.patch(`/chat/conversations/${convId}/archive`);
            setOpenMenuId(null);
            if (activeConversation?.id === convId) {
                setActiveConversation(null);
                activeConvIdRef.current = null;
            }
            loadConversations();
        } catch {
            toast.error('Gagal mengarsipkan.');
        }
    };

    const unarchiveConversation = async (convId) => {
        try {
            await api.patch(`/chat/conversations/${convId}/unarchive`);
            setOpenMenuId(null);
            loadConversations();
        } catch {
            toast.error('Gagal membatalkan arsip.');
        }
    };

    const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#efe6d5]">
                <p className="text-gray-500">Memuat percakapan...</p>
            </div>
        );
    }

    const hasNoConversationsAtAll = conversations.length === 0 && tab === 'chat' && !debouncedSearch;

    return (
        <div className="h-screen flex flex-col bg-[#efe6d5] overflow-hidden">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col overflow-hidden">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-3 flex-shrink-0">
                    <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                        <div className="text-xl font-bold">{stats.total}</div>
                        <div className="text-xs text-gray-500 mt-1">Total Percakapan</div>
                    </div>
                    <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                        <div className="text-xl font-bold text-red-500">{stats.unread}</div>
                        <div className="text-xs text-gray-500 mt-1">Belum Dibaca</div>
                    </div>
                    <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                        <div className="text-xl font-bold">{stats.archived}</div>
                        <div className="text-xs text-gray-500 mt-1">Arsip</div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-3 flex-shrink-0">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="🔍 Cari nama agen atau properti..."
                        className="w-full border rounded-lg px-4 py-2 text-sm"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-3 flex-shrink-0">
                    <button
                        onClick={() => setTab('chat')}
                        className={`flex-1 py-2 text-sm font-medium ${tab === 'chat' ? 'text-[#C5A065] border-b-2 border-[#C5A065]' : 'text-gray-500'}`}
                    >
                        💬 Chat ({stats.total})
                    </button>
                    <button
                        onClick={() => setTab('archive')}
                        className={`flex-1 py-2 text-sm font-medium ${tab === 'archive' ? 'text-[#C5A065] border-b-2 border-[#C5A065]' : 'text-gray-500'}`}
                    >
                        🗂️ Arsip ({stats.archived})
                    </button>
                </div>

                {/* Main layout */}
                <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                    {/* ── Conversation List ── */}
                    <div className={`bg-white rounded-2xl shadow-md flex flex-col overflow-hidden transition-all duration-300 ${activeConversation ? 'w-[30%]' : 'w-full'}`}>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {hasNoConversationsAtAll ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                                    <p className="text-5xl mb-3">💬</p>
                                    <p className="text-base font-bold mb-1">Belum ada percakapan</p>
                                    <p className="text-xs text-center">Mulai percakapan dengan agen properti dari halaman detail properti.</p>
                                </div>
                            ) : isLoadingArchive ? (
                                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                                    Memperbarui arsip...
                                </div>
                            ) : conversations.length === 0 ? (
                                <p className="p-4 text-gray-400 text-sm text-center">Tidak ada percakapan di tab ini.</p>
                            ) : (
                                conversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => openConversation(conv)}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 relative ${activeConversation?.id === conv.id ? 'bg-[#faf7f0]' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#C5A065] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {conv.other_user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {conv.other_user?.name || 'User'}
                                                    </p>
                                                    {conv.latest_message && (
                                                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap flex-shrink-0">
                                                            {formatTime(conv.latest_message.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                {conv.property && (
                                                    <p className="text-xs text-gray-500 truncate">🏠 {conv.property.title}</p>
                                                )}
                                                <div className="flex justify-between items-center mt-0.5">
                                                    <p className={`text-xs truncate flex-1 ${conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                                        {conv.latest_message?.body || ''}
                                                    </p>
                                                    {conv.unread_count > 0 && (
                                                        <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center ml-2 flex-shrink-0">
                                                            {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute top-2 right-2"
                                            style={{ zIndex: 10 }}
                                            data-dropdown
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                                                }}
                                                className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                                            >
                                                ⋮
                                            </button>
                                            {openMenuId === conv.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[150px]" style={{ zIndex: 50 }}>
                                                    {tab === 'chat' ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); archiveConversation(conv.id); }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        >
                                                            📥 Masuk Arsip
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); unarchiveConversation(conv.id); }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        >
                                                            📤 Hapus dari Arsip
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Chat Window ── */}
                    {activeConversation ? (
                        <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col overflow-hidden min-w-0">
                            {/* Header */}
                            <div className="p-4 border-b flex items-center gap-3 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        setActiveConversation(null);
                                        activeConvIdRef.current = null;
                                    }}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                                    aria-label="Tutup percakapan"
                                >
                                    ←
                                </button>
                                <div className="w-10 h-10 rounded-full bg-[#C5A065] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {activeConversation.other_user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{activeConversation.other_user?.name || 'User'}</p>
                                    {activeConversation.property && (
                                        <p className="text-xs text-gray-500 truncate">🏠 {activeConversation.property.title}</p>
                                    )}
                                </div>

                                <div className="relative" data-dropdown>
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === 'header' ? null : 'header')}
                                        className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                                    >
                                        ⋮
                                    </button>
                                    {openMenuId === 'header' && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[150px]" style={{ zIndex: 50 }}>
                                            {tab === 'chat' ? (
                                                <button
                                                    onClick={() => archiveConversation(activeConversation.id)}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    📥 Masuk Arsip
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => unarchiveConversation(activeConversation.id)}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    📤 Hapus dari Arsip
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div
                                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
                                ref={chatContainerRef}
                                onScroll={handleScroll}
                            >
                                {loadingMore && (
                                    <div className="text-center text-gray-400 text-xs py-2">
                                        Memuat pesan lama...
                                    </div>
                                )}
                                {nextPageUrl && !loadingMore && (
                                    <div className="text-center">
                                        <button
                                            onClick={loadOlderMessages}
                                            className="text-xs text-[#C5A065] hover:underline py-1"
                                        >
                                            Muat pesan lebih lama
                                        </button>
                                    </div>
                                )}

                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400 text-sm">Memuat pesan...</p>
                                    </div>
                                ) : groupedMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <p className="text-3xl mb-2">👋</p>
                                        <p className="text-sm">Belum ada pesan. Mulai percakapan!</p>
                                    </div>
                                ) : (
                                    groupedMessages.map((item) => {
                                        if (item.type === 'date') {
                                            return (
                                                <div key={item.id} className="flex justify-center my-2">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        const isOwn = item.user_id === user?.id;
                                        return (
                                            <div key={item.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words ${isOwn ? 'bg-[#C5A065] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                                    <p className="whitespace-pre-wrap">{item.body}</p>
                                                    <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[10px] opacity-60">
                                                            {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isOwn && (
                                                            <span className={`text-[11px] ${item.read_at ? 'opacity-100' : 'opacity-60'}`}>
                                                                {item.read_at ? '✓✓' : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 items-end flex-shrink-0">
                                <textarea
                                    ref={textareaRef}
                                    value={newMessage}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ketik pesan… (Shift+Enter untuk baris baru)"
                                    className="flex-1 border rounded-xl px-4 py-2 text-sm resize-none leading-relaxed focus:outline-none focus:border-[#C5A065]"
                                    maxLength={2000}
                                    rows={1}
                                    style={{ maxHeight: '120px', overflowY: 'auto' }}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-[#C5A065] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#b8913a] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 self-end"
                                    style={{ height: '38px' }}
                                >
                                    ➤
                                </button>
                            </form>
                        </div>
                    ) : (
                        conversations.length > 0 && (
                            <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-center bg-white rounded-2xl shadow-md">
                                <div>
                                    <p className="text-4xl mb-3">💬</p>
                                    <p className="text-base font-bold mb-1 text-gray-600">Pesan Saya</p>
                                    <p className="text-sm">Komunikasi Anda dengan agen properti</p>
                                    <p className="text-xs mt-2 text-gray-300">← Pilih percakapan dari daftar</p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}