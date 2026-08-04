import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  message?: string;
}

interface FieldError {
  field: string;
  message: string;
}

export function useFormValidation(rules: Record<string, ValidationRule>) {
  const [errors, setErrors] = useState<FieldError[]>([]);

  const validate = useCallback((data: Record<string, any>) => {
    const newErrors: FieldError[] = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      // Required
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors.push({ field, message: rule.message || `${field} is required` });
        continue;
      }

      if (!value) continue;

      // Min length
      if (rule.minLength && String(value).length < rule.minLength) {
        newErrors.push({ field, message: rule.message || `${field} must be at least ${rule.minLength} characters` });
        continue;
      }

      // Max length
      if (rule.maxLength && String(value).length > rule.maxLength) {
        newErrors.push({ field, message: rule.message || `${field} must be at most ${rule.maxLength} characters` });
        continue;
      }

      // Min value
      if (rule.min && Number(value) < rule.min) {
        newErrors.push({ field, message: rule.message || `${field} must be at least ${rule.min}` });
        continue;
      }

      // Max value
      if (rule.max && Number(value) > rule.max) {
        newErrors.push({ field, message: rule.message || `${field} must be at most ${rule.max}` });
        continue;
      }

      // Pattern
      if (rule.pattern && !rule.pattern.test(String(value))) {
        newErrors.push({ field, message: rule.message || `${field} is invalid` });
        continue;
      }

      // Email
      if (rule.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          newErrors.push({ field, message: rule.message || 'Invalid email address' });
          continue;
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [rules]);

  const getError = useCallback((field: string) => {
    return errors.find(e => e.field === field)?.message || null;
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return { errors, validate, getError, clearErrors };
}