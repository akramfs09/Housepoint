import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_WEBSITE_CONTENT } from '../data/defaultWebsiteContent';
import { fetchWebsiteContent } from '../services/api';

const mergeContent = (content) => {
    const branding = { ...DEFAULT_WEBSITE_CONTENT.branding, ...(content?.branding || {}) };
    const hero = { ...DEFAULT_WEBSITE_CONTENT.hero, ...(content?.hero || {}) };
    const heroImages = Array.isArray(hero.images) ? hero.images.filter((image) => image.image_url) : [];

    return {
        branding: {
            ...branding,
            header_logo_url: branding.header_logo_url || DEFAULT_WEBSITE_CONTENT.branding.header_logo_url,
            footer_logo_url: branding.footer_logo_url || DEFAULT_WEBSITE_CONTENT.branding.footer_logo_url,
            auth_logo_url: branding.auth_logo_url || DEFAULT_WEBSITE_CONTENT.branding.auth_logo_url,
        },
        hero: {
            ...hero,
            images: heroImages,
            image_url: hero.image_url || heroImages[0]?.image_url || null,
            alt_text: hero.alt_text || DEFAULT_WEBSITE_CONTENT.hero.alt_text,
        },
        footer: { ...DEFAULT_WEBSITE_CONTENT.footer, ...(content?.footer || {}) },
        about: {
            ...DEFAULT_WEBSITE_CONTENT.about,
            ...(content?.about || {}),
            about_logo_url: content?.about?.about_logo_url || null,
        },
        contact: { ...DEFAULT_WEBSITE_CONTENT.contact, ...(content?.contact || {}) },
    };
};

const WebsiteContentContext = createContext(null);

export const WebsiteContentProvider = ({ children }) => {
    const [content, setContent] = useState(DEFAULT_WEBSITE_CONTENT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const { data } = await fetchWebsiteContent();
                if (active) {
                    setContent(mergeContent(data.data));
                }
            } catch {
                if (active) {
                    setContent(DEFAULT_WEBSITE_CONTENT);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();

        const handleContentUpdate = async () => {
            try {
                const { data } = await fetchWebsiteContent();
                if (active) {
                    setContent(mergeContent(data.data));
                }
            } catch {
                if (active) {
                    setContent(DEFAULT_WEBSITE_CONTENT);
                }
            }
        };

        window.addEventListener('website-content-updated', handleContentUpdate);

        return () => {
            active = false;
            window.removeEventListener('website-content-updated', handleContentUpdate);
        };
    }, []);

    const value = useMemo(() => ({ content, loading }), [content, loading]);

    return createElement(WebsiteContentContext.Provider, { value }, children);
};

export const useWebsiteContent = () => {
    const context = useContext(WebsiteContentContext);

    if (context) {
        return context;
    }

    const [content, setContent] = useState(DEFAULT_WEBSITE_CONTENT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const { data } = await fetchWebsiteContent();
                if (active) {
                    setContent(mergeContent(data.data));
                }
            } catch {
                if (active) {
                    setContent(DEFAULT_WEBSITE_CONTENT);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();

        const handleContentUpdate = async () => {
            try {
                const { data } = await fetchWebsiteContent();
                if (active) {
                    setContent(mergeContent(data.data));
                }
            } catch {
                if (active) {
                    setContent(DEFAULT_WEBSITE_CONTENT);
                }
            }
        };

        window.addEventListener('website-content-updated', handleContentUpdate);

        return () => {
            active = false;
            window.removeEventListener('website-content-updated', handleContentUpdate);
        };
    }, []);

    return { content, loading };
};
