import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  CheckCircle2,
  UtensilsCrossed,
  Sunrise,
  Sun,
  Moon,
  Candy,
  ChevronLeft,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodService } from '../services/foodService';
import useUserStore from '../stores/useUserStore';
import { FREE_LOGS_LIMIT } from '../utils/constants';
import Button from './Button';
import Input from './Input';

const FoodLogModal = ({ isOpen, onClose, selectedDate, onFoodAdded }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Review, 3: Success
  const [foodText, setFoodText] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { subscription, user, setUser } = useUserStore();

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: Sunrise },
    { value: 'lunch', label: 'Lunch', icon: Sun },
    { value: 'dinner', label: 'Dinner', icon: Moon },
    { value: 'snacks', label: 'Snacks', icon: Candy },
  ];

  const handleParse = async () => {
    if (!foodText.trim()) {
      setError('Please enter what you ate');
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
      const data = await foodService.parseFood(foodText);

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
          err.response?.data?.error || 'Failed to parse food. Please try again.'
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
      // Normalize the date to UTC midnight to avoid timezone issues
      // Use UTC methods to ensure the date represents the selected calendar day
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const normalizedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

      // Build food entry object, filtering out null/undefined values
      const foodEntry = {
        date: normalizedDate.toISOString(),
        mealType,
        foodName: parsedData.foodName,
        description: parsedData.description,
        calories: parsedData.calories,
        protein: parsedData.protein,
        carbs: parsedData.carbs,
        fats: parsedData.fats,
        source: 'text',
        aiParsed: true,
      };

      // Add optional nutrients only if they have values
      const optionalNutrients = [
        'fiber',
        'sugar',
        'sodium',
        'cholesterol',
        'water',
        'omega3',
        'transFat',
        'caffeine',
        'alcohol',
        'vitaminA',
        'vitaminC',
        'vitaminD',
        'vitaminE',
        'vitaminK',
        'vitaminB1',
        'vitaminB2',
        'vitaminB3',
        'vitaminB5',
        'vitaminB6',
        'vitaminB9',
        'vitaminB12',
        'calcium',
        'iron',
        'magnesium',
        'phosphorus',
        'potassium',
        'zinc',
        'manganese',
        'copper',
        'selenium',
      ];

      optionalNutrients.forEach((nutrient) => {
        if (parsedData[nutrient] != null) {
          foodEntry[nutrient] = parsedData[nutrient];
        }
      });

      console.log('Saving food entry:', foodEntry);
      await foodService.addFoodEntry(foodEntry);
      setStep(3);

      // Call callback to refresh food log
      if (onFoodAdded) {
        onFoodAdded();
      }

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Save food entry error:', err);
      console.error('Error response:', err.response);
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to save food entry';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFoodText('');
    setMealType('breakfast');
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
                  <h2 className='text-2xl font-bold text-slate-800'>
                    Log Your Food
                  </h2>
                  <p className='text-slate-600 mt-2'>
                    Tell us what you ate, and AI will calculate the nutrition
                  </p>
                </div>

                {/* Meal Type Selection */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-3'>
                    Meal Type
                  </label>
                  <div className='grid grid-cols-4 gap-2'>
                    {mealTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setMealType(type.value)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            mealType === type.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}>
                          <Icon className='w-5 h-5 mx-auto mb-1' />
                          <div className='text-xs font-semibold'>
                            {type.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Food Input */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    What did you eat?
                  </label>
                  <textarea
                    value={foodText}
                    onChange={(e) => setFoodText(e.target.value)}
                    placeholder='e.g., 2 scrambled eggs with toast and orange juice'
                    className='w-full p-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none resize-none text-slate-800 placeholder:text-slate-400'
                    rows={4}
                    disabled={isLoading}
                  />
                  <p className='text-xs text-slate-500 mt-2 flex items-start gap-1.5'>
                    <span className='text-amber-500 text-base leading-none'>
                      💡
                    </span>
                    <span>
                      Be specific: include quantities, cooking methods, and
                      ingredients
                    </span>
                  </p>
                </div>

                {error && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3'>
                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm text-red-600'>{error}</p>
                      {subscription.freeLogs === 0 && (
                        <button
                          onClick={() => navigate('/upgrade')}
                          className='text-sm text-red-700 font-semibold underline mt-2 hover:text-red-800'>
                          Upgrade to Pro →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Free logs remaining notice for free users */}
                {subscription.status === 'free' &&
                  subscription.freeLogs >= 0 && (
                    <div
                      className={`p-4 rounded-xl border-2 ${
                        subscription.freeLogs <= 3
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              subscription.freeLogs <= 3
                                ? 'text-amber-800'
                                : 'text-blue-800'
                            }`}>
                            {subscription.freeLogs} free{' '}
                            {subscription.freeLogs === 1 ? 'log' : 'logs'}{' '}
                            remaining
                          </p>
                          {subscription.freeLogs === 0 && (
                            <p
                              className={`text-xs mt-1 ${
                                subscription.freeLogs <= 3
                                  ? 'text-amber-600'
                                  : 'text-blue-600'
                              }`}>
                              Upgrade for unlimited logs
                            </p>
                          )}
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
                    isLoading || !foodText.trim() || subscription.freeLogs === 0
                  }
                  className='w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                      Analyzing with AI...
                    </>
                  ) : (
                    'Analyze Food'
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && parsedData && (
              <div className='space-y-6'>
                <div className='text-center'>
                  <div className='w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center'>
                    <CheckCircle2 className='w-7 h-7 text-emerald-600' />
                  </div>
                  <h2 className='text-2xl font-bold text-slate-800'>
                    Review & Confirm
                  </h2>
                  <p className='text-slate-600 mt-2'>
                    AI analyzed your food. You can edit values before saving.
                  </p>
                </div>

                {/* Food Name */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Food Name
                  </label>
                  <Input
                    value={parsedData.foodName}
                    onChange={(e) => handleEdit('foodName', e.target.value)}
                  />
                </div>

                {/* Macros */}
                <div>
                  <h3 className='text-sm font-medium text-slate-700 mb-3 flex items-center gap-2'>
                    <BarChart3 className='w-4 h-4 text-slate-600' />
                    Macronutrients
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='block text-xs text-slate-600 mb-1'>
                        Calories (kcal)
                      </label>
                      <Input
                        type='number'
                        value={parsedData.calories}
                        onChange={(e) =>
                          handleEdit(
                            'calories',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-slate-600 mb-1'>
                        Protein (g)
                      </label>
                      <Input
                        type='number'
                        value={parsedData.protein}
                        onChange={(e) =>
                          handleEdit('protein', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-slate-600 mb-1'>
                        Carbs (g)
                      </label>
                      <Input
                        type='number'
                        value={parsedData.carbs}
                        onChange={(e) =>
                          handleEdit('carbs', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-slate-600 mb-1'>
                        Fats (g)
                      </label>
                      <Input
                        type='number'
                        value={parsedData.fats}
                        onChange={(e) =>
                          handleEdit('fats', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Nutrients Preview */}
                {(parsedData.fiber ||
                  parsedData.sugar ||
                  parsedData.sodium) && (
                  <div className='p-4 bg-slate-50 rounded-xl border border-slate-200'>
                    <h3 className='text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5'>
                      <span className='text-base'>💊</span>
                      Additional Nutrients
                    </h3>
                    <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs'>
                      {parsedData.sugar && (
                        <div>
                          <span className='text-slate-600'>Sugar:</span>{' '}
                          <span className='font-semibold text-slate-800'>
                            {parsedData.sugar}g
                          </span>
                        </div>
                      )}
                      {parsedData.sodium && (
                        <div>
                          <span className='text-slate-600'>Sodium:</span>{' '}
                          <span className='font-semibold text-slate-800'>
                            {parsedData.sodium}mg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-xl'>
                    <p className='text-sm text-red-600'>{error}</p>
                  </div>
                )}

                <div className='flex gap-3'>
                  <Button
                    onClick={() => setStep(1)}
                    variant='outline'
                    className='flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50'
                    disabled={isLoading}>
                    <ChevronLeft className='w-4 h-4 mr-1' />
                    Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className='flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'>
                    {isLoading ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      'Save Food Entry'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className='text-center py-8'>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                  <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center'>
                    <CheckCircle2 className='w-10 h-10 text-emerald-600' />
                  </div>
                  <h2 className='text-2xl font-bold text-slate-800 mb-2'>
                    Food Logged!
                  </h2>
                  <p className='text-slate-600'>
                    Your meal has been added to your food log
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

export default FoodLogModal;
