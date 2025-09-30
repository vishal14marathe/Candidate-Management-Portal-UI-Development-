// hooks/useNoCopyPaste.js
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useNoCopyPaste = () => {
    const handlePaste = useCallback((e) => {
        e.preventDefault();
        toast.error("Pasting is not allowed in this field");
        return false;
    }, []);

    const handleCopy = useCallback((e) => {
        e.preventDefault();
        toast.error("Copying is not allowed from this field");
        return false;
    }, []);

    const handleCut = useCallback((e) => {
        e.preventDefault();
        toast.error("Cutting is not allowed from this field");
        return false;
    }, []);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        return false;
    }, []);

    return {
        handlePaste,
        handleCopy,
        handleCut,
        handleContextMenu
    };
};