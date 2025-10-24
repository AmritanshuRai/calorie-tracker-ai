import React from 'react';
import { IosPickerItem } from './EmblaCarouselIosPickerItem';

const EmblaCarousel = (props) => {
  const { loop, value, onChange } = props;

  return (
    <div className='embla'>
      <IosPickerItem
        slideCount={88}
        startValue={13}
        perspective='left'
        loop={loop}
        label='years'
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default EmblaCarousel;
