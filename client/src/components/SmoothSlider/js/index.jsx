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
      />
    </section>
  </main>
);

export default SmoothSlider;
