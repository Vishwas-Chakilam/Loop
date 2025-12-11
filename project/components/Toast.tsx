import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, X } from 'lucide-react-native';
import { getThemeColors } from '@/utils/theme';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}

export function Toast({ type, title, message, onClose }: ToastProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#4CAF50" strokeWidth={2} />;
      case 'error':
        return <AlertCircle size={20} color="#F44336" strokeWidth={2} />;
      case 'info':
        return <Info size={20} color="#2196F3" strokeWidth={2} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#E8F5E8';
      case 'error':
        return '#FFEBEE';
      case 'info':
        return '#E3F2FD';
    }
  };

  const styles = getStyles(colors, getBackgroundColor());

  return (
    <View style={styles.container}>
      {getIcon()}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={16} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (colors: any, backgroundColor: string) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColor,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
});