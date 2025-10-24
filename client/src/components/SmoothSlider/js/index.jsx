import EmblaCarousel from './EmblaCarousel';
import '../css/base.css';
import '../css/sandbox.css';
import '../css/embla.css';

const LOOP = false;

const SmoothSlider = ({
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
}) => (
  <main className='sandbox'>
    <section className='sandbox__carousel'>
      <EmblaCarousel
        loop={LOOP}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        label={label}
        isDualColumn={isDualColumn}
        value2={value2}
        onChange2={onChange2}
        min2={min2}
        max2={max2}
        label2={label2}
      />
    </section>
  </main>
);

export default SmoothSlider;
