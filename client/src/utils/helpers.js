import { format, parse, differenceInWeeks } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMMM dd, yyyy');
};

export const formatShortDate = (date) => {
  return format(new Date(date), 'MMM dd');
};

export const parseDate = (dateString) => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

export const calculateWeeksBetween = (startDate, endDate) => {
  return differenceInWeeks(new Date(endDate), new Date(startDate));
};

export const calculateWeightChangeRate = (
  currentWeight,
  targetWeight,
  weeks
) => {
  const difference = Math.abs(targetWeight - currentWeight);
  return weeks > 0 ? difference / weeks : 0;
};

export const formatNumber = (num, decimals = 0) => {
  return Number(num).toFixed(decimals);
};

export const validateWeightChangeRate = (rate) => {
  if (rate > 1) {
    return {
      isHealthy: false,
      message:
        '⚠️ This pace is too fast and not recommended for sustainable weight change.',
      severity: 'error',
    };
  } else if (rate > 0.75) {
    return {
      isHealthy: true,
      message: '⚡ This is an aggressive but achievable pace.',
      severity: 'warning',
    };
  } else if (rate >= 0.25) {
    return {
      isHealthy: true,
      message: '✅ Healthy & Sustainable',
      severity: 'success',
    };
  } else {
    return {
      isHealthy: true,
      message: '🐢 This is a very slow pace, which is perfectly fine!',
      severity: 'info',
    };
  }
};
