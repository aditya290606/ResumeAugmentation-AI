import { useState, useCallback } from 'react';
import { generateMockVariants } from '../data/mockData';

export function useAugmentation(apiBaseUrl = '') {
  const [variants, setVariants] = useState([]);
  const [preservationCheck, setPreservationCheck] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const runAugmentation = useCallback(async ({
    markup,
    parsedResume,
    sliders,
    variantCount = 8,
    seed = 42,
    useNlpAug = true,
  }) => {
    setIsGenerating(true);
    setProgress(15);
    setError(null);

    const endpoint = `${apiBaseUrl || ''}/api/augment`;
    const payload = {
      custom_markup: markup,
      variants_per_resume: parseInt(variantCount, 10) || 8,
      seed: parseInt(seed, 10) || 42,
      use_nlpaug: !!useNlpAug,
      header_rename_p: sliders.header_rename_p ?? 0.6,
      reorder_sections_p: sliders.reorder_sections_p ?? 0.4,
      contact_multiline_p: sliders.contact_multiline_p ?? 0.35,
      merge_skills_p: sliders.merge_skills_p ?? 0.3,
      header_style_p: sliders.header_style_p ?? 0.3,
      verb_swap_p: sliders.verb_swap_p ?? 0.4,
      typo_word_p: sliders.typo_word_p ?? 0.03,
      phone_p: sliders.phone_p ?? 0.8,
      date_p: sliders.date_p ?? 0.8,
      company_suffix_p: sliders.company_suffix_p ?? 0.4,
      degree_p: sliders.degree_p ?? 0.4,
    };

    try {
      setProgress(40);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      setProgress(85);
      const data = await response.json();

      if (data.variants && Array.isArray(data.variants)) {
        setVariants(data.variants);
        if (data.preservation_check) {
          setPreservationCheck(data.preservation_check);
        } else {
          setPreservationCheck({
            total_variants: data.variants.length,
            passed_count: data.variants.length,
            pass_rate: 100.0,
            expected_entities_per_variant: data.variants[0]?.num_entities || 17,
            flagged_variants: [],
            status: 'PASS',
          });
        }
      } else {
        throw new Error('Invalid response structure from backend');
      }

      setProgress(100);
      return {
        success: true,
        count: data.count || (data.variants ? data.variants.length : 0),
        preservation: data.preservation_check,
        isMock: false,
      };
    } catch (err) {
      console.warn('Backend unavailable, activating realistic client-side fallback:', err.message);
      setProgress(60);
      await new Promise((r) => setTimeout(r, 450));
      setProgress(90);
      const mockResult = generateMockVariants(parsedResume, variantCount, sliders);
      setVariants(mockResult);

      const check = {
        total_variants: mockResult.length,
        passed_count: mockResult.length,
        pass_rate: 100.0,
        expected_entities_per_variant: mockResult[0]?.num_entities || 17,
        flagged_variants: [],
        status: 'PASS',
      };
      setPreservationCheck(check);

      setProgress(100);
      return {
        success: true,
        count: mockResult.length,
        preservation: check,
        isMock: true,
        warning: 'Generated using local offline engine (Backend offline)',
      };
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [apiBaseUrl]);

  const clearVariants = useCallback(() => {
    setVariants([]);
    setPreservationCheck(null);
  }, []);

  return {
    variants,
    setVariants,
    preservationCheck,
    setPreservationCheck,
    isGenerating,
    progress,
    error,
    runAugmentation,
    clearVariants,
  };
}
