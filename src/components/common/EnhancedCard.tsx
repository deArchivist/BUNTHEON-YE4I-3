import React, { forwardRef, ReactNode } from 'react';
import { Card, CardProps, Box, rem } from '@mantine/core';
import { getShadow, getGlow } from '../../theme/mantineTheme';

interface EnhancedCardProps extends Omit<CardProps, 'children'> {
  children: ReactNode;
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'warning' | 'error' | 'success' | 'none';
  interactiveHover?: boolean;
  glowOnHover?: boolean;
  borderIndicator?: boolean;
  depth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      children,
      colorScheme = 'none',
      interactiveHover = false,
      glowOnHover = false,
      borderIndicator = false,
      depth = 'sm',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    // Get color value based on scheme
    const getColorValue = (opacity: number = 0.8) => {
      switch (colorScheme) {
        case 'primary': return `rgba(172, 184, 247, ${opacity})`;
        case 'secondary': return `rgba(219, 193, 247, ${opacity})`;
        case 'accent': return `rgba(153, 183, 240, ${opacity})`;
        case 'warning': return `rgba(252, 147, 77, ${opacity})`;
        case 'error': return `rgba(253, 164, 164, ${opacity})`;
        case 'success': return `rgba(150, 255, 150, ${opacity})`;
        default: return `rgba(240, 240, 240, ${opacity})`;
      }
    };

    // Build class list
    const classes = [
      className,
      interactiveHover ? 'hover-lift' : '',
    ].filter(Boolean).join(' ');
    
    // Additional hover styles
    const hoverStyles = glowOnHover ? {
      root: {
        boxShadow: undefined,
        '&:hover': {
          boxShadow: colorScheme !== 'none' 
            ? `${getShadow('md')}, ${getGlow(colorScheme)}` 
            : getShadow('md'),
        }
      }
    } : {};

    return (
      <Card
        ref={ref}
        withBorder
        radius="md"
        shadow={depth}
        className={classes}
        styles={hoverStyles}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: colorScheme !== 'none' ? getColorValue(0.15) : undefined,
          borderLeft: borderIndicator && colorScheme !== 'none' 
            ? `${rem(4)} solid ${getColorValue(0.8)}` 
            : undefined,
          transition: 'all 0.2s ease',
          ...style,
        }}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';
