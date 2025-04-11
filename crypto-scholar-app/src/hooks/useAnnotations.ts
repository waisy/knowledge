'use client';

import { useState, useEffect, useCallback } from 'react';

// Define the structure for a single annotation
export interface Annotation {
  id: string; // Unique ID for the annotation
  text: string; // The highlighted text content
  contextBefore?: string; // A few characters before the highlight to determine its position
  contextAfter?: string; // A few characters after the highlight to determine its position
}

// Define the structure for storing annotations per slug
export type AnnotationsMap = Record<string, Annotation[]>;

const STORAGE_KEY = 'cryptoScholarAnnotations';

// Helper function to safely get annotations from localStorage
const getStoredAnnotations = (): AnnotationsMap => {
  if (typeof window === 'undefined') {
    return {}; // Return empty object during SSR
  }
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      // Basic validation: ensure it's an object
      if (typeof parsed === 'object' && parsed !== null) {
        // Further validation could check structure per slug
        return parsed as AnnotationsMap;
      }
    }
  } catch (error) {
    console.error("Error reading annotations from localStorage:", error);
  }
  return {}; // Return empty object if error or no data
};

// Helper function to safely set annotations in localStorage
const setStoredAnnotations = (annotations: AnnotationsMap) => {
  if (typeof window === 'undefined') {
    return; // Don't run on server
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  } catch (error) {
    console.error("Error saving annotations to localStorage:", error);
  }
};

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState<AnnotationsMap>(() => ({}));
  const [isHydrated, setIsHydrated] = useState(false);

  // Load annotations from localStorage on mount
  useEffect(() => {
    setAnnotations(getStoredAnnotations());
    setIsHydrated(true);
  }, []);

  // Get annotations for a specific slug
  const getAnnotationsForSlug = useCallback(
    (slug: string): Annotation[] => {
      return isHydrated ? annotations[slug] || [] : [];
    },
    [annotations, isHydrated]
  );

  // Add a new annotation for a specific slug
  const addAnnotation = useCallback(
    (slug: string, text: string, contextBefore?: string, contextAfter?: string) => {
      if (!text) return;

      const newAnnotation: Annotation = {
        id: crypto.randomUUID(), // Simple unique ID
        text: text,
        contextBefore,
        contextAfter,
      };

      setAnnotations((prevAnnotations) => {
        const updatedAnnotations = { ...prevAnnotations };
        const slugAnnotations = updatedAnnotations[slug] || [];
        // Avoid adding exact duplicates (same text and context)
        if (!slugAnnotations.some(ann => 
          ann.text === text && 
          ann.contextBefore === contextBefore && 
          ann.contextAfter === contextAfter
        )) {
          updatedAnnotations[slug] = [...slugAnnotations, newAnnotation];
          setStoredAnnotations(updatedAnnotations); // Save to localStorage
          return updatedAnnotations;
        }
        return prevAnnotations; // Return previous state if duplicate
      });
    },
    []
  );

  // Remove an annotation by its ID for a specific slug
  const removeAnnotation = useCallback(
    (slug: string, annotationId: string) => {
      setAnnotations((prevAnnotations) => {
        const updatedAnnotations = { ...prevAnnotations };
        const slugAnnotations = updatedAnnotations[slug] || [];
        const filteredAnnotations = slugAnnotations.filter(ann => ann.id !== annotationId);

        if (filteredAnnotations.length < slugAnnotations.length) {
          updatedAnnotations[slug] = filteredAnnotations;
          // If no annotations left for the slug, remove the key
          if (filteredAnnotations.length === 0) {
            delete updatedAnnotations[slug];
          }
          setStoredAnnotations(updatedAnnotations);
          return updatedAnnotations;
        }
        return prevAnnotations; // Return previous state if ID not found
      });
    },
    []
  );

  return {
    annotations,
    isHydrated,
    getAnnotationsForSlug,
    addAnnotation,
    removeAnnotation,
  };
}; 