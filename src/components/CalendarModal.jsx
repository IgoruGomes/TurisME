
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarModal = ({ events, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const eventDates = events.map(event => {
    const date = new Date(event.event_date);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      title: event.title
    };
  });

  const hasEvent = (day) => {
    return eventDates.some(
      event =>
        event.day === day &&
        event.month === currentDate.getMonth() &&
        event.year === currentDate.getFullYear()
    );
  };

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const date = new Date(event.event_date);
      return (
        date.getDate() === day &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Calendário de Eventos</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const hasEventThisDay = hasEvent(day);
              
              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer
                    ${hasEventThisDay 
                      ? 'bg-gradient-to-r from-blue-500 to-orange-500 text-white hover:from-blue-600 hover:to-orange-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Events List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">Eventos do Mês</h3>
            {events
              .filter(event => {
                const date = new Date(event.event_date);
                return (
                  date.getMonth() === currentDate.getMonth() &&
                  date.getFullYear() === currentDate.getFullYear()
                );
              })
              .map(event => {
                const date = new Date(event.event_date);
                return (
                  <div
                    key={event.id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-200"
                  >
                    <p className="font-semibold text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      {date.getDate()} de {monthNames[date.getMonth()]}
                    </p>
                  </div>
                );
              })}
            
            {events.filter(event => {
              const date = new Date(event.event_date);
              return (
                date.getMonth() === currentDate.getMonth() &&
                date.getFullYear() === currentDate.getFullYear()
              );
            }).length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum evento neste mês</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarModal;
