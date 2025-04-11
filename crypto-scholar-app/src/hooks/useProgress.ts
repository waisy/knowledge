'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cryptoScholarProgress';

// New data structure for progress
interface PageProgress {
  pageCompleted: boolean;
  completedSections: Set<string>; 
}

type ProgressMap = Record<string, PageProgress>;

// Helper to get stored data
const getStoredProgress = (): ProgressMap => {
  if (typeof window === 'undefined') return {};
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      if (typeof parsed === 'object' && parsed !== null) {
        // Reconstruct Sets from arrays
        const progressMap: ProgressMap = {};
        for (const slug in parsed) {
          if (Object.prototype.hasOwnProperty.call(parsed, slug)) {
            const pageData = parsed[slug];
            progressMap[slug] = {
              pageCompleted: pageData.pageCompleted === true,
              completedSections: new Set(Array.isArray(pageData.completedSections) ? pageData.completedSections : []),
            };
          }
        }
        return progressMap;
      }
    }
  } catch (error) {
    console.error("Error reading progress from localStorage:", error);
  }
  return {};
};

// Helper to set stored data
const setStoredProgress = (progress: ProgressMap) => {
  if (typeof window === 'undefined') return;
  try {
    // Convert Sets to arrays for JSON serialization
    const serializableProgress: Record<string, { pageCompleted: boolean; completedSections: string[] }> = {};
    for (const slug in progress) {
      if (Object.prototype.hasOwnProperty.call(progress, slug)) {
        serializableProgress[slug] = {
          pageCompleted: progress[slug].pageCompleted,
          completedSections: Array.from(progress[slug].completedSections),
        };
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableProgress));
  } catch (error) {
    console.error("Error saving progress to localStorage:", error);
  }
};

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressMap>(() => ({}));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setProgress(getStoredProgress());
    setIsHydrated(true);
  }, []);

  // -- Page Level Completion --
  const isCompleted = useCallback(
    (slug: string): boolean => {
      return isHydrated ? progress[slug]?.pageCompleted ?? false : false;
    },
    [progress, isHydrated]
  );

  const toggleCompleted = useCallback(
    (slug: string) => {
      setProgress((prevProgress) => {
        const newProgress = { ...prevProgress };
        const currentPage = newProgress[slug] || { pageCompleted: false, completedSections: new Set() };
        newProgress[slug] = { ...currentPage, pageCompleted: !currentPage.pageCompleted };
        setStoredProgress(newProgress);
        return newProgress;
      });
    },
    []
  );

  // -- Section Level Completion --
  const isSectionCompleted = useCallback(
    (slug: string, sectionId: string): boolean => {
       return isHydrated ? progress[slug]?.completedSections?.has(sectionId) ?? false : false;
    },
    [progress, isHydrated]
  );

  const toggleSectionCompleted = useCallback(
    (slug: string, sectionId: string) => {
      setProgress((prevProgress) => {
        const newProgress = { ...prevProgress };
        const currentPage = newProgress[slug] || { pageCompleted: false, completedSections: new Set() };
        const newSections = new Set(currentPage.completedSections);
        
        if (newSections.has(sectionId)) {
          newSections.delete(sectionId);
        } else {
          newSections.add(sectionId);
        }

        newProgress[slug] = { ...currentPage, completedSections: newSections };
        // Optionally, update pageCompleted status based on sections?
        // For now, keep them independent.
        
        setStoredProgress(newProgress);
        return newProgress;
      });
    },
    []
  );

  return { 
    isCompleted, 
    toggleCompleted, 
    isSectionCompleted, 
    toggleSectionCompleted, 
    // completedSlugs: progress, // Maybe rename later if needed
    isHydrated 
  };
}; 