import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  X,
  Scale,
  Droplets,
  Camera,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Button from './Button';
import Input from './Input';
import PictureUploadTab from './PictureUploadTab';
import { dailyLogService } from '../services/dailyLogService';

const DailyLogModal = ({ isOpen, onClose, selectedDate, onLogAdded }) => {
  const [activeTab, setActiveTab] = useState('weight'); // 'weight' | 'water' | 'picture'
  const [weight, setWeight] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [waterUnit, setWaterUnit] = useState('ml');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const [previousWeight, setPreviousWeight] = useState(null);

  const loadExistingData = useCallback(async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await dailyLogService.getDailyLog(dateStr);

      // Always reset the state based on the data received
      if (data.weight) {
        setWeight(data.weight.toString());
        setWeightUnit(data.weightUnit || 'kg');
      } else {
        setWeight('');
        setWeightUnit('kg');
      }

      if (data.waterIntake) {
        setWaterIntake(data.waterIntake.toString());
        setWaterUnit(data.waterUnit || 'ml');
      } else {
        setWaterIntake('');
        setWaterUnit('ml');
      }
    } catch (err) {
      console.error('Failed to load existing data:', err);
    }
  }, [selectedDate]);

  const loadPreviousWeight = useCallback(async () => {
    try {
      const history = await dailyLogService.getWeightHistory({ limit: 2 });
      if (history.length > 0) {
        const prev = history.find(
          (entry) =>
            format(new Date(entry.date), 'yyyy-MM-dd') !==
            format(selectedDate, 'yyyy-MM-dd')
        );
        if (prev) {
          setPreviousWeight(prev.weight);
        }
      }
    } catch (err) {
      console.error('Failed to load previous weight:', err);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isOpen) {
      loadExistingData();
      loadPreviousWeight();
    }
  }, [isOpen, selectedDate, loadExistingData, loadPreviousWeight]);

  const handleSave = async () => {
    const weightValue = parseFloat(weight);
    const waterValue = parseFloat(waterIntake);

    if (!weightValue && !waterValue) {
      setError('Please enter at least weight or water intake');
      return;
    }

    if (weightValue && (weightValue <= 0 || weightValue > 500)) {
      setError('Please enter a valid weight');
      return;
    }

    if (waterValue && (waterValue < 0 || waterValue > 20000)) {
      setError('Please enter a valid water intake');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = {};

      if (weightValue) {
        data.weight = weightValue;
        data.weightUnit = weightUnit;
      }
      if (waterValue) {
        data.waterIntake = waterValue;
        data.waterUnit = waterUnit;
      }

      await dailyLogService.updateDailyLog(dateStr, data);
      setIsSaved(true);

      if (onLogAdded) {
        onLogAdded();
      }

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save daily log:', err);
      setError(err.response?.data?.error || 'Failed to save data');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setWeight('');
    setWaterIntake('');
    setWeightUnit('kg');
    setWaterUnit('ml');
    setIsLoading(false);
    setIsSaved(false);
    setError('');
    setPreviousWeight(null);
    setActiveTab('weight');
    onClose();
  };

  const getWeightChange = () => {
    if (!previousWeight || !weight) return null;
    const change = parseFloat(weight) - previousWeight;
    return {
      value: Math.abs(change).toFixed(1),
      isIncrease: change > 0,
      percentage: ((Math.abs(change) / previousWeight) * 100).toFixed(1),
    };
  };

  const convertWater = (value, fromUnit, toUnit) => {
    const conversions = {
      ml: 1,
      liters: 1000,
      cups: 236.588,
      oz: 29.5735,
    };
    return (value * conversions[fromUnit]) / conversions[toUnit];
  };

  if (!isOpen) return null;

  const weightChange = getWeightChange();

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex sm:items-center justify-center'>
        {/* Backdrop */}
        <div
          onClick={handleClose}
          className='absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'
        />

        {/* Modal */}
        <div className='relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95'>
          {/* Close button */}
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10'>
            <X className='w-6 h-6 text-slate-600' />
          </button>

          <div className='p-6'>
            {!isSaved ? (
              <div className='space-y-6'>
                <div className='text-center'>
                  <div className='mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4'>
                    {activeTab === 'weight' && (
                      <Scale className='w-8 h-8 text-white' />
                    )}
                    {activeTab === 'water' && (
                      <Droplets className='w-8 h-8 text-white' />
                    )}
                    {activeTab === 'picture' && (
                      <Camera className='w-8 h-8 text-white' />
                    )}
                  </div>
                  <h2 className='text-2xl font-bold text-slate-800'>
                    Daily Log
                  </h2>
                  <p className='text-slate-600 mt-2'>
                    {activeTab === 'weight' && 'Track your weight'}
                    {activeTab === 'water' && 'Track your water intake'}
                    {activeTab === 'picture' && 'Upload your progress picture'}
                  </p>
                </div>

                {/* Tabs */}
                <div className='flex gap-2 border-b border-slate-200'>
                  <button
                    onClick={() => setActiveTab('weight')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === 'weight'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}>
                    <Scale className='w-4 h-4' />
                    <span className='hidden sm:inline'>Weight</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('water')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === 'water'
                        ? 'text-cyan-600 border-b-2 border-cyan-600'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}>
                    <Droplets className='w-4 h-4' />
                    <span className='hidden sm:inline'>Water</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('picture')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === 'picture'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}>
                    <Camera className='w-4 h-4' />
                    <span className='hidden sm:inline'>Picture</span>
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'weight' && (
                  <>
                    {/* Weight Input */}
                    <div className='p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Scale className='w-5 h-5 text-blue-600' />
                        <h3 className='text-sm font-semibold text-blue-900'>
                          Today's Weight
                        </h3>
                      </div>
                      <div className='flex gap-2'>
                        <Input
                          type='number'
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder='Enter weight'
                          step='0.1'
                          className='flex-1'
                        />
                        <select
                          value={weightUnit}
                          onChange={(e) => setWeightUnit(e.target.value)}
                          className='px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none bg-white text-slate-800'>
                          <option value='kg'>kg</option>
                          <option value='lbs'>lbs</option>
                        </select>
                      </div>

                      {/* Weight change indicator */}
                      {weightChange && (
                        <div
                          className={`mt-3 flex items-center gap-2 text-sm ${
                            weightChange.isIncrease
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}>
                          {weightChange.isIncrease ? (
                            <TrendingUp className='w-4 h-4' />
                          ) : (
                            <TrendingDown className='w-4 h-4' />
                          )}
                          <span className='font-semibold'>
                            {weightChange.isIncrease ? '+' : '-'}
                            {weightChange.value} {weightUnit}
                          </span>
                          <span className='text-slate-500'>
                            ({weightChange.percentage}% from last entry)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className='p-4 bg-red-50 border border-red-200 rounded-xl'>
                        <p className='text-sm text-red-800'>{error}</p>
                      </div>
                    )}

                    {/* Save Button */}
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || !weight}
                      className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed'>
                      {isLoading ? 'Saving...' : 'Save Weight'}
                    </Button>
                  </>
                )}

                {activeTab === 'water' && (
                  <>
                    {/* Water Intake Input */}
                    <div className='p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Droplets className='w-5 h-5 text-cyan-600' />
                        <h3 className='text-sm font-semibold text-cyan-900'>
                          Water Intake
                        </h3>
                      </div>
                      <div className='flex gap-2'>
                        <Input
                          type='number'
                          value={waterIntake}
                          onChange={(e) => setWaterIntake(e.target.value)}
                          placeholder='Enter amount'
                          step='100'
                          className='flex-1'
                        />
                        <select
                          value={waterUnit}
                          onChange={(e) => setWaterUnit(e.target.value)}
                          className='px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none bg-white text-slate-800'>
                          <option value='ml'>ml</option>
                          <option value='liters'>liters</option>
                          <option value='cups'>cups</option>
                          <option value='oz'>oz</option>
                        </select>
                      </div>

                      {/* Quick add buttons for water */}
                      <div className='mt-3 flex gap-2'>
                        {[250, 500, 750, 1000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              const currentValue = parseFloat(waterIntake) || 0;
                              const convertedAmount = convertWater(
                                amount,
                                'ml',
                                waterUnit
                              );
                              setWaterIntake(
                                (currentValue + convertedAmount).toString()
                              );
                            }}
                            className='flex-1 px-2 py-1.5 text-xs font-medium bg-white border border-cyan-300 text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors'>
                            +{amount}ml
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className='p-4 bg-red-50 border border-red-200 rounded-xl'>
                        <p className='text-sm text-red-800'>{error}</p>
                      </div>
                    )}

                    {/* Save Button */}
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || !waterIntake}
                      className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed'>
                      {isLoading ? 'Saving...' : 'Save Water Intake'}
                    </Button>
                  </>
                )}

                {activeTab === 'picture' && (
                  <PictureUploadTab
                    selectedDate={selectedDate}
                    onUploadSuccess={onLogAdded}
                  />
                )}
              </div>
            ) : (
              <div className='text-center py-8'>
                <div className='mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6'>
                  <CheckCircle2 className='w-10 h-10 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-slate-800 mb-2'>
                  Saved Successfully!
                </h2>
                <p className='text-slate-600'>
                  Your daily log has been updated
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default DailyLogModal;
