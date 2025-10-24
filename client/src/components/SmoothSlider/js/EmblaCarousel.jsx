import React from 'react';
import { IosPickerItem } from './EmblaCarouselIosPickerItem';

const EmblaCarousel = (props) => {
  const { loop, value, onChange, min = 13, max = 100, label = 'years' } = props;
  const slideCount = max - min + 1;

  return (
    <div className='embla'>
      <IosPickerItem
        slideCount={slideCount}
        startValue={min}
        perspective='left'
        loop={loop}
        label={label}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default EmblaCarousel;
