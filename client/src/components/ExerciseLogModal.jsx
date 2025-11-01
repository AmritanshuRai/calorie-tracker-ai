import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  CheckCircle2,
  Dumbbell,
  ChevronLeft,
  Flame,
  AlertCircle,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exerciseService } from '../services/exerciseService';
import useUserStore from '../stores/useUserStore';
import { FREE_LOGS_LIMIT } from '../utils/constants';
import Button from './Button';
import Input from './Input';

const ExerciseLogModal = ({
  isOpen,
  onClose,
  selectedDate,
  onExerciseAdded,
}) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Review, 3: Success
  const [exerciseText, setExerciseText] = useState('');
  const [exerciseType, setExerciseType] = useState('cardio');
  const [intensity, setIntensity] = useState('moderate');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { subscription, user, setUser } = useUserStore();

  const handleParse = async () => {
    if (!exerciseText.trim()) {
      setError('Please enter an exercise description');
      return;
    }

    // Check if user has remaining free logs (for free users)
    if (subscription.freeLogs === 0) {
      setError(
        `You have used all ${FREE_LOGS_LIMIT} free logs. Upgrade to Pro for unlimited access.`
      );
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await exerciseService.parseExercise(
        exerciseText,
        exerciseType,
        intensity
      );

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      // Update user's free logs from response
      if (data.freeLogs !== undefined && user) {
        setUser({
          ...user,
          freeLogs: data.freeLogs,
        });
      }

      setParsedData(data);
      setStep(2);
    } catch (err) {
      // Handle free logs exhausted error
      if (err.response?.data?.code === 'FREE_LOGS_EXHAUSTED') {
        setError(err.response.data.message);
        // Update free logs to 0
        if (user) {
          setUser({
            ...user,
            freeLogs: 0,
          });
        }
      } else {
        setError(
          err.response?.data?.error ||
            'Failed to parse exercise. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Normalize the date to UTC midnight
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const normalizedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

      // Build exercise entry object
      const exerciseEntry = {
        date: normalizedDate.toISOString(),
        exerciseName: parsedData.exerciseName,
        description: parsedData.description,
        duration: parsedData.duration,
        exerciseType: parsedData.exerciseType,
        intensity: parsedData.intensity,
        caloriesBurned: parsedData.caloriesBurned,
        aiParsed: true,
      };

      console.log('Saving exercise entry:', exerciseEntry);
      await exerciseService.addExerciseEntry(exerciseEntry);
      setStep(3);

      // Call callback to refresh exercise log
      if (onExerciseAdded) {
        onExerciseAdded();
      }

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Save exercise entry error:', err);
      console.error('Error response:', err.response);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Failed to save exercise entry';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setExerciseText('');
    setExerciseType('cardio');
    setIntensity('moderate');
    setParsedData(null);
    setError('');
    setIsLoading(false);
    onClose();
  };

  const handleEdit = (field, value) => {
    setParsedData({
      ...parsedData,
      [field]: value,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex sm:items-center justify-center'>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className='relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full flex flex-col'>
          {/* Close button */}
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10'>
            <X className='w-6 h-6 text-slate-600' />
          </button>

          <div className='p-4 sm:p-6 pb-6 overflow-y-auto flex-1'>
            {/* Step 1: Input */}
            {step === 1 && (
              <div className='space-y-6'>
                <div className='text-center'>
                  <div className='mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4'>
                    <Dumbbell className='w-8 h-8 text-white' />
                  </div>
                  <h2 className='text-2xl font-bold text-slate-800'>
                    Log Your Workout
                  </h2>
                  <p className='text-slate-600 mt-2'>
                    Tell us what exercise you did and we'll calculate calories
                    burned
                  </p>
                </div>

                {/* Exercise Input */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    What exercise did you do?
                  </label>
                  <textarea
                    value={exerciseText}
                    onChange={(e) => setExerciseText(e.target.value)}
                    placeholder='e.g., "30 minutes jogging" or "strength training" or "1 hour swimming"'
                    className='w-full p-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none resize-none text-slate-800 placeholder:text-slate-400'
                    rows={4}
                    disabled={isLoading}
                  />
                  <p className='text-xs text-slate-500 mt-2'>
                    💡 Tip: Include duration and intensity for better accuracy
                  </p>
                </div>

                {/* Exercise Type & Intensity Selection */}
                <div className='p-4 bg-slate-50 rounded-xl border border-slate-200'>
                  <h3 className='text-sm font-medium text-slate-700 mb-3'>
                    Exercise Details
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-xs text-slate-600 mb-2'>
                        Type
                      </label>
                      <select
                        value={exerciseType}
                        onChange={(e) => setExerciseType(e.target.value)}
                        className='w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-purple-500 focus:ring-0 outline-none bg-white'
                        disabled={isLoading}>
                        <option value='cardio'>Cardio</option>
                        <option value='strength'>Strength</option>
                        <option value='flexibility'>Flexibility</option>
                        <option value='sports'>Sports</option>
                        <option value='other'>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-xs text-slate-600 mb-2'>
                        Intensity
                      </label>
                      <select
                        value={intensity}
                        onChange={(e) => setIntensity(e.target.value)}
                        className='w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-purple-500 focus:ring-0 outline-none bg-white'
                        disabled={isLoading}>
                        <option value='light'>Light</option>
                        <option value='moderate'>Moderate</option>
                        <option value='vigorous'>Vigorous</option>
                        <option value='very_vigorous'>Very Vigorous</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3'>
                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                    <p className='text-sm text-red-800'>{error}</p>
                  </div>
                )}

                {/* Free Logs Warning */}
                {!subscription.isPro && subscription.freeLogs !== undefined && (
                  <div
                    className={`p-4 rounded-xl border ${
                      subscription.freeLogs <= 3
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <AlertCircle
                          className={`w-5 h-5 flex-shrink-0 ${
                            subscription.freeLogs <= 3
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              subscription.freeLogs <= 3
                                ? 'text-amber-900'
                                : 'text-blue-900'
                            }`}>
                            {subscription.freeLogs} free logs remaining
                          </p>
                          {subscription.freeLogs <= 3 && (
                            <p className='text-xs text-amber-700 mt-0.5'>
                              Upgrade for unlimited logs
                            </p>
                          )}
                        </div>
                      </div>
                      {subscription.freeLogs <= 5 && (
                        <button
                          onClick={() => navigate('/upgrade')}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap ${
                            subscription.freeLogs <= 3
                              ? 'bg-amber-600 text-white hover:bg-amber-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleParse}
                  disabled={
                    isLoading ||
                    !exerciseText.trim() ||
                    subscription.freeLogs === 0
                  }
                  className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                      Analyzing Exercise...
                    </>
                  ) : (
                    <>
                      <Flame className='w-5 h-5 mr-2' />
                      Calculate Calories
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && parsedData && (
              <div className='space-y-6'>
                <button
                  onClick={() => setStep(1)}
                  className='flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-2'>
                  <ChevronLeft className='w-4 h-4' />
                  Back
                </button>

                <div className='text-center'>
                  <h2 className='text-2xl font-bold text-slate-800'>
                    Review & Confirm
                  </h2>
                  <p className='text-slate-600 mt-2'>
                    AI calculated your workout. You can edit values before
                    saving.
                  </p>
                </div>

                {/* Exercise Name */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Exercise Name
                  </label>
                  <Input
                    value={parsedData.exerciseName}
                    onChange={(e) => handleEdit('exerciseName', e.target.value)}
                  />
                </div>

                {/* Workout Details */}
                <div>
                  <h3 className='text-sm font-medium text-slate-700 mb-3 flex items-center gap-2'>
                    <Activity className='w-4 h-4 text-slate-600' />
                    Workout Details
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='block text-xs text-slate-600 mb-1'>
                        Duration (minutes)
                      </label>
                      <Input
                        type='number'
                        value={parsedData.duration}
                        onChange={(e) =>
                          handleEdit(
                            'duration',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-slate-600 mb-1'>
                        Calories Burned
                      </label>
                      <Input
                        type='number'
                        value={parsedData.caloriesBurned}
                        onChange={(e) =>
                          handleEdit(
                            'caloriesBurned',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Calorie Impact Preview */}
                <div className='p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Flame className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <p className='text-xs text-purple-700 font-medium'>
                        Calories Burned
                      </p>
                      <p className='text-2xl font-black text-purple-900'>
                        {Math.round(parsedData.caloriesBurned)} cal
                      </p>
                      <p className='text-xs text-purple-600 mt-0.5'>
                        +{Math.round(parsedData.caloriesBurned)} to your daily
                        budget
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {parsedData.description && (
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Description
                    </label>
                    <textarea
                      value={parsedData.description}
                      onChange={(e) =>
                        handleEdit('description', e.target.value)
                      }
                      className='w-full p-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none resize-none text-sm text-slate-800'
                      rows={2}
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3'>
                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                    <p className='text-sm text-red-800'>{error}</p>
                  </div>
                )}

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'>
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    'Save Workout'
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className='text-center py-8'>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}>
                  <div className='mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6'>
                    <CheckCircle2 className='w-10 h-10 text-white' />
                  </div>
                  <h2 className='text-2xl font-bold text-slate-800 mb-2'>
                    Workout Logged!
                  </h2>
                  <p className='text-slate-600'>
                    Your exercise has been added to your activity log
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExerciseLogModal;
