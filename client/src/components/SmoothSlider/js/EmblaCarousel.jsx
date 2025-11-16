import React from 'react';
import { IosPickerItem } from './EmblaCarouselIosPickerItem';

const EmblaCarousel = (props) => {
  const {
    loop,
    value,
    onChange,
    min = 13,
    max = 100,
    label = 'years',
    // Dual column props
    isDualColumn = false,
    value2,
    onChange2,
    min2,
    max2,
    label2,
  } = props;

  const slideCount = max - min + 1;
  const slideCount2 = isDualColumn ? max2 - min2 + 1 : 0;

  if (isDualColumn) {
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
        <IosPickerItem
          slideCount={slideCount2}
          startValue={min2}
          perspective='right'
          loop={loop}
          label={label2}
          value={value2}
          onChange={onChange2}
        />
      </div>
    );
  }

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
