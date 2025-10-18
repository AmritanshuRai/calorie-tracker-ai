import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { foodService } from '../services/foodService';
import Button from './Button';
import Input from './Input';

const FoodLogModal = ({ isOpen, onClose, selectedDate, onFoodAdded }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Review, 3: Success
  const [foodText, setFoodText] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');

  const mealTypes = [
    { value: 'breakfast', label: '🌅 Breakfast', emoji: '🌅' },
    { value: 'lunch', label: '☀️ Lunch', emoji: '☀️' },
    { value: 'dinner', label: '🌙 Dinner', emoji: '🌙' },
    { value: 'snacks', label: '🍿 Snacks', emoji: '🍿' },
  ];

  const handleParse = async () => {
    if (!foodText.trim()) {
      setError('Please enter what you ate');
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

      setParsedData(data);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to parse food. Please try again.'
      );
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
        'vitaminB9',
        'vitaminB12',
        'calcium',
        'iron',
        'magnesium',
        'potassium',
        'zinc',
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
      <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center'>
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
          className='relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto'>
          {/* Close button */}
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10'>
            <svg
              className='w-6 h-6 text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          <div className='p-6'>
            {/* Step 1: Input */}
            {step === 1 && (
              <div className='space-y-6'>
                <div className='text-center'>
                  <div className='text-4xl mb-3'>🍽️</div>
                  <h2 className='text-2xl font-bold text-gray-800'>
                    Log Your Food
                  </h2>
                  <p className='text-gray-600 mt-2'>
                    Tell us what you ate, and AI will calculate the nutrition
                  </p>
                </div>

                {/* Meal Type Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Meal Type
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    {mealTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setMealType(type.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          mealType === type.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className='text-2xl mb-1'>{type.emoji}</div>
                        <div className='text-sm font-medium'>
                          {type.label.replace(/[^\w\s]/g, '')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food Input */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    What did you eat?
                  </label>
                  <textarea
                    value={foodText}
                    onChange={(e) => setFoodText(e.target.value)}
                    placeholder='e.g., 2 scrambled eggs with toast and orange juice'
                    className='w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none resize-none'
                    rows={4}
                    disabled={isLoading}
                  />
                  <p className='text-xs text-gray-500 mt-2'>
                    💡 Be specific: include quantities, cooking methods, and
                    ingredients
                  </p>
                </div>

                {error && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-xl'>
                    <p className='text-sm text-red-600'>{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleParse}
                  disabled={isLoading || !foodText.trim()}
                  className='w-full'>
                  {isLoading ? (
                    <>
                      <svg
                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
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
                  <div className='text-4xl mb-3'>✅</div>
                  <h2 className='text-2xl font-bold text-gray-800'>
                    Review & Confirm
                  </h2>
                  <p className='text-gray-600 mt-2'>
                    AI analyzed your food. You can edit values before saving.
                  </p>
                </div>

                {/* Food Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Food Name
                  </label>
                  <Input
                    value={parsedData.foodName}
                    onChange={(e) => handleEdit('foodName', e.target.value)}
                  />
                </div>

                {/* Macros */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>
                    📊 Macronutrients
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='block text-xs text-gray-600 mb-1'>
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
                      <label className='block text-xs text-gray-600 mb-1'>
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
                      <label className='block text-xs text-gray-600 mb-1'>
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
                      <label className='block text-xs text-gray-600 mb-1'>
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
                  <div className='p-4 bg-gray-50 rounded-xl'>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>
                      💊 Additional Nutrients
                    </h3>
                    <div className='grid grid-cols-3 gap-2 text-xs'>
                      {parsedData.fiber && (
                        <div>
                          <span className='text-gray-600'>Fiber:</span>{' '}
                          <span className='font-medium'>
                            {parsedData.fiber}g
                          </span>
                        </div>
                      )}
                      {parsedData.sugar && (
                        <div>
                          <span className='text-gray-600'>Sugar:</span>{' '}
                          <span className='font-medium'>
                            {parsedData.sugar}g
                          </span>
                        </div>
                      )}
                      {parsedData.sodium && (
                        <div>
                          <span className='text-gray-600'>Sodium:</span>{' '}
                          <span className='font-medium'>
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
                    variant='secondary'
                    className='flex-1'
                    disabled={isLoading}>
                    ← Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className='flex-1'>
                    {isLoading ? (
                      <>
                        <svg
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'>
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
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
                  <div className='text-6xl mb-4'>✅</div>
                  <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                    Food Logged!
                  </h2>
                  <p className='text-gray-600'>
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
