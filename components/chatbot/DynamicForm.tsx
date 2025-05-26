"use client"

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  X,
  AlertCircle,
  FileText,
  Loader2,
  Calendar,
  CheckCircle,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { FormField, FormSubmissionData, ValidationResult, DynamicFormProps } from '@/types/chatbot';
import { cn } from '@/lib/utils';

export function DynamicForm({
  fields,
  title,
  description,
  onSubmit,
  onCancel,
  loading = false,
  className
}: DynamicFormProps & { className?: string }) {
  const [formData, setFormData] = useState<FormSubmissionData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Calculate form completion
  const completedFields = fields.filter(field => {
    const value = formData[field.name];
    return value !== undefined && value !== '' && value !== null;
  }).length;

  const completionPercentage = Math.round((completedFields / fields.length) * 100);

  const validateField = useCallback((field: FormField, value: any): string | null => {
    // Required field validation
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} is required`;
    }

    // Skip validation if field is empty and not required
    if (!value) return null;

    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'tel':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number';
        }
        break;

      case 'text':
      case 'textarea':
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return `Minimum ${field.validation.minLength} characters required`;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return `Maximum ${field.validation.maxLength} characters allowed`;
        }
        if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          return 'Please enter a valid format';
        }
        break;

      case 'date':
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          return 'Please enter a valid date';
        }
        break;
    }

    return null;
  }, []);

  const validateForm = useCallback((): ValidationResult => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [fields, formData, validateField]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    const fieldValue = formData[field.name] || '';
    const isCompleted = fieldValue !== undefined && fieldValue !== '' && fieldValue !== null;

    const commonProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      disabled: loading || isSubmitting,
      className: cn(fieldError && "border-red-500")
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            rows={3}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.name, value)}
            disabled={loading || isSubmitting}
          >
            <SelectTrigger className={cn(fieldError && "border-red-500")}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.name, value)}
            disabled={loading || isSubmitting}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                <Label htmlFor={`${field.name}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={fieldValue === true}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              disabled={loading || isSubmitting}
            />
            <Label htmlFor={field.name} className="text-sm">
              {field.placeholder || field.label}
            </Label>
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type="date"
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              {...commonProps}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFieldChange(field.name, file);
              }}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            {fieldValue && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Upload className="h-4 w-4" />
                <span>{fieldValue.name} ({(fieldValue.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type={showPassword[field.name] ? "text" : "password"}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(prev => ({
                ...prev,
                [field.name]: !prev[field.name]
              }))}
            >
              {showPassword[field.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            maxLength={field.validation?.maxLength}
          />
        );
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            {title || 'Form'}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {completedFields}/{fields.length} fields
          </Badge>
        </div>

        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="max-h-96 overflow-y-auto chatbot-scrollbar chatbot-scroll-area">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field, index) => {
            const fieldError = errors[field.name];
            const isCompleted = formData[field.name] !== undefined &&
                               formData[field.name] !== '' &&
                               formData[field.name] !== null;

            return (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name} className="text-sm font-medium flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                    {isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </Label>

                  {field.validation?.maxLength && field.type !== 'file' && (
                    <span className="text-xs text-gray-400">
                      {(formData[field.name] || '').toString().length}/{field.validation.maxLength}
                    </span>
                  )}
                </div>

                {renderField(field)}

                {fieldError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {fieldError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          })}

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || isSubmitting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={loading || isSubmitting || completionPercentage < 100}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit
            </Button>
          </div>
        </form>

        {/* Form Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {fields.filter(f => f.required).length} required fields
            </span>
            <span>
              {fields.length} total fields
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DynamicForm;
