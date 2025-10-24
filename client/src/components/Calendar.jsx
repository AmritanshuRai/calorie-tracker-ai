import { useEffect, useCallback } from 'react';
import {
  format,
  addDays,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ selectedDate, onDateSelect }) => {
  // Generate dates for current month only
  const generateDates = useCallback(() => {
    const dates = [];

    // Current month only
    const currentMonthStart = startOfMonth(selectedDate);
    const currentMonthEnd = endOfMonth(selectedDate);
    let currentDate = currentMonthStart;
    while (currentDate <= currentMonthEnd) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  }, [selectedDate]);

  const dates = generateDates();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    dragFree: true,
  });

  const isToday = (date) =>
    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const isSelected = useCallback(
    (date) => format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'),
    [selectedDate]
  );

  // Scroll to selected date when it changes (only on initial load)
  useEffect(() => {
    if (emblaApi) {
      const selectedIndex = dates.findIndex((date) => isSelected(date));
      if (selectedIndex !== -1) {
        // Only scroll if the selected date is not visible
        const slidesInView = emblaApi.slidesInView();
        if (!slidesInView.includes(selectedIndex)) {
          emblaApi.scrollTo(selectedIndex, false);
        }
      }
    }
  }, [emblaApi, dates, isSelected]);

  const scrollPrev = useCallback(() => {
    // Navigate to previous month
    const prevMonth = subMonths(selectedDate, 1);
    onDateSelect(startOfMonth(prevMonth));
  }, [selectedDate, onDateSelect]);

  const scrollNext = useCallback(() => {
    // Navigate to next month
    const nextMonth = addMonths(selectedDate, 1);
    onDateSelect(startOfMonth(nextMonth));
  }, [selectedDate, onDateSelect]);

  return (
    <div className='calendar-carousel'>
      {/* Header with navigation */}
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-base font-bold text-slate-800'>
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className='flex gap-1'>
          <button
            onClick={scrollPrev}
            className='p-1.5 hover:bg-slate-100 rounded-lg transition-colors'>
            <ChevronLeft className='w-4 h-4 text-slate-600' />
          </button>
          <button
            onClick={scrollNext}
            className='p-1.5 hover:bg-slate-100 rounded-lg transition-colors'>
            <ChevronRight className='w-4 h-4 text-slate-600' />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-2'>
          {dates.map((date, index) => (
            <button
              key={`${date.toString()}-${index}`}
              onClick={() => onDateSelect(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all duration-300 ${
                isSelected(date)
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                  : isToday(date)
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
                  isSelected(date) ? 'text-white/80' : 'text-slate-400'
                }`}>
                {format(date, 'EEE')}
              </span>
              <span className='text-base font-bold'>{format(date, 'd')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
