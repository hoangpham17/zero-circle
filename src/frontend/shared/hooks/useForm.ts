import { useState, useCallback, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho validation errors
type ValidationErrors<T> = Partial<Record<keyof T, string>>;

// Định nghĩa kiểu dữ liệu cho validation rules
type ValidationRule<T> = {
  validate: (value: any, formValues: T) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

/**
 * Hook quản lý form và validation
 * 
 * @param initialValues - Giá trị ban đầu của form
 * @param validationRules - Quy tắc validation cho các trường
 * @param onSubmit - Hàm xử lý khi submit form
 * @returns Các phương thức và trạng thái để quản lý form
 * 
 * @example
 * ```jsx
 * const {
 *   values,
 *   errors,
 *   touched,
 *   handleChange,
 *   handleBlur,
 *   handleSubmit,
 *   reset,
 *   isValid,
 *   isDirty
 * } = useForm(
 *   { email: '', password: '' },
 *   {
 *     email: [
 *       {
 *         validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
 *         message: 'Email không hợp lệ'
 *       },
 *     ],
 *     password: [
 *       {
 *         validate: (value) => value.length >= 6,
 *         message: 'Mật khẩu phải có ít nhất 6 ký tự'
 *       },
 *     ]
 *   },
 *   (values) => console.log('Form submitted:', values)
 * );
 * ```
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void
) {
  // State cho giá trị form
  const [values, setValues] = useState<T>(initialValues);
  // State cho các trường đã được tương tác
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  // State cho các lỗi validation
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  // State cho trạng thái form đã thay đổi
  const [isDirty, setIsDirty] = useState<boolean>(false);
  // State cho trạng thái form hợp lệ
  const [isValid, setIsValid] = useState<boolean>(true);
  // State cho trạng thái đang submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validate một trường cụ thể
  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      if (!validationRules || !validationRules[name]) return undefined;

      const fieldRules = validationRules[name] || [];
      
      for (const rule of fieldRules) {
        if (!rule.validate(value, values)) {
          return rule.message;
        }
      }

      return undefined;
    },
    [validationRules, values]
  );

  // Validate toàn bộ form
  const validateForm = useCallback((): ValidationErrors<T> => {
    if (!validationRules) return {};

    const newErrors: ValidationErrors<T> = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setIsValid(formIsValid);
    return newErrors;
  }, [validationRules, validateField, values]);

  // Xử lý thay đổi giá trị
  const handleChange = useCallback(
    (name: keyof T) => (value: any) => {
      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
      setIsDirty(true);

      // Validate field nếu đã touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: error,
        }));
      }
    },
    [touched, validateField]
  );

  // Xử lý khi blur field
  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));

      const error = validateField(name, values[name]);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    },
    [validateField, values]
  );

  // Xử lý submit form
  const handleSubmit = useCallback(() => {
    // Đánh dấu tất cả các trường là đã touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched as Partial<Record<keyof T, boolean>>);

    // Validate toàn bộ form
    const formErrors = validateForm();
    setErrors(formErrors);

    // Nếu không có lỗi, gọi onSubmit
    if (Object.keys(formErrors).length === 0 && onSubmit) {
      setIsSubmitting(true);
      try {
        onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateForm, onSubmit]);

  // Reset form về giá trị ban đầu
  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Validate form khi values thay đổi
  useEffect(() => {
    if (isDirty) {
      const newErrors = validateForm();
      setErrors(newErrors);
    }
  }, [values, isDirty, validateForm]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid,
    isDirty,
    isSubmitting,
    setValues,
  };
}

/**
 * Lưu ý cho việc triển khai thực tế:
 * 
 * 1. Tích hợp với thư viện validation:
 *    - Có thể tích hợp với Yup, Zod, Joi để validation phức tạp hơn
 * 
 * 2. Xử lý async validation:
 *    - Thêm hỗ trợ cho validation bất đồng bộ (ví dụ: kiểm tra email đã tồn tại)
 * 
 * 3. Tối ưu hiệu suất:
 *    - Sử dụng debounce cho handleChange để tránh validate quá nhiều
 *    - Chỉ validate các trường phụ thuộc khi cần thiết
 */