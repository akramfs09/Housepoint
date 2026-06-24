import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import echo from '../../echo';
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
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    if (isSameCalendarDay(now, date))
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameCalendarDay(yesterday, date)) return 'Kemarin';
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays < 7)
        return date.toLocaleDateString('id-ID', { weekday: 'long' });
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const groupMessagesByDate = (messages) => {
    const groups = [];
    let lastDateStr = null;
    messages.forEach((msg) => {
        const dateStr = new Date(msg.created_at).toDateString();
        if (dateStr !== lastDateStr) {
            groups.push({
                type: 'date',
                label: getDateLabel(msg.created_at),
                id: `date-${msg.id}`,
            });
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

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State pencarian input (lokal, berubah per huruf)
    const [search, setSearch] = useState('');
    // State pencarian hasil akhir (hanya berubah setelah user berhenti mengetik)
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const [filter, setFilter] = useState('all'); 
    const [stats, setStats] = useState({ total: 0, unread: 0, archived: 0 });
    const [openMenuId, setOpenMenuId] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const chatContainerRef = useRef(null);
    const isUserAtBottom = useRef(true);
    const activeConvIdRef = useRef(null);
    const loadingMoreRef = useRef(false);
    const prevScrollHeightRef = useRef(0);
    const textareaRef = useRef(null);

    // Refs untuk kebutuhan sinkronisasi event WebSocket tanpa re-binding effect
    const filterRef = useRef(filter);
    const debouncedSearchRef = useRef(debouncedSearch);
    
    useEffect(() => { filterRef.current = filter; }, [filter]);
    useEffect(() => { debouncedSearchRef.current = debouncedSearch; }, [debouncedSearch]);

    // Debounce Mechanism
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 600); // Jeda 600ms setelah ketikan terakhir selesai
        return () => clearTimeout(handler);
    }, [search]);

    // Scroll helpers
    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop =
                        chatContainerRef.current.scrollHeight;
                    isUserAtBottom.current = true;
                }
            });
        });
    }, []);

    const updateIsAtBottom = useCallback(() => {
        const el = chatContainerRef.current;
        if (!el) return;
        isUserAtBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    }, []);

    // loadConversations murni menerima parameter (Bebas Dependensi State Luar)
    const loadConversations = useCallback(async (currentSearch = '', currentFilter = 'all', showGlobalLoader = false) => {
        if (showGlobalLoader) setLoading(true);
        try {
            const params = {};
            if (currentFilter === 'archived') params.archived = true;
            if (currentSearch.trim()) params.search = currentSearch;
            
            const { data } = await api.get('/chat/conversations', { params });
            setConversations(data.conversations || []);
            setStats(data.stats || { total: 0, unread: 0, archived: 0 });
        } catch (err) {
            console.error(err);
        } finally {
            if (showGlobalLoader) setLoading(false);
        }
    }, []);

    // Trigger Fetch HANYA saat DebouncedSearch atau Filter berubah nyata
    useEffect(() => {
        loadConversations(debouncedSearch, filter, true);
    }, [debouncedSearch, filter, loadConversations]);

    // Open conversation from URL param
    useEffect(() => {
        if (loading || !convIdFromUrl) return;
        const targetConv = conversations.find(
            (c) => c.id === parseInt(convIdFromUrl, 10)
        );
        if (targetConv) {
            openConversation(targetConv);
            setSearchParams({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, convIdFromUrl]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('[data-dropdown]')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Open conversation
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

            let messageList = Array.isArray(data.data) ? data.data : data || [];
            messageList = [...messageList].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
            setMessages(messageList);
            setNextPageUrl(data.next_page_url || null);

            api.patch(`/chat/conversations/${conv.id}/read`).catch(() => {});

            setConversations((prev) =>
                prev.map((c) =>
                    c.id === conv.id ? { ...c, unread_count: 0 } : c
                )
            );

            // Silently dapatkan stats terbaru
            api.get('/chat/conversations', {
                params: { archived: filterRef.current === 'archived' },
            }).then(({ data }) => {
                setStats(data.stats || { total: 0, unread: 0, archived: 0 });
            }).catch(() => {});

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
    }, [scrollToBottom]);

    // Infinite scroll: load older messages
    const loadOlderMessages = useCallback(async () => {
        if (!nextPageUrl || loadingMoreRef.current) return;

        loadingMoreRef.current = true;
        setLoadingMore(true);
        prevScrollHeightRef.current = chatContainerRef.current?.scrollHeight ?? 0;

        try {
            const { data } = await api.get(nextPageUrl);
            const older = Array.isArray(data.data) ? data.data : data || [];
            setMessages((prev) =>
                [...older, ...prev].sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                )
            );
            setNextPageUrl(data.next_page_url || null);

            requestAnimationFrame(() => {
                if (chatContainerRef.current) {
                    const added =
                        chatContainerRef.current.scrollHeight -
                        prevScrollHeightRef.current;
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

    // Scroll event handler
    const handleScroll = useCallback(() => {
        updateIsAtBottom();
        const el = chatContainerRef.current;
        if (el && el.scrollTop <= 60 && nextPageUrl && !loadingMoreRef.current) {
            loadOlderMessages();
        }
    }, [nextPageUrl, loadOlderMessages, updateIsAtBottom]);

    // WebSocket: per-conversation channel
    useEffect(() => {
        if (!activeConversation) return;

        const channel = echo.private(`chat.${activeConversation.id}`);

        channel.listen('.message.sent', (msg) => {
            if (msg.user_id === user?.id) return;

            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg].sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
            });

            setConversations((prev) =>
                prev.map((c) =>
                    c.id === msg.conversation_id
                        ? {
                              ...c,
                              latest_message: {
                                  id: msg.id,
                                  body: msg.body,
                                  created_at: msg.created_at,
                              },
                          }
                        : c
                )
            );

            if (document.hidden) toast.success(`Pesan baru dari ${msg.user_name}`);

            api.patch(`/chat/conversations/${activeConversation.id}/read`).catch(() => {});

            if (isUserAtBottom.current) scrollToBottom();
        });

        channel.listen('.message.read', (evt) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === evt.message_id ? { ...m, read_at: evt.read_at } : m
                )
            );
        });

        return () => {
            echo.leaveChannel(`chat.${activeConversation.id}`);
        };
    }, [activeConversation, user?.id, scrollToBottom]);

    // WebSocket: global new-message notification
    useEffect(() => {
        if (!user) return;

        const userChannel = echo.private(`user.${user.id}`);
        userChannel.listen('.new.message', () => {
            loadConversations(debouncedSearchRef.current, filterRef.current, false);
        });

        return () => {
            echo.leaveChannel(`user.${user.id}`);
        };
    }, [user, loadConversations]);

    // Send message
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
            setMessages((prev) => {
                if (prev.some((m) => m.id === data.id)) return prev;
                return [...prev, data].sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
            });

            scrollToBottom();

            setConversations((prev) =>
                prev.map((c) =>
                    c.id === activeConversation.id
                        ? {
                              ...c,
                              latest_message: {
                                  id: data.id,
                                  body: data.body,
                                  created_at: data.created_at,
                              },
                          }
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
            loadConversations(debouncedSearch, filter, false);
        } catch {
            toast.error('Gagal mengarsipkan.');
        }
    };

    const unarchiveConversation = async (convId) => {
        try {
            await api.patch(`/chat/conversations/${convId}/unarchive`);
            setOpenMenuId(null);
            loadConversations(debouncedSearch, filter, false);
        } catch {
            toast.error('Gagal membatalkan arsip.');
        }
    };

    const filteredConversations = useMemo(() => {
        if (filter === 'all') return conversations;
        if (filter === 'unread') return conversations.filter((c) => c.unread_count > 0);
        if (filter === 'archived') return conversations.filter((c) => c.archived === true);
        return conversations;
    }, [conversations, filter]);

    const groupedMessages = useMemo(
        () => groupMessagesByDate(messages),
        [messages]
    );

    // Tampilan Loading Awal Saja (Supaya ngetik search tidak memicu layar putih ini)
    if (loading && conversations.length === 0 && search === '') {
        return (
            <div className="flex items-center justify-center h-[300px] w-full text-gray-500 font-medium">
                Memuat percakapan...
            </div>
        );
    }

    const hasNoConversations = filteredConversations.length === 0;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-transparent p-6 w-full max-w-5xl mx-auto overflow-hidden">
            

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 flex-shrink-0">
                <button
                    onClick={() => setFilter('all')}
                    className={`bg-white rounded-xl py-4 px-6 flex items-center gap-4 text-left shadow-sm border transition-all duration-200 hover:shadow-md ${
                        filter === 'all' ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'border-gray-100 hover:border-[#C5A065]'
                    }`}
                >
                    <div className="w-10 h-10 rounded-full bg-[#FDF9F2] flex items-center justify-center text-[#C5A065] flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total Percakapan</div>
                        <div className="text-xl font-bold text-gray-900 leading-none">{stats.total}</div>
                    </div>
                </button>

                <button
                    onClick={() => setFilter('unread')}
                    className={`bg-white rounded-xl py-4 px-6 flex items-center gap-4 text-left shadow-sm border transition-all duration-200 hover:shadow-md ${
                        filter === 'unread' ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'border-gray-100 hover:border-[#C5A065]'
                    }`}
                >
                    <div className="w-10 h-10 rounded-full bg-[#FDF9F2] flex items-center justify-center text-[#C5A065] flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Belum Dibaca</div>
                        <div className="text-xl font-bold text-gray-900 leading-none">{stats.unread}</div>
                    </div>
                </button>

                <button
                    onClick={() => setFilter('archived')}
                    className={`bg-white rounded-xl py-4 px-6 flex items-center gap-4 text-left shadow-sm border transition-all duration-200 hover:shadow-md ${
                        filter === 'archived' ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'border-gray-100 hover:border-[#C5A065]'
                    }`}
                >
                    <div className="w-10 h-10 rounded-full bg-[#FDF9F2] flex items-center justify-center text-[#C5A065] flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Arsip</div>
                        <div className="text-xl font-bold text-gray-900 leading-none">{stats.archived}</div>
                    </div>
                </button>
            </div>

            {/* Search Bar Input */}
            <div className="mb-6 flex-shrink-0 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama agen atau properti..."
                    className="w-full border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#C5A065] focus:border-[#C5A065] transition-all placeholder-gray-400"
                />
                {loading && search !== debouncedSearch && (
                    <span className="absolute inset-y-0 right-4 flex items-center text-xs text-gray-400">
                        Mengetik...
                    </span>
                )}
            </div>

            {/* Chat Layout Container */}
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0 h-full w-full">
                
                {/* KIRI: Daftar Percakapan */}
                <div
                    className={`flex flex-col overflow-y-auto h-full space-y-4 pr-1 transition-all duration-300 ${
                        activeConversation ? 'w-[40%] border-r border-gray-100 pr-4' : 'w-full'
                    }`}
                >
                    {hasNoConversations ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full text-gray-400 p-6">
                            <p className="text-5xl mb-3">💬</p>
                            <p className="text-base font-bold mb-1 text-gray-700">
                                {filter === 'all' ? 'Belum ada percakapan' : filter === 'unread' ? 'Tidak ada pesan belum dibaca' : 'Tidak ada arsip'}
                            </p>
                            <p className="text-xs text-center text-gray-400 max-w-sm">
                                {filter === 'all' && 'Mulai percakapan dengan agen properti dari halaman detail properti.'}
                                {filter === 'unread' && 'Semua pesan sudah selesai dibaca.'}
                                {filter === 'archived' && 'Belum ada riwayat percakapan yang diarsipkan.'}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const isActive = activeConversation?.id === conv.id;
                            const isUnread = conv.unread_count > 0;
                            
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => openConversation(conv)}
                                    className={`bg-white p-4 rounded-2xl shadow-sm border cursor-pointer relative transition-all duration-150 flex gap-4 items-center flex-shrink-0 ${
                                        isActive || isUnread ? 'border-transparent shadow-md' : 'border-gray-100 hover:shadow-md'
                                    }`}
                                >
                                    {(isActive || isUnread) && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C5A065] rounded-l-2xl" />
                                    )}

                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-base">
                                        {conv.other_user?.avatar_url ? (
                                            <img src={conv.other_user.avatar_url} alt={conv.other_user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#C5A065] flex items-center justify-center">
                                                {conv.other_user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-bold text-gray-800'}`}>
                                            {conv.other_user?.name || 'User'}
                                        </h3>

                                        {conv.property && (
                                            <div className="text-[10px] text-[#C5A065] font-semibold flex items-center gap-1 mt-0.5 mb-0.5">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                </svg>
                                                <span className="truncate">{conv.property.title}</span>
                                            </div>
                                        )}

                                        <p className={`text-xs truncate ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                            {conv.latest_message?.body || 'Belum ada pesan.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0" data-dropdown>
                                        <div className="flex items-center gap-2">
                                            {conv.latest_message && (
                                                <span className="text-[10px] text-gray-400">
                                                    {formatTime(conv.latest_message.created_at)}
                                                </span>
                                            )}
                                            
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                                                }}
                                                className="text-gray-400 hover:text-gray-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <div className="mt-auto pt-1 h-5">
                                            {isUnread && (
                                                <span className="bg-[#C5A065] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm ml-auto">
                                                    {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                                </span>
                                            )}
                                        </div>

                                        {openMenuId === conv.id && (
                                            <div className="absolute right-4 top-10 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 min-w-[130px]" style={{ zIndex: 50 }}>
                                                {conv.archived ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); unarchiveConversation(conv.id); }}
                                                        className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        📤 Keluar Arsip
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); archiveConversation(conv.id); }}
                                                        className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        📥 Masuk Arsip
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* KANAN: Jendela Room Obrolan Aktif */}
                {activeConversation && (
                    <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full">
                        {/* Header Box */}
                        <div className="border-b border-gray-100 p-4 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h2 className="font-bold text-gray-800 text-base">{activeConversation.other_user?.name}</h2>
                                {activeConversation.property && (
                                    <p className="text-xs text-gray-400 truncate max-w-xs">Properti: {activeConversation.property.title}</p>
                                )}
                            </div>
                            <button onClick={() => setActiveConversation(null)} className="text-xs bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 px-2.5 py-1.5 rounded-lg transition-all">
                                Tutup Chat
                            </button>
                        </div>
                        
                        {/* Area Isi Pesan Bubble Chat */}
                        <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
                            {loadingMessages ? (
                                <div className="text-center text-xs text-gray-400 py-10">Memuat pesan...</div>
                            ) : (
                                groupedMessages.map((item) => {
                                    if (item.type === 'date') {
                                        return <div key={item.id} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider my-4">{item.label}</div>;
                                    }
                                    const fromMe = item.user_id === user?.id;
                                    return (
                                        <div key={item.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${fromMe ? 'bg-[#C5A065] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                                <p className="whitespace-pre-wrap break-words leading-relaxed">{item.body}</p>
                                                <span className={`block text-[9px] text-right mt-1 font-medium ${fromMe ? 'text-gray-200' : 'text-gray-400'}`}>
                                                    {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Box Kirim Pesan */}
                        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                            <div className="flex gap-2 items-end">
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={newMessage}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] resize-none max-h-28 overflow-y-auto bg-gray-50"
                                />
                                <button onClick={sendMessage} className="bg-[#C5A065] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#b08e54] transition-all shadow-sm flex-shrink-0 h-[46px]">
                                    Kirim
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}