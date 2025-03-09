import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, Box, Text } from '@mantine/core';
import { getGlow } from '../../theme/mantineTheme';

interface EnhancedInputProps extends TextInputProps {
  helperText?: string;
  errorText?: string;
  label?: React.ReactNode;
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'warning' | 'error' | 'success';
  animated?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      helperText,
      errorText,
      label,
      colorScheme = 'primary',
      animated = true,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const id = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <Box className={className} style={style}>
        <TextInput
          ref={ref}
          id={id}
          label={label}
          error={errorText}
          radius="md"
          styles={{
            input: {
              transition: animated ? 'all 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease' : undefined,
              '&:focus': {
                borderColor: `var(--mantine-color-${colorScheme}-6)`,
                boxShadow: getGlow('focusRing'),
                transform: animated ? 'translateY(-1px)' : undefined
              },
              '&:hover:not(:focus):not(:disabled)': {
                borderColor: `var(--mantine-color-${colorScheme}-3)`,
                transform: animated ? 'translateY(-1px)' : undefined
              }
            },
            label: {
              marginBottom: '4px',
            },
            error: {
              marginTop: '4px',
            }
          }}
          {...props}
        />
        {helperText && !errorText && (
          <Text size="xs" c="dimmed" mt={4} ml={4}>
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';
