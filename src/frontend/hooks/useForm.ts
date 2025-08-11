import { useState, useCallback, useEffect } from 'react';

type ValidationRule<T> = {
  validate: (value: T, formValues: Record<string, any>) => boolean;
  message: string;
};

type FieldConfig<T> = {
  initialValue: T;
  validationRules?: ValidationRule<T>[];
  required?: boolean;
  requiredMessage?: string;
  transform?: (value: T) => any;
};

type FormConfig = Record<string, FieldConfig<any>>;

type FormState<T extends FormConfig> = {
  values: { [K in keyof T]: any };
  errors: { [K in keyof T]?: string };
  touched: { [K in keyof T]: boolean };
  isValid: boolean;
  isDirty: boolean;
};

export const useForm = <T extends FormConfig>(config: T) => {
  // Initialize form state
  const initialValues = Object.entries(config).reduce(
    (acc, [key, field]) => ({ ...acc, [key]: field.initialValue }),
    {} as { [K in keyof T]: any }
  );

  const initialTouched = Object.keys(config).reduce(
    (acc, key) => ({ ...acc, [key]: false }),
    {} as { [K in keyof T]: boolean }
  );

  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: initialTouched,
    isValid: false,
    isDirty: false,
  });

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any) => {
      const fieldConfig = config[name];
      if (!fieldConfig) return '';

      // Check required
      if (fieldConfig.required && (value === '' || value === null || value === undefined)) {
        return fieldConfig.requiredMessage || 'This field is required';
      }

      // Check validation rules
      if (fieldConfig.validationRules) {
        for (const rule of fieldConfig.validationRules) {
          if (!rule.validate(value, formState.values)) {
            return rule.message;
          }
        }
      }

      return '';
    },
    [config, formState.values]
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: { [K in keyof T]?: string } = {};
    let isValid = true;

    Object.keys(config).forEach(key => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, formState.values[fieldName]);
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    return { errors: newErrors, isValid };
  }, [config, formState.values, validateField]);

  // Update form validity whenever values change
  useEffect(() => {
    const { errors, isValid } = validateForm();
    setFormState(prev => ({
      ...prev,
      errors,
      isValid,
    }));
  }, [formState.values, validateForm]);

  // Handle field change
  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      const fieldConfig = config[name];
      const transformedValue = fieldConfig.transform ? fieldConfig.transform(value) : value;
      
      setFormState(prev => {
        const newValues = { ...prev.values, [name]: transformedValue };
        const error = validateField(name, transformedValue);
        const newErrors = { ...prev.errors };
        
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        
        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isDirty: true,
        };
      });
    },
    [config, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: keyof T) => {
      setFormState(prev => {
        const newTouched = { ...prev.touched, [name]: true };
        const error = validateField(name, prev.values[name]);
        const newErrors = { ...prev.errors };
        
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        
        return {
          ...prev,
          touched: newTouched,
          errors: newErrors,
        };
      });
    },
    [validateField]
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: initialTouched,
      isValid: false,
      isDirty: false,
    });
  }, [initialValues, initialTouched]);

  // Set form values programmatically
  const setValues = useCallback((newValues: Partial<{ [K in keyof T]: any }>) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, ...newValues },
      isDirty: true,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (values: { [K in keyof T]: any }) => void) => {
      return (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        // Mark all fields as touched
        const allTouched = Object.keys(config).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as { [K in keyof T]: boolean }
        );

        const { errors, isValid } = validateForm();

        setFormState(prev => ({
          ...prev,
          touched: allTouched,
          errors,
          isValid,
        }));

        if (isValid) {
          // Transform values if needed
          const transformedValues = Object.entries(formState.values).reduce(
            (acc, [key, value]) => {
              const fieldConfig = config[key];
              const transformedValue = fieldConfig.transform ? fieldConfig.transform(value) : value;
              return { ...acc, [key]: transformedValue };
            },
            {} as { [K in keyof T]: any }
          );

          onSubmit(transformedValues);
        }
      };
    },
    [config, formState.values, validateForm]
  );

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    validateField,
    validateForm: () => {
      const { isValid } = validateForm();
      return isValid;
    },
  };
};

// Common validation rules
export const validationRules = {
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
  },
  minLength: (min: number) => ({
    validate: (value: string) => value.length >= min,
    message: `Must be at least ${min} characters`,
  }),
  maxLength: (max: number) => ({
    validate: (value: string) => value.length <= max,
    message: `Must be no more than ${max} characters`,
  }),
  pattern: (regex: RegExp, message: string) => ({
    validate: (value: string) => regex.test(value),
    message,
  }),
  match: (fieldToMatch: string, message: string) => ({
    validate: (value: string, formValues: Record<string, any>) => value === formValues[fieldToMatch],
    message,
  }),
  min: (min: number) => ({
    validate: (value: number) => value >= min,
    message: `Must be at least ${min}`,
  }),
  max: (max: number) => ({
    validate: (value: number) => value <= max,
    message: `Must be no more than ${max}`,
  }),
};