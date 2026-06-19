import { getBanks } from './banks';

const STORAGE_KEY = 'signa_banks_cache';

export const getCachedBanks = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
};

export const cacheBankList = (banks) => {
    try {
        const slim = banks.map((b) => ({ id: b.id, name: b.name }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch (err) {
    }
};

export const loadBankOptions = async ({ forceRefresh = false } = {}) => {
    if (!forceRefresh) {
        const cached = getCachedBanks();
        if (cached.length > 0) return cached;
    }

    const { data } = await getBanks();
    const banks = Array.isArray(data) ? data : data?.content || [];
    cacheBankList(banks);
    return banks.map((b) => ({ id: b.id, name: b.name }));
};